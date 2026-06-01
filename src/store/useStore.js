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
    .map(word => {
      if (word.toLowerCase() === 'vhs') return 'VHS';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
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
      customCards: [], // Array of custom cards created by the user
      dailyNewLimit: 20, // Daily new cards limit
      activeDecks: {}, // Maps deckId -> boolean (default true)
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

      toggleDeckActive: (deckId) => {
        set((state) => {
          const current = state.activeDecks?.[deckId] !== false;
          return {
            activeDecks: {
              ...(state.activeDecks || {}),
              [deckId]: !current
            }
          };
        });
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

      addCustomCard: (cardData) => {
        set((state) => {
          const newCard = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            deck: cardData.deck || 'Eigene Karten',
            deckId: (cardData.deck || 'Eigene Karten').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            type: cardData.type || 'Nomen',
            german: cardData.german,
            turkish: cardData.turkish,
            germanExample: cardData.germanExample || '',
            turkishExample: cardData.turkishExample || ''
          };
          return {
            customCards: [...(state.customCards || []), newCard]
          };
        });
      },

      addCustomCards: (cardsList) => {
        set((state) => {
          const newCards = cardsList.map((cardData, idx) => ({
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${idx}`,
            deck: cardData.deck || 'Eigene Karten',
            deckId: (cardData.deck || 'Eigene Karten').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            type: cardData.type || 'Nomen',
            german: cardData.german,
            turkish: cardData.turkish,
            germanExample: cardData.germanExample || '',
            turkishExample: cardData.turkishExample || ''
          }));
          return {
            customCards: [...(state.customCards || []), ...newCards]
          };
        });
      },

      deleteCustomCard: (cardId) => {
        set((state) => {
          const updatedCustomCards = (state.customCards || []).filter(c => c.id !== cardId);
          const updatedSrsDataMap = { ...state.srsDataMap };
          delete updatedSrsDataMap[cardId];
          return {
            customCards: updatedCustomCards,
            srsDataMap: updatedSrsDataMap
          };
        });
      },

      setDailyNewLimit: (limit) => {
        set({ dailyNewLimit: limit });
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
        const allCards = [...cardsData, ...(get().customCards || [])];
        const activeDecks = get().activeDecks || {};
        
        // Filter cards by deck if a specific deck is requested
        let filteredCardsData = allCards;
        if (deckName && deckName !== 'all') {
          const deckCards = allCards.filter(card => card.deck === deckName);
          const deckId = deckCards[0]?.deckId;
          if (deckId && activeDecks[deckId] === false) {
            return [];
          }
          filteredCardsData = deckCards;
        } else {
          filteredCardsData = allCards.filter(card => activeDecks[card.deckId] !== false);
        }
        
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
        
        const baseLimit = get().dailyNewLimit || 20;
        const DAILY_NEW_LIMIT = baseLimit + increment;
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
        const allCards = [...cardsData, ...(get().customCards || [])];
        return allCards.map(card => ({
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
          newCardsLimitIncrements: {},
          customCards: [],
          dailyNewLimit: 20,
          activeDecks: {}
        });
      },

      resetDeckProgress: (deckName) => {
        set((state) => {
          const allCards = [...cardsData, ...(state.customCards || [])];
          const cardsInDeck = allCards.filter(card => card.deck === deckName);
          const updatedSrsDataMap = { ...state.srsDataMap };
          
          cardsInDeck.forEach(card => {
            delete updatedSrsDataMap[card.id];
          });
          
          const todayStr = startOfDay(new Date()).toISOString().split('T')[0];
          const updatedIncrements = { ...state.newCardsLimitIncrements };
          if (updatedIncrements[todayStr]) {
            const dayIncrements = { ...updatedIncrements[todayStr] };
            delete dayIncrements[deckName];
            updatedIncrements[todayStr] = dayIncrements;
          }
          
          return {
            srsDataMap: updatedSrsDataMap,
            newCardsLimitIncrements: updatedIncrements
          };
        });
      },

      importProgress: (importedData) => {
        if (!importedData || typeof importedData !== 'object') return;
        set((state) => ({
          srsDataMap: importedData.srsDataMap || state.srsDataMap,
          stats: importedData.stats || state.stats,
          favorites: importedData.favorites || state.favorites,
          newCardsLimitIncrements: importedData.newCardsLimitIncrements || state.newCardsLimitIncrements || {},
          customCards: importedData.customCards || state.customCards || [],
          dailyNewLimit: importedData.dailyNewLimit || state.dailyNewLimit || 20,
          activeDecks: importedData.activeDecks || state.activeDecks || {}
        }));
      }
    }),
    {
      name: 'deutsch-lernen-storage',
      partialize: (state) => ({ 
        srsDataMap: state.srsDataMap, 
        stats: state.stats,
        favorites: state.favorites,
        newCardsLimitIncrements: state.newCardsLimitIncrements,
        customCards: state.customCards,
        dailyNewLimit: state.dailyNewLimit,
        activeDecks: state.activeDecks
      }),
    }
  )
);
