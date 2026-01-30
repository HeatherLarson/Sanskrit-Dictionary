import { useState, useMemo } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Search, BookOpen, Heart, Volume2, X, Sparkles, ExternalLink } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  sanskritDictionary,
  searchDictionary,
  categoryLabels,
  categoryColors,
  getRelatedWords,
  type Category,
  type SanskritWord,
} from '@/lib/sanskritDictionary';

const Index = () => {
  useSeoMeta({
    title: 'Yogic Lexicon - Sanskrit Dictionary for Yoga Teachers',
    description:
      'A beautiful, comprehensive Sanskrit dictionary designed for yoga teachers. Learn pronunciation, meaning, and usage of essential yoga terminology.',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedWord, setSelectedWord] = useState<SanskritWord | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>('yogic-lexicon:favorites', []);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredWords = useMemo(() => {
    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    let results = searchDictionary(searchQuery, category);

    if (showFavoritesOnly) {
      results = results.filter((word) => favorites.includes(word.id));
    }

    return results;
  }, [searchQuery, selectedCategory, showFavoritesOnly, favorites]);

  const toggleFavorite = (wordId: string) => {
    setFavorites((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
    );
  };

  const relatedWords = useMemo(() => {
    if (!selectedWord) return [];
    return getRelatedWords(selectedWord.id);
  }, [selectedWord]);

  const categories: (Category | 'all')[] = [
    'all',
    'asana',
    'pranayama',
    'philosophy',
    'meditation',
    'chakra',
    'mantra',
    'anatomy',
    'ayurveda',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-sand via-background to-sand/50">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 isolate">
          <img
            src="/hero-mandala.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 -z-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background -z-10" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-saffron/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-sage/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-lotus/10 rounded-full blur-2xl animate-float" />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron to-lotus flex items-center justify-center shadow-lg">
              <span className="font-devanagari text-2xl text-white">{'\u0913\u0902'}</span>
            </div>
            <span className="text-muted-foreground text-sm tracking-widest uppercase">
              Yogic Lexicon
            </span>
          </div>

          {/* Main Title */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 animate-slide-up">
              Sanskrit Dictionary
              <span className="block text-gradient mt-2">for Yoga Teachers</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]">
              Discover the sacred language of yoga. Learn pronunciation, meaning, and how to weave
              ancient wisdom into your teaching.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-10 animate-slide-up opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-saffron/20 via-lotus/20 to-sage/20 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <Input
                  type="text"
                  placeholder="Search Sanskrit terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-lg py-6 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mr-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in opacity-0 [animation-delay:700ms] [animation-fill-mode:forwards]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{sanskritDictionary.length} terms</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>8 categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>{favorites.length} saved</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-foreground">Browse by Category</h2>
            <Button
              variant={showFavoritesOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="gap-2"
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites ({favorites.length})
            </Button>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'shadow-md'
                      : 'hover:bg-secondary/80'
                  }`}
                >
                  {cat === 'all' ? 'All Terms' : categoryLabels[cat]}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredWords.length === 0
              ? 'No terms found'
              : `Showing ${filteredWords.length} term${filteredWords.length === 1 ? '' : 's'}`}
          </p>
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          )}
        </div>

        {/* Dictionary Grid */}
        {filteredWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word, index) => (
              <WordCard
                key={word.id}
                word={word}
                isFavorite={favorites.includes(word.id)}
                onToggleFavorite={() => toggleFavorite(word.id)}
                onClick={() => setSelectedWord(word)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-2">No terms found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {showFavoritesOnly
                  ? "You haven't saved any favorites yet. Click the heart icon on any term to save it."
                  : 'Try adjusting your search or browse by category to discover Sanskrit terms.'}
              </p>
              {(searchQuery || showFavoritesOnly) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setShowFavoritesOnly(false);
                    setSelectedCategory('all');
                  }}
                >
                  Show all terms
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Word Detail Modal */}
      <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedWord && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={`mb-3 ${categoryColors[selectedWord.category]}`}>
                      {categoryLabels[selectedWord.category]}
                    </Badge>
                    <DialogTitle className="font-serif text-3xl">{selectedWord.sanskrit}</DialogTitle>
                    <DialogDescription className="font-devanagari text-2xl mt-1 text-foreground/80">
                      {selectedWord.devanagari}
                    </DialogDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(selectedWord.id)}
                    className="shrink-0"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(selectedWord.id)
                          ? 'fill-lotus text-lotus'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                </div>
              </DialogHeader>

              <Tabs defaultValue="meaning" className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="meaning" className="flex-1">
                    Meaning
                  </TabsTrigger>
                  <TabsTrigger value="pronunciation" className="flex-1">
                    Pronunciation
                  </TabsTrigger>
                  <TabsTrigger value="usage" className="flex-1">
                    Usage
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="meaning" className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Definition
                    </h4>
                    <p className="text-lg">{selectedWord.meaning}</p>
                  </div>

                  {selectedWord.etymology && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Etymology
                      </h4>
                      <p className="text-foreground/80">{selectedWord.etymology}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pronunciation" className="mt-4 space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Volume2 className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground uppercase tracking-wider">
                        Pronunciation
                      </span>
                    </div>
                    <p className="font-serif text-2xl text-foreground">
                      {selectedWord.pronunciation}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Transliteration
                    </h4>
                    <p className="text-lg italic">{selectedWord.transliteration}</p>
                  </div>
                </TabsContent>

                <TabsContent value="usage" className="mt-4 space-y-4">
                  <div className="bg-secondary/30 rounded-lg p-6 border-l-4 border-primary">
                    <p className="italic text-foreground/90">"{selectedWord.usage}"</p>
                  </div>

                  {relatedWords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Related Terms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {relatedWords.map((related) => (
                          <Button
                            key={related.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWord(related)}
                            className="gap-1"
                          >
                            {related.sanskrit}
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-lotus flex items-center justify-center">
                <span className="font-devanagari text-sm text-white">{'\u0913\u0902'}</span>
              </div>
              <span className="text-sm text-muted-foreground">Yogic Lexicon</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Vibed with{' '}
              <a
                href="https://shakespeare.diy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Shakespeare
              </a>
            </p>
            <p className="text-sm text-muted-foreground italic">
              {'\u0932\u094B\u0915\u093E\u0903 \u0938\u092E\u0938\u094D\u0924\u093E\u0903 \u0938\u0941\u0916\u093F\u0928\u094B \u092D\u0935\u0928\u094D\u0924\u0941'} - May all beings be happy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface WordCardProps {
  word: SanskritWord;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  index: number;
}

function WordCard({ word, isFavorite, onToggleFavorite, onClick, index }: WordCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in opacity-0"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'forwards' }}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge className={`text-xs ${categoryColors[word.category]}`}>
            {categoryLabels[word.category]}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-lotus text-lotus' : 'text-muted-foreground group-hover:text-lotus'
              }`}
            />
          </Button>
        </div>
        <CardTitle className="font-serif text-xl mt-2">{word.sanskrit}</CardTitle>
        <p className="font-devanagari text-lg text-muted-foreground">{word.devanagari}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{word.meaning}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Volume2 className="w-3 h-3" />
          <span className="italic">{word.pronunciation}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default Index;
