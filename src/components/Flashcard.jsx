import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

const Flashcard = ({ card, isFlipped, setIsFlipped }) => {
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const isFavorite = useStore(state => state.favorites.includes(card.id));

  return (
    <div 
      className="w-full max-w-sm sm:max-w-md mx-auto h-[55vh] min-h-[320px] max-h-[500px] perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front (German) */}
        <div className="absolute w-full h-full backface-hidden bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-xl flex flex-col p-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
                 className="text-slate-500 hover:text-indigo-400 transition-colors p-2 bg-slate-800/80 rounded-full backdrop-blur"
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
                 className={`transition-colors p-2 bg-slate-800/80 rounded-full backdrop-blur ${isFavorite ? 'text-red-500 hover:text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleFavorite(card.id);
                 }}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          <div className="my-auto w-full flex flex-col items-center text-center pt-8 pb-4">
            <span className="text-indigo-400 font-medium text-sm tracking-widest uppercase mb-4">{card.type}</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white break-words w-full px-2">{card.german}</h2>
          </div>
          
          <p className="text-slate-400 text-sm mx-auto mt-auto shrink-0 pb-2">Tippen zum Umdrehen</p>
        </div>

        {/* Back (Turkish) */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-900 to-slate-800 border-2 border-indigo-500/50 rounded-3xl shadow-xl flex flex-col p-6 rotate-y-180 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="my-auto w-full flex flex-col items-center text-center">
            <span className="text-indigo-300 font-medium text-sm tracking-widest uppercase mb-4">{card.type}</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 break-words w-full">{card.turkish}</h2>
            
            <div className="w-full bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 text-left shrink-0">
              <p className="text-slate-300 italic mb-3">"{card.germanExample}"</p>
              <p className="text-slate-400 text-sm">"{card.turkishExample}"</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcard;
