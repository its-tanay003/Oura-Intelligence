
import { GoogleGenAI, Type, Chat, Modality, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { ThoughtRecord } from "../types";

// Safety check for API Key that works in both Node (process) and Vite/Browser (import.meta)
const getApiKey = () => {
    // 1. Check Vite/Modern Browser environment
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
        return (import.meta as any).env.VITE_API_KEY;
    }
    // 2. Check Node/Process environment (Standard Vercel)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    return '';
};

const apiKey = getApiKey();
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
        enum: ['HOME', 'LOG', 'MIND', 'INSIGHTS', 'PROFILE', 'CONNECT', 'GOALS'],
        description: 'The target view to navigate to. CONNECT is for Trusted Circle. GOALS is for Learning Journeys.'
      },
      reason: {
          type: Type.STRING,
          description: 'A very brief explanation of why we are going there (e.g. "Let\'s log that sleep.").'
      }
    },
    required: ['view']
  }
};

const coachingFunction: FunctionDeclaration = {
  name: 'provideCoaching',
  description: 'Provide a structured coaching card with a specific tip, insight, or micro-action. Use this when you want to highlight a key piece of advice, a grounding quote, or a specific suggestion visually.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Short, encouraging title for the advice.' },
      advice: { type: Type.STRING, description: 'The main content of the advice or insight.' },
      category: { type: Type.STRING, enum: ['REST', 'FOCUS', 'CONNECT', 'GROWTH', 'GROUNDING'], description: 'The domain of the advice.' },
      actionItem: { type: Type.STRING, description: 'A very short, doable micro-action (optional).' }
    },
    required: ['title', 'advice', 'category']
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
  chat: Chat | null, 
  message: string | any, 
  useThinking: boolean = false, 
  useSearch: boolean = false
): Promise<GenerateContentResponse> => {
  if (!ai || !chat) throw new Error("Service unavailable.");

  const config: any = {
    temperature: 0.7,
  };

  // Configure Tools
  const tools: any[] = [{ functionDeclarations: [navigationFunction, coachingFunction] }];
  
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
  if (!base64Audio) return "No audio captured."; 

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
 * LEARNING JOURNEYS
 * Uses gemini-3-flash-preview for structured plan generation.
 */
export const generateLearningJourney = async (topic: string): Promise<{ title: string; milestones: { title: string; description: string; searchQuery: string }[] }> => {
  if (!ai) return { 
    title: topic, 
    milestones: [
        { title: "Explore Basics", description: "Read an introductory article or watch a video.", searchQuery: `${topic} basics introduction` }, 
        { title: "First Practice", description: "Try a simple exercise related to the topic.", searchQuery: `${topic} beginner exercises` }
    ] 
  };

  try {
    const prompt = `
      Create a "Learning Journey" for the user interested in: "${topic}".
      
      Rules:
      1. Tone: Encouraging, low-pressure, bite-sized.
      2. Structure: 3 to 5 clear, actionable milestones.
      3. Focus: Progressive learning (Start small -> Go deeper).
      4. Output: JSON with 'title' (inspiring name for the journey) and 'milestones' array (title, description, searchQuery).
      5. searchQuery: A specific, effective Google Search query to find educational content for this milestone.
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
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  searchQuery: { type: Type.STRING }
                },
                required: ["title", "description", "searchQuery"]
              }
            }
          },
          required: ["title", "milestones"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
        title: `Journey: ${topic}`, 
        milestones: [{ title: "Getting Started", description: "Define what you want to learn specifically about this topic.", searchQuery: `${topic} getting started` }] 
    };
  }
};

/**
 * REALITY CHECK / REFRAME
 */
interface RealityCheckInput {
    emotion: string;
    intensity: number;
    story: string; // The Assumption
    facts: string; // The Reality
}

export const reframeThought = async (input: RealityCheckInput | Omit<ThoughtRecord, 'id' | 'timestamp' | 'reframe'>): Promise<string> => {
  if (!ai) return handleMissingApi("Let's look at this differently. Is there evidence that supports this thought? Is there evidence against it?");

  // Handle legacy calls or new structured calls
  const story = 'story' in input ? input.story : (input as any).thought;
  const facts = 'facts' in input ? input.facts : (input as any).situation;
  const emotion = input.emotion;

  try {
    const prompt = `
      You are a calm, supportive, non-clinical mental health guide. 
      The user is performing a "Reality Check" to separate facts from feelings.
      
      The Emotion: "${emotion}"
      The Facts (Camera View): "${facts}"
      The Story (User's Assumption): "${story}"

      Task: Provide a gentle, grounded reframe that bridges the gap between the facts and the story.
      1. Acknowledge the emotion without reinforcing the negative story.
      2. Highlight the difference between the 'story' and the 'facts' gently.
      3. Offer a neutral, grounded perspective.
      4. MAX 3 sentences. Calm, warm, "human" tone.
      5. NO medical advice. NO "you should".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.6, 
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
      Analyze these recent anonymous wellbeing logs: ${JSON.stringify(logs.slice(-5))}
      
      Task: Analyze the user's sleep duration consistency.
      
      Rules:
      1. Tone: Calm, observational, non-judgmental.
      2. Focus: Identify if sleep duration is stable or erratic and how it might correlate with mood (if visible).
      3. Format: JSON with:
         - "title" (Short & engaging, e.g. "Sleep Rhythm")
         - "body" (Exactly two sentences: 1. Observation of the sleep pattern. 2. A gentle suggestion related to consistency.)
      4. Avoid clinical terms.
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
