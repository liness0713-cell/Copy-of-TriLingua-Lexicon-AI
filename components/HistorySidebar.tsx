import React from 'react';
import { HistoryItem, WordData, SentenceData } from '../types';
import { AdUnit } from './AdUnit';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onExport: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  history, 
  onSelect, 
  onExport,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50
        lg:transform-none lg:static lg:w-80 lg:shadow-none lg:border-r lg:border-slate-200 lg:h-screen lg:flex lg:flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Study History
          </h2>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 mt-10 text-sm min-h-[200px] flex flex-col justify-center">
              <p>No history yet.</p>
              <p>Start searching!</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 hover:border-brand-200 border border-transparent transition-all group shrink-0"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    {item.type === 'word' 
                      ? (item.data as WordData).coreWord.en 
                      : (item.data as SentenceData).translations.en.slice(0, 30) + '...'}
                  </span>
                </div>
              </button>
            ))
          )}

          {/* Ad Space - Increased margins for better separation */}
          <div className="mt-8 pt-6 border-t border-slate-100 shrink-0 mb-10">
             <AdUnit format="rectangle" className="w-full !max-w-full !h-[180px] !my-0" />
          </div>
        </div>

        {/* Export Button Fixed Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onExport}
            disabled={history.length === 0}
            className="w-full flex justify-center items-center gap-2 bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          
          <div className="mt-4 text-center">
            <a 
              href="https://my-portfolio-beige-five-56.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-brand-600 transition-colors font-medium inline-block"
            >
              千葉２狗 🐶
            </a>
          </div>
        </div>
      </div>
    </>
  );
};