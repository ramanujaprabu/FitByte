/**
 * FitByte — Voice log transcript parser.
 *
 * Turns a plain transcript like "2 eggs, a slice of toast and a banana"
 * into a list of { quantity, name } items. This is a simple rule-based
 * splitter, not an NLP model — it expects fairly plain, list-like phrasing
 * (comma/"and"-separated items, each with an optional leading quantity).
 * Natural rambling speech ("I had a couple eggs this morning") is handled
 * on a best-effort basis via a small quantifier/filler-word list, not
 * general language understanding.
 */

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  couple: 2, few: 3, some: 2,
};

const UNIT_WORDS = new Set([
  'of', 'slice', 'slices', 'cup', 'cups', 'glass', 'glasses',
  'piece', 'pieces', 'bowl', 'bowls', 'plate', 'plates', 'serving', 'servings',
]);

const LEADING_FILLER = /^(i\s+)?(had|ate|just\s+had|just\s+ate|logged|log|have)\s+/i;
const TRAILING_FILLER = /\s+(for\s+(breakfast|lunch|dinner|snacks?)|this\s+(morning|afternoon|evening|night)|today|just\s+now)\s*$/i;

export interface ParsedFoodItem {
  quantity: number;
  name: string;
  raw: string;
}

export function parseFoodTranscript(transcript: string): ParsedFoodItem[] {
  const cleaned = transcript
    .toLowerCase()
    .replace(LEADING_FILLER, '')
    .replace(TRAILING_FILLER, '')
    .trim();

  const segments = cleaned
    .split(/,| and /gi)
    .map((s) => s.trim())
    .filter(Boolean);

  const items: ParsedFoodItem[] = [];
  for (const seg of segments) {
    const words = seg.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    let quantity = 1;
    let idx = 0;
    if (/^\d+(\.\d+)?$/.test(words[0])) {
      quantity = parseFloat(words[0]);
      idx = 1;
    } else if (NUMBER_WORDS[words[0]] != null) {
      quantity = NUMBER_WORDS[words[0]];
      idx = 1;
    }
    while (idx < words.length && UNIT_WORDS.has(words[idx])) idx++;

    const name = words.slice(idx).join(' ').trim();
    if (name.length > 0) {
      items.push({ quantity, name, raw: seg });
    }
  }
  return items;
}
