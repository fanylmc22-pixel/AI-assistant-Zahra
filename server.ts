import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';

const FANY_CV = `
Fany Louis-Mondésir
flouismondesir@hotmail.com
Chargée de Marketing Digital & Acquisition chez LexisNexis (Marketing B2B, campagnes multicanales, Pardot, web, event).
Recherche un CDI en marketing digital B2B.
Exp: LexisNexis (fév 2025-présent), MEDEF International (assistante CRM, 2023).
Formation: Master 1 ESCE (2024-2026).
Compétences: SEO, SEA, Emailing, Pardot, HubSpot, Canva.
`.trim();

import fs from 'fs';
function logFile(msg: string) {
  try {
     fs.appendFileSync('.dev-logs.txt', new Date().toISOString() + ': ' + msg + '\n');
  } catch(e) {}
}

process.on('uncaughtException', (err) => {
  logFile('UNCAUGHT EXCEPTION: ' + err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  logFile('UNHANDLED REJECTION: ' + String(reason));
});

async function startServer() {
  logFile('Starting server...');
  const app = express();
  const PORT = 3000;


  // Needed to parse incoming JSON payload
  app.use(express.json());

  // AI Chat Route
  app.post('/api/chat', async (req, res) => {
    const fallbackText = "Ceci est le mode sans l'IA : Fany est Chargée de Marketing Digital à la recherche d'un CDI. Contactez-la à flouismondesir@hotmail.com !";
    try {
      console.log('Received POST /api/chat req.body:', req.body);
      const messages = req.body?.messages || [];
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return res.json({ text: "Clé API manquante. " + fallbackText });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Ensure mapped contents follows the SDK syntax.
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'zahra' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const systemInstruction = "Tu es Zahra, une assistante qui représente Fany Louis-Mondésir. Réponds très brièvement (1 phrase). Fany: " + FANY_CV;

      console.log('Calling GenAI model...');
      let response;
      let retries = 2;
      while (retries >= 0) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction,
              maxOutputTokens: 60
            }
          });
          break; // success
        } catch (err: any) {
          if (err.status === 503 && retries > 0) {
            console.log('503 High Demand, retrying in 2 seconds...');
            await new Promise(r => setTimeout(r, 2000));
            retries--;
          } else {
            throw err;
          }
        }
      }
      console.log('GenAI response text:', response?.text);
      res.json({ text: response?.text });
    } catch (err: any) {
      logFile("AI API Error: " + err.stack);
      console.error("AI API Error:", err);
      // ALWAYS return 200 with fallback to avoid frontend crash loop or HTML error pages
      res.json({ text: fallbackText });
    }
  });

  // TTS Route
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, lang } = req.body;
      const ttsLang = lang === 'en' ? 'en' : 'fr';
      
      const googleTTS = await import('google-tts-api');
      
      console.log('Calling Free Google TTS...');
      
      // google-tts-api returns base64 audio string if we use the getAudioBase64 function
      const base64Audio = await googleTTS.getAudioBase64(
        text.substring(0, 200), // restrict to 200 chars for free translate TTS
        {
          lang: ttsLang,
          slow: false,
          host: 'https://translate.google.com',
          timeout: 10000,
        }
      );
      
      res.json({ audio: base64Audio, type: 'mp3' });
    } catch (err: any) {
      logFile("TTS Exception: " + err.stack);
      console.error("TTS Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Setup Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logFile(`Server running on http://localhost:${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
