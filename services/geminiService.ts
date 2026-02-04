import { GoogleGenAI, Type } from "@google/genai";
import { ThoughtRecord } from "../types";

// Safety check for API Key
const apiKey = process.env.API_KEY || '';
const isApiConfigured = !!apiKey;

const ai = isApiConfigured ? new GoogleGenAI({ apiKey }) : null;

// Helper to handle API unavailability gracefully
const handleMissingApi = (fallbackText: string): string => {
  console.warn("Gemini API Key missing. Returning fallback.");
  return fallbackText;
};

/**
 * Reframes a negative thought using Cognitive Behavioral Therapy (CBT) grounding techniques.
 * strictly non-clinical.
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
        temperature: 0.7, // Slightly creative but grounded
      }
    });

    return response.text || "Could we look at this another way?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "We might be looking at this through a harsh lens. What would you tell a friend in this situation?";
  }
};

/**
 * Generates a calm daily insight based on logs.
 */
export const generateDailyInsight = async (logs: any[]): Promise<{ title: string; body: string }> => {
  if (!ai) return { title: "Noticing Patterns", body: "Consistency helps us understand our needs. Keep logging to see more." };

  try {
    const prompt = `
      Analyze these recent anonymous wellbeing logs: ${JSON.stringify(logs.slice(-3))}
      
      Generate a "Daily Insight" card.
      Rules:
      1. Tone: Calm, observational, non-judgmental.
      2. No alarmist language.
      3. Format: JSON with "title" (short) and "body" (1 sentence explanation + 1 gentle suggestion).
      4. If data is scarce, encourage small steps.
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