// J.A.R.V.I.S — Audio Waveform Visualizer
// Canvas-based real-time FFT visualization with neon glow effect
import { useRef, useEffect } from 'react';
import useJarvisStore from '../../stores/jarvisStore';
import { ORB_STATES } from '../../utils/constants';

export default function AudioWaveform({ width = 400, height = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const { orbState, waveformData } = useJarvisStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const isActive = orbState === ORB_STATES.LISTENING || orbState === ORB_STATES.RESPONDING;
      const barCount = 64;
      const barWidth = (width / barCount) * 0.6;
      const gap = (width / barCount) * 0.4;
      const maxBarHeight = height * 0.8;

      // Color based on state
      let color = '#00d4ff';
      if (orbState === ORB_STATES.LISTENING) color = '#00ff88';
      else if (orbState === ORB_STATES.PROCESSING) color = '#ffd700';
      else if (orbState === ORB_STATES.RESPONDING) color = '#7b2fdb';

      phase += 0.02;

      for (let i = 0; i < barCount; i++) {
        let amplitude;
        if (isActive) {
          // Use actual waveform data or generate animated wave
          const dataVal = waveformData[i] || 0;
          const wave = Math.sin(phase + i * 0.15) * 0.3 + 0.5;
          amplitude = Math.max(dataVal, wave) * maxBarHeight;
        } else {
          // Idle — subtle breathing wave
          const wave = Math.sin(phase * 0.5 + i * 0.1) * 0.15 + 0.05;
          amplitude = wave * maxBarHeight;
        }

        const x = i * (barWidth + gap) + gap / 2;
        const y = (height - amplitude) / 2;

        // Neon glow
        ctx.shadowColor = color;
        ctx.shadowBlur = isActive ? 8 : 3;

        // Gradient bar
        const gradient = ctx.createLinearGradient(x, y, x, y + amplitude);
        gradient.addColorStop(0, color + 'cc');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, color + 'cc');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, amplitude, 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      // Center line
      ctx.strokeStyle = color + '22';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [orbState, waveformData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="block"
    />
  );
}
