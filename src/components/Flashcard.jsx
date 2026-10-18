import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Heart, CheckCircle2, XCircle, Lightbulb, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { VARIANT_REVERSE, VARIANT_ARTIKEL, ARTICLE_STYLES } from '../lib/cardVariants';
import { getArtikelTips } from '../lib/artikelRules';

const speak = (text, lang) => {
  if (text && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
};

const CornerButtons = ({ visible, onSpeak, isFavorite, onToggleFavorite, variant = 'front' }) => {
  const base = variant === 'front'
    ? 'p-2 bg-slate-800/80 rounded-full backdrop-blur'
    : 'p-2 bg-slate-900/50 rounded-full backdrop-blur border border-slate-700/50';
  const hidden = visible ? 'opacity-100' : 'opacity-0 invisible pointer-events-none';
  return (
    <>
      <div className={`absolute top-4 right-4 z-10 transition-all duration-200 ${hidden}`}>
        <button
          className={`transition-colors ${base} ${isFavorite ? 'text-red-500 hover:text-red-400' : 'text-slate-500 hover:text-red-400'}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        >
          <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      {onSpeak && (
        <div className={`absolute top-4 left-4 z-10 transition-all duration-200 ${hidden}`}>
          <button
            className={`text-slate-500 hover:text-indigo-400 transition-colors ${base}`}
            onClick={(e) => { e.stopPropagation(); onSpeak(); }}
          >
            <Volume2 size={24} />
          </button>
        </div>
      )}
    </>
  );
};

const getSentenceTextSize = (text) => {
  if (!text) return 'text-2xl sm:text-4xl';
  const len = text.length;
  if (len > 90) return 'text-base sm:text-lg font-medium leading-relaxed';
  if (len > 60) return 'text-lg sm:text-xl font-semibold leading-relaxed';
  if (len > 35) return 'text-xl sm:text-2xl font-bold leading-snug';
  if (len > 18) return 'text-2xl sm:text-3xl font-bold leading-snug';
  return 'text-3xl sm:text-5xl font-bold';
};

const SentenceVariations = ({ variations }) => {
  if (!variations || variations.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 my-3 text-left">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
        <span>✨ Varyasyonlar & Alternatifler ({variations.length})</span>
      </div>
      <div className="flex flex-col gap-2">
        {variations.map((v, idx) => (
          <div
            key={idx}
            className="bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl p-3 text-xs transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-100 text-[13px] leading-snug">
                {v.german}
              </span>
              <button
                type="button"
                title="Seslendir"
                className="p-1.5 rounded-full text-indigo-400 hover:text-indigo-200 hover:bg-indigo-500/20 shrink-0 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(v.german, 'de-DE');
                }}
              >
                <Volume2 size={15} />
              </button>
            </div>
            <p className="text-slate-300 text-[12px] leading-relaxed">
              {v.turkish}
            </p>
            {v.context && (
              <div className="mt-1.5 flex">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {v.context}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Examples = ({ card }) => {
  if (!card.germanExample && !card.turkishExample) return null;
  return (
    <div className="w-full bg-slate-900/50 rounded-xl p-3.5 border border-slate-700/50 text-left shrink-0 whitespace-pre-line mt-2">
      {card.germanExample && <p className="text-slate-300 italic mb-2 text-xs sm:text-sm">"{card.germanExample}"</p>}
      {card.turkishExample && <p className="text-slate-400 text-xs">"{card.turkishExample}"</p>}
    </div>
  );
};

const ArtikelTips = ({ card }) => {
  const tips = React.useMemo(() => getArtikelTips(card), [card]);
  if (!tips || tips.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2.5 my-3 text-left">
      {tips.map((tip, idx) => {
        const isMatch = tip.status === 'match';
        const isException = tip.status === 'exception';

        if (isException) {
          return (
            <div
              key={tip.id || idx}
              className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 text-xs text-slate-300"
            >
              <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
                <AlertCircle size={15} className="text-rose-400 shrink-0" />
                <span>İstisna Uyarısı: {tip.title}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-300">{tip.text}</p>
            </div>
          );
        }

        if (isMatch) {
          return (
            <div
              key={tip.id || idx}
              className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-300"
            >
              <div className="flex items-center justify-between gap-1.5 font-bold text-amber-300 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Lightbulb size={15} className="text-amber-400 shrink-0" />
                  <span className="truncate">Kural / İpucu: {tip.title}</span>
                </div>
                {tip.reliability === 'always' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 shrink-0">
                    %100 Kural
                  </span>
                )}
              </div>
              <p className="leading-relaxed text-[11px] text-slate-300">{tip.text}</p>
              {tip.examples && tip.examples.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10.5px] text-slate-400">
                  <span className="text-amber-400/80 font-semibold">Örnekler: </span>
                  <span className="text-slate-300">{tip.examples.join(', ')}</span>
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={tip.id || idx}
            className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-400"
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
              <Info size={15} className="text-slate-400 shrink-0" />
              <span>{tip.title}</span>
            </div>
            <p className="leading-relaxed text-[11px]">{tip.text}</p>
          </div>
        );
      })}
    </div>
  );
};

const Flashcard = ({ card, isFlipped, setIsFlipped, selectedArticle = null }) => {
  const favoriteId = card.baseId || card.id;
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const isFavorite = useStore(state => state.favorites.includes(favoriteId));
  const onToggleFavorite = () => toggleFavorite(favoriteId);

  const isAlltagssatz = card.type === 'Alltagssatz';
  const isReverse = card.variant === VARIANT_REVERSE;
  const isArtikel = card.variant === VARIANT_ARTIKEL;

  // Alltagssatz cards do not flip; both German and Turkish are shown directly
  if (isAlltagssatz) {
    return (
      <div className="w-full max-w-sm sm:max-w-md mx-auto h-[58vh] min-h-[350px] max-h-[550px]">
        <div className="w-full h-full bg-slate-800 border-2 border-indigo-500/40 rounded-3xl shadow-xl flex flex-col p-6 overflow-y-auto overflow-x-hidden scrollbar-hide relative">
          <CornerButtons
            variant="front"
            visible={true}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onSpeak={() => speak(card.german, 'de-DE')}
          />

          <div className="w-full flex flex-col pt-8 pb-2">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3 px-8">
              <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">
                {card.type}
              </span>
              {card.category && (
                <span className="text-slate-300 text-xs px-2.5 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/60 font-medium">
                  {card.category}
                </span>
              )}
            </div>

            {/* German & Turkish (Directly together) */}
            <div className="text-center my-3 px-2">
              <h2 className={`${getSentenceTextSize(card.german)} font-bold text-white break-words leading-tight`}>
                {card.german}
              </h2>

              <p className="text-indigo-300 text-base sm:text-lg font-medium mt-3 leading-relaxed">
                {card.turkish}
              </p>
            </div>

            {/* Spoken Variations (if present) */}
            <SentenceVariations variations={card.variations} />

            {/* Dialogue Examples (if present) */}
            <Examples card={card} />
          </div>
        </div>
      </div>
    );
  }

  // Artikel cards can only be flipped by picking an article
  const handleCardClick = () => {
    if (isArtikel && !isFlipped) return;
    setIsFlipped(!isFlipped);
  };

  const frontText = isReverse ? card.turkish : card.german;
  const backText = isReverse ? card.german : card.turkish;
  const frontLang = isReverse ? 'tr-TR' : 'de-DE';
  const backLang = isReverse ? 'de-DE' : 'tr-TR';

  // Artikel-specific values
  const correctArticles = card.articles || [];
  const isCorrect = isArtikel && selectedArticle && correctArticles.includes(selectedArticle);
  const mainArticle = correctArticles[0];
  const articleStyle = ARTICLE_STYLES[mainArticle] || ARTICLE_STYLES.der;
  const spokenNoun = isArtikel ? `${mainArticle} ${card.noun}` : null;

  return (
    <div
      className={`w-full max-w-sm sm:max-w-md mx-auto h-[58vh] min-h-[350px] max-h-[550px] perspective-1000 ${isArtikel && !isFlipped ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={handleCardClick}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-slate-800 border-2 border-slate-700 rounded-3xl shadow-xl flex flex-col p-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <CornerButtons
            visible={!isFlipped}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            // Speaking the noun on the front would give away the article
            onSpeak={isArtikel ? null : () => speak(frontText, frontLang)}
          />

          {isArtikel ? (
            <div className="my-auto w-full flex flex-col items-center text-center pt-8 pb-4">
              <span className="text-indigo-400 font-medium text-sm tracking-widest uppercase mb-4">Welcher Artikel?</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-white break-words w-full px-2 flex flex-wrap items-baseline justify-center gap-x-3">
                <span className="text-slate-500 tracking-widest">___</span>
                <span>{card.noun}</span>
              </h2>
              <p className="text-slate-400 mt-5 text-base sm:text-lg">{card.turkish}</p>
            </div>
          ) : (
            <div className="my-auto w-full flex flex-col items-center text-center pt-8 pb-4">
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                <span className="text-indigo-400 font-medium text-xs sm:text-sm tracking-widest uppercase">
                  {card.type}
                </span>
                {card.category && (
                  <span className="text-slate-400 text-xs px-2.5 py-0.5 rounded-full bg-slate-700/60 font-normal">
                    {card.category}
                  </span>
                )}
                {isReverse && (
                  <span className="text-amber-400 text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 font-medium">
                    TR → DE
                  </span>
                )}
              </div>
              <h2 className={`${getSentenceTextSize(frontText)} text-white break-words w-full px-2`}>
                {frontText}
              </h2>
              {card.variations && card.variations.length > 0 && (
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  <span>✨ {card.variations.length} varyasyon mevcut</span>
                </div>
              )}
            </div>
          )}

          <p className="text-slate-400 text-sm mx-auto mt-auto shrink-0 pb-2">
            {isArtikel ? 'Wähle unten der, die oder das' : 'Tippen zum Umdrehen'}
          </p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-900 to-slate-800 border-2 border-indigo-500/50 rounded-3xl shadow-xl flex flex-col p-6 rotate-y-180 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <CornerButtons
            variant="back"
            visible={isFlipped}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onSpeak={() => (isArtikel ? speak(spokenNoun, 'de-DE') : speak(backText, backLang))}
          />

          {isArtikel ? (
            <div className="my-auto w-full flex flex-col items-center text-center pt-8">
              {selectedArticle && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold mb-4 ${isCorrect ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {isCorrect ? 'Richtig!' : <span>Falsch – du hast <em>„{selectedArticle}"</em> gewählt</span>}
                </div>
              )}
              <h2 className="text-3xl sm:text-5xl font-bold text-white break-words w-full flex flex-wrap items-baseline justify-center gap-x-3">
                <span className={articleStyle.text}>{correctArticles.join('/')}</span>
                <span>{card.noun}</span>
              </h2>
              {card.plural && (
                <p className="text-slate-400 text-sm mt-2">Plural: <span className="text-slate-300 font-medium">{card.plural}</span></p>
              )}
              <p className="text-indigo-200 text-lg mt-2 mb-2">{card.turkish}</p>

              {/* Artikel tips & grammar rules */}
              <ArtikelTips card={card} />

              <Examples card={card} />
            </div>
          ) : (
            <div className="my-auto w-full flex flex-col items-center text-center pt-8 pb-2">
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                <span className="text-indigo-300 font-medium text-xs sm:text-sm tracking-widest uppercase">
                  {card.type}
                </span>
                {card.category && (
                  <span className="text-indigo-200 text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/30">
                    {card.category}
                  </span>
                )}
              </div>
              <h2 className={`${getSentenceTextSize(backText)} font-bold text-white mb-4 break-words w-full`}>
                {backText}
              </h2>
              <SentenceVariations variations={card.variations} />
              <Examples card={card} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcard;
