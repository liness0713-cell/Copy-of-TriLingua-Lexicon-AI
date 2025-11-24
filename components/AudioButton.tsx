import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

interface AudioButtonProps {
  text: string;
  lang: 'jp' | 'en' | 'zh';
  size?: 'sm' | 'md';
}

export const AudioButton: React.FC<AudioButtonProps> = ({ text, lang, size = 'md' }) => {
  const [playing, setPlaying] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) return;
    setPlaying(true);
    await geminiService.generateSpeech(text, lang);
    setPlaying(false);
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={handlePlay}
      disabled={playing}
      className={`text-brand-600 hover:text-brand-900 transition-colors p-1 rounded-full hover:bg-brand-50 focus:outline-none ${playing ? 'opacity-50' : ''}`}
      title="Play Pronunciation"
    >
      {playing ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${iconSize} animate-pulse`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconSize}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      )}
    </button>
  );
};