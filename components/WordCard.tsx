import React from 'react';
import { WordData } from '../types';
import { AudioButton } from './AudioButton';

interface WordCardProps {
  data: WordData;
  imageUrl?: string;
}

export const WordCard: React.FC<WordCardProps> = ({ data, imageUrl }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      
      {/* Header Section */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-serif text-slate-800 font-bold mb-2 flex items-center gap-3">
              {data.coreWord.jp} / {data.coreWord.en}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-slate-600 bg-white/50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 w-8">JP</span>
                <span className="font-medium text-lg">{data.pronunciation.jp}</span>
                <AudioButton text={data.coreWord.jp} lang="jp" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 w-8">EN</span>
                <span className="font-medium text-lg font-sans">{data.pronunciation.en}</span>
                <AudioButton text={data.coreWord.en} lang="en" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 w-8">ZH</span>
                <span className="font-medium text-lg">{data.pronunciation.zh}</span>
                <AudioButton text={data.coreWord.zh} lang="zh" />
              </div>
            </div>
          </div>
          
          {imageUrl && (
            <div className="w-full md:w-48 flex-shrink-0">
               <img 
                 src={imageUrl} 
                 alt={data.coreWord.en} 
                 className="w-full h-48 object-cover rounded-lg shadow-md border border-slate-200"
               />
            </div>
          )}
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
            <div className="space-y-4">
              <div className="group">
                <p className="text-xs text-slate-400 mb-1">日本語</p>
                <p className="text-lg text-slate-800 leading-relaxed font-serif">{data.definitions.jp}</p>
              </div>
              <div className="group">
                <p className="text-xs text-slate-400 mb-1">English</p>
                <p className="text-lg text-slate-800 leading-relaxed">{data.definitions.en}</p>
              </div>
              <div className="group">
                <p className="text-xs text-slate-400 mb-1">中文</p>
                <p className="text-lg text-slate-800 leading-relaxed">{data.definitions.zh}</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 p-5 rounded-lg border border-slate-100">
             <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Etymology & Origin</h3>
             <p className="text-slate-700 text-sm leading-6">{data.etymology}</p>
          </section>

          <section>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <h4 className="text-xs text-green-600 font-bold uppercase mb-2">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.related.synonyms.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">{s}</span>
                    ))}
                  </div>
               </div>
               <div>
                  <h4 className="text-xs text-red-600 font-bold uppercase mb-2">Antonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.related.antonyms.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">{s}</span>
                    ))}
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
            {data.examples.map((ex, index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-slate-100 hover:border-brand-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${ex.lang === 'jp' ? 'bg-red-400' : 'bg-blue-400'}`}>
                    {ex.lang.toUpperCase()}
                  </span>
                  <AudioButton text={ex.text} lang={ex.lang} size="sm" />
                </div>
                <p className={`text-lg mb-2 text-slate-800 ${ex.lang === 'jp' ? 'font-serif' : 'font-sans'}`}>
                  {ex.text}
                </p>
                <p className="text-slate-500 text-sm">
                  {ex.translation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};