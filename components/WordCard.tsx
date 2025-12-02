
import React from 'react';
import { WordData } from '../types';
import { AudioButton } from './AudioButton';

interface WordCardProps {
  data: WordData;
  imageUrl?: string;
  onWordClick: (word: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({ data, imageUrl, onWordClick }) => {
  const isAiGenerated = imageUrl?.startsWith('data:');
  const sourceLabel = isAiGenerated ? "AI Visualization" : "Web Image";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      
      {/* Top Image Section (Full Width) */}
      {imageUrl && (
        <div className="w-full h-72 md:h-[480px] bg-slate-100 relative group transition-all duration-300">
           <img 
             src={imageUrl} 
             alt={data.coreWord.en} 
             className="w-full h-full object-cover"
             onError={(e) => {
               // Fallback if the searched image URL is broken
               (e.target as HTMLImageElement).style.display = 'none';
               (e.target as HTMLImageElement).parentElement!.style.display = 'none';
             }}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
           <span className={`absolute bottom-3 right-3 text-white/90 text-[10px] uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm font-bold ${isAiGenerated ? 'bg-indigo-600/80' : 'bg-slate-700/80'}`}>
             {sourceLabel}
           </span>
        </div>
      )}

      {/* Header Section */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col gap-4">
          <div className="flex-1 text-center md:text-left">
            {/* 
                Refactored Header: 
                - Uses div instead of h1 for flexible wrapping
                - Increased gap-y (line spacing)
                - Grouped separators with words to prevent orphaned slashes
            */}
            <div className="flex flex-wrap justify-center items-baseline gap-x-4 md:gap-x-6 gap-y-4 md:gap-y-6 mb-8">
              <div className="text-4xl md:text-6xl font-serif text-slate-800 font-bold leading-tight break-all">
                {data.coreWord.jp}
              </div>
              
              <div className="flex flex-wrap items-baseline gap-x-2 md:gap-x-4">
                <span className="text-2xl md:text-4xl text-slate-300 font-light select-none">/</span>
                <span className="text-3xl md:text-5xl text-slate-600 font-sans font-medium leading-tight break-all">{data.coreWord.en}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 md:gap-x-4">
                <span className="text-2xl md:text-4xl text-slate-300 font-light select-none">/</span>
                <span className="text-3xl md:text-5xl text-slate-600 font-serif font-medium leading-tight break-all">{data.coreWord.zh}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-center md:justify-start gap-3 p-2 rounded hover:bg-slate-50 transition-colors">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-6">JP</span>
                <span className="font-medium text-lg">{data.pronunciation.jp}</span>
                <AudioButton text={data.coreWord.jp} lang="jp" />
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 p-2 rounded hover:bg-slate-50 transition-colors border-t md:border-t-0 md:border-l border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-6">EN</span>
                <span className="font-medium text-lg font-sans">{data.pronunciation.en}</span>
                <AudioButton text={data.coreWord.en} lang="en" />
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 p-2 rounded hover:bg-slate-50 transition-colors border-t md:border-t-0 md:border-l border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-6">ZH</span>
                <span className="font-medium text-lg">{data.pronunciation.zh}</span>
                <AudioButton text={data.coreWord.zh} lang="zh" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        
        {/* Left Column: Definitions & Etymology */}
        <div className="p-6 md:p-8 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-100">
          
          <section>
            <h3 className="text-xs uppercase tracking-wider text-brand-600 font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-brand-600"></span>
              Definitions / 意味
            </h3>
            <div className="space-y-6">
              {/* Japanese Definitions Block */}
              <div className="space-y-3">
                 <div className="flex items-center gap-2 mb-1 ml-1">
                    <p className="text-xs text-slate-400">日本語</p>
                    <AudioButton text={data.definitions.jp} lang="jp" size="sm" />
                 </div>
                 
                 {/* Plain Text Version */}
                 <div className="group">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 pl-4">Standard</div>
                    <p className="text-lg text-slate-800 leading-relaxed font-serif border-l-2 border-slate-200 pl-4 group-hover:border-brand-300 transition-colors">
                      {data.definitions.jp}
                    </p>
                 </div>

                 {/* Furigana Version */}
                 <div className="group">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 pl-4">With Readings</div>
                    <p className="text-lg text-slate-800 leading-relaxed font-serif border-l-2 border-slate-200 pl-4 group-hover:border-brand-300 transition-colors">
                       <span dangerouslySetInnerHTML={{ __html: data.definitions.jp_furigana || data.definitions.jp }} className="ruby-text" />
                    </p>
                 </div>
              </div>

              <div className="group">
                <div className="flex items-center gap-2 mb-1 ml-1">
                    <p className="text-xs text-slate-400">English</p>
                    <AudioButton text={data.definitions.en} lang="en" size="sm" />
                </div>
                <p className="text-lg text-slate-800 leading-relaxed border-l-2 border-slate-200 pl-4 group-hover:border-brand-300 transition-colors">{data.definitions.en}</p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1 ml-1">
                    <p className="text-xs text-slate-400">中文</p>
                    <AudioButton text={data.definitions.zh} lang="zh" size="sm" />
                </div>
                <p className="text-lg text-slate-800 leading-relaxed border-l-2 border-slate-200 pl-4 group-hover:border-brand-300 transition-colors">{data.definitions.zh}</p>
              </div>
            </div>
          </section>

          {/* Inflections / Conjugations Section */}
          {data.inflections && data.inflections.length > 0 && (
            <section className="bg-slate-50/50 p-6 rounded-xl border border-slate-100">
               <h3 className="text-xs uppercase tracking-wider text-slate-600 font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-brand-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Inflections & Conjugations / 活用
               </h3>
               <div className="space-y-6">
                 {data.inflections.map((group, idx) => (
                   <div key={idx}>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">{group.partOfSpeech}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {group.forms?.map((form, fIdx) => (
                          <div key={fIdx} className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 mb-0.5">{form.label}</span>
                            <span className="text-sm font-medium text-slate-700">{form.value}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
               </div>
            </section>
          )}

          <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
             <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                Etymology & Origin
             </h3>
             <p className="text-slate-700 text-sm leading-6">{data.etymology}</p>
          </section>

          <section>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h4 className="text-xs text-green-600 font-bold uppercase mb-2 flex items-center gap-1">
                    <span>Synonyms</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.related?.synonyms?.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => onWordClick(s)}
                        className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-100 font-medium hover:bg-green-100 hover:border-green-300 transition-all cursor-pointer"
                        title={`Search for "${s}"`}
                      >
                        {s}
                      </button>
                    )) || <span className="text-xs text-slate-400">None</span>}
                  </div>
               </div>
               <div>
                  <h4 className="text-xs text-red-600 font-bold uppercase mb-2">Antonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.related?.antonyms?.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => onWordClick(s)}
                        className="px-2.5 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100 font-medium hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer"
                        title={`Search for "${s}"`}
                      >
                        {s}
                      </button>
                    )) || <span className="text-xs text-slate-400">None</span>}
                  </div>
               </div>
            </div>
          </section>
        </div>

        {/* Right Column: Examples */}
        <div className="p-6 md:p-8 bg-slate-50/50">
          <h3 className="text-xs uppercase tracking-wider text-brand-600 font-bold mb-6 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-brand-600"></span>
              Examples / 例文
          </h3>
          
          <div className="space-y-6">
            {data.examples?.map((ex, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wide ${ex.lang === 'jp' ? 'bg-rose-400' : 'bg-indigo-400'}`}>
                    {ex.lang === 'jp' ? 'Japanese' : 'English'}
                  </span>
                  <AudioButton text={ex.text} lang={ex.lang} size="sm" />
                </div>
                
                {ex.lang === 'jp' ? (
                  <div className="space-y-3 mb-3">
                    {/* Standard Version */}
                    <div className="group">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Standard</p>
                        <p className="text-lg text-slate-800 font-serif leading-relaxed">
                          {ex.text}
                        </p>
                    </div>
                    {/* Furigana Version if available */}
                    {ex.text_furigana && (
                      <div className="group border-t border-slate-50 pt-2">
                         <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">With Readings</p>
                         <p className="text-lg text-slate-800 font-serif leading-relaxed">
                             <span dangerouslySetInnerHTML={{ __html: ex.text_furigana }} className="ruby-text" />
                         </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-lg mb-3 text-slate-800 font-sans">
                    {ex.text}
                  </p>
                )}
                
                <p className="text-slate-500 text-sm border-t border-slate-50 pt-3 mt-2">
                  {ex.translation}
                </p>
              </div>
            ))}
            {(!data.examples || data.examples.length === 0) && (
               <p className="text-slate-400 italic text-sm text-center py-10">No examples available.</p>
            )}
          </div>
        </div>

      </div>
      
      {/* Global Styles for Ruby Tags if not present */}
      <style>{`
        .ruby-text rt {
          font-size: 0.6em;
          color: #64748b;
          user-select: none;
        }
      `}</style>
    </div>
  );
};
