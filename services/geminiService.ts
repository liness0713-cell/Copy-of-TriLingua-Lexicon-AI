import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordData } from "../types";

// Helper to decode base64 audio
const decodeAudioData = async (
  base64Data: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await audioContext.decodeAudioData(bytes.buffer);
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeWord(query: string): Promise<WordData> {
    const prompt = `
      Analyze the following input: "${query}". 
      Input language could be Japanese, English, or Chinese.
      Identify the core vocabulary word intended by the user.
      Provide a trilingual dictionary entry (Japanese, English, Chinese).
      Include definitions, pronunciations, example sentences (at least one JP and one EN), etymology/composition, synonyms, and antonyms.
      Ensure the explanations are suitable for a language learner.
    `;

    const response = await this.ai.models.generateContent({
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
            etymology: { type: Type.STRING, description: "Origin, kanji breakdown, or word formation history" },
            related: {
              type: Type.OBJECT,
              properties: {
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
          required: ["coreWord", "pronunciation", "definitions", "examples", "etymology"],
        },
      },
    });

    if (!response.text) throw new Error("No text response from Gemini");
    return JSON.parse(response.text) as WordData;
  }

  async generateImage(word: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A clear, educational, minimalistic illustration representing the word: "${word}". No text in the image.` }],
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
    const voiceName = lang === 'jp' ? 'Kore' : lang === 'en' ? 'Fenrir' : 'Puck'; // Mapping approx voices
    
    // Note: Gemini TTS currently supports specific voices. Using default English-like mapping or multi-lang capable if available.
    // Since 'Kore' etc are preset, we try to match the best available.
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
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

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await decodeAudioData(base64Audio, audioContext);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

    } catch (e) {
      console.error("TTS failed", e);
    }
  }
}

export const geminiService = new GeminiService();
