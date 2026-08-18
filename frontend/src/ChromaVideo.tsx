import React, { useRef, useEffect } from 'react';

interface ChromaVideoProps {
  src: string;
  className?: string;
}

const ChromaVideo: React.FC<ChromaVideoProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    const processFrame = () => {
      if (video.paused || video.ended) {
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green screen detection (adjust tolerances if needed)
        // If green is dominant
        if (g > 100 && g > r * 1.4 && g > b * 1.4) {
          data[i + 3] = 0; // Make transparent
        }
      }

      ctx.putImageData(frame, 0, 0);
      animationFrameId = requestAnimationFrame(processFrame);
    };

    video.addEventListener('play', () => {
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      processFrame();
    });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-px h-px opacity-0" // Esconde sem display:none para o navegador não pausar
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ChromaVideo;
