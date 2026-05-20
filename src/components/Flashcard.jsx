import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

const Flashcard = ({ card, isFlipped, setIsFlipped }) => {
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const isFavorite = useStore(state => state.favorites.includes(card.id));

  return (
    <div 
      className="w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4] perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front (German) */}
        <div className="absolute w-full h-full backface-hidden bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-xl flex flex-col p-6 items-center justify-center text-center gap-6">
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
                 className="text-slate-500 hover:text-indigo-400 transition-colors p-2"
                 onClick={(e) => {
                   e.stopPropagation();
                   if ('speechSynthesis' in window) {
                     const utterance = new SpeechSynthesisUtterance(card.german);
                     utterance.lang = 'de-DE';
                     window.speechSynthesis.speak(utterance);
                   }
                 }}
            >
              <Volume2 size={24} />
            </button>
            <button
                 className={`transition-colors p-2 ${isFavorite ? 'text-red-500 hover:text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleFavorite(card.id);
                 }}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <span className="text-indigo-400 font-medium text-sm tracking-widest uppercase mt-4">{card.type}</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white break-words">{card.german}</h2>
          <p className="text-slate-400 text-sm mt-auto mb-4">Tap to flip</p>
        </div>

        {/* Back (Turkish) */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-900 to-slate-800 border-2 border-indigo-500/50 rounded-3xl shadow-xl flex flex-col p-6 items-center justify-center text-center rotate-y-180">
          <span className="text-indigo-300 font-medium text-sm tracking-widest uppercase mb-4">{card.type}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">{card.turkish}</h2>
          
          <div className="w-full bg-slate-900/50 rounded-xl p-4 mt-4 border border-slate-700/50 text-left">
            <p className="text-slate-300 italic mb-2">"{card.germanExample}"</p>
            <p className="text-slate-400 text-sm">"{card.turkishExample}"</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcard;
