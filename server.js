const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const lorePath = path.join(__dirname, 'data', 'lore.json');
const lore = JSON.parse(fs.readFileSync(lorePath, 'utf-8'));

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/lore', (_req, res) => {
  res.json(lore);
});

app.post('/api/llm/chat', async (req, res) => {
  const userMessage = String(req.body?.message || '').trim();
  if (!userMessage) {
    return res.status(400).json({ error: 'message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      mode: 'offline',
      reply:
        'Sono l\'Archivista della Seriana (offline). Imposta GROQ_API_KEY per una conversazione LLM live. Intanto: visita Clusone, Gromo e il Santuario della Trinità e dimmi quale epoca vuoi esplorare.'
    });
  }

  const systemPrompt = [
    'Sei "L\'Archivista della Valle Seriana" in un videogioco pixel-art stile creature-collector.',
    'Parla in italiano con tocchi bergamaschi leggeri e comprensibili.',
    'Mantieni accuratezza storica e geografica della Valle Seriana (Bergamo).',
    'Dai risposte concise (max 140 parole) ma ricche di riferimenti utili.',
    'Se un fatto non è certo, dichiaralo apertamente.'
  ].join(' ');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 240,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(502).json({
        error: 'Groq API error',
        details: errorBody
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    return res.json({
      mode: 'groq',
      reply: reply || 'Nessuna risposta disponibile dal modello.'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unexpected server error',
      details: error.message
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Valle Seriana Chronicles listening on http://localhost:${port}`);
});
