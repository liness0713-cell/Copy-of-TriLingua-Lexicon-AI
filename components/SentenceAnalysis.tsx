import React from 'react';
import { SentenceData } from '../types';
import { AudioButton } from './AudioButton';

interface SentenceAnalysisProps {
  data: SentenceData;
}

export const SentenceAnalysis: React.FC<SentenceAnalysisProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      
      {/* Original Sentence Header */}
      <div className="p-8 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Original Sentence</h2>
        <div className="flex flex-col gap-2">
            <p className="text-2xl md:text-3xl text-slate-800 font-serif leading-relaxed">
              {data.original}
            </p>
            <div className="flex items-center gap-2 mt-2">
                <AudioButton text={data.original} lang="jp" /> 
                <span className="text-xs text-slate-400">(Auto-detect TTS)</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* Left Column: Breakdown & Grammar */}
        <div className="lg:col-span-2 p-6 md:p-8 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-100">
          
          {/* Vocabulary Breakdown */}
          <section>
            <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
              Word Breakdown
            </h3>
            <div className="overflow-x-auto">
              <div className="flex flex-wrap gap-3">
                {data.breakdown.map((item, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[140px] max-w-[200px] flex flex-col items-center text-center hover:border-brand-300 transition-colors">
                    <span className="text-lg font-bold text-slate-800 mb-1">{item.word}</span>
                    {item.reading && <span className="text-xs text-slate-500 mb-1">{item.reading}</span>}
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded uppercase font-semibold mb-2">{item.partOfSpeech}</span>
                    
                    {/* Render meanings based on type (string or object) */}
                    {typeof item.meaning === 'string' ? (
                      <span className="text-xs text-slate-600 leading-tight">{item.meaning}</span>
                    ) : (
                      <div className="flex flex-col gap-1 text-left w-full mt-2 pt-2 border-t border-slate-200/50">
                        <div className="grid grid-cols-[20px_1fr] gap-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">JP</span>
                          <span className="text-xs text-slate-700 leading-tight">{item.meaning.jp}</span>
                        </div>
                        <div className="grid grid-cols-[20px_1fr] gap-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">EN</span>
                          <span className="text-xs text-slate-700 leading-tight">{item.meaning.en}</span>
                        </div>
                        <div className="grid grid-cols-[20px_1fr] gap-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">ZH</span>
                          <span className="text-xs text-slate-700 leading-tight">{item.meaning.zh}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Grammar Analysis */}
          <section>
             <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
                Grammar & Structure
             </h3>
             <div className="space-y-4">
               {/* Backward Compatibility Check: If it's a string, render normally. If it's an object, render trilingual. */}
               {typeof data.grammarAnalysis === 'string' ? (
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                   {data.grammarAnalysis}
                 </div>
               ) : (
                 <>
                    {/* Japanese Analysis */}
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span>Japanese Explanation</span>
                      </h4>
                      <p className="text-slate-700 leading-relaxed font-serif">
                         <span dangerouslySetInnerHTML={{ __html: data.grammarAnalysis.jp }} className="ruby-text" />
                      </p>
                   </div>
                   
                   {/* English Analysis */}
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span>English Explanation</span>
                      </h4>
                      <p className="text-slate-700 leading-relaxed font-sans">{data.grammarAnalysis.en}</p>
                   </div>

                   {/* Chinese Analysis */}
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span>Chinese Explanation</span>
                      </h4>
                      <p className="text-slate-700 leading-relaxed">{data.grammarAnalysis.zh}</p>
                   </div>
                 </>
               )}
             </div>
          </section>
        </div>

        {/* Right Column: Translations */}
        <div className="p-6 md:p-8 bg-slate-50/50 space-y-8">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Translations</h3>
           
           {/* Japanese */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                 <span className="text-xs font-bold text-rose-500 uppercase">Japanese</span>
                 <AudioButton text={data.translations.jp} lang="jp" size="sm" />
              </div>
              
              <div className="space-y-4">
                 <div>
                    <p className="text-xs text-slate-400 mb-1">Standard</p>
                    <p className="text-lg text-slate-800 font-serif">{data.translations.jp}</p>
                 </div>
                 <div>
                    <p className="text-xs text-slate-400 mb-1">With Readings</p>
                    <p className="text-lg text-slate-800 font-serif">
                        <span dangerouslySetInnerHTML={{ __html: data.translations.jp_furigana }} className="ruby-text" />
                    </p>
                 </div>
              </div>
           </div>

           {/* English */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                 <span className="text-xs font-bold text-indigo-500 uppercase">English</span>
                 <AudioButton text={data.translations.en} lang="en" size="sm" />
              </div>
              <p className="text-lg text-slate-800 font-sans">{data.translations.en}</p>
           </div>

           {/* Chinese */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                 <span className="text-xs font-bold text-emerald-500 uppercase">Chinese</span>
                 <AudioButton text={data.translations.zh} lang="zh" size="sm" />
              </div>
              <p className="text-lg text-slate-800">{data.translations.zh}</p>
           </div>

        </div>
      </div>

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