
import { GoogleGenAI, Type } from "@google/genai";
import { Tone, CommitResult } from "../types";

export const generateCommitMessage = async (prompt: string, tone: Tone): Promise<CommitResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("Missing API_KEY. Please add it to your Vercel Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are an expert software engineer who writes perfect Git commit messages.
    Your task is to take a raw description of code changes and turn it into a high-quality commit message.
    
    Tone Guide:
    - Professional: Clear, standard industry wording.
    - Concise: Extremely short but informative.
    - Fun: Add a bit of personality or an emoji.
    - Conventional: Follow the Conventional Commits spec (feat:, fix:, docs:, etc.).

    Always return a JSON object with two fields:
    1. "message": The primary commit subject line.
    2. "description": A brief 1-2 sentence explanation of why this change was made.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a ${tone} commit message for these changes: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["message", "description"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as CommitResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY")) {
        throw new Error("Invalid API Key. Check your Google AI Studio settings.");
    }
    throw new Error(error.message || "Failed to generate commit message. Ensure your Vercel Environment Variables are set.");
  }
};
