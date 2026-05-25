import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Flashcard from './Flashcard';
import { X, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSM2 } from '../lib/sm2';

const StudySession = ({ mode = 'all', onFinish }) => {
  const getCardsDueToday = useStore(state => state.getCardsDueToday);
  const getAllCards = useStore(state => state.getAllCards);
  const reviewCard = useStore(state => state.reviewCard);
  const increaseNewCardsLimit = useStore(state => state.increaseNewCardsLimit);
  const newCardsLimitIncrements = useStore(state => state.newCardsLimitIncrements);
  
  const [cardsToStudy, setCardsToStudy] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [initialTotalCards, setInitialTotalCards] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [clickedButton, setClickedButton] = useState(null);

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
      const currentFavorites = useStore.getState().favorites;
      cards = getAllCards().filter(card => currentFavorites.includes(card.id));
    } else {
      cards = getCardsDueToday(mode);
    }
    const shuffled = shuffleArray(cards);
    setCardsToStudy(shuffled);
    setInitialTotalCards(shuffled.length);
    setCompletedCount(0);
    setCurrentIndex(0);
    setIsFinished(false);
  }, [mode, getCardsDueToday, getAllCards, newCardsLimitIncrements]);

  const handleReview = (quality) => {
    setClickedButton(quality);
    setTimeout(() => {
      const currentCard = cardsToStudy[currentIndex];
      reviewCard(currentCard.id, quality);

      setClickedButton(null);
      const willRequeue = quality === 1;

      if (willRequeue) {
        setCardsToStudy(prev => [...prev, currentCard]);
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
      } else {
        setCompletedCount(prev => prev + 1);
        if (currentIndex < cardsToStudy.length - 1) {
          setIsFlipped(false);
          setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        } else {
          setIsFinished(true);
        }
      }
    }, 200);
  };

  // Calculate remaining unseen cards in this deck/all to see if they can study more
  const handlePracticeRestart = () => {
    let cards = [];
    if (mode === 'favorites') {
      const currentFavorites = useStore.getState().favorites;
      cards = getAllCards().filter(card => currentFavorites.includes(card.id));
    } else {
      cards = mode === 'all' ? getAllCards() : getAllCards().filter(c => c.deck === mode);
    }
    const shuffled = shuffleArray(cards);
    setCardsToStudy(shuffled);
    setInitialTotalCards(shuffled.length);
    setCompletedCount(0);
    setCurrentIndex(0);
    setIsFinished(false);
  };

  const allCards = getAllCards();
  const deckCards = mode === 'all' ? allCards : allCards.filter(c => c.deck === mode);
  const unseenCount = deckCards.filter(c => !c.srsData || !c.srsData.introducedDate).length;
  const canStudyMore = mode !== 'favorites' && unseenCount > 0;

  if (isFinished || cardsToStudy.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-8 rounded-3xl flex flex-col items-center text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Alles erledigt!</h2>
          <p className="text-slate-400 mb-8">
            {cardsToStudy.length === 0 
              ? (mode === 'favorites' ? "Du hast keine Favoriten zum Lernen." : "Keine Karten mehr für heute fällig. Super gemacht!")
              : "Du hast deine heutige Lernsitzung beendet."}
          </p>
          <button 
            onClick={onFinish}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
          >
            Zurück zur Übersicht
          </button>
          {canStudyMore && (
            <button 
              onClick={() => {
                increaseNewCardsLimit(mode, 20);
              }}
              className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors border border-slate-600 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              Weitere 20 neue Karten lernen
            </button>
          )}
          {!canStudyMore && deckCards.length > 0 && (
            <button 
              onClick={handlePracticeRestart}
              className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold py-3 px-4 rounded-xl transition-colors border border-slate-700 shadow-md flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <RefreshCw size={16} />
              Stapel üben (Alle Karten)
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentCard = cardsToStudy[currentIndex];
  const progress = initialTotalCards > 0 ? (completedCount / initialTotalCards) * 100 : 0;

  const getIntervalLabel = (quality) => {
    if (!currentCard) return '';
    const srs = currentCard.srsData || { interval: 0, repetition: 0, efactor: 2.5 };
    const { interval } = calculateSM2(quality, srs.interval, srs.repetition, srs.efactor);
    if (interval === 0) return '< 1m';
    if (interval === 1) return '1t';
    return `${interval}t`;
  };

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
        <span className="text-sm font-bold text-slate-400 w-20 text-right">
          {cardsToStudy.length - currentIndex} übrig
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
      <div 
        className="mt-auto mb-8 sm:mb-12 shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {isFlipped ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-5 gap-1.5 sm:gap-3 w-full max-w-lg mx-auto px-1 sm:px-0"
          >
            <button 
              onClick={() => handleReview(1)}
              disabled={clickedButton !== null}
              className={`flex flex-col items-center justify-between gap-1 bg-slate-800 border-2 py-2 px-0.5 sm:p-4 rounded-2xl transition-all ${
                clickedButton === 1 ? 'border-red-500 bg-red-500/30 scale-95' : 'border-red-500/50 hover:bg-red-500/20 hover:border-red-500'
              }`}
            >
              <RefreshCw size={18} className="text-red-400 mb-1" />
              <span className="font-bold text-[10px] sm:text-sm mt-auto w-full text-center leading-tight tracking-tight break-words">Nochmal</span>
              <span className="text-[9px] sm:text-xs text-slate-400 invisible pointer-events-none select-none">1t</span>
            </button>
            <button 
              onClick={() => handleReview(3)}
              disabled={clickedButton !== null}
              className={`flex flex-col items-center justify-between gap-1 bg-slate-800 border-2 py-2 px-0.5 sm:p-4 rounded-2xl transition-all ${
                clickedButton === 3 ? 'border-blue-500 bg-blue-500/30 scale-95' : 'border-blue-500/50 hover:bg-blue-500/20 hover:border-blue-500'
              }`}
            >
              <span className="font-bold text-[10px] sm:text-sm mt-auto w-full text-center leading-tight tracking-tight break-words">Schwer</span>
              <span className="text-[9px] sm:text-xs text-slate-400">{getIntervalLabel(3)}</span>
            </button>
            <button 
              onClick={() => handleReview(4)}
              disabled={clickedButton !== null}
              className={`flex flex-col items-center justify-between gap-1 bg-slate-800 border-2 py-2 px-0.5 sm:p-4 rounded-2xl transition-all ${
                clickedButton === 4 ? 'border-green-500 bg-green-500/30 scale-95' : 'border-green-500/50 hover:bg-green-500/20 hover:border-green-500'
              }`}
            >
              <span className="font-bold text-[10px] sm:text-sm mt-auto w-full text-center leading-tight tracking-tight break-words">Gut</span>
              <span className="text-[9px] sm:text-xs text-slate-400">{getIntervalLabel(4)}</span>
            </button>
            <button 
              onClick={() => handleReview(5)}
              disabled={clickedButton !== null}
              className={`flex flex-col items-center justify-between gap-1 bg-slate-800 border-2 py-2 px-0.5 sm:p-4 rounded-2xl transition-all ${
                clickedButton === 5 ? 'border-indigo-500 bg-indigo-500/30 scale-95' : 'border-indigo-500/50 hover:bg-indigo-500/20 hover:border-indigo-500'
              }`}
            >
              <span className="font-bold text-[10px] sm:text-sm mt-auto w-full text-center leading-tight tracking-tight break-words">Einfach</span>
              <span className="text-[9px] sm:text-xs text-slate-400">{getIntervalLabel(5)}</span>
            </button>
            <button 
              onClick={() => handleReview(6)}
              disabled={clickedButton !== null}
              className={`flex flex-col items-center justify-between gap-1 bg-slate-800 border-2 py-2 px-0.5 sm:p-4 rounded-2xl transition-all ${
                clickedButton === 6 ? 'border-purple-500 bg-purple-500/30 scale-95' : 'border-purple-500/50 hover:bg-purple-500/20 hover:border-purple-500'
              }`}
            >
              <span className="font-bold text-[10px] sm:text-sm mt-auto w-full text-center leading-tight tracking-tight break-words">Bekannt</span>
              <span className="text-[9px] sm:text-xs text-slate-400">{getIntervalLabel(6)}</span>
            </button>
          </motion.div>
        ) : (
          <div className="flex justify-center h-full max-w-sm mx-auto items-center text-slate-500 animate-pulse text-center px-4">
            Tippe auf die Karte, um die Antwort zu sehen
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySession;
