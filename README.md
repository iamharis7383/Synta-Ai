# Synta AI

A full-stack AI chat application with a React/Vite interface, Express API, SQLite persistence, session-based authentication, and streaming responses from Gemini, Groq, or OpenAI.

## Requirements

- Node.js 20 or newer
- npm
- An API key from Google AI Studio, Groq, or OpenAI (or set one on the server)

## Run locally

```bash
npm install
cp .env.example .env
```

Set a long random `SESSION_SECRET` in `.env`. Then either add a provider key to `.env` (`GEMINI_API_KEY`, `GROQ_API_KEY`, or `OPENAI_API_KEY`) or sign up and paste your own key under **Settings → AI provider & API key**.

```bash
npm run dev
```

Open http://localhost:5173. The API runs on port 3001 and Vite proxies `/api` requests to it. SQLite data is stored in `server/data/synta.sqlite` and is created automatically.

## Production build

```bash
npm run build
NODE_ENV=production npm start
```

The Express server serves the built frontend from `dist`. Set `PORT`, `SESSION_SECRET`, and your provider key in the hosting environment. Use persistent disk storage for `server/data`; SQLite data is not durable on ephemeral filesystems.

## Features

- Signup/login/logout with bcrypt password hashing and server-side sessions
- Protected API endpoints and user-owned chat records
- Persistent chat history, create/rename/delete/search, and clear-all
- Streaming Gemini, Groq, and OpenAI chat completions
- Per-user provider selection, optional user API key, and system instructions
- Markdown and GFM rendering, copy, stop generation, export to Markdown, timestamps
- Light/dark appearance, responsive mobile sidebar, password change, and toast feedback

## Security and deployment notes

- Never commit `.env`, database files, or API keys.
- Set a unique, high-entropy `SESSION_SECRET`; the development fallback is not suitable for deployment.
- Serve over HTTPS in production. The session cookie is configured `secure` when `NODE_ENV=production`.
- User-supplied provider API keys are encrypted at rest with AES-256-GCM. Set a stable, high-entropy `API_KEY_ENCRYPTION_SECRET` and keep it backed up securely; changing it makes previously stored keys unreadable. Configure database backups and rate limiting before launch.
- Add reverse-proxy rate limits, account verification, password reset, abuse monitoring, and a managed database before exposing this app to the public internet.
- Gemini model name is set in `server/ai.js` (`gemini-2.0-flash`); update it there if Google changes model availability for your API project.

## Project structure

```text
synta-ai/
├── public/logo.svg
├── server/
│   ├── ai.js
│   ├── db.js
│   └── index.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── style.css
├── .env.example
├── package.json
└── vite.config.js
```
