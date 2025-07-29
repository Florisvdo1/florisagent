/*
 * Service functions for interacting with the ElevenLabs API. These helpers
 * encapsulate the HTTP requests required to obtain signed WebSocket URLs and to
 * perform text‑to‑speech conversions. Keeping these functions in a separate
 * module makes it easier to manage and test API interactions in isolation.
 */

const axios = require('axios');

// Base URL for the ElevenLabs API
const BASE_URL = 'https://api.elevenlabs.io';

/**
 * Request a signed WebSocket URL from ElevenLabs for a specific agent. The
 * signed URL allows the client to open a WebSocket connection without
 * exposing the API key. See the documentation at:
 * https://elevenlabs.io/docs/conversational-ai/libraries/web-sockets#using-a-signed-url
 *
 * @param {string} agentId The agent ID for which to request a signed URL.
 * @param {string} apiKey Your ElevenLabs API key.
 * @returns {Promise<string>} The signed WebSocket URL.
 */
async function getSignedUrl(agentId, apiKey) {
  const url = `${BASE_URL}/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`;
  const headers = {
    'xi-api-key': apiKey,
  };
  const response = await axios.get(url, { headers });
  if (response.data && response.data.signed_url) {
    return response.data.signed_url;
  }
  throw new Error('Invalid response from ElevenLabs when requesting signed URL');
}

/**
 * Convert arbitrary text into speech using the ElevenLabs text‑to‑speech API.
 * This function posts the text to the TTS endpoint and returns the raw audio
 * bytes as a Buffer. The default model and voice settings can be configured
 * via environment variables on the server. See:
 * https://elevenlabs.io/docs/api-reference/text-to-speech/create-speech
 *
 * @param {string} text The text to convert into speech.
 * @param {string} voiceId The voice identifier to use.
 * @param {string} apiKey Your ElevenLabs API key.
 * @param {object} [options] Additional options such as model_id or output_format.
 * @returns {Promise<Buffer>} A Buffer containing the generated audio data.
 */
async function textToSpeech(text, voiceId, apiKey, options = {}) {
  const url = `${BASE_URL}/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
  const headers = {
    'xi-api-key': apiKey,
    'Content-Type': 'application/json',
  };
  const data = {
    text,
    model_id: options.model_id || 'eleven_multilingual_v2',
    voice_settings: options.voice_settings || {
      stability: 0.5,
      similarity_boost: 0.8,
    },
    output_format: options.output_format || 'mp3_44100_128',
  };
  const response = await axios.post(url, data, {
    headers,
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
}

module.exports = {
  getSignedUrl,
  textToSpeech,
};