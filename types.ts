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

export interface HistoryItem {
  id: string;
  timestamp: number;
  word: string;
  data: WordData;
  imageUrl?: string;
}

export enum LoadingState {
  IDLE,
  ANALYZING,
  GENERATING_IMAGE,
  COMPLETE,
  ERROR
}