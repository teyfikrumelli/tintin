import React from 'react';
import { useStore } from '../store/useStore';
import { Brain, Flame, Target, BookOpen, Settings } from 'lucide-react';
import { isBefore, addDays, startOfDay, parseISO } from 'date-fns';
import { isDue, isLearned, isLearning } from '../lib/srsUtils';

const Dashboard = () => {
  const cards = useStore(state => state.getAllCards());
  const stats = useStore(state => state.stats);
  const resetProgress = useStore(state => state.resetProgress);
  
  const today = startOfDay(new Date());

  const totalCards = cards.length;
  const dueTodayCount = cards.filter(card => isDue(card, today)).length;
  const learnedCardsCount = cards.filter(isLearned).length;
  const learningCardsCount = cards.filter(isLearning).length;
  const newCardsCount = totalCards - learnedCardsCount - learningCardsCount;
  
  const retentionRate = stats.totalReviews > 0 
    ? Math.round((stats.cardsLearned / stats.totalReviews) * 100) 
    : 0;

  const qualityDist = stats.qualityDistribution || { 1: 0, 3: 0, 4: 0, 5: 0 };
  const totalQualityReviews = qualityDist[1] + qualityDist[3] + qualityDist[4] + qualityDist[5];
  const getQualityPercent = (q) => totalQualityReviews > 0 ? (qualityDist[q] / totalQualityReviews) * 100 : 0;

  // Calculate cards by deck file
  const deckStatsMap = cards.reduce((acc, card) => {
    const deckName = card.deck || 'Uncategorized';
    if (!acc[deckName]) {
      acc[deckName] = { name: deckName, total: 0, learned: 0, learning: 0, new: 0, due: 0, q1: 0, q3: 0, q4: 0, q5: 0 };
    }
    acc[deckName].total += 1;
    if (isLearned(card)) acc[deckName].learned += 1;
    else if (isLearning(card)) acc[deckName].learning += 1;
    else acc[deckName].new += 1;
    
    if (isDue(card, today)) acc[deckName].due += 1;
    
    if (card.srsData && card.srsData.lastQuality) {
      const q = card.srsData.lastQuality;
      if (q === 1) acc[deckName].q1 += 1;
      if (q === 3) acc[deckName].q3 += 1;
      if (q === 4) acc[deckName].q4 += 1;
      if (q === 5) acc[deckName].q5 += 1;
    }
    
    return acc;
  }, {});

  const deckStatsList = Object.values(deckStatsMap).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Fällig (Due)</p>
            <p className="text-2xl font-bold text-white">{dueTodayCount}</p>
          </div>
        </div>
        
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-slate-500/20 text-slate-400 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-400">Neu</span>
            <p className="text-2xl font-bold text-white">{newCardsCount}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-xl">
            <Brain size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-400">Lernen</span>
            <p className="text-2xl font-bold text-white">{learningCardsCount}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-400">Gelernt</span>
            <p className="text-2xl font-bold text-white">{learnedCardsCount}</p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Gesamt</p>
            <p className="text-2xl font-bold text-white">{totalCards}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="text-indigo-400" size={20} />
          Antwort-Verteilung
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs sm:text-sm font-medium">
            <div className="text-red-400 flex flex-col sm:flex-row justify-center gap-1"><span>Nochmal</span><span>({qualityDist[1]})</span></div>
            <div className="text-blue-400 flex flex-col sm:flex-row justify-center gap-1"><span>Schwer</span><span>({qualityDist[3]})</span></div>
            <div className="text-green-400 flex flex-col sm:flex-row justify-center gap-1"><span>Gut</span><span>({qualityDist[4]})</span></div>
            <div className="text-indigo-400 flex flex-col sm:flex-row justify-center gap-1"><span>Einfach</span><span>({qualityDist[5]})</span></div>
          </div>
          <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden flex ring-1 ring-slate-700/50">
            {totalQualityReviews === 0 ? (
              <div className="h-full w-full bg-slate-700" />
            ) : (
              <>
                <div style={{ width: `${getQualityPercent(1)}%` }} className="h-full bg-red-500 transition-all" title={`Nochmal: ${Math.round(getQualityPercent(1))}%`} />
                <div style={{ width: `${getQualityPercent(3)}%` }} className="h-full bg-blue-500 transition-all" title={`Schwer: ${Math.round(getQualityPercent(3))}%`} />
                <div style={{ width: `${getQualityPercent(4)}%` }} className="h-full bg-green-500 transition-all" title={`Gut: ${Math.round(getQualityPercent(4))}%`} />
                <div style={{ width: `${getQualityPercent(5)}%` }} className="h-full bg-indigo-500 transition-all" title={`Einfach: ${Math.round(getQualityPercent(5))}%`} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="text-indigo-400" size={20} />
          Stapelübersicht
        </h2>
        <div className="space-y-4">
          {deckStatsList.map(deck => {
            const learnedPercent = deck.total > 0 ? (deck.learned / deck.total) * 100 : 0;
            const learningPercent = deck.total > 0 ? (deck.learning / deck.total) * 100 : 0;
            
            return (
              <div key={deck.name} className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white truncate" title={deck.name}>{deck.name}</span>
                  <div className="flex gap-2 text-xs font-bold text-slate-400">
                    <span className="text-green-400">{deck.learned} Gelernt</span>
                    <span className="text-yellow-500">{deck.learning} Lernen</span>
                  </div>
                </div>
                
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${learnedPercent}%` }}
                    title={`${Math.round(learnedPercent)}% Gelernt`}
                  />
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${learningPercent}%` }}
                    title={`${Math.round(learningPercent)}% Lernen`}
                  />
                  <div 
                    className="h-full bg-indigo-500/50"
                    style={{ width: `${100 - learnedPercent - learningPercent}%` }}
                    title={`${Math.round(100 - learnedPercent - learningPercent)}% Neu`}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{deck.new} Neu</span>
                  <div className="flex items-center gap-2">
                    <span className={deck.due > 0 ? 'text-red-400 font-bold' : 'text-slate-500'}>
                      {deck.due > 0 ? `${deck.due} heute fällig` : 'Keine fällig'}
                    </span>
                    <span className="text-slate-600">({deck.total} Gesamt)</span>
                  </div>
                </div>
                {(deck.q1 > 0 || deck.q3 > 0 || deck.q4 > 0 || deck.q5 > 0) && (
                  <div className="mt-1 pt-2 border-t border-slate-700/50 flex flex-wrap gap-2 text-[10px] font-medium">
                    {deck.q1 > 0 && <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Nochmal: {deck.q1}</span>}
                    {deck.q3 > 0 && <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Schwer: {deck.q3}</span>}
                    {deck.q4 > 0 && <span className="text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">Gut: {deck.q4}</span>}
                    {deck.q5 > 0 && <span className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Einfach: {deck.q5}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button 
          onClick={resetProgress}
          className="w-full sm:w-auto px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium rounded-xl transition-colors border border-red-500/20"
        >
          Fortschritt zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
