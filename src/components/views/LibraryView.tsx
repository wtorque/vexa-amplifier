'use client';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { Heart, Play, Trash2, Music } from 'lucide-react';
import { formatTime } from '@/components/ui/WaveformSeekbar';

export function LibraryView() {
  const { 
    favorites, 
    removeFromFavorites, 
    playTrack, 
    addToQueue, 
    currentTrack, 
    playing,
    setActiveTab 
  } = usePlayerStore();

  const handlePlayAll = () => {
    if (favorites.length === 0) return;
    playTrack(favorites[0]);
    // Add rest to queue
    favorites.slice(1).forEach(t => addToQueue(t));
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '24px',
        padding: '24px 0',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #e11d48 0%, #4c0519 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(225, 29, 72, 0.3)',
          flexShrink: 0
        }}>
          <Heart size={54} fill="#ffffff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            Playlist
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Liked Tracks
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>{favorites.length} {favorites.length === 1 ? 'track' : 'tracks'}</span>
            <span>•</span>
            <span>Enhanced with Vexa DSP</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handlePlayAll}
          disabled={favorites.length === 0}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '99px', opacity: favorites.length === 0 ? 0.4 : 1 }}
        >
          <Play size={16} fill="currentColor" />
          <span>Play All</span>
        </button>
      </div>

      {/* Tracks Table */}
      {favorites.length === 0 ? (
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
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            <Heart size={20} />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>No liked tracks yet</div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', maxWidth: '300px' }}>
            Browse songs or search your favorite artists and click the heart icon to save them here.
          </p>
          <button
            onClick={() => setActiveTab('search')}
            className="btn btn-ghost"
            style={{ marginTop: '8px' }}
          >
            Find Music
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 1fr 100px 80px',
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
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {/* List */}
          {favorites.map((track, idx) => {
            const isPlayingThis = currentTrack?.id === track.id && playing;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 1fr 100px 80px',
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
                    {track.thumbnail ? (
                      <Image src={track.thumbnail} alt="" width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Music size={16} color="gray" />
                      </div>
                    )}
                  </div>
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.title}
                  </span>
                </div>

                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.artist}
                </span>

                <span style={{ textAlign: 'right', color: 'var(--text-tertiary)', fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: '12px' }}>
                  {formatTime(track.duration * 1000)}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(track.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Remove from favorites"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
