import React, { useState, useEffect } from 'react';
import { geminiService } from './services/geminiService';
import { WordData, SentenceData, HistoryItem, LoadingState, AppMode } from './types';
import { WordCard } from './components/WordCard';
import { SentenceAnalysis } from './components/SentenceAnalysis';
import { HistorySidebar } from './components/HistorySidebar';
import { AdUnit } from './components/AdUnit';

const HISTORY_KEY = 'trilingua_history';

function App() {
  const [mode, setMode] = useState<AppMode>('dictionary');
  const [query, setQuery] = useState('');
  const [currentWordData, setCurrentWordData] = useState<WordData | null>(null);
  const [currentSentenceData, setCurrentSentenceData] = useState<SentenceData | null>(null);
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const updateUrl = (term: string, currentMode: AppMode) => {
    // Prevent execution in restricted environments (like blob previews) where pushState throws security errors
    if (typeof window !== 'undefined' && (window.location.protocol === 'blob:' || window.location.protocol === 'file:')) {
      return;
    }

    try {
      const url = new URL(window.location.href);
      if (term) {
        url.searchParams.set('q', term);
      } else {
        url.searchParams.delete('q');
      }
      url.searchParams.set('mode', currentMode);
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      // Catching the error prevents the app from crashing in environments that restrict History API
      console.warn("Could not update URL:", e);
    }
  };

  // Initialize from URL and LocalStorage
  useEffect(() => {
    // 1. Load History
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // 2. Check URL Params
    // We check for URL support before accessing specific params to be safe
    if (typeof window !== 'undefined' && window.location.protocol !== 'blob:') {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('q');
      const urlMode = params.get('mode');

      if (urlQuery) {
        // If valid mode in URL, use it, otherwise default to dictionary
        const targetMode: AppMode = (urlMode === 'sentence') ? 'sentence' : 'dictionary';
        
        setMode(targetMode);
        setQuery(urlQuery);
        
        // Trigger search immediately with the URL parameters
        handleSearch(undefined, urlQuery, targetMode);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    try {
      // Create a lightweight version of history for storage
      // We remove base64 images to prevent QuotaExceededError
      const storageHistory = history.map(item => {
        // If imageUrl is a base64 string (starts with data:), remove it
        if (item.imageUrl && item.imageUrl.startsWith('data:')) {
          return {
            ...item,
            imageUrl: undefined 
          };
        }
        return item;
      });
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(storageHistory));
    } catch (e) {
      // Catch QuotaExceededError and other storage errors to prevent app crash
      console.warn("Failed to save history to localStorage (likely quota exceeded):", e);
    }
  }, [history]);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string, overrideMode?: AppMode) => {
    if (e) e.preventDefault();
    const searchTerm = overrideQuery || query;
    const activeMode = overrideMode || mode;

    if (!searchTerm.trim()) return;

    // Update URL
    updateUrl(searchTerm, activeMode);

    setLoadingState(LoadingState.ANALYZING);
    setError(null);
    
    // Clear data for the ACTIVE mode to show loading state correctly
    // We keep the OTHER mode's data in state (optimized for switching back)
    if (activeMode === 'dictionary') {
        setCurrentWordData(null);
        setCurrentImage(undefined);
    } else {
        setCurrentSentenceData(null);
    }

    try {
      if (activeMode === 'dictionary') {
        // Dictionary Mode Logic
        const data = await geminiService.analyzeWord(searchTerm);
        setCurrentWordData(data);
        setLoadingState(LoadingState.GENERATING_IMAGE);

        // Generate Image
        const image = await geminiService.generateImage(data.coreWord.en);
        if (image) setCurrentImage(image);

        setLoadingState(LoadingState.COMPLETE);

        // Add to History
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'word',
          label: data.coreWord.jp,
          data: data,
          imageUrl: image || undefined
        };
        updateHistory(newItem);

      } else {
        // Sentence Mode Logic
        const data = await geminiService.analyzeSentence(searchTerm);
        setCurrentSentenceData(data);
        setLoadingState(LoadingState.COMPLETE);

        // Add to History
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: 'sentence',
          label: data.original.length > 20 ? data.original.substring(0, 20) + '...' : data.original,
          data: data
        };
        updateHistory(newItem);
      }

    } catch (err) {
      console.error(err);
      setError("Unable to analyze. Please check your API key or try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const updateHistory = (newItem: HistoryItem) => {
    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.label !== newItem.label);
      return [newItem, ...filtered].slice(0, 50);
    });
  };

  const loadFromHistory = async (item: HistoryItem) => {
    setLoadingState(LoadingState.COMPLETE);
    setError(null);
    
    // Determine mode based on item type
    const newMode = item.type === 'word' ? 'dictionary' : 'sentence';
    setMode(newMode);
    
    if (item.type === 'word') {
      const wData = item.data as WordData;
      const queryText = wData.inputWord || wData.coreWord.jp;
      
      setCurrentWordData(wData);
      setQuery(queryText);
      updateUrl(queryText, 'dictionary');
      
      // Image Handling
      if (item.imageUrl) {
        setCurrentImage(item.imageUrl);
      } else {
        setCurrentImage(undefined);
        // Regenerate background
        try {
            const wordForImage = wData.coreWord.en;
            const newImageUrl = await geminiService.generateImage(wordForImage);
            if (newImageUrl) {
                setCurrentImage(newImageUrl);
                setHistory(prev => prev.map(h => h.id === item.id ? { ...h, imageUrl: newImageUrl } : h));
            }
        } catch (e) {
            console.error("Background image regeneration failed", e);
        }
      }

    } else {
      const sData = item.data as SentenceData;
      setCurrentSentenceData(sData);
      setQuery(sData.original);
      updateUrl(sData.original, 'sentence');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWordClick = (word: string) => {
    setQuery(word);
    setMode('dictionary');
    // We pass the word explicitly to handleSearch to ensure it uses the clicked word
    handleSearch(undefined, word, 'dictionary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeSwitch = (newMode: AppMode) => {
    setMode(newMode);
    setError(null);
    setLoadingState(LoadingState.IDLE);
    
    // OPTIMIZATION: Restore query text and URL for the selected mode
    // We DO NOT clear the data of the new mode. If it was previously searched, we show it.
    if (newMode === 'dictionary') {
      if (currentWordData) {
        // If we have previous dictionary data, restore the query and URL
        const word = currentWordData.inputWord || currentWordData.coreWord.jp;
        setQuery(word);
        updateUrl(word, 'dictionary');
      } else {
        // Empty state for dictionary
        setQuery('');
        updateUrl('', 'dictionary');
      }
    } else {
      if (currentSentenceData) {
        // If we have previous sentence data, restore the query and URL
        setQuery(currentSentenceData.original);
        updateUrl(currentSentenceData.original, 'sentence');
      } else {
        // Empty state for sentence
        setQuery('');
        updateUrl('', 'sentence');
      }
    }
  };

  const exportHistory = () => {
    if (history.length === 0) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Type,Label\n"
      + history.map(h => `${new Date(h.timestamp).toISOString()},${h.type},"${h.label.replace(/"/g, '""')}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "history_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.select();
  };

  // Logic for showing the empty state placeholder
  const showPlaceholder = loadingState === LoadingState.IDLE && (
    (mode === 'dictionary' && !currentWordData) ||
    (mode === 'sentence' && !currentSentenceData)
  );

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
        <div className="bg-white border-b border-slate-200 p-4 md:p-6 shadow-sm z-30 flex flex-col gap-4">
          
          {/* Mobile Menu & Title */}
          <div className="flex items-center gap-4 lg:hidden">
             <button 
              className="text-slate-500 p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="font-bold text-slate-700">TriLingua</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex justify-center">
             <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                <button 
                  onClick={() => handleModeSwitch('dictionary')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'dictionary' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Dictionary
                </button>
                <button 
                  onClick={() => handleModeSwitch('sentence')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'sentence' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sentence Analysis
                </button>
             </div>
          </div>

          {/* Search Form */}
          <form onSubmit={(e) => handleSearch(e)} className="w-full max-w-3xl mx-auto flex gap-2 relative">
            <div className="relative flex-1">
              <div className="absolute top-3.5 left-3 flex items-start pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              {mode === 'dictionary' ? (
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Enter a word (Japanese, English, or Chinese)..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all shadow-sm bg-white"
                />
              ) : (
                 <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Enter a long sentence to analyze..."
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all shadow-sm resize-none bg-white"
                />
              )}
            </div>
            <button
              type="submit"
              disabled={loadingState === LoadingState.ANALYZING || loadingState === LoadingState.GENERATING_IMAGE || !query.trim()}
              className={`px-6 py-3 text-white font-semibold rounded-xl shadow-md transition-colors h-fit ${mode === 'dictionary' ? 'bg-brand-600 hover:bg-brand-500' : 'bg-indigo-600 hover:bg-indigo-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {mode === 'dictionary' ? 'Search' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          
          <div className="max-w-4xl mx-auto min-h-full pb-20">
            
            {/* Top Ad Unit - Prime real estate above content */}
            <AdUnit format="horizontal" />

            {/* Empty State Placeholder */}
            {showPlaceholder && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-32 h-32 mb-4">
                  {mode === 'dictionary' ? (
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  ) : (
                     <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  )}
                </svg>
                <p className="text-xl font-serif">
                  {mode === 'dictionary' ? 'Search for a word' : 'Enter a sentence to analyze'}
                </p>
              </div>
            )}

            {(loadingState === LoadingState.ANALYZING || loadingState === LoadingState.GENERATING_IMAGE) && (
              <div className="bg-white rounded-xl shadow p-8 animate-pulse">
                <div className="h-10 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6 mb-8"></div>
                {mode === 'dictionary' ? (
                   <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-slate-200 rounded"></div>
                    <div className="h-32 bg-slate-200 rounded"></div>
                  </div>
                ) : (
                   <div className="flex gap-2">
                     <div className="h-24 w-24 bg-slate-200 rounded"></div>
                     <div className="h-24 w-24 bg-slate-200 rounded"></div>
                     <div className="h-24 w-24 bg-slate-200 rounded"></div>
                   </div>
                )}
               
                <div className="mt-8 text-center text-brand-600 font-medium">
                  {loadingState === LoadingState.ANALYZING ? "Analyzing language patterns..." : "Visualizing context..."}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center shadow-sm">
                <p>{error}</p>
              </div>
            )}

            {mode === 'dictionary' && currentWordData && (
              <WordCard 
                data={currentWordData} 
                imageUrl={currentImage} 
                onWordClick={handleWordClick}
              />
            )}

            {mode === 'sentence' && currentSentenceData && (
              <SentenceAnalysis data={currentSentenceData} />
            )}

            {/* Bottom Ad Unit - Shown after content or on initial load */}
            <AdUnit format="horizontal" className="mt-8" />

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;