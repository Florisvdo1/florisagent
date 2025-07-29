import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useVoiceStream } from 'voice-stream';

/**
 * Custom React hook that encapsulates the logic for interacting with the
 * ElevenLabs conversational API via WebSockets. It handles obtaining a signed
 * WebSocket URL from the backend, establishing a WebSocket connection,
 * streaming microphone audio, receiving transcripts and agent responses, and
 * playing back audio returned by the agent. A simple message model is used
 * wherein each message contains a role ("user" or "agent"), text and
 * optionally associated audio.
 */
export function useConversation() {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const websocketRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isAudioPlayingRef = useRef(false);
  const mediaStreamRef = useRef(null);

  // Setup voice streaming. The onAudioChunked callback is invoked by the
  // voice‑stream library with base64 encoded PCM audio chunks. These are
  // forwarded to the ElevenLabs WebSocket when a connection is active.
  const { startStreaming, stopStreaming } = useVoiceStream({
    onAudioChunked: (audioData) => {
      const ws = websocketRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify({
          user_audio_chunk: audioData,
        }),
      );
    },
  });

  /**
   * Plays the next audio file in the queue if nothing is currently playing.
   */
  const maybePlayNextAudio = useCallback(() => {
    if (isAudioPlayingRef.current) return;
    const next = audioQueueRef.current.shift();
    if (next) {
      isAudioPlayingRef.current = true;
      const audio = new Audio(`data:audio/mpeg;base64,${next}`);
      audio.onended = () => {
        isAudioPlayingRef.current = false;
        maybePlayNextAudio();
      };
      audio.play().catch(() => {
        // On failure we still proceed to the next item
        isAudioPlayingRef.current = false;
        maybePlayNextAudio();
      });
    }
  }, []);

  /**
   * Establishes a new conversation with the ElevenLabs agent. This function
   * requests a signed WebSocket URL from the backend, opens the WebSocket
   * connection, and begins streaming microphone audio. When the connection
   * closes the streaming is stopped and the UI state is updated.
   */
  const startConversation = useCallback(async () => {
    if (isConnected) return;
    try {
      // Request a signed WebSocket URL from the backend
      const { data } = await axios.get('/api/signed-url');
      const { signedUrl } = data;
      if (!signedUrl) throw new Error('Signed URL not provided');

      const ws = new WebSocket(signedUrl);
      websocketRef.current = ws;
      ws.onopen = async () => {
        setIsConnected(true);
        // Send conversation initiation message as required by API
        ws.send(
          JSON.stringify({
            type: 'conversation_initiation_client_data',
          }),
        );
        // Start streaming audio from the microphone
        await startStreaming();
        setIsRecording(true);
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') {
          // Respond to ping events to keep the connection alive
          ws.send(
            JSON.stringify({
              type: 'pong',
              event_id: data.ping_event.event_id,
            }),
          );
          return;
        }
        if (data.type === 'user_transcript') {
          const text = data.user_transcription_event?.user_transcript;
          if (text) {
            setMessages((prev) => [...prev, { role: 'user', text }]);
          }
        }
        if (data.type === 'agent_response') {
          const text = data.agent_response_event?.agent_response;
          if (text) {
            setMessages((prev) => [...prev, { role: 'agent', text }]);
          }
        }
        if (data.type === 'audio') {
          const base64Audio = data.audio_event?.audio_base_64;
          if (base64Audio) {
            // Queue the audio and start playback if not already playing
            audioQueueRef.current.push(base64Audio);
            maybePlayNextAudio();
          }
        }
      };
      ws.onclose = () => {
        websocketRef.current = null;
        setIsConnected(false);
        setIsRecording(false);
        stopStreaming();
      };
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [isConnected, maybePlayNextAudio, startStreaming, stopStreaming]);

  /**
   * Stops the current conversation by closing the WebSocket connection and
   * stopping microphone streaming.
   */
  const stopConversation = useCallback(() => {
    const ws = websocketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    websocketRef.current = null;
    setIsConnected(false);
    setIsRecording(false);
    stopStreaming();
  }, [stopStreaming]);

  /**
   * Sends a text message to the backend for fallback text‑to‑speech. The
   * generated audio is queued for playback and the transcript is added to the
   * messages list.
   *
   * @param {string} text The text input from the user.
   */
  const sendTextMessage = useCallback(
    async (text) => {
      if (!text) return;
      // Add the user's text to the chat
      setMessages((prev) => [...prev, { role: 'user', text }]);
      try {
        const { data } = await axios.post('/api/tts', { text });
        const { audio: audioBase64, format } = data;
        // For fallback we simply play the returned audio and add a stub agent message
        if (audioBase64) {
          audioQueueRef.current.push(audioBase64);
          maybePlayNextAudio();
          setMessages((prev) => [...prev, { role: 'agent', text: '[audio]' }]);
        }
      } catch (error) {
        console.error('Failed to perform TTS:', error);
        setMessages((prev) => [...prev, { role: 'agent', text: 'Sorry, I could not process that.' }]);
      }
    },
    [maybePlayNextAudio],
  );

  return {
    messages,
    isRecording,
    startConversation,
    stopConversation,
    sendTextMessage,
  };
}