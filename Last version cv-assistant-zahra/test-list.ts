import { GoogleGenAI } from '@google/genai';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.list();
  for await (const model of response) {
    if (model.name.includes('flash')) {
      console.log(model.name);
    }
  }
}
run();
