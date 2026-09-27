'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { History as HistoryIcon, Trash2, Music } from 'lucide-react';
import { formatTime } from '@/components/ui/WaveformSeekbar';

export function HistoryView() {
  const {
    history,
    playTrack,
    currentTrack,
    playing,
  } = usePlayerStore();

  // "Time ago" labels depend on the current time, which can't be read
  // directly during render (impure). Refresh it on a timer instead.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const clearHistory = () => {
    // Clear history in store
    usePlayerStore.setState({ history: [] });
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>Listening History</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Tracks recently streamed and processed through the DSP pipeline</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="btn btn-ghost" style={{ color: '#ff4444' }}>
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{
          padding: '64px 20px',
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px dashed var(--border)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <HistoryIcon size={32} color="var(--text-tertiary)" />
          <div style={{ fontSize: '15px', fontWeight: 600 }}>No Play History Yet</div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '300px' }}>
            When you play songs, your recent audio stream activity will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1.5fr 1fr 100px 120px',
            padding: '8px 16px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '1px solid var(--border)'
          }}>
            <span>#</span>
            <span>Title</span>
            <span>Artist</span>
            <span style={{ textAlign: 'right' }}>Duration</span>
            <span style={{ textAlign: 'right' }}>Played</span>
          </div>

          {history.map((entry, idx) => {
            const isPlayingThis = currentTrack?.id === entry.track.id && playing;
            return (
              <div
                key={`${entry.track.id}-${entry.playedAt}-${idx}`}
                onClick={() => playTrack(entry.track)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1.5fr 1fr 100px 120px',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: isPlayingThis ? '#ffffff' : 'var(--text-primary)',
                  background: isPlayingThis ? 'rgba(255,255,255,0.06)' : 'transparent',
                  transition: 'background 0.1s ease'
                }}
                onMouseEnter={(e) => !isPlayingThis && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => !isPlayingThis && (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  {idx + 1}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                    {entry.track.thumbnail ? (
                      <Image src={entry.track.thumbnail} alt="" width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Music size={16} color="gray" />
                      </div>
                    )}
                  </div>
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.track.title}
                  </span>
                </div>

                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.track.artist}
                </span>

                <span style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '12px' }}>
                  {formatTime(entry.track.duration * 1000)}
                </span>

                <span style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontSize: '11px' }}>
                  {getTimeAgo(entry.playedAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
