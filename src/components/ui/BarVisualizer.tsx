'use client';
import { useEffect, useRef, useState } from 'react';

const TICK_MS = 60;

export function BarVisualizer({ playing, barCount = 32 }: { playing: boolean; barCount?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Randomized once per mount (lazy initializer), not recomputed on every
  // render — reading Math.random() directly in JSX would make the render
  // impure and reshuffle bar heights on every unrelated re-render.
  const [initialHeights] = useState(() => Array.from({ length: barCount }, () => 8 + Math.random() * 24));

  useEffect(() => {
    const bars = containerRef.current?.querySelectorAll<HTMLElement>('span');
    if (!bars || bars.length === 0) return;

    if (!playing) {
      bars.forEach(bar => { bar.style.transform = 'scaleY(0.15)'; });
      return;
    }

    // A single shared timer drives all bars (instead of one setInterval per
    // bar) — each bar keeps its own randomized countdown so they still pulse
    // independently, at a fraction of the timer overhead.
    const countdowns = Array.from(bars, () => 0);
    const interval = setInterval(() => {
      bars.forEach((bar, i) => {
        countdowns[i] -= TICK_MS;
        if (countdowns[i] > 0) return;
        countdowns[i] = 80 + Math.random() * 120;
        const h = 0.15 + Math.random() * 0.85;
        bar.style.transform = `scaleY(${h})`;
        bar.style.opacity = String(0.3 + h * 0.7);
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div
      ref={containerRef}
      className="bar-visualizer"
      style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '32px' }}
    >
      {initialHeights.map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h}px`,
            background: 'rgba(255,255,255,0.6)',
            transition: 'transform 0.1s ease, opacity 0.1s ease',
            transform: 'scaleY(0.15)',
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  );
}
