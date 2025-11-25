
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordData, SentenceData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Attempt to initialize if key is present, but don't crash if not.
    // Initialization is deferred to actual usage to prevent load-time errors.
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (e) {
        console.error("Failed to initialize Gemini client:", e);
      }
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing. Please set the API_KEY environment variable in your Vercel settings or .env file.");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async analyzeWord(query: string): Promise<WordData> {
    const prompt = `
      Analyze the following input: "${query}". 
      Input language could be Japanese, English, or Chinese.
      Identify the core vocabulary word intended by the user.
      Provide a trilingual dictionary entry (Japanese, English, Chinese).
      
      For the Japanese Definition:
      1. Provide a standard text version.
      2. Provide a version with Furigana using HTML <ruby> tags (e.g., <ruby>日本<rt>にほん</rt></ruby>).
      
      Include pronunciations, example sentences, etymology, synonyms, and antonyms.
    `;

    const response = await this.getClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            inputWord: { type: Type.STRING },
            coreWord: {
              type: Type.OBJECT,
              properties: {
                jp: { type: Type.STRING },
                en: { type: Type.STRING },
                zh: { type: Type.STRING },
              },
              required: ["jp", "en", "zh"],
            },
            pronunciation: {
              type: Type.OBJECT,
              properties: {
                jp: { type: Type.STRING, description: "Hiragana and Romaji" },
                en: { type: Type.STRING, description: "IPA format" },
                zh: { type: Type.STRING, description: "Pinyin" },
              },
            },
            definitions: {
              type: Type.OBJECT,
              properties: {
                jp: { type: Type.STRING },
                jp_furigana: { type: Type.STRING, description: "Japanese definition containing HTML <ruby> tags for Kanji readings" },
                en: { type: Type.STRING },
                zh: { type: Type.STRING },
              },
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  translation: { type: Type.STRING, description: "Chinese translation" },
                  lang: { type: Type.STRING, enum: ["jp", "en"] },
                },
              },
            },
            etymology: { type: Type.STRING },
            related: {
              type: Type.OBJECT,
              properties: {
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["synonyms", "antonyms"],
            },
          },
          required: ["coreWord", "pronunciation", "definitions", "examples", "etymology", "related"],
        },
      },
    });

    if (!response.text) throw new Error("No text response from Gemini");
    return JSON.parse(response.text) as WordData;
  }

  async analyzeSentence(sentence: string): Promise<SentenceData> {
    const prompt = `
      Analyze the following sentence deeply: "${sentence}".
      The sentence could be in Japanese, English, or Chinese.
      
      1. Break down the sentence word by word (or by grammatical unit).
      2. Provide a detailed grammar analysis explaining the structure, tense, and nuances.
      3. Provide the grammar analysis in THREE languages: Japanese, English, and Chinese.
      4. Translate the full sentence into Japanese, English, and Chinese.
      
      For ANY Japanese text output (translations, grammar analysis, etc.):
      Provide a version that uses HTML <ruby> tags for Furigana readings where appropriate (e.g. <ruby>私<rt>わたし</rt></ruby>は...).
    `;

    const response = await this.getClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  reading: { type: Type.STRING, description: "Reading if applicable (e.g. Kana for Kanji)" },
                  partOfSpeech: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                }
              }
            },
            grammarAnalysis: {
              type: Type.OBJECT,
              description: "Detailed explanation of grammar and structure in three languages",
              properties: {
                jp: { type: Type.STRING, description: "Japanese explanation" },
                en: { type: Type.STRING, description: "English explanation" },
                zh: { type: Type.STRING, description: "Chinese explanation" }
              },
              required: ["jp", "en", "zh"]
            },
            translations: {
              type: Type.OBJECT,
              properties: {
                jp: { type: Type.STRING, description: "Plain Japanese translation" },
                jp_furigana: { type: Type.STRING, description: "Japanese translation with HTML <ruby> tags" },
                en: { type: Type.STRING },
                zh: { type: Type.STRING },
              },
              required: ["jp", "jp_furigana", "en", "zh"]
            }
          },
          required: ["original", "breakdown", "grammarAnalysis", "translations"]
        }
      }
    });

    if (!response.text) throw new Error("No text response from Gemini");
    return JSON.parse(response.text) as SentenceData;
  }

  async generateImage(word: string): Promise<string | null> {
    try {
      const response = await this.getClient().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A clear, high-quality, photorealistic or artistic illustration representing the concept of: "${word}". The image should be wide and suitable for a header.` }],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (e) {
      console.error("Image generation failed", e);
      return null;
    }
  }

  async generateSpeech(text: string, lang: 'jp' | 'en' | 'zh'): Promise<void> {
    // Strip HTML tags for speech generation (in case text contains ruby tags)
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    
    const voiceName = lang === 'jp' ? 'Kore' : lang === 'en' ? 'Fenrir' : 'Puck';
    
    try {
      const response = await this.getClient().models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return;

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();

    } catch (e) {
      console.error("TTS failed", e);
      // Optional: You could throw here if you want the UI to show a "Speech failed" error
    }
  }
}

export const geminiService = new GeminiService();
