
import { GoogleGenAI, Type, Chat, Modality, FunctionDeclaration } from "@google/genai";
import { ThoughtRecord } from "../types";

// Safety check for API Key
const apiKey = process.env.API_KEY || '';
const isApiConfigured = !!apiKey;

export const ai = isApiConfigured ? new GoogleGenAI({ apiKey }) : null;

// Helper to handle API unavailability gracefully
const handleMissingApi = (fallbackText: string): string => {
  console.warn("Gemini API Key missing. Returning fallback.");
  return fallbackText;
};

// --- TOOLS ---

const navigationFunction: FunctionDeclaration = {
  name: 'navigate',
  description: 'Navigate the user to a specific view in the application. Use this when the user expresses an intent to perform an action available in another section (e.g., logging data, breathing exercises, checking insights, or profile settings).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      view: {
        type: Type.STRING,
        enum: ['HOME', 'LOG', 'MIND', 'INSIGHTS', 'PROFILE'],
        description: 'The target view to navigate to.'
      },
      reason: {
          type: Type.STRING,
          description: 'A very brief explanation of why we are going there (e.g. "Let\'s log that sleep.").'
      }
    },
    required: ['view']
  }
};

/**
 * CHAT SERVICE
 * Uses gemini-3-pro-preview for complex reasoning and chat.
 * Supports Search Grounding, Thinking Mode, and Navigation Tools.
 */
export const createChat = (systemInstruction: string) => {
  if (!ai) return null;
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction,
    }
  });
};

export const sendMessage = async (
  chat: Chat, 
  message: string | any, 
  useThinking: boolean = false, 
  useSearch: boolean = false
) => {
  if (!ai) return { text: "Service unavailable." };

  const config: any = {
    temperature: 0.7,
  };

  // Configure Tools
  const tools: any[] = [{ functionDeclarations: [navigationFunction] }];
  
  if (useSearch) {
    tools.push({ googleSearch: {} });
  }
  
  config.tools = tools;

  if (useThinking) {
    // Gemini 3 Pro max thinking budget
    config.thinkingConfig = { thinkingBudget: 32768 }; 
  }

  const response = await chat.sendMessage({
    message,
    config
  });

  return response;
};

/**
 * IMAGE GENERATION
 * Uses gemini-3-pro-image-preview
 */
export const generateImage = async (prompt: string, aspectRatio: string) => {
  if (!ai) throw new Error("AI not configured");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any, 
        imageSize: "1K"
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * TEXT TO SPEECH
 * Uses gemini-2.5-flash-preview-tts
 */
export const generateSpeech = async (text: string) => {
  if (!ai) throw new Error("AI not configured");

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

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

/**
 * AUDIO TRANSCRIPTION
 * Uses gemini-3-flash-preview
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  if (!ai) throw new Error("AI not configured");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio
          }
        },
        { text: "Transcribe this audio exactly." }
      ]
    }
  });

  return response.text;
};

/**
 * Existing Functions
 */

export const reframeThought = async (record: Omit<ThoughtRecord, 'id' | 'timestamp' | 'reframe'>): Promise<string> => {
  if (!ai) return handleMissingApi("Let's look at this differently. Is there evidence that supports this thought? Is there evidence against it?");

  try {
    const prompt = `
      You are a calm, supportive, non-clinical mental health guide. 
      The user is performing a "reality check" on a thought.
      
      Situation: "${record.situation}"
      Emotion: "${record.emotion}"
      Assumption/Thought: "${record.thought}"

      Task: Provide a gentle, grounded reframe. 
      1. Validate the feeling briefly.
      2. Ask a checking question or offer a more neutral perspective.
      3. Separate fact from assumption.
      4. MAX 2 sentences.
      5. NO medical advice. NO "you should".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7, 
      }
    });

    return response.text || "Could we look at this another way?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "We might be looking at this through a harsh lens. What would you tell a friend in this situation?";
  }
};

export const generateDailyInsight = async (logs: any[]): Promise<{ title: string; body: string }> => {
  if (!ai) return { title: "Noticing Patterns", body: "Consistency helps us understand our needs. Keep logging to see more." };

  try {
    const prompt = `
      Analyze these recent anonymous wellbeing logs: ${JSON.stringify(logs.slice(-3))}
      
      Generate a "Daily Insight" card.
      Rules:
      1. Tone: Calm, observational, non-judgmental.
      2. No alarmist language or "red alerts".
      3. Format: JSON with "title" (short) and "body" (1 sentence explanation + 1 gentle suggestion).
      4. If data is scarce, encourage small steps.
      5. STRICT SAFETY: Do NOT use clinical terms like 'recovery score', 'optimal', 'symptoms', 'diagnosis'. 
      6. Use metaphors like 'balance', 'rhythm', 'energy', 'rest pattern'.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING }
          },
          required: ["title", "body"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (error) {
    return { title: "Rest & Reflect", body: "Taking a moment to check in with yourself is productive in itself." };
  }
};
