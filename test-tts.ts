import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ parts: [{ text: "Bonjour, que sais-tu de mon CV ?" }] }],
      config: {
        systemInstruction: "Tu es Zahra"
      },
    });
    console.log("Success text:", response.text);
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
run();
