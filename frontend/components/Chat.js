import { useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import VoiceVisualizer from './VoiceVisualizer';
import { useConversation } from '../utils/useConversation';

/**
 * Chat component combines the user interface for interacting with the
 * conversational agent. It displays a scrollable list of messages, a text
 * input field for fallback text entry, and controls for starting/stopping
 * voice conversations. When recording, a waveform visualizer is shown.
 */
export default function Chat() {
  const {
    messages,
    isRecording,
    startConversation,
    stopConversation,
    sendTextMessage,
  } = useConversation();
  const [textInput, setTextInput] = useState('');
  const [audioStream, setAudioStream] = useState(null);

  // Start or stop voice conversation. When starting, request a microphone
  // stream for visualization. When stopping, clean up the stream.
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stopConversation();
      if (audioStream) {
        audioStream.getTracks().forEach((t) => t.stop());
        setAudioStream(null);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
      } catch (error) {
        console.error('Microphone access denied:', error);
      }
      startConversation();
    }
  }, [isRecording, audioStream, startConversation, stopConversation]);

  // Submit a text message to the backend and clear the input
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const text = textInput.trim();
      if (text) {
        sendTextMessage(text);
        setTextInput('');
      }
    },
    [textInput, sendTextMessage],
  );

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-white rounded-md shadow-lg overflow-hidden">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
      </div>

      {/* Audio visualizer when recording */}
      {isRecording && audioStream && (
        <div className="px-4 py-2 bg-gray-100">
          <VoiceVisualizer stream={audioStream} />
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex items-center p-3 bg-white border-t">
        <input
          type="text"
          className="flex-1 border rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Send
        </button>
        <button
          type="button"
          onClick={handleToggleRecording}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center"
        >
          {isRecording ? 'Stop' : 'Talk'}
        </button>
      </form>
    </div>
  );
}