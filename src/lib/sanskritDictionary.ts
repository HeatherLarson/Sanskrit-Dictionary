import type { NostrEvent } from '@nostrify/nostrify';

export const SANSKRIT_TERM_KIND = 39843;

export type Category =
  | 'asana'
  | 'pranayama'
  | 'philosophy'
  | 'anatomy'
  | 'meditation'
  | 'mantra'
  | 'chakra'
  | 'ayurveda';

export interface SanskritWord {
  id: string;
  sanskrit: string;
  devanagari: string;
  transliteration: string;
  meaning: string;
  pronunciation: string;
  category: Category;
  usage: string;
  related?: string[];
  etymology?: string;
  pubkey?: string;
  createdAt?: number;
}

export const categoryLabels: Record<Category, string> = {
  asana: 'Asanas (Poses)',
  pranayama: 'Pranayama (Breath)',
  philosophy: 'Philosophy',
  anatomy: 'Anatomy',
  meditation: 'Meditation',
  mantra: 'Mantras & Chants',
  chakra: 'Chakras & Energy',
  ayurveda: 'Ayurveda',
};

export const categoryColors: Record<Category, string> = {
  asana: 'bg-saffron/10 text-saffron border-saffron/20',
  pranayama: 'bg-sage/10 text-sage border-sage/20',
  philosophy: 'bg-lotus/10 text-lotus border-lotus/20',
  anatomy: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  meditation: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  mantra: 'bg-gold/10 text-amber-600 border-gold/20',
  chakra: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  ayurveda: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

export const categories: Category[] = [
  'asana',
  'pranayama',
  'philosophy',
  'anatomy',
  'meditation',
  'mantra',
  'chakra',
  'ayurveda',
];

/**
 * Validates if a string is a valid category
 */
export function isValidCategory(value: string): value is Category {
  return categories.includes(value as Category);
}

/**
 * Parse a Nostr event into a SanskritWord object
 */
export function parseNostrEvent(event: NostrEvent): SanskritWord | null {
  if (event.kind !== SANSKRIT_TERM_KIND) return null;

  const getTag = (name: string) => event.tags.find(([t]) => t === name)?.[1];

  const sanskrit = getTag('sanskrit');
  const devanagari = getTag('devanagari');
  const transliteration = getTag('transliteration');
  const meaning = event.content;
  const pronunciation = getTag('pronunciation');
  const categoryTag = getTag('category');
  const usage = getTag('usage');
  const etymology = getTag('etymology');
  const dTag = getTag('d');

  // Validate required fields
  if (!sanskrit || !devanagari || !meaning || !pronunciation || !categoryTag || !dTag) {
    return null;
  }

  // Validate category
  if (!isValidCategory(categoryTag)) {
    return null;
  }

  // Get related terms
  const relatedTags = event.tags
    .filter(([t]) => t === 'related')
    .map(([, value]) => value)
    .filter(Boolean);

  return {
    id: dTag,
    sanskrit,
    devanagari,
    transliteration: transliteration || sanskrit,
    meaning,
    pronunciation,
    category: categoryTag,
    usage: usage || '',
    etymology,
    related: relatedTags.length > 0 ? relatedTags : undefined,
    pubkey: event.pubkey,
    createdAt: event.created_at,
  };
}

/**
 * Create tags for a Sanskrit term Nostr event
 */
export function createSanskritTermTags(word: Omit<SanskritWord, 'id' | 'pubkey' | 'createdAt'>): string[][] {
  const dTag = normalizeDTag(word.sanskrit);

  const tags: string[][] = [
    ['d', dTag],
    ['sanskrit', word.sanskrit],
    ['devanagari', word.devanagari],
    ['transliteration', word.transliteration],
    ['pronunciation', word.pronunciation],
    ['category', word.category],
    ['t', 'sanskrit'],
    ['t', 'yoga'],
    ['t', word.category],
    ['alt', `Sanskrit term: ${word.sanskrit} - ${word.meaning.substring(0, 100)}`],
  ];

  if (word.usage) {
    tags.push(['usage', word.usage]);
  }

  if (word.etymology) {
    tags.push(['etymology', word.etymology]);
  }

  if (word.related) {
    for (const related of word.related) {
      tags.push(['related', related]);
    }
  }

  return tags;
}

/**
 * Normalize a string for use as a d-tag
 */
export function normalizeDTag(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0900-\u097F-]/g, '') // Keep word chars, Devanagari, and hyphens
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Search through Sanskrit words
 */
export function searchWords(words: SanskritWord[], query: string, category?: Category): SanskritWord[] {
  const normalizedQuery = query.toLowerCase().trim();

  return words.filter((word) => {
    const matchesCategory = !category || word.category === category;
    const matchesQuery =
      !normalizedQuery ||
      word.sanskrit.toLowerCase().includes(normalizedQuery) ||
      word.transliteration.toLowerCase().includes(normalizedQuery) ||
      word.meaning.toLowerCase().includes(normalizedQuery) ||
      word.devanagari.includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}

/**
 * Get related words from a list
 */
export function getRelatedWords(words: SanskritWord[], wordId: string): SanskritWord[] {
  const word = words.find((w) => w.id === wordId);
  if (!word?.related) return [];

  return words.filter((w) =>
    word.related?.some(
      (r) =>
        w.sanskrit.toLowerCase().includes(r.toLowerCase()) ||
        w.transliteration.toLowerCase().includes(r.toLowerCase())
    )
  );
}

// Built-in starter terms (will be shown when no Nostr terms are available)
export const starterTerms: SanskritWord[] = [
  {
    id: 'asana',
    sanskrit: 'asana',
    devanagari: '\u0906\u0938\u0928',
    transliteration: 'asana',
    meaning: 'Seat; posture; the physical poses practiced in yoga',
    pronunciation: 'AH-suh-nuh',
    category: 'asana',
    usage: 'Begin your asana practice with a few minutes of breath awareness.',
    related: ['sthira', 'sukha'],
    etymology: 'From the root "as" meaning "to sit"',
  },
  {
    id: 'yoga',
    sanskrit: 'yoga',
    devanagari: '\u092F\u094B\u0917',
    transliteration: 'yoga',
    meaning: 'Union; to yoke; the practice of uniting body, mind, and spirit',
    pronunciation: 'YO-gah',
    category: 'philosophy',
    usage: 'Yoga is much more than physical postures; it is a path to self-realization.',
    related: ['yogi', 'yogini'],
    etymology: 'From the root "yuj" meaning to yoke or unite',
  },
  {
    id: 'prana',
    sanskrit: 'prana',
    devanagari: '\u092A\u094D\u0930\u093E\u0923',
    transliteration: 'prana',
    meaning: 'Life force; vital energy; breath',
    pronunciation: 'PRAH-nah',
    category: 'pranayama',
    usage: 'Focus on drawing prana into your body with each inhalation.',
    related: ['pranayama', 'apana', 'vayu'],
    etymology: 'From "pra" (forth) and "an" (to breathe)',
  },
  {
    id: 'om',
    sanskrit: 'om',
    devanagari: '\u0913\u0902',
    transliteration: 'om',
    meaning: 'The primordial sound; the vibration of the universe',
    pronunciation: 'OHHM (A-U-M)',
    category: 'mantra',
    usage: 'Chant Om three times to begin and end your practice.',
    related: ['aum', 'pranava'],
    etymology: 'The sacred syllable representing the absolute',
  },
  {
    id: 'namaste',
    sanskrit: 'namaste',
    devanagari: '\u0928\u092E\u0938\u094D\u0924\u0947',
    transliteration: 'namaste',
    meaning: 'I bow to you; a greeting honoring the divine in another',
    pronunciation: 'nah-mah-STAY',
    category: 'mantra',
    usage: 'End your class by bringing hands to heart and saying Namaste.',
    related: ['namaskar', 'anjali mudra'],
    etymology: '"Namah" (bow) + "te" (to you)',
  },
  {
    id: 'chakra',
    sanskrit: 'chakra',
    devanagari: '\u091A\u0915\u094D\u0930',
    transliteration: 'chakra',
    meaning: 'Wheel; energy center in the subtle body',
    pronunciation: 'CHAHK-rah',
    category: 'chakra',
    usage: 'Balance your chakras through asana, pranayama, and meditation.',
    related: ['nadi', 'kundalini'],
    etymology: 'From "cakra" meaning wheel or circle',
  },
  {
    id: 'dhyana',
    sanskrit: 'dhyana',
    devanagari: '\u0927\u094D\u092F\u093E\u0928',
    transliteration: 'dhyana',
    meaning: 'Meditation; sustained concentration; the seventh limb of yoga',
    pronunciation: 'dee-YAH-nah',
    category: 'meditation',
    usage: 'Regular Dhyana practice calms the fluctuations of the mind.',
    related: ['dharana', 'samadhi'],
    etymology: 'From "dhyai" meaning to contemplate',
  },
  {
    id: 'ahimsa',
    sanskrit: 'ahimsa',
    devanagari: '\u0905\u0939\u093F\u0902\u0938\u093E',
    transliteration: 'ahimsa',
    meaning: 'Non-violence; non-harming in thought, word, and deed',
    pronunciation: 'ah-HIM-sah',
    category: 'philosophy',
    usage: 'Practice Ahimsa by being gentle with yourself in challenging poses.',
    related: ['yama', 'satya'],
    etymology: '"A" (non) + "himsa" (violence)',
  },
];
