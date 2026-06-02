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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Needed to parse incoming JSON payload
  app.use(express.json());

  // AI Chat Route
  app.post('/api/chat', async (req, res) => {
    try {
      console.log('Received POST /api/chat req.body:', req.body);
      const { messages } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY is missing');
        return res.status(500).json({ error: "Configuration API Key missing. Please set GEMINI_API_KEY." });
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
            model: 'gemini-3.5-flash',
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
      if (err.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
        // AI API Quota Exceeded. Using fallback text.
      } else {
        console.error("AI API Error:", err.message || err);
      }
      // Fallback response with CV information in case of API limit or failure
      const fallbackText = "Je rencontre actuellement un petit problème technique qui m'empêche d'analyser son profil en profondeur. Cependant, je peux vous dire que Fany Louis-Mondésir est une super Chargée de Marketing Digital & Acquisition avec de l'expérience chez LexisNexis et MEDEF International. Elle maîtrise l'acquisition, le CRM (Pardot, HubSpot) et la création de contenu. N'hésitez pas à la contacter à flouismondesir@hotmail.com pour échanger !";
      res.json({ text: fallbackText });
    }
  });

  // TTS Route
  app.post('/api/tts', async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "API Key missing." });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      console.log('Calling Gemini TTS model...');
      
      let response;
      let retries = 2;
      while (retries >= 0) {
        try {
          response = await ai.models.generateContent({
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
          break;
        } catch (err: any) {
          if (err.status === 503 && retries > 0) {
            console.log('503 High Demand in TTS, retrying in 2 seconds...');
            await new Promise(r => setTimeout(r, 2000));
            retries--;
          } else {
            throw err;
          }
        }
      }
      
      const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        // Add WAV header to raw PCM
        const pcmBuffer = Buffer.from(base64Audio, 'base64');
        const header = Buffer.alloc(44);
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);

        header.write('RIFF', 0);
        header.writeUInt32LE(36 + pcmBuffer.length, 4);
        header.write('WAVE', 8);
        header.write('fmt ', 12);
        header.writeUInt32LE(16, 16);
        header.writeUInt16LE(1, 20);
        header.writeUInt16LE(numChannels, 22);
        header.writeUInt32LE(sampleRate, 24);
        header.writeUInt32LE(byteRate, 28);
        header.writeUInt16LE(blockAlign, 32);
        header.writeUInt16LE(bitsPerSample, 34);
        header.write('data', 36);
        header.writeUInt32LE(pcmBuffer.length, 40);

        const wavBase64 = Buffer.concat([header, pcmBuffer]).toString('base64');
        res.json({ audio: wavBase64 });
      } else {
        res.status(500).json({ error: "No audio generated" });
      }
    } catch (err: any) {
      if (err.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
        // TTS Quota Exceeded. Returning error for client fallback.
        res.status(503).json({ error: "TTS Quota exceeded" });
      } else {
        console.error("TTS Error:", err.message);
        res.status(500).json({ error: err.message });
      }
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
