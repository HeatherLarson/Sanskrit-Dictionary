# Yogic Lexicon - Sanskrit Dictionary Events

This document describes the custom Nostr event kinds used by Yogic Lexicon for storing Sanskrit yoga terminology.

## Kind 39843: Sanskrit Dictionary Entry

An addressable event for Sanskrit yoga terminology definitions.

### Event Structure

```json
{
  "kind": 39843,
  "content": "<meaning and definition>",
  "tags": [
    ["d", "<normalized-sanskrit-term>"],
    ["sanskrit", "<sanskrit term in roman script>"],
    ["devanagari", "<term in devanagari script>"],
    ["transliteration", "<transliteration>"],
    ["pronunciation", "<pronunciation guide>"],
    ["category", "<category>"],
    ["t", "sanskrit"],
    ["t", "yoga"],
    ["t", "<category>"],
    ["alt", "Sanskrit term: <term> - <short description>"],
    ["usage", "<teaching usage example>"],
    ["etymology", "<word origin>"],
    ["related", "<related term 1>"],
    ["related", "<related term 2>"]
  ]
}
```

### Required Tags

- `d`: Normalized identifier for the term (lowercase, hyphens instead of spaces)
- `sanskrit`: The Sanskrit term in Roman script
- `devanagari`: The term written in Devanagari script
- `pronunciation`: Pronunciation guide (e.g., "AH-suh-nuh")
- `category`: One of the valid categories (see below)
- `t`: At minimum, must include "sanskrit" and "yoga" hashtags
- `alt`: Human-readable summary per NIP-31

### Optional Tags

- `transliteration`: If different from the `sanskrit` tag
- `usage`: Example of how to use the term when teaching
- `etymology`: Origin and root of the word
- `related`: Related terms (can have multiple)

### Valid Categories

- `asana` - Yoga poses
- `pranayama` - Breathing techniques
- `philosophy` - Yogic philosophy concepts
- `anatomy` - Body and energetic anatomy
- `meditation` - Meditation-related terms
- `mantra` - Mantras and chants
- `chakra` - Chakras and energy concepts
- `ayurveda` - Ayurvedic terminology

### Content Field

The `content` field contains the full meaning and definition of the term.

### Example Event

```json
{
  "kind": 39843,
  "content": "Seat; posture; the physical poses practiced in yoga. In the Yoga Sutras, Patanjali defines asana as 'sthira sukham asanam' - a posture that is steady and comfortable.",
  "tags": [
    ["d", "asana"],
    ["sanskrit", "asana"],
    ["devanagari", "आसन"],
    ["transliteration", "asana"],
    ["pronunciation", "AH-suh-nuh"],
    ["category", "asana"],
    ["t", "sanskrit"],
    ["t", "yoga"],
    ["t", "asana"],
    ["alt", "Sanskrit term: asana - Seat; posture; the physical poses practiced in yoga"],
    ["usage", "Begin your asana practice with a few minutes of breath awareness."],
    ["etymology", "From the root 'as' meaning 'to sit'"],
    ["related", "sthira"],
    ["related", "sukha"]
  ]
}
```

## Favorites (Kind 30003)

Users save favorite terms using NIP-51 bookmark sets with `d` tag "sanskrit-favorites".

```json
{
  "kind": 30003,
  "content": "",
  "tags": [
    ["d", "sanskrit-favorites"],
    ["title", "Sanskrit Favorites"],
    ["description", "My favorite Sanskrit yoga terms"],
    ["a", "39843:<pubkey>:<term-d-tag>"],
    ["a", "39843:<pubkey>:<term-d-tag>"]
  ]
}
```

## Querying Terms

To fetch all Sanskrit terms:

```json
{
  "kinds": [39843],
  "#t": ["sanskrit"],
  "limit": 500
}
```

To fetch a specific term by a known author:

```json
{
  "kinds": [39843],
  "authors": ["<pubkey>"],
  "#d": ["<term-d-tag>"],
  "limit": 1
}
```
