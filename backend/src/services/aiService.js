import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export const generateTopicIdea = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `Generate a random, engaging topic for an English speaking practice session.
The topic should be thought-provoking and suitable for a 1-3 minute speech.

Return ONLY a valid JSON object (no markdown, no code fences) with these fields:
{
  "title": "A catchy title for the topic",
  "description": "A brief description or prompt question to guide the speaker",
  "category": "one of: General, Business, Technology, Debate, Interview",
  "difficulty": "one of: Beginner, Intermediate, Advanced"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating topic with Gemini:', error?.message || error);
    throw new Error('Failed to generate topic with AI');
  }
};
