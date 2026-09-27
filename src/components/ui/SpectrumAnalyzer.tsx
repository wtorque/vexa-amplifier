'use client';
import { useRef, useEffect, useState } from 'react';

export function SpectrumAnalyzer({ playing, height = 64 }: { playing: boolean; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  // The random starting values are computed once via useState's lazy
  // initializer (which only ever runs on the very first render), then
  // handed to a ref for mutation-without-rerender on every animation frame.
  const [initialBars] = useState(() => Array(48).fill(0).map(() => Math.random() * 0.2));
  const [initialTargets] = useState(() => Array(48).fill(0).map(() => Math.random() * 0.2));
  const barsRef = useRef<number[]>(initialBars);
  const targetsRef = useRef<number[]>(initialTargets);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bars = barsRef.current;
    const targets = targetsRef.current;

    const BAR_COUNT = 48;
    const GAP = 2;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const barW = (W - GAP * (BAR_COUNT - 1)) / BAR_COUNT;

      for (let i = 0; i < BAR_COUNT; i++) {
        // Smoothly move toward target
        if (playing) {
          if (Math.abs(bars[i] - targets[i]) < 0.02) {
            const bell = Math.exp(-0.5 * Math.pow((i - BAR_COUNT * 0.4) / (BAR_COUNT * 0.3), 2));
            targets[i] = 0.05 + Math.random() * bell * 0.95;
          }
          bars[i] += (targets[i] - bars[i]) * 0.12;
        } else {
          bars[i] += (0.05 - bars[i]) * 0.08;
        }

        const barH = Math.max(2, bars[i] * H);
        const x = i * (barW + GAP);
        const y = H - barH;

        // Gradient per bar
        const grad = ctx.createLinearGradient(0, y, 0, H);
        grad.addColorStop(0, 'rgba(255,255,255,0.8)');
        grad.addColorStop(1, 'rgba(255,255,255,0.15)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={height}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
    />
  );
}
