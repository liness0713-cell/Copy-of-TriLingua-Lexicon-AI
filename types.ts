
export interface ExampleSentence {
  text: string;
  translation: string; // Chinese translation
  lang: 'jp' | 'en';
}

export interface WordData {
  inputWord: string;
  coreWord: {
    jp: string;
    en: string;
    zh: string;
  };
  pronunciation: {
    jp: string; // Hiragana/Romaji
    en: string; // IPA
    zh: string; // Pinyin
  };
  definitions: {
    jp: string;
    jp_furigana: string; // New: Definition with Ruby tags
    en: string;
    zh: string;
  };
  examples: ExampleSentence[];
  etymology: string; // Origin and composition
  related: {
    synonyms: string[];
    antonyms: string[];
  };
}

export interface WordBreakdown {
  word: string;
  reading?: string;
  partOfSpeech: string;
  meaning: string;
}

export interface SentenceData {
  original: string;
  breakdown: WordBreakdown[];
  grammarAnalysis: {
    jp: string;
    en: string;
    zh: string;
  } | string; // Union type for backward compatibility with older history items
  translations: {
    jp: string;
    jp_furigana: string;
    en: string;
    zh: string;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'word' | 'sentence';
  label: string; // The word or truncated sentence
  data: WordData | SentenceData; // Union type
  imageUrl?: string;
}

export enum LoadingState {
  IDLE,
  ANALYZING,
  GENERATING_IMAGE,
  COMPLETE,
  ERROR
}

export type AppMode = 'dictionary' | 'sentence';
