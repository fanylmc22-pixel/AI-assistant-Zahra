import { GoogleGenAI } from '@google/genai';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No api key');
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ parts: [{ text: "Bonjour" }], role: "user" }]
    });
    console.log("Success text:", response.text);
  } catch (err) {
    console.error("SDK Error:", err.message);
  }
}
run();
