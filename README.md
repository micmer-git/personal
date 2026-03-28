# Valle Seriana Chronicles

Gioco web pixel-art ispirato ai creature-RPG classici, ambientato in **Valle Seriana (Bergamo)** con:

- Mappa esplorabile in tempo reale (controlli WASD/Frecce).
- Nodi storici multi-epoca (Albino, Clusone, Gromo, Valbondione).
- Tocco linguistico bergamasco in-game.
- Backend LLM con **Groq + Llama** per interazioni naturali con l'"Archivista".

## Avvio locale

```bash
npm install
cp .env.example .env
npm start
```

Apri: `http://localhost:3000`

## Variabili ambiente

- `PORT`: porta server HTTP.
- `GROQ_API_KEY`: chiave API Groq.
- `GROQ_MODEL`: modello (default `llama-3.3-70b-versatile`).

Se `GROQ_API_KEY` manca, il gioco resta funzionante con risposta offline.

## Deploy condivisibile

Puoi pubblicarlo su Render / Railway / Fly.io / VPS:

1. Push del repo su GitHub.
2. Crea servizio Node.js.
3. Imposta env vars (`GROQ_API_KEY`, ecc.).
4. Condividi l'URL pubblico: il gioco è giocabile da chiunque via browser.

## Nota sulla geografia

La mappa è una **stilizzazione giocabile** basata sull'asse reale della valle del Serio (bassa-media-alta valle), con posizionamento relativo dei nodi principali. Per una replica topografica 1:1 puoi integrare tile GIS/DEM in una fase successiva.
