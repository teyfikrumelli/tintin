import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Search, Heart, Volume2, LayoutList } from 'lucide-react';
import { isLearned, isLearning } from '../lib/srsUtils';

const CardBrowser = () => {
  const cards = useStore(state => state.getAllCards());
  const favorites = useStore(state => state.favorites);
  const toggleFavorite = useStore(state => state.toggleFavorite);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, learned, learning, new

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // 1. Apply Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesGerman = card.german.toLowerCase().includes(query);
        const matchesTurkish = card.turkish.toLowerCase().includes(query);
        if (!matchesGerman && !matchesTurkish) return false;
      }

      // 2. Apply Status Filter
      if (statusFilter !== 'all') {
        const learned = isLearned(card);
        const learning = isLearning(card);
        const isNew = !learned && !learning;

        if (statusFilter === 'learned' && !learned) return false;
        if (statusFilter === 'learning' && !learning) return false;
        if (statusFilter === 'new' && !isNew) return false;
      }

      return true;
    });
  }, [cards, searchQuery, statusFilter]);

  // Limit rendering to first 100 cards to prevent performance issues on huge datasets
  const displayedCards = filteredCards.slice(0, 100);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <LayoutList className="text-indigo-400" size={24} />
          Alle Karten
        </h2>
        <p className="text-slate-400">Durchsuche deinen gesamten Wortschatz.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Suchen nach Deutsch oder Türkisch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'all' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Alle ({cards.length})
          </button>
          <button
            onClick={() => setStatusFilter('learned')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              statusFilter === 'learned' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
            }`}
          >
            Gelernt
          </button>
          <button
            onClick={() => setStatusFilter('learning')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              statusFilter === 'learning' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
            }`}
          >
            Lernen
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              statusFilter === 'new' 
                ? 'bg-slate-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Neu
          </button>
        </div>
      </div>

      <div className="text-sm font-medium text-slate-500">
        Zeigt {displayedCards.length} von {filteredCards.length} Ergebnissen
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedCards.map(card => {
          const isFav = favorites.includes(card.id);
          const learned = isLearned(card);
          const learning = isLearning(card);
          
          let statusLabel = 'Neu';
          let statusColor = 'text-slate-400 bg-slate-800';
          if (learned) {
            statusLabel = 'Gelernt';
            statusColor = 'text-green-400 bg-green-500/10';
          } else if (learning) {
            statusLabel = 'Lernen';
            statusColor = 'text-yellow-500 bg-yellow-500/10';
          }

          return (
            <div key={card.id} className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{card.type}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusColor}`}>{statusLabel}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{card.german}</h3>
                  <p className="text-slate-300 text-sm mt-1">{card.turkish}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    className="text-slate-500 hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-700"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(card.german);
                        utterance.lang = 'de-DE';
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                  >
                    <Volume2 size={18} />
                  </button>
                  <button
                    className={`transition-colors p-2 rounded-full hover:bg-slate-700 ${isFav ? 'text-red-500' : 'text-slate-500 hover:text-red-400'}`}
                    onClick={() => toggleFavorite(card.id)}
                  >
                    <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700/50 text-xs">
                <p className="text-slate-400 italic">"{card.germanExample}"</p>
                <p className="text-slate-500 mt-0.5">"{card.turkishExample}"</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredCards.length > 100 && (
        <div className="text-center text-slate-500 text-sm italic mt-4">
          Es gibt noch mehr Ergebnisse. Verfeinere deine Suche, um sie zu sehen.
        </div>
      )}
    </div>
  );
};

export default CardBrowser;
