import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PlusCircle, Search, Trash2, Tag, Layers, AlignLeft, Check } from 'lucide-react';

const CustomCardManager = () => {
  const customCards = useStore(state => state.customCards || []);
  const addCustomCard = useStore(state => state.addCustomCard);
  const deleteCustomCard = useStore(state => state.deleteCustomCard);

  const allCards = useStore(state => state.getAllCards());
  
  // Extract all unique decks (both system and custom) for the creator dropdown
  const existingDecks = useMemo(() => {
    const deckSet = new Set(allCards.map(c => c.deck));
    deckSet.add('Eigene Karten');
    return Array.from(deckSet).sort();
  }, [allCards]);

  // Extract all unique custom decks for the filter dropdown
  const customDecks = useMemo(() => {
    const deckSet = new Set(customCards.map(c => c.deck));
    return Array.from(deckSet).sort();
  }, [customCards]);

  const [newType, setNewType] = useState('Nomen');
  const [newGerman, setNewGerman] = useState('');
  const [newTurkish, setNewTurkish] = useState('');
  const [newGermanExample, setNewGermanExample] = useState('');
  const [newTurkishExample, setNewTurkishExample] = useState('');
  
  // States for deck selector in creation form
  const [selectedDeck, setSelectedDeck] = useState('Eigene Karten');
  const [customDeckName, setCustomDeckName] = useState('');
  const [isNewDeck, setIsNewDeck] = useState(false);

  // States for managing/filtering custom cards
  const [searchQuery, setSearchQuery] = useState('');
  const [deckFilter, setDeckFilter] = useState('all');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newGerman.trim() || !newTurkish.trim()) {
      alert('Bitte geben Sie mindestens das deutsche Wort und die türkische Übersetzung an.');
      return;
    }

    const finalDeckName = isNewDeck ? customDeckName.trim() : selectedDeck;
    if (isNewDeck && !finalDeckName) {
      alert('Bitte geben Sie einen Namen für das neue Deck an.');
      return;
    }
    
    addCustomCard({
      type: newType,
      german: newGerman.trim(),
      turkish: newTurkish.trim(),
      germanExample: newGermanExample.trim(),
      turkishExample: newTurkishExample.trim(),
      deck: finalDeckName || 'Eigene Karten'
    });

    setNewGerman('');
    setNewTurkish('');
    setNewGermanExample('');
    setNewTurkishExample('');
    
    if (isNewDeck) {
      setSelectedDeck(finalDeckName);
      setIsNewDeck(false);
      setCustomDeckName('');
    }

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const deleteDeckCards = (deckName) => {
    if (window.confirm(`Möchten Sie wirklich alle Karten im Stapel "${deckName}" löschen?`)) {
      const cardsInDeck = customCards.filter(c => c.deck === deckName);
      cardsInDeck.forEach(c => deleteCustomCard(c.id));
      setDeckFilter('all');
    }
  };

  const filteredCards = useMemo(() => {
    return customCards.filter(card => {
      // 1. Deck Filter
      if (deckFilter !== 'all' && card.deck !== deckFilter) {
        return false;
      }

      // 2. Text Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesGerman = card.german.toLowerCase().includes(query);
        const matchesTurkish = card.turkish.toLowerCase().includes(query);
        const matchesDeck = card.deck && card.deck.toLowerCase().includes(query);
        const matchesType = card.type && card.type.toLowerCase().includes(query);
        if (!matchesGerman && !matchesTurkish && !matchesDeck && !matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [customCards, searchQuery, deckFilter]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Title Header */}
      <div className="flex justify-between items-center bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <PlusCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Eigene Karten</h2>
            <p className="text-slate-400 text-sm">Füge deine eigenen Karteikarten hinzu und verwalte deine Stapel</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/20 animate-in slide-in-from-top-4 duration-300">
          <Check size={18} className="shrink-0" />
          <span className="text-sm font-semibold">Karteikarte erfolgreich erstellt!</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/50">
            Neue Karte erstellen
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Tag size={12} className="text-indigo-400" />
                Worttyp
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Nomen">Nomen</option>
                <option value="Verb">Verb</option>
                <option value="Adjektiv">Adjektiv</option>
                <option value="Adverb">Adverb</option>
                <option value="Phrase">Phrase</option>
                <option value="Präposition">Präposition</option>
                <option value="Konjunktion">Konjunktion</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Layers size={12} className="text-indigo-400" />
                Stapel auswählen oder erstellen *
              </label>
              <select
                value={isNewDeck ? "__new__" : selectedDeck}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__new__") {
                    setIsNewDeck(true);
                  } else {
                    setIsNewDeck(false);
                    setSelectedDeck(val);
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors"
              >
                {existingDecks.map(deck => (
                  <option key={deck} value={deck}>{deck}</option>
                ))}
                <option value="__new__">+ Neuen Stapel erstellen...</option>
              </select>
              
              {isNewDeck && (
                <input
                  type="text"
                  value={customDeckName}
                  onChange={(e) => setCustomDeckName(e.target.value)}
                  placeholder="Stapelname eingeben..."
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors mt-2 animate-in slide-in-from-top-2 duration-200"
                  required
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Deutsch *</label>
              <input
                type="text"
                value={newGerman}
                onChange={(e) => setNewGerman(e.target.value)}
                placeholder="z.B. das Buch"
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Türkische Übersetzung *</label>
              <input
                type="text"
                value={newTurkish}
                onChange={(e) => setNewTurkish(e.target.value)}
                placeholder="z.B. kitap"
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <AlignLeft size={12} className="text-indigo-400" />
                Deutsches Beispielsatz (optional)
              </label>
              <textarea
                value={newGermanExample}
                onChange={(e) => setNewGermanExample(e.target.value)}
                placeholder="z.B. Ich lese ein interessantes Buch."
                rows="2"
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-2.5 outline-none resize-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Türkische Übersetzung des Beispiels (optional)</label>
              <textarea
                value={newTurkishExample}
                onChange={(e) => setNewTurkishExample(e.target.value)}
                placeholder="z.B. İlginç bir kitap okuyorum."
                rows="2"
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl p-2.5 outline-none resize-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
            >
              Karte speichern
            </button>
          </form>
        </div>

        {/* Right Column: Searchable List */}
        <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4 self-stretch">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/50">
            <h3 className="text-lg font-bold text-white">
              Deine erstellten Karten ({customCards.length})
            </h3>
          </div>

          {customCards.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Karten durchsuchen (Deutsch, Türkisch, Stapel oder Typ)..."
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              
              {customDecks.length > 0 && (
                <div className="flex gap-2">
                  <select
                    value={deckFilter}
                    onChange={(e) => setDeckFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none focus:border-indigo-500 transition-colors shrink-0 w-full sm:w-44"
                  >
                    <option value="all">Alle Stapel ({customCards.length})</option>
                    {customDecks.map(deck => {
                      const count = customCards.filter(c => c.deck === deck).length;
                      return (
                        <option key={deck} value={deck}>{deck} ({count})</option>
                      );
                    })}
                  </select>

                  {deckFilter !== 'all' && (
                    <button
                      onClick={() => deleteDeckCards(deckFilter)}
                      className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl transition-colors shrink-0"
                      title="Alle Karten im Stapel löschen"
                    >
                      Stapel löschen
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {customCards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
              <PlusCircle size={36} className="text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm italic">
                Du hast noch keine eigenen Karteikarten erstellt.
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Verwende das Formular links, um deine erste eigene Karte zu erstellen!
              </p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
              <Search size={36} className="text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm italic">
                Keine passenden Karteikarten gefunden.
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Versuche es mit einem anderen Suchbegriff.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[520px] pr-1 space-y-3 custom-scrollbar">
              {filteredCards.map((card) => (
                <div 
                  key={card.id} 
                  className="p-4 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-700/30 rounded-xl flex items-start justify-between gap-4 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-white text-sm truncate">{card.german}</span>
                      <span className="text-slate-500 text-xs">—</span>
                      <span className="text-slate-300 text-sm truncate">{card.turkish}</span>
                    </div>

                    <div className="flex gap-2 items-center text-[10px] text-slate-500 mb-2">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-bold text-slate-400">
                        {card.type}
                      </span>
                      <span>•</span>
                      <span className="truncate bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[9px] font-semibold">
                        {card.deck}
                      </span>
                    </div>

                    {(card.germanExample || card.turkishExample) && (
                      <div className="mt-2 pl-2.5 border-l-2 border-slate-700 text-xs space-y-1">
                        {card.germanExample && (
                          <p className="text-slate-400 italic font-sans">"{card.germanExample}"</p>
                        )}
                        {card.turkishExample && (
                          <p className="text-slate-500 font-sans">"{card.turkishExample}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm('Sind Sie sicher, dass Sie diese Karte löschen möchten?')) {
                        deleteCustomCard(card.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 self-center"
                    title="Karte löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomCardManager;
