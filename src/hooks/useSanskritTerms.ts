import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { NostrEvent } from '@nostrify/nostrify';

import {
  SANSKRIT_TERM_KIND,
  parseNostrEvent,
  type SanskritWord,
} from '@/lib/sanskritDictionary';

/**
 * Hook to fetch Sanskrit terms from Nostr relays
 */
export function useSanskritTerms() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr', 'sanskrit-terms'],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [
          {
            kinds: [SANSKRIT_TERM_KIND],
            '#t': ['sanskrit'],
            limit: 500,
          },
        ],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) }
      );

      // Parse events into SanskritWord objects
      const terms: SanskritWord[] = [];
      const seenIds = new Set<string>();

      // Sort by created_at descending to get the latest version of each term
      const sortedEvents = [...events].sort((a, b) => b.created_at - a.created_at);

      for (const event of sortedEvents) {
        const term = parseNostrEvent(event);
        if (term && !seenIds.has(term.id)) {
          seenIds.add(term.id);
          terms.push(term);
        }
      }

      // Sort alphabetically by sanskrit term
      return terms.sort((a, b) => a.sanskrit.localeCompare(b.sanskrit));
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single Sanskrit term by its d-tag
 */
export function useSanskritTerm(dTag: string | undefined, pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nostr', 'sanskrit-term', dTag, pubkey],
    queryFn: async ({ signal }) => {
      if (!dTag) return null;

      const filter: { kinds: number[]; '#d': string[]; authors?: string[]; limit: number } = {
        kinds: [SANSKRIT_TERM_KIND],
        '#d': [dTag],
        limit: 1,
      };

      // If pubkey provided, filter by author for security
      if (pubkey) {
        filter.authors = [pubkey];
      }

      const events = await nostr.query([filter], {
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
      });

      if (events.length === 0) return null;

      return parseNostrEvent(events[0]);
    },
    enabled: !!dTag,
  });
}

/**
 * Get raw events for debugging/display
 */
export function useSanskritTermEvents() {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[]>({
    queryKey: ['nostr', 'sanskrit-term-events'],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [
          {
            kinds: [SANSKRIT_TERM_KIND],
            '#t': ['sanskrit'],
            limit: 500,
          },
        ],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) }
      );

      return events;
    },
    staleTime: 60000,
  });
}
