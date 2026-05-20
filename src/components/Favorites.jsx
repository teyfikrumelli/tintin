import React from 'react';
import { useStore } from '../store/useStore';
import { Heart, Volume2, Play } from 'lucide-react';

const Favorites = ({ onStartStudy }) => {
  const cards = useStore(state => state.getAllCards());
  const favorites = useStore(state => state.favorites);
  const toggleFavorite = useStore(state => state.toggleFavorite);

  const favoriteCards = cards.filter(card => favorites.includes(card.id));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Heart className="text-red-500" fill="currentColor" size={24} />
          Favoriten
        </h2>
        <p className="text-slate-400">Deine individuell gespeicherten Vokabeln.</p>
      </div>

      {favoriteCards.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center text-slate-400">
          Noch keine Favoriten. Tippe auf das Herz-Symbol auf einer Karte, um sie hier zu speichern!
        </div>
      ) : (
        <>
          <div className="max-w-xl mb-4">
            <div 
              className="group bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 sm:p-8 rounded-3xl flex flex-col gap-6 hover:border-red-500/50 transition-colors cursor-pointer relative overflow-hidden"
              onClick={onStartStudy}
            >
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl group-hover:bg-red-500/20 transition-colors">
                    <Heart size={32} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Favoriten lernen</h3>
                    <p className="text-slate-400 mt-1">Wiederhole deine gespeicherten Karten separat</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-6 border-t border-slate-700/50 relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-400">Gesamt</span>
                  <span className="text-2xl font-bold text-red-400">
                    {favoriteCards.length} {favoriteCards.length === 1 ? 'Karte' : 'Karten'}
                  </span>
                </div>
                
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors flex items-center justify-center shadow-xl shadow-red-500/20 group-hover:scale-105"
                >
                  <Play size={24} fill="currentColor" className="ml-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteCards.map(card => (
            <div key={card.id} className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{card.type}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{card.german}</h3>
                  <p className="text-slate-300 text-sm mt-1">{card.turkish}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="text-slate-500 hover:text-indigo-400 transition-colors p-2"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(card.german);
                        utterance.lang = 'de-DE';
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                  >
                    <Volume2 size={20} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-400 transition-colors p-2"
                    onClick={() => toggleFavorite(card.id)}
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-700/50 text-sm">
                <p className="text-slate-400 italic">"{card.germanExample}"</p>
                <p className="text-slate-500 mt-1">"{card.turkishExample}"</p>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
};

export default Favorites;
