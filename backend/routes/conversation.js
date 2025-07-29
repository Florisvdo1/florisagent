/*
 * Routes related to conversation and speech functionality. These routes wrap
 * calls to the ElevenLabs API so that sensitive credentials remain on the
 * server.
 */

const express = require('express');
const router = express.Router();
const {
  getSignedUrl,
  textToSpeech,
} = require('../services/elevenLabs');

// GET /api/signed-url
// Returns a signed WebSocket URL for the frontend to use when connecting to
// the ElevenLabs conversational API. The agent ID must be supplied via
// environment variable (see .env.example).
router.get('/signed-url', async (req, res) => {
  try {
    const agentId = process.env.AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!agentId) {
      return res.status(500).json({ error: 'Agent ID is not configured' });
    }
    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API key is not configured' });
    }
    const signedUrl = await getSignedUrl(agentId, apiKey);
    res.json({ signedUrl });
  } catch (error) {
    console.error('Error getting signed URL:', error.message);
    res.status(500).json({ error: 'Failed to obtain signed URL' });
  }
});

// POST /api/tts
// Converts text into speech using the ElevenLabs text‑to‑speech API. Expects a
// JSON body with a `text` field. Returns the generated audio as binary data
// encoded in base64 along with a content type header.
router.post('/tts', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) {
      return res.status(500).json({ error: 'Voice ID or API key not configured' });
    }
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing text' });
    }
    const audioBuffer = await textToSpeech(text, voiceId, apiKey);
    // Return audio as base64 string along with content type (MP3)
    const audioBase64 = audioBuffer.toString('base64');
    res.json({ audio: audioBase64, format: 'mp3' });
  } catch (error) {
    console.error('Error generating TTS:', error.message);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

module.exports = router;