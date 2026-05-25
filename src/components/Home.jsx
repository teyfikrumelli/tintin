import React from 'react';
import { useStore } from '../store/useStore';
import { Layers, Play, BookOpen } from 'lucide-react';
import { isBefore, addDays, startOfDay, parseISO } from 'date-fns';
import { isDue, isLearned, isLearning } from '../lib/srsUtils';

const Home = ({ onStartStudy }) => {
  const cards = useStore(state => state.getAllCards());
  const getCardsDueToday = useStore(state => state.getCardsDueToday);
  
  const dueCards = getCardsDueToday();
  const dueTodayCount = dueCards.length;

  // Group cards by deck
  const decksMap = cards.reduce((acc, card) => {
    const deckName = card.deck || 'Uncategorized';
    if (!acc[deckName]) {
      acc[deckName] = { name: deckName, total: 0, due: 0, learned: 0, learning: 0, new: 0 };
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

  const decksList = Object.values(decksMap).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-2">Mein Wortschatz</h2>
        <p className="text-slate-400">Wähle einen Stapel aus, um mit dem Lernen zu beginnen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Individual Sub-Decks */}
        {decksList.map(deck => (
          <div 
            key={deck.name}
            className="group bg-slate-800/50 backdrop-blur border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-4 hover:border-slate-500 transition-colors cursor-pointer"
            onClick={() => onStartStudy(deck.name)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 text-slate-300 rounded-xl group-hover:text-white transition-colors">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-bold text-white flex-1">{deck.name}</h3>
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
                  <span className={deck.due > 0 ? 'text-red-400' : 'text-green-400'}>
                    {deck.due} heute fällig
                  </span>
                  <span className="text-slate-500 text-xs">{deck.total} Gesamt</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-indigo-500 transition-colors text-white">
                <Play size={14} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
