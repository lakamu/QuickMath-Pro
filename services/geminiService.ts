
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEncouragement = async (score: number, reason: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just lost a fast-math game with a score of ${score}. 
                 Reason for loss: ${reason}. 
                 Write a very short (max 15 words) sarcastic but encouraging remark in Indonesian 
                 to motivate them to try again. Keep it cool and gamer-like.`,
    });
    return response.text?.trim() || "Coba lagi, kamu pasti bisa!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tetap semangat! Matematika itu asik.";
  }
};
