// Derives extra "virtual" decks from the base card data:
//  1. Reverse decks (Turkish → German) for every deck
//  2. Artikel decks (guess der/die/das) for every noun that carries an article
// Derived cards get their own IDs, so they have independent SRS progress.

export const VARIANT_REVERSE = 'reverse';
export const VARIANT_ARTIKEL = 'artikel';

const REVERSE_DECK_SUFFIX = ' (TR → DE)';
const ARTIKEL_DECK_SUFFIX = ' · Artikel';
const REVERSE_ID_SUFFIX = '--reverse';
const ARTIKEL_ID_SUFFIX = '--artikel';

export const ARTICLES = ['der', 'die', 'das'];

// Matches "der Abfall, ¨-e", "die Leute (Pl.)", "der/die Angestellte, -n"
const ARTICLE_RE = /^((?:der|die|das)(?:\s*\/\s*(?:der|die|das))*)\s+(.+)$/i;

const isNounType = (type) => /^(nomen|noun|substantiv)$/i.test((type || '').trim());

/**
 * Parses "die Abbildung, -en" -> { articles: ['die'], noun: 'Abbildung', plural: '-en' }
 * Returns null if the string does not start with a definite article.
 */
export const parseArticle = (german) => {
  if (!german) return null;
  const match = german.trim().match(ARTICLE_RE);
  if (!match) return null;
  const articles = [...new Set(match[1].toLowerCase().split('/').map(a => a.trim()))];
  const rest = match[2].trim();
  const commaIdx = rest.indexOf(',');
  const noun = (commaIdx >= 0 ? rest.slice(0, commaIdx) : rest).trim();
  const plural = commaIdx >= 0 ? rest.slice(commaIdx + 1).trim() : '';
  if (!noun) return null;
  return { articles, noun, plural };
};

export const getVariantFromDeckId = (deckId = '') => {
  if (deckId.endsWith(REVERSE_ID_SUFFIX)) return VARIANT_REVERSE;
  if (deckId.endsWith(ARTIKEL_ID_SUFFIX)) return VARIANT_ARTIKEL;
  return null;
};

/**
 * Derived decks are inactive by default so they don't flood the
 * "all decks" review queue until the user explicitly enables them.
 */
export const isDeckActive = (activeDecks = {}, deckId) => {
  if (deckId && Object.prototype.hasOwnProperty.call(activeDecks, deckId)) {
    return activeDecks[deckId] !== false;
  }
  return getVariantFromDeckId(deckId) === null;
};

/** IDs of all derived cards that could exist for a given base card ID. */
export const getDerivedIds = (baseId) => [`rev_${baseId}`, `art_${baseId}`];

export const deriveCards = (baseCards = []) =>
  baseCards.flatMap((card) => {
    if (card.variant || !card.german || !card.turkish) return [];

    const derived = [];

    // Turkish -> German reverse card (if enabled on the card)
    if (card.enableReverse) {
      derived.push({
        ...card,
        id: `rev_${card.id}`,
        baseId: card.id,
        variant: VARIANT_REVERSE,
        deck: `${card.deck}${REVERSE_DECK_SUFFIX}`,
        deckId: `${card.deckId}${REVERSE_ID_SUFFIX}`,
      });
    }

    // Artikel guessing card (if enabled on the card and is a noun with an article)
    if (card.enableArtikel && isNounType(card.type)) {
      const parsed = parseArticle(card.german);
      if (parsed) {
        derived.push({
          ...card,
          id: `art_${card.id}`,
          baseId: card.id,
          variant: VARIANT_ARTIKEL,
          articles: parsed.articles,
          noun: parsed.noun,
          plural: parsed.plural,
          deck: `${card.deck}${ARTIKEL_DECK_SUFFIX}`,
          deckId: `${card.deckId}${ARTIKEL_ID_SUFFIX}`,
        });
      }
    }

    return derived;
  });

// Static Tailwind class names (must be literal strings for the JIT compiler)
export const ARTICLE_STYLES = {
  der: { text: 'text-sky-400', bg: 'bg-sky-500/15', border: 'border-sky-500/60', hover: 'hover:bg-sky-500/25 hover:border-sky-400', solid: 'bg-sky-500' },
  die: { text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/60', hover: 'hover:bg-rose-500/25 hover:border-rose-400', solid: 'bg-rose-500' },
  das: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/60', hover: 'hover:bg-emerald-500/25 hover:border-emerald-400', solid: 'bg-emerald-500' },
};
