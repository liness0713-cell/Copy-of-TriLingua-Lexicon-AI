import React, { useState, useEffect, useCallback } from 'react';
import { geminiService } from './services/geminiService';
import { WordData, HistoryItem, LoadingState } from './types';
import { WordCard } from './components/WordCard';
import { HistorySidebar } from './components/HistorySidebar';

const HISTORY_KEY = 'trilingua_history';

function App() {
  const [query, setQuery] = useState('');
  const [currentData, setCurrentData] = useState<WordData | null>(null);
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoadingState(LoadingState.ANALYZING);
    setError(null);
    setCurrentData(null);
    setCurrentImage(undefined);

    try {
      // 1. Analyze text
      const data = await geminiService.analyzeWord(query);
      setCurrentData(data);
      setLoadingState(LoadingState.GENERATING_IMAGE);

      // 2. Generate Image
      const image = await geminiService.generateImage(data.coreWord.en);
      if (image) setCurrentImage(image);

      setLoadingState(LoadingState.COMPLETE);

      // 3. Add to History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        word: data.coreWord.jp,
        data: data,
        imageUrl: image || undefined
      };
      
      setHistory(prev => {
        // Remove duplicate if exists at top
        const filtered = prev.filter(item => 
          item.data.coreWord.jp !== data.coreWord.jp && 
          item.data.coreWord.en !== data.coreWord.en
        );
        return [newItem, ...filtered].slice(0, 50); // Keep last 50
      });

    } catch (err) {
      console.error(err);
      setError("Unable to analyze the word. Please check your API key or try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setCurrentData(item.data);
    setCurrentImage(item.imageUrl);
    setQuery(item.data.inputWord || item.data.coreWord.jp);
    setLoadingState(LoadingState.COMPLETE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportHistory = () => {
    if (history.length === 0) return;

    const headers = ["Timestamp", "Input", "JP", "EN", "ZH", "JP_Pron", "EN_Pron", "Definition_JP", "Definition_EN"];
    const rows = history.map(h => [
      new Date(h.timestamp).toISOString(),
      h.data.inputWord,
      h.data.coreWord.jp,
      h.data.coreWord.en,
      h.data.coreWord.zh,
      h.data.pronunciation.jp,
      h.data.pronunciation.en,
      `"${h.data.definitions.jp.replace(/"/g, '""')}"`,
      `"${h.data.definitions.en.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trilingua_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      
      {/* Sidebar */}
      <HistorySidebar 
        history={history} 
        onSelect={loadFromHistory} 
        onExport={exportHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar / Search Bar */}
        <div className="bg-white border-b border-slate-200 p-4 md:p-6 shadow-sm z-30 flex gap-4 items-center">
          <button 
            className="lg:hidden text-slate-500 p-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <form onSubmit={handleSearch} className="flex-1 max-w-3xl mx-auto flex gap-2 relative">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Japanese, English, or Chinese..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loadingState === LoadingState.ANALYZING || loadingState === LoadingState.GENERATING_IMAGE || !query.trim()}
              className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          
          <div className="max-w-4xl mx-auto min-h-full">
            
            {loadingState === LoadingState.IDLE && !currentData && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 mt-20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-32 h-32 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <p className="text-xl font-serif">Search for a word to begin learning</p>
              </div>
            )}

            {(loadingState === LoadingState.ANALYZING || loadingState === LoadingState.GENERATING_IMAGE) && (
              <div className="bg-white rounded-xl shadow p-8 animate-pulse">
                <div className="h-10 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6 mb-8"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-slate-200 rounded"></div>
                  <div className="h-32 bg-slate-200 rounded"></div>
                </div>
                <div className="mt-8 text-center text-brand-600 font-medium">
                  {loadingState === LoadingState.ANALYZING ? "Analyzing language patterns..." : "Painting visualization..."}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center shadow-sm">
                <p>{error}</p>
              </div>
            )}

            {currentData && (
              <WordCard data={currentData} imageUrl={currentImage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;