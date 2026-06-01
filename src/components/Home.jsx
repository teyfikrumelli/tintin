import React from 'react';
import { useStore } from '../store/useStore';
import { Layers, Play, BookOpen } from 'lucide-react';
import { isBefore, addDays, startOfDay, parseISO } from 'date-fns';
import { isDue, isLearned, isLearning } from '../lib/srsUtils';

const Home = ({ onStartStudy }) => {
  const cards = useStore(state => state.getAllCards());
  const getCardsDueToday = useStore(state => state.getCardsDueToday);
  const activeDecks = useStore(state => state.activeDecks || {});
  const toggleDeckActive = useStore(state => state.toggleDeckActive);
  
  const dueCards = getCardsDueToday();
  const dueTodayCount = dueCards.length;

  // Group cards by deck
  const decksMap = cards.reduce((acc, card) => {
    const deckName = card.deck || 'Uncategorized';
    if (!acc[deckName]) {
      acc[deckName] = { 
        name: deckName, 
        deckId: card.deckId, 
        total: 0, 
        due: 0, 
        learned: 0, 
        learning: 0, 
        new: 0 
      };
    }
    acc[deckName].total += 1;
    
    if (isLearned(card)) acc[deckName].learned += 1;
    else if (isLearning(card)) acc[deckName].learning += 1;
    else acc[deckName].new += 1;
    
    return acc;
  }, {});

  // Populate due counts for each deck individually
  Object.keys(decksMap).forEach(deckName => {
    decksMap[deckName].due = getCardsDueToday(deckName).length;
  });

  // Sort: active decks on top, then alphabetically
  const decksList = Object.values(decksMap).sort((a, b) => {
    const aActive = activeDecks[a.deckId] !== false;
    const bActive = activeDecks[b.deckId] !== false;
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-2">Mein Wortschatz</h2>
        <p className="text-slate-400">Wähle einen Stapel aus, um mit dem Lernen zu beginnen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Individual Sub-Decks */}
        {decksList.map(deck => {
          const isActive = activeDecks[deck.deckId] !== false;
          
          return (
            <div 
              key={deck.name}
              className={`group bg-slate-800/50 backdrop-blur border p-5 rounded-2xl flex flex-col gap-4 transition-all duration-300 ${
                isActive 
                  ? 'border-slate-700/50 hover:border-slate-500 cursor-pointer' 
                  : 'border-slate-800/40 opacity-50 cursor-default'
              }`}
              onClick={() => isActive && onStartStudy(deck.name)}
            >
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-slate-700/50 text-slate-300 group-hover:text-white' 
                      : 'bg-slate-800/80 text-slate-600'
                  }`}>
                    <BookOpen size={20} />
                  </div>
                  <h3 className={`text-lg font-bold truncate ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {deck.name}
                  </h3>
                </div>
                
                {/* Active/Inactive Toggle Switch */}
                <label 
                  className="relative inline-flex items-center cursor-pointer select-none shrink-0" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={() => toggleDeckActive(deck.deckId)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span className="text-green-400">{deck.learned} Gelernt</span>
                    <span className="text-yellow-500">{deck.learning} Lernen</span>
                    <span>{deck.new} Neu</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1 mb-1 flex">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${deck.total > 0 ? (deck.learned / deck.total) * 100 : 0}%` }}
                    />
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ width: `${deck.total > 0 ? (deck.learning / deck.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    {isActive ? (
                      <span className={deck.due > 0 ? 'text-red-400' : 'text-green-400'}>
                        {deck.due} heute fällig
                      </span>
                    ) : (
                      <span className="text-slate-500">Inaktiv</span>
                    )}
                    <span className="text-slate-500 text-xs">{deck.total} Gesamt</span>
                  </div>
                </div>
                
                {isActive ? (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-indigo-500 transition-colors text-white shrink-0">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </div>
                ) : (
                  <div className="text-slate-600 text-xs font-semibold px-2 py-1 bg-slate-800/80 rounded-lg shrink-0 select-none">
                    Deaktiviert
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
