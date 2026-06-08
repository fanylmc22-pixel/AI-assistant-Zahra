import express from 'express';
import { GoogleGenAI } from '@google/genai';
const app = express();
app.use(express.json());
app.post('/api/chat', async (req, res) => {
  try {
     console.log('body is', req.body);
     res.json({ ok: 1 });
  } catch (e) {
     console.error(e);
     res.status(500).json({ error: "error" });
  }
});
app.listen(3001, () => {
  console.log("Started on 3001");
});
