import React from 'react';
import { useStore } from '../store/useStore';
import { Layers, Play, BookOpen } from 'lucide-react';
import { isBefore, addDays, startOfDay, parseISO } from 'date-fns';

const Home = ({ onStartStudy }) => {
  const cards = useStore(state => state.getAllCards());
  
  // Calculate due cards logic manually since store method returns all due cards
  const today = startOfDay(new Date());
  const isDue = (card) => {
    const srs = card.srsData;
    if (!srs || !srs.nextReviewDate) return true;
    const reviewDate = parseISO(srs.nextReviewDate);
    return isBefore(reviewDate, addDays(today, 1));
  };

  const dueTodayCount = cards.filter(isDue).length;

  // Group cards by deck
  const decksMap = cards.reduce((acc, card) => {
    const deckName = card.deck || 'Uncategorized';
    if (!acc[deckName]) {
      acc[deckName] = { name: deckName, total: 0, due: 0 };
    }
    acc[deckName].total += 1;
    if (isDue(card)) acc[deckName].due += 1;
    return acc;
  }, {});

  const decksList = Object.values(decksMap).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-2">My Vocabulary</h2>
        <p className="text-slate-400">Select a deck below or review your unified collection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* All Flashcards Main Deck */}
        <div 
          className="group bg-slate-800/80 backdrop-blur border border-indigo-500/30 p-6 rounded-3xl flex flex-col gap-6 hover:border-indigo-500/80 transition-colors cursor-pointer relative overflow-hidden md:col-span-2"
          onClick={() => onStartStudy('all')}
        >
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex gap-4 items-center">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                <Layers size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">All Flashcards</h3>
                <p className="text-slate-400 mt-1">{cards.length} total cards in collection</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-6 border-t border-slate-700/50 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-400">Due for review</span>
              <span className={`text-2xl font-bold ${
                dueTodayCount > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {dueTodayCount} {dueTodayCount === 1 ? 'card' : 'cards'}
              </span>
            </div>
            
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full transition-colors flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-105">
              <Play size={24} fill="currentColor" className="ml-1" />
            </button>
          </div>
        </div>

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
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Total Cards: {deck.total}</span>
                <span className={`text-sm font-bold ${deck.due > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {deck.due} due today
                </span>
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
