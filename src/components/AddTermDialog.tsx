import { useState } from 'react';
import { useNostr } from '@nostrify/react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import {
  SANSKRIT_TERM_KIND,
  createSanskritTermTags,
  categoryLabels,
  categories,
  type Category,
} from '@/lib/sanskritDictionary';

interface AddTermDialogProps {
  children?: React.ReactNode;
}

export function AddTermDialog({ children }: AddTermDialogProps) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sanskrit: '',
    devanagari: '',
    transliteration: '',
    meaning: '',
    pronunciation: '',
    category: '' as Category | '',
    usage: '',
    etymology: '',
    related: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: Category) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const resetForm = () => {
    setFormData({
      sanskrit: '',
      devanagari: '',
      transliteration: '',
      meaning: '',
      pronunciation: '',
      category: '',
      usage: '',
      etymology: '',
      related: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login with your Nostr extension to add terms.',
        variant: 'destructive',
      });
      return;
    }

    if (
      !formData.sanskrit ||
      !formData.devanagari ||
      !formData.meaning ||
      !formData.pronunciation ||
      !formData.category
    ) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const relatedArray = formData.related
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const tags = createSanskritTermTags({
        sanskrit: formData.sanskrit,
        devanagari: formData.devanagari,
        transliteration: formData.transliteration || formData.sanskrit,
        meaning: formData.meaning,
        pronunciation: formData.pronunciation,
        category: formData.category as Category,
        usage: formData.usage,
        etymology: formData.etymology,
        related: relatedArray.length > 0 ? relatedArray : undefined,
      });

      const event = await user.signer.signEvent({
        kind: SANSKRIT_TERM_KIND,
        content: formData.meaning,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      toast({
        title: 'Term published!',
        description: `"${formData.sanskrit}" has been shared with the community.`,
      });

      // Invalidate cache to refetch terms
      queryClient.invalidateQueries({ queryKey: ['nostr', 'sanskrit-terms'] });

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Failed to publish term:', error);
      toast({
        title: 'Failed to publish',
        description: 'There was an error publishing your term. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Term
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Share a Sanskrit Term</DialogTitle>
          <DialogDescription>
            Contribute to the community dictionary by sharing a Sanskrit term with fellow yoga
            teachers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sanskrit (Roman) */}
            <div className="space-y-2">
              <Label htmlFor="sanskrit">
                Sanskrit (Roman) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sanskrit"
                name="sanskrit"
                placeholder="e.g., asana"
                value={formData.sanskrit}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Devanagari */}
            <div className="space-y-2">
              <Label htmlFor="devanagari">
                Devanagari Script <span className="text-destructive">*</span>
              </Label>
              <Input
                id="devanagari"
                name="devanagari"
                placeholder="e.g., आसन"
                className="font-devanagari"
                value={formData.devanagari}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Transliteration */}
            <div className="space-y-2">
              <Label htmlFor="transliteration">Transliteration</Label>
              <Input
                id="transliteration"
                name="transliteration"
                placeholder="e.g., asana (if different from above)"
                value={formData.transliteration}
                onChange={handleInputChange}
              />
            </div>

            {/* Pronunciation */}
            <div className="space-y-2">
              <Label htmlFor="pronunciation">
                Pronunciation Guide <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pronunciation"
                name="pronunciation"
                placeholder="e.g., AH-suh-nuh"
                value={formData.pronunciation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meaning */}
          <div className="space-y-2">
            <Label htmlFor="meaning">
              Meaning & Definition <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="meaning"
              name="meaning"
              placeholder="The meaning and definition of this term..."
              value={formData.meaning}
              onChange={handleInputChange}
              rows={3}
              required
            />
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <Label htmlFor="usage">Teaching Usage Example</Label>
            <Textarea
              id="usage"
              name="usage"
              placeholder="An example of how to use this term when teaching..."
              value={formData.usage}
              onChange={handleInputChange}
              rows={2}
            />
          </div>

          {/* Etymology */}
          <div className="space-y-2">
            <Label htmlFor="etymology">Etymology</Label>
            <Input
              id="etymology"
              name="etymology"
              placeholder="Origin and root of the word..."
              value={formData.etymology}
              onChange={handleInputChange}
            />
          </div>

          {/* Related Terms */}
          <div className="space-y-2">
            <Label htmlFor="related">Related Terms</Label>
            <Input
              id="related"
              name="related"
              placeholder="Comma-separated related terms (e.g., prana, vayu)"
              value={formData.related}
              onChange={handleInputChange}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !user}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Publish Term
                </>
              )}
            </Button>
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please login with your Nostr extension to add terms.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
