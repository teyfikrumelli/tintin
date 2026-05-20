import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Flashcard from './Flashcard';
import { X, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudySession = ({ mode = 'all', onFinish }) => {
  const getCardsDueToday = useStore(state => state.getCardsDueToday);
  const getAllCards = useStore(state => state.getAllCards);
  const favorites = useStore(state => state.favorites);
  const reviewCard = useStore(state => state.reviewCard);
  
  const [cardsToStudy, setCardsToStudy] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Fisher-Yates shuffle to randomize cards
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    let cards = [];
    if (mode === 'favorites') {
      cards = getAllCards().filter(card => favorites.includes(card.id));
    } else if (mode === 'all') {
      cards = getCardsDueToday();
    } else {
      // It's a specific deck name
      const dueToday = getCardsDueToday();
      cards = dueToday.filter(card => card.deck === mode);
    }
    setCardsToStudy(shuffleArray(cards));
  }, [mode, getCardsDueToday, getAllCards, favorites]);

  const handleReview = (quality) => {
    const currentCard = cardsToStudy[currentIndex];
    reviewCard(currentCard.id, quality);

    // If card was rated Hard (1 or 2), we could put it at the end of the session queue
    // For simplicity, we stick to the SM-2 daily schedule.
    
    if (currentIndex < cardsToStudy.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished || cardsToStudy.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-8 rounded-3xl flex flex-col items-center text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're All Caught Up!</h2>
          <p className="text-slate-400 mb-8">
            {cardsToStudy.length === 0 
              ? (mode === 'favorites' ? "You have no favorite cards to study." : "No more cards due today. Great job!")
              : "You've finished your review session for today."}
          </p>
          <button 
            onClick={onFinish}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cardsToStudy[currentIndex];
  const progress = ((currentIndex) / cardsToStudy.length) * 100;

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
      {/* Header / Progress */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button 
          onClick={onFinish}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-400 w-12 text-right">
          {currentIndex + 1} / {cardsToStudy.length}
        </span>
      </div>

      {/* Flashcard Area */}
      <div className="flex-1 flex flex-col justify-center mb-4 relative perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -50, rotateY: 10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Flashcard 
              card={currentCard} 
              isFlipped={isFlipped} 
              setIsFlipped={setIsFlipped} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Area */}
      <div className="h-20 sm:h-28 mt-auto pb-2 shrink-0">
        {isFlipped ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 sm:gap-4 max-w-sm mx-auto"
          >
            <button 
              onClick={() => handleReview(1)}
              className="flex-1 flex flex-col items-center gap-1 bg-slate-800 border-2 border-red-500/50 hover:bg-red-500/20 hover:border-red-500 text-white p-3 sm:p-4 rounded-2xl transition-all"
            >
              <RefreshCw size={20} className="text-red-400 mb-1" />
              <span className="font-bold text-sm sm:text-base">Again</span>
              <span className="text-xs text-slate-400">&lt; 1m</span>
            </button>
            <button 
              onClick={() => handleReview(3)}
              className="flex-1 flex flex-col items-center gap-1 bg-slate-800 border-2 border-blue-500/50 hover:bg-blue-500/20 hover:border-blue-500 text-white p-3 sm:p-4 rounded-2xl transition-all"
            >
              <span className="font-bold text-sm sm:text-base mt-auto">Hard</span>
              <span className="text-xs text-slate-400">1d</span>
            </button>
            <button 
              onClick={() => handleReview(4)}
              className="flex-1 flex flex-col items-center gap-1 bg-slate-800 border-2 border-green-500/50 hover:bg-green-500/20 hover:border-green-500 text-white p-3 sm:p-4 rounded-2xl transition-all"
            >
              <span className="font-bold text-sm sm:text-base mt-auto">Good</span>
              <span className="text-xs text-slate-400">3d</span>
            </button>
            <button 
              onClick={() => handleReview(5)}
              className="flex-1 flex flex-col items-center gap-1 bg-slate-800 border-2 border-indigo-500/50 hover:bg-indigo-500/20 hover:border-indigo-500 text-white p-3 sm:p-4 rounded-2xl transition-all"
            >
              <span className="font-bold text-sm sm:text-base mt-auto">Easy</span>
              <span className="text-xs text-slate-400">7d</span>
            </button>
          </motion.div>
        ) : (
          <div className="flex justify-center h-full max-w-sm mx-auto items-center text-slate-500 animate-pulse">
            Tap the card to reveal the answer
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySession;
