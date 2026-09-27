'use client';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { formatTime } from '@/components/ui/WaveformSeekbar';

export function QueuePanel() {
  const {
    queue,
    currentTrack,
    playing,
    removeFromQueue,
    clearQueue,
    playTrack,
  } = usePlayerStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white' }}>
          Queue
        </span>
        {queue.length > 0 && (
          <button
            onClick={clearQueue}
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Current track */}
      {currentTrack && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Now Playing
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentTrack.thumbnail && (
              <Image src={currentTrack.thumbnail} alt="" width={36} height={36} style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentTrack.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{currentTrack.artist}</div>
            </div>
            {playing && (
              <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
                {[1, 2, 3].map(i => (
                  <span key={i} style={{
                    display: 'block', width: 3,
                    background: 'white',
                    borderRadius: 99,
                    animation: `barPulse ${0.6 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                    height: `${8 + i * 4}px`,
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Up next */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {queue.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>♫</div>
            Queue is empty.<br />
            <span style={{ fontSize: 11, marginTop: 4, display: 'block' }}>Search for tracks to add.</span>
          </div>
        ) : (
          <>
            <div style={{ padding: '8px 20px 4px', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Up Next ({queue.length})
            </div>
            {queue.map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                onClick={() => { removeFromQueue(i); playTrack(track); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-glass)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', width: 16, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                {track.thumbnail && (
                  <Image src={track.thumbnail} alt="" width={32} height={32} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{track.artist}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {formatTime(track.duration * 1000)}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); removeFromQueue(i); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    fontSize: 14,
                    flexShrink: 0,
                    padding: '2px 4px',
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
