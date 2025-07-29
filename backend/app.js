/*
 * Main entry point for the Agent Floris backend service.
 *
 * This Node.js server uses Express to expose a simple API for the frontend to
 * obtain signed WebSocket URLs for real‑time conversations with the ElevenLabs
 * Conversational AI API and to perform text‑to‑speech conversions as a
 * fallback. Configuration is read from environment variables (see
 * `.env.example` for details) and kept on the server side to avoid
 * exposing secrets in the client.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file when present
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Configure CORS. During development the frontend typically runs on
// http://localhost:3000 so we allow that origin by default. In production you
// should set FRONTEND_ORIGIN in your environment to a specific domain.
const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
);

// Import API routes
const conversationRoutes = require('./routes/conversation');

// Mount the routes under /api
app.use('/api', conversationRoutes);

// Health check endpoint to verify that the server is running
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});