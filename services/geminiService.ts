
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";

// Initialize with direct process.env.API_KEY access
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for base64 encoding
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper for base64 decoding
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decode raw PCM audio data
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
  // Low-latency responses for hospitality context
  async getQuickFeedback(prompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: Indian Aviation Hospitality & Travel Management. Prompt: ${prompt}`,
    });
    return response.text;
  },

  // Complex reasoning for hospitality academy operations with Regulatory awareness
  async solveComplexProblem(prompt: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert Aviation Regulatory Consultant for Vision Aviation Academy, India. 
      Your focus is Hospitality & Travel Management. 
      Incorporate specific DGCA (Directorate General of Civil Aviation) rules for cabin crew medicals, grooming, and safety training, 
      and AAI (Airports Authority of India) protocols for ground handling, airport security, and passenger facilitation. 
      
      Problem/Query: ${prompt}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  },

  // Analyze hospitality sales performance
  async analyzePerformance(data: { totalLeads: number; conversionRate: number; totalRevenue: number }) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following hospitality training sales performance for Vision Aviation Academy and provide a brief strategic overview:
      Total Leads: ${data.totalLeads}
      Conversion Rate: ${data.conversionRate}%
      Total Revenue: ₹${data.totalRevenue.toLocaleString('en-IN')}`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });
    return response.text;
  },

  // Search Grounding for hospitality news/DGCA circulars
  async searchAviationInfo(query: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for official information from DGCA (dgca.gov.in) and AAI (aai.aero) regarding: ${query}. 
      Focus on Airline Cabin Crew requirements, Ground Staff regulations, and Travel Industry laws in India.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.map((chunk: any) => ({
      title: chunk.web?.title || 'Official Regulatory Source',
      uri: chunk.web?.uri || '#'
    })).filter((s: any) => s.uri !== '#');

    return { text: response.text, sources };
  },

  // Generate Image for hospitality branding
  async generateAviationImage(prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K") {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A professional image showing high-end aviation hospitality, cabin crew, or luxury airport lounge management: ${prompt}` }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  // Edit Image
  async editAviationImage(base64Image: string, prompt: string, mimeType: string = 'image/png') {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ],
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  // Text-to-Speech
  async speak(text: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  },

  // Live Real-time Session with Hospitality and DGCA Safety training instructions
  connectLive(callbacks: {
    onopen: () => void;
    onmessage: (msg: LiveServerMessage) => void;
    onerror: (e: any) => void;
    onclose: (e: any) => void;
  }) {
    const ai = getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are the Vision Aviation Academy Career and Compliance Coach. You assist sales reps in closing leads for Cabin Crew, Ground Staff, and Travel Management. You are well-versed in DGCA safety requirements and AAI airport protocols.',
      },
    });
  }
};
