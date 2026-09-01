/**
 * AR Camera Stream and Fallback Simulated Cyber World Background
 */

import React, { useRef, useEffect } from 'react';
import { CameraStatus } from '../services/camera';

interface ARCameraBackgroundProps {
  cameraStatus: CameraStatus;
  cameraYaw: number;
  cameraPitch: number;
  isSimulated: boolean;
}

export const ARCameraBackground: React.FC<ARCameraBackgroundProps> = ({
  cameraStatus,
  cameraYaw,
  cameraPitch,
  isSimulated,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cyberCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bind video stream
  useEffect(() => {
    if (videoRef.current && cameraStatus.stream && !isSimulated) {
      videoRef.current.srcObject = cameraStatus.stream;
      videoRef.current.play().catch((err) => {
        console.warn('Video auto-play prevented:', err);
      });
    }
  }, [cameraStatus.stream, isSimulated]);

  // Render Simulated 360 Cyber Skybox & Grid if camera is simulated/offline
  useEffect(() => {
    if (!isSimulated && cameraStatus.isActive) return;

    const canvas = cyberCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderCyberWorld = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(renderCyberWorld);
        return;
      }

      // Deep space sci-fi background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#020617'); // Night black
      grad.addColorStop(0.5, '#0f172a'); // Slate blue
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;

      // Simulated 360 Grid Horizon
      const horizonY = centerY + cameraPitch * (h * 0.8);

      // Cyber Ground Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.5;

      // Vanishing lines to horizon
      const numLines = 14;
      for (let i = -numLines; i <= numLines; i++) {
        const offset = i * (w / 10) + ((cameraYaw * 150) % (w / 10));
        ctx.beginPath();
        ctx.moveTo(centerX + offset * 0.2, horizonY);
        ctx.lineTo(centerX + offset * 2.5, h);
        ctx.stroke();
      }

      // Horizontal depth lines on floor
      for (let d = 1; d <= 8; d++) {
        const lineY = horizonY + (d / 8) ** 2 * (h - horizonY);
        if (lineY >= horizonY && lineY <= h) {
          ctx.beginPath();
          ctx.moveTo(0, lineY);
          ctx.lineTo(w, lineY);
          ctx.stroke();
        }
      }

      // Cyber Sky Constellations / Distant Hexagons
      const starDensity = 40;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
      for (let i = 0; i < starDensity; i++) {
        const angle = (i * 2 * Math.PI) / starDensity;
        const starYaw = angle - cameraYaw;
        const starPitch = (Math.sin(i * 3) * 0.8) - cameraPitch;

        const sx = centerX + Math.tan(starYaw) * (w / 2);
        const sy = centerY - Math.tan(starPitch) * (h / 2);

        if (sx >= 0 && sx <= w && sy >= 0 && sy <= horizonY) {
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Glowing Neon Horizon Line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(renderCyberWorld);
    };

    animId = requestAnimationFrame(renderCyberWorld);
    return () => cancelAnimationFrame(animId);
  }, [cameraYaw, cameraPitch, isSimulated, cameraStatus.isActive]);

  // Resize canvas to window
  useEffect(() => {
    const handleResize = () => {
      if (cyberCanvasRef.current) {
        cyberCanvasRef.current.width = window.innerWidth;
        cyberCanvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-black">
      {/* Real-time Camera Video Element */}
      {!isSimulated && cameraStatus.stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${
            cameraStatus.facingMode === 'user' ? 'scale-x-[-1]' : ''
          }`}
        />
      )}

      {/* Simulated Cyber Grid Canvas (active if no camera or user selected simulation) */}
      {(isSimulated || !cameraStatus.isActive) && (
        <canvas ref={cyberCanvasRef} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Sci-Fi AR Vignette & Subtle Scanline Shader effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
    </div>
  );
};
