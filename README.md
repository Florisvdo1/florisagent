# Agent Floris

Agent Floris is a full‑stack conversational AI web application that lets you
speak naturally with an ElevenLabs agent and hear its responses in real time.
The frontend is built with **React** and **Next.js**, while the backend is a
lightweight **Node.js/Express** service that proxies all requests to the
ElevenLabs API. Microphone audio is streamed to ElevenLabs via WebSockets and
responses are played back immediately. A signed WebSocket URL is used to
authenticate the conversation so that your API key is never exposed to the
client【397688032406679†L140-L164】.

## Features

- **Real‑time voice conversations** – The UI includes a “Talk” button that opens
  a WebSocket connection to `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=…` and
  streams microphone audio to the agent. Audio responses and transcripts are
  rendered live in the chat【397688032406679†L140-L160】.
- **Secure authentication** – The backend uses the `/v1/convai/conversation/get‑signed‑url` endpoint to obtain a one‑time token on your behalf【397688032406679†L166-L180】. The signed URL is passed to the frontend instead of the raw API key【397688032406679†L160-L184】.
- **Text‑to‑speech fallback** – If you type a message instead of speaking, the
  backend uses the ElevenLabs text‑to‑speech API to generate audio which is then
  played back in the browser.
- **Responsive design** – Built with Tailwind CSS, the interface adapts from
  mobile phones to large desktops. A waveform visualizer displays your speech in
  real time.
- **Easy deployment** – Dockerfiles and a `docker-compose.yml` are provided to
  build and run both services with a single command.

## Project structure

```
agent_Floris/
├── backend/                 # Express server that talks to ElevenLabs
│   ├── app.js               # Main server entry point
│   ├── routes/
│   │   └── conversation.js  # API routes: signed URL & TTS proxy
│   ├── services/
│   │   └── elevenLabs.js    # Helper functions for ElevenLabs API
│   ├── middleware/          # (reserved for future use)
│   ├── package.json         # Backend dependencies & scripts
│   └── Dockerfile           # Build & run the backend container
├── frontend/                # Next.js application
│   ├── pages/               # Routes (index, _app)
│   ├── components/          # React components (Chat, MessageBubble, Visualizer)
│   ├── utils/               # Custom hooks (useConversation)
│   ├── styles/              # Global styles (Tailwind CSS)
│   ├── package.json         # Frontend dependencies & scripts
│   └── Dockerfile           # Build & run the frontend container
├── docker-compose.yml       # One‑click orchestration of backend & frontend
├── .env.example             # Template for environment variables
└── README.md                # Project documentation (this file)
```

## Getting started locally

1. **Clone the repository**

   ```bash
   git clone <repository_url>
   cd agent_Floris
   ```

2. **Configure environment variables**

   Copy the example environment file and fill in your ElevenLabs API key, your
   target agent ID and, optionally, a voice ID for the TTS fallback. Never
   commit your actual API key to version control.

   ```bash
   cp .env.example .env
   # Edit .env with your favourite editor
   ```

   The key variables are:

   - `ELEVENLABS_API_KEY` – your ElevenLabs API key. Required for both signed
     URL generation and text‑to‑speech.
   - `AGENT_ID` – the ID of the agent you wish to converse with. For the
     supplied demo this defaults to `agent_01jy74zmxaeejtckv60bq12t98`.
   - `ELEVENLABS_VOICE_ID` – optional voice ID used for text‑to‑speech fallback.
     Leave blank to use your account’s default voice.
   - `PORT` – the backend port (defaults to `5000`).
   - `FRONTEND_ORIGIN` – the allowed CORS origin for the backend (defaults to
     `http://localhost:3000`).

3. **Install dependencies and run both services**

   The backend and frontend are separate Node.js projects. In development you
   can run them in two terminals:

   ```bash
   # Terminal 1 – start the backend
   cd backend
   npm install
   npm start

   # Terminal 2 – start the frontend
   cd ../frontend
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to use
   Agent Floris. The frontend proxies API requests to the backend via a rewrite
   rule defined in `next.config.js`.

## Using Docker

Agent Floris ships with container definitions so you can run the entire stack
without installing Node.js locally. Build and start the services via
`docker-compose`:

```bash
cp .env.example .env
# edit .env with your API key and agent ID
docker-compose up --build
```

The backend will be available at `http://localhost:5000` and the frontend at
`http://localhost:3000`. Stopping the containers will not remove your
environment variables.

## Deployment

### Vercel (frontend)

The frontend is a standard Next.js application and can be deployed to Vercel
using their CLI or Git integration. Set the environment variables via Vercel’s
dashboard to point to your backend endpoint (for example, `NEXT_PUBLIC_BACKEND_URL`)
or rely on relative API routes if the backend is served from the same domain.

### Heroku/AWS/Azure (backend)

The backend is a simple Express server. Deploy it to your preferred cloud
provider by building the Docker image defined in `backend/Dockerfile` or by
pushing the Node.js project directly. Make sure to configure the same
environment variables used locally.

### Single host deployment

For small deployments you can host both services on a single VM. Use the
`docker-compose.yml` provided here to orchestrate the containers. Adjust the
exposed ports as needed and configure a reverse proxy (NGINX or Apache) to
route traffic to the frontend and backend.

## Usage

1. **Start a conversation**: Click the **Talk** button. The application will
   request microphone access and then open a WebSocket connection to the
   ElevenLabs agent using a signed URL fetched from the backend【397688032406679†L166-L180】.
2. **Speak naturally**: As you speak, the waveform visualizer animates in
   real time. Your utterances are transcribed and appended to the chat once
   the server returns them【397688032406679†L186-L216】.
3. **Listen to the response**: The agent’s reply appears as text and its audio
   is queued for playback. Audio arrives in chunks and is played in sequence
   without blocking the UI【397688032406679†L186-L216】.
4. **Send a typed message**: If you cannot speak or prefer to type, use the
   text input. The backend will convert your text into speech using the
   ElevenLabs text‑to‑speech API and the audio will be played back immediately.
5. **End the conversation**: Click **Stop** to close the WebSocket and
   release the microphone. You can start a new conversation at any time.

## Troubleshooting

- **No audio** – Ensure your browser has permission to access the microphone
  and that your speakers are not muted. Check your `.env` values, particularly
  the voice ID used for the fallback TTS.
- **Failed to obtain signed URL** – Verify that your API key and agent ID are
  correct. The backend logs errors to the console when requests to ElevenLabs
  fail.
- **CORS errors** – If you deploy the backend separately, set
  `FRONTEND_ORIGIN` in `.env` to the domain serving the frontend. For local
  development this defaults to `http://localhost:3000`.
- **High latency** – Network conditions and model selection affect latency.
  ElevenLabs offers different models with various latency/quality trade‑offs【397688032406679†L140-L160】.

## Acknowledgements

This project was inspired by the official ElevenLabs Next.js example which
demonstrates how to integrate the WebSocket API with `voice-stream` and
Tailwind CSS【397688032406679†L238-L256】. The structure here adapts those
recommendations for a full‑stack deployment and includes a backend to securely
manage API credentials.