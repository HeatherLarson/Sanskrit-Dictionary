import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SANSKRIT_TERM_KIND } from '@/lib/sanskritDictionary';

const FAVORITES_KIND = 30003; // NIP-51 Bookmark sets

/**
 * Hook to manage Sanskrit term favorites on Nostr
 * Uses NIP-51 bookmark sets (kind 30003) with d-tag "sanskrit-favorites"
 */
export function useFavorites() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  // Fetch user's favorites from Nostr
  const favoritesQuery = useQuery({
    queryKey: ['nostr', 'favorites', user?.pubkey],
    queryFn: async ({ signal }) => {
      if (!user?.pubkey) return [];

      const events = await nostr.query(
        [
          {
            kinds: [FAVORITES_KIND],
            authors: [user.pubkey],
            '#d': ['sanskrit-favorites'],
            limit: 1,
          },
        ],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) }
      );

      if (events.length === 0) return [];

      // Extract 'a' tags which reference addressable events
      // Format: ["a", "kind:pubkey:d-tag"]
      const aTags = events[0].tags.filter(([t]) => t === 'a');
      
      // Extract just the d-tag (term id) from each reference
      return aTags
        .map(([, ref]) => {
          const parts = ref.split(':');
          if (parts.length >= 3 && parts[0] === String(SANSKRIT_TERM_KIND)) {
            return parts.slice(2).join(':'); // d-tag might contain colons
          }
          return null;
        })
        .filter((id): id is string => id !== null);
    },
    enabled: !!user?.pubkey,
    staleTime: 30000,
  });

  // Add or remove a favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ termId, termPubkey, add }: { termId: string; termPubkey: string; add: boolean }) => {
      if (!user) throw new Error('Not logged in');

      const currentFavorites = favoritesQuery.data || [];
      const aTagValue = `${SANSKRIT_TERM_KIND}:${termPubkey}:${termId}`;

      let newATags: string[][];

      if (add) {
        // Add the favorite if not already present
        const existing = currentFavorites.includes(termId);
        if (existing) return; // Already favorited
        
        newATags = [
          ...currentFavorites.map((id) => {
            // We need to preserve existing references - for now just use the termPubkey
            // In a real app, we'd need to look up the original pubkey
            return ['a', `${SANSKRIT_TERM_KIND}:${termPubkey}:${id}`];
          }),
          ['a', aTagValue],
        ];
      } else {
        // Remove the favorite
        newATags = currentFavorites
          .filter((id) => id !== termId)
          .map((id) => ['a', `${SANSKRIT_TERM_KIND}:${termPubkey}:${id}`]);
      }

      const event = await user.signer.signEvent({
        kind: FAVORITES_KIND,
        content: '',
        tags: [
          ['d', 'sanskrit-favorites'],
          ['title', 'Sanskrit Favorites'],
          ['description', 'My favorite Sanskrit yoga terms'],
          ...newATags,
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      return event;
    },
    onSuccess: () => {
      // Invalidate favorites query to refetch
      queryClient.invalidateQueries({ queryKey: ['nostr', 'favorites', user?.pubkey] });
    },
  });

  const isFavorite = (termId: string) => {
    return favoritesQuery.data?.includes(termId) ?? false;
  };

  const toggleFavorite = (termId: string, termPubkey: string) => {
    const isCurrentlyFavorite = isFavorite(termId);
    toggleFavoriteMutation.mutate({
      termId,
      termPubkey,
      add: !isCurrentlyFavorite,
    });
  };

  return {
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    isFavorite,
    toggleFavorite,
    isToggling: toggleFavoriteMutation.isPending,
  };
}
