import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateSM2 } from '../lib/sm2';
import { addDays, isBefore, startOfDay, parseISO } from 'date-fns';

// Dynamically import all JSON files in the data directory
const jsonModules = import.meta.glob('../data/*.json', { eager: true });

// Parse them into a flat array of cards, injecting the filename as the deck name
const cardsData = Object.entries(jsonModules).flatMap(([path, module]) => {
  // Extract filename without extension (e.g., '../data/verben-mit-blabla.json' -> 'verben-mit-blabla')
  const deckFileName = path.split('/').pop().replace('.json', '');
  
  // Format the name nicely for display (e.g., 'verben-mit-blabla' -> 'Verben Mit Blabla')
  const deckDisplayName = deckFileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (module.default || module).map(card => ({
    ...card,
    deck: deckDisplayName,
    deckId: deckFileName
  }));
});

const defaultSrs = { interval: 0, repetition: 0, efactor: 2.5, nextReviewDate: null };

export const useStore = create(
  persist(
    (set, get) => ({
      srsDataMap: {}, // Maps card.id -> srsData
      favorites: [], // Array of favorite card IDs
      stats: {
        totalReviews: 0,
        cardsLearned: 0,
      },

      toggleFavorite: (cardId) => {
        set((state) => ({
          favorites: state.favorites.includes(cardId)
            ? state.favorites.filter(id => id !== cardId)
            : [...state.favorites, cardId]
        }));
      },

      reviewCard: (cardId, quality) => {
        set((state) => {
          const currentSrs = state.srsDataMap[cardId] || { ...defaultSrs, nextReviewDate: new Date().toISOString() };
          
          const { interval, repetition, efactor } = calculateSM2(
            quality,
            currentSrs.interval,
            currentSrs.repetition,
            currentSrs.efactor
          );

          let nextReviewDate = new Date();
          if (interval > 0) {
            nextReviewDate = addDays(startOfDay(new Date()), interval);
          }

          const isNewlyLearned = currentSrs.repetition === 0 && repetition > 0;

          return {
            srsDataMap: {
              ...state.srsDataMap,
              [cardId]: {
                interval,
                repetition,
                efactor,
                nextReviewDate: nextReviewDate.toISOString()
              }
            },
            stats: {
              ...state.stats,
              totalReviews: state.stats.totalReviews + 1,
              cardsLearned: state.stats.cardsLearned + (isNewlyLearned ? 1 : 0)
            }
          };
        });
      },

      getCardsDueToday: () => {
        const today = startOfDay(new Date());
        
        return cardsData.filter(card => {
          const srs = get().srsDataMap[card.id];
          if (!srs) return true; // new card without SRS data is due today
          
          const reviewDate = srs.nextReviewDate ? parseISO(srs.nextReviewDate) : new Date();
          return isBefore(reviewDate, addDays(today, 1));
        }).map(card => ({
          ...card,
          srsData: get().srsDataMap[card.id] || { ...defaultSrs, nextReviewDate: new Date().toISOString() }
        }));
      },

      getAllCards: () => {
        return cardsData.map(card => ({
          ...card,
          srsData: get().srsDataMap[card.id] || { ...defaultSrs, nextReviewDate: new Date().toISOString() }
        }));
      },

      resetProgress: () => {
        set({
          srsDataMap: {},
          stats: { totalReviews: 0, cardsLearned: 0 },
          favorites: []
        });
      }
    }),
    {
      name: 'deutsch-lernen-storage',
      partialize: (state) => ({ 
        srsDataMap: state.srsDataMap, 
        stats: state.stats,
        favorites: state.favorites
      }),
    }
  )
);
