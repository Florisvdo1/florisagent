import { useEffect, useRef } from 'react';

/**
 * VoiceVisualizer renders a simple waveform representing the real‑time audio
 * captured from the user's microphone. It uses the Web Audio API to attach
 * an analyser node to the provided MediaStream and draws the time domain
 * waveform onto a canvas. The component only draws when a stream is
 * provided.
 *
 * @param {Object} props
 * @param {MediaStream|null} props.stream - The active audio stream. When
 *   falsy, the visualizer renders an empty area.
 */
export default function VoiceVisualizer({ stream, width = 300, height = 60 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!stream) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    const draw = () => {
      const drawVisual = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      canvasCtx.fillStyle = '#f3f4f6'; // Tailwind's gray-100
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#4b5563'; // Tailwind's gray-600
      canvasCtx.beginPath();
      const sliceWidth = (width * 1.0) / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.lineTo(width, height / 2);
      canvasCtx.stroke();
    };
    draw();
    return () => {
      analyser.disconnect();
      source.disconnect();
      audioCtx.close();
    };
  }, [stream, width, height]);

  return (
    <div className="w-full flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-16"
      />
    </div>
  );
}