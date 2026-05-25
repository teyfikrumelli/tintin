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
      newCardsLimitIncrements: {}, // Maps dateStr -> increment amount
      stats: {
        totalReviews: 0,
        cardsLearned: 0,
        qualityDistribution: {
          1: 0,
          3: 0,
          4: 0,
          5: 0
        }
      },

      increaseNewCardsLimit: (deckName, amount) => {
        set((state) => {
          const todayStr = startOfDay(new Date()).toISOString().split('T')[0];
          const increments = state.newCardsLimitIncrements || {};
          const dayIncrements = increments[todayStr] || {};
          const currentVal = dayIncrements[deckName] || 0;
          return {
            newCardsLimitIncrements: {
              ...increments,
              [todayStr]: {
                ...dayIncrements,
                [deckName]: currentVal + amount
              }
            }
          };
        });
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
          const introducedDate = currentSrs.introducedDate || new Date().toISOString();

          return {
            srsDataMap: {
              ...state.srsDataMap,
              [cardId]: {
                interval,
                repetition,
                efactor,
                nextReviewDate: nextReviewDate.toISOString(),
                lastQuality: quality,
                introducedDate
              }
            },
            stats: {
              ...state.stats,
              totalReviews: state.stats.totalReviews + 1,
              cardsLearned: state.stats.cardsLearned + (isNewlyLearned ? 1 : 0),
              qualityDistribution: {
                ...(state.stats.qualityDistribution || { 1: 0, 3: 0, 4: 0, 5: 0 }),
                [quality]: (state.stats.qualityDistribution?.[quality] || 0) + 1
              }
            }
          };
        });
      },

      getCardsDueToday: (deckName = 'all') => {
        const today = startOfDay(new Date());
        const tomorrow = addDays(today, 1);
        
        const srsDataMap = get().srsDataMap;
        
        // Filter cards by deck if a specific deck is requested
        const filteredCardsData = deckName && deckName !== 'all'
          ? cardsData.filter(card => card.deck === deckName)
          : cardsData;
        
        // Count how many new cards have been introduced today (for this deck/all)
        let introducedTodayCount = 0;
        filteredCardsData.forEach(card => {
          const srs = srsDataMap[card.id];
          if (srs && srs.introducedDate) {
            const introDate = parseISO(srs.introducedDate);
            if (isBefore(introDate, tomorrow) && !isBefore(introDate, today)) {
              introducedTodayCount++;
            }
          }
        });
        
        const todayStr = today.toISOString().split('T')[0];
        const dayIncrements = get().newCardsLimitIncrements?.[todayStr] || {};
        const increment = dayIncrements[deckName] || 0;
        
        const DAILY_NEW_LIMIT = 20 + increment;
        const newBudget = Math.max(0, DAILY_NEW_LIMIT - introducedTodayCount);
        
        const reviewCardsDue = [];
        const unseenCards = [];
        
        filteredCardsData.forEach(card => {
          const srs = srsDataMap[card.id];
          if (!srs || !srs.introducedDate) {
            unseenCards.push(card);
          } else {
            const reviewDate = srs.nextReviewDate ? parseISO(srs.nextReviewDate) : new Date();
            if (isBefore(reviewDate, tomorrow)) {
              reviewCardsDue.push(card);
            }
          }
        });
        
        const selectedNewCards = [...unseenCards]
          .sort(() => Math.random() - 0.5)
          .slice(0, newBudget);
        const allDueCards = [...reviewCardsDue, ...selectedNewCards];
        
        return allDueCards.map(card => ({
          ...card,
          srsData: srsDataMap[card.id] || { ...defaultSrs, nextReviewDate: new Date().toISOString() }
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
          stats: { 
            totalReviews: 0, 
            cardsLearned: 0,
            qualityDistribution: { 1: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
          },
          favorites: [],
          newCardsLimitIncrements: {}
        });
      },

      importProgress: (importedData) => {
        if (!importedData || typeof importedData !== 'object') return;
        set((state) => ({
          srsDataMap: importedData.srsDataMap || state.srsDataMap,
          stats: importedData.stats || state.stats,
          favorites: importedData.favorites || state.favorites,
          newCardsLimitIncrements: importedData.newCardsLimitIncrements || state.newCardsLimitIncrements || {}
        }));
      }
    }),
    {
      name: 'deutsch-lernen-storage',
      partialize: (state) => ({ 
        srsDataMap: state.srsDataMap, 
        stats: state.stats,
        favorites: state.favorites,
        newCardsLimitIncrements: state.newCardsLimitIncrements
      }),
    }
  )
);
