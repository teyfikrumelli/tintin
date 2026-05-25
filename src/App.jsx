import React, { useState } from 'react';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import StudySession from './components/StudySession';
import Favorites from './components/Favorites';
import CardBrowser from './components/CardBrowser';
import KullanimKilavuzu from './components/KullanimKilavuzu';
import CustomCardManager from './components/CustomCardManager';
import { Book, LayoutDashboard, Layers, Heart, Search, HelpCircle, PlusSquare } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, dashboard, favorites, study, editor
  const [studyMode, setStudyMode] = useState('all'); // all, favorites

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onStartStudy={(mode) => { setStudyMode(mode); setCurrentView('study'); }} />;
      case 'dashboard':
        return <Dashboard />;
      case 'browser':
        return <CardBrowser />;
      case 'favorites':
        return <Favorites onStartStudy={() => { setStudyMode('favorites'); setCurrentView('study'); }} />;
      case 'study':
        return <StudySession mode={studyMode} onFinish={() => setCurrentView(studyMode === 'favorites' ? 'favorites' : 'home')} />;
      case 'editor':
        return <CustomCardManager />;
      case 'help':
        return <KullanimKilavuzu />;
      default:
        return <Home onStartStudy={() => setCurrentView('study')} />;
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 p-4 shrink-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <div className="bg-indigo-500 p-2 rounded-lg text-white">
              <Book size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              KarteiKarten
            </h1>
          </div>

          {currentView !== 'study' && (
            <nav className="flex gap-1 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setCurrentView('home')}
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${currentView === 'home' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Layers size={16} />
                <span className="hidden sm:inline">Wortschatz</span>
              </button>
              <button
                onClick={() => setCurrentView('favorites')}
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${currentView === 'favorites' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Heart size={16} />
                <span className="hidden sm:inline">Favoriten</span>
              </button>
              <button
                onClick={() => setCurrentView('browser')}
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${currentView === 'browser' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <Search size={16} />
                <span className="hidden sm:inline">Suche</span>
              </button>
              <button
                onClick={() => setCurrentView('editor')}
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${currentView === 'editor' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <PlusSquare size={16} />
                <span className="hidden sm:inline">Editor</span>
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${currentView === 'dashboard' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Übersicht</span>
              </button>
              <button
                onClick={() => setCurrentView('help')}
                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${currentView === 'help' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <HelpCircle size={16} />
                <span className="hidden sm:inline">Hilfe</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      <main
        className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col overflow-y-auto"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
      >
        {renderView()}
      </main>
    </div>
  );
}

export default App;
