'use client';
import { useRef, useCallback } from 'react';

interface Props {
  position: number;   // ms
  duration: number;   // ms
  onSeek: (ms: number) => void;
}

export function WaveformSeekbar({ position, duration, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const progress = duration > 0 ? Math.min(1, position / duration) : 0;

  const getSeekFromEvent = useCallback((e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.floor(ratio * duration);
  }, [duration]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    onSeek(getSeekFromEvent(e));
  }, [onSeek, getSeekFromEvent]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    onSeek(getSeekFromEvent(e));

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      onSeek(getSeekFromEvent(e));
    };
    const onUp = () => { isDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [onSeek, getSeekFromEvent]);

  return (
    <div style={{ width: '100%', padding: '8px 0', cursor: 'pointer' }} onMouseDown={handleMouseDown} onClick={handleClick}>
      <div
        ref={barRef}
        style={{
          position: 'relative',
          height: '4px',
          borderRadius: '99px',
          background: 'rgba(255,255,255,0.1)',
          overflow: 'visible',
        }}
      >
        {/* Played */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${progress * 100}%`,
          background: 'white',
          borderRadius: '99px',
          transition: 'width 0.1s linear',
        }} />
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${progress * 100}%`,
          transform: 'translate(-50%, -50%)',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 0 8px rgba(255,255,255,0.5)',
          transition: 'left 0.1s linear',
        }} />
      </div>
    </div>
  );
}

export function formatTime(ms: number): string {
  if (!ms || !isFinite(ms)) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
