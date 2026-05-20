import React from 'react';
import { useStore } from '../store/useStore';
import { Brain, Flame, Target, BookOpen, Settings } from 'lucide-react';

const Dashboard = () => {
  const cards = useStore(state => state.getAllCards());
  const stats = useStore(state => state.stats);
  const getCardsDueToday = useStore(state => state.getCardsDueToday);
  const resetProgress = useStore(state => state.resetProgress);
  
  const dueToday = getCardsDueToday().length;
  const totalCards = cards.length;
  const retentionRate = stats.totalReviews > 0 
    ? Math.round((stats.cardsLearned / stats.totalReviews) * 100) 
    : 0;

  // Calculate cards by deck file
  const typeStats = cards.reduce((acc, card) => {
    const deckName = card.deck || 'Uncategorized';
    acc[deckName] = (acc[deckName] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Due Today</p>
            <p className="text-2xl font-bold text-white">{dueToday}</p>
          </div>
        </div>
        
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Learned</p>
            <p className="text-2xl font-bold text-white">{stats.cardsLearned}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Cards</p>
            <p className="text-2xl font-bold text-white">{totalCards}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Retention</p>
            <p className="text-2xl font-bold text-white">{Math.min(100, retentionRate)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="text-indigo-400" size={20} />
          Deck Breakdown
        </h2>
        <div className="space-y-4">
          {Object.entries(typeStats).map(([deck, count]) => (
            <div key={deck} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium text-slate-300 truncate" title={deck}>{deck}</span>
              <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${(count / totalCards) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
              resetProgress();
            }
          }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <Settings size={16} />
          Reset Progress
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
