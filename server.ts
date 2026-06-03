import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';

const FANY_CV = `
Fany Louis-Mondésir
Chargée de Marketing Digital & Acquisition
France
flouismondesir@hotmail.com | www.linkedin.com/in/fany-lm

Résumé:
Chargée de Marketing Digital & Acquisition chez LexisNexis (Europe & Afrique francophone), je pilote des campagnes multicanales, de l'automation Pardot à la création de contenu. Actuellement en M2 à l'ESCE, je recherche un CDI ou CDD en marketing digital B2B.

Expérience:
- LexisNexis (février 2025 - Présent): Chargée de Marketing Digital et Acquisition (B2B, campagnes multicanales, SEO, SEA, Pardot, web, event).
- Mouvement des Entreprises de France International (février 2023 - juillet 2023): Appui opérationnel - Assistante CRM (onboarding, événements, segmentation Pardot).
- McDonald's (octobre 2022 - décembre 2022): Équipier polyvalent.
- Glam&Cosy (juin 2022 - juillet 2022): Assistant en Marketing Digital et Communication (réseaux sociaux, Shopify, Canva, création de contenu).

Formation:
- ESCE International Business School : Master 1 (M1) International Consumer Marketing (juil. 2024 - août 2026).
- ESCE International Business School : Bachelor Commerce international (fév. 2021 - juin 2023).

Compétences:
- Acquisition digitale: SEO, SEA, Emailing, Display.
- CRM & Automation: Pardot, HubSpot.
- Création contenu: LinkedIn, blog, Canva.
- Langues: Français (natif), Anglais (professionnel), Espagnol (notions).
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
    const fallbackText = "Bonjour ! Je suis l'assistante de Fany Louis-Mondésir. Elle est actuellement une Chargée de Marketing Digital & Acquisition avec une belle expérience chez LexisNexis et au MEDEF International. Elle cherche un CDI en marketing digital B2B. N'hésitez pas à la contacter à flouismondesir@hotmail.com !";
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

      const systemInstruction = "Tu es Zahra, une assistante virtuelle professionnelle et chaleureuse. Ton rôle est de représenter Fany Louis-Mondésir et de répondre aux questions sur son CV aux recruteurs. Tu es enthousiaste, précise, et tu fais ressortir sa valeur ajoutée. Réponds de FAÇON TRÈS CONCISE (1 à 2 phrases courtes maximum) et conversationnelle. NE METS JAMAIS D'ASTÉRISQUES ou de texte en gras ; ton texte sera lu à l'oral. Si l'utilisateur te salue sans question précise, mentionne de suite un point fort de Fany (ex: son poste chez LexisNexis ou sa recherche de CDI) pour engager la conversation. L'utilisateur utilise la reconnaissance vocale : sois très indulgente avec les erreurs de transcription, les mots mal orthographiés (comme 'fanny' au lieu de Fany) ou les phrases approximatives, et essaie de toujours deviner son intention pour lui répondre utilement. \n\nVoici le CV complet de Fany :\n\n" + FANY_CV;

      console.log('Calling GenAI model...');
      let response;
      let retries = 2;
      while (retries >= 0) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction
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
