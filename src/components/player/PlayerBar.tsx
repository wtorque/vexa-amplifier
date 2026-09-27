'use client';
import { usePlayerStore } from '@/store/playerStore';
import { WaveformSeekbar, formatTime } from '@/components/ui/WaveformSeekbar';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Spinner } from '@/components/ui/Spinner';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1,
  Heart, Volume, Volume1, Volume2, VolumeX, ListMusic, SlidersHorizontal,
} from 'lucide-react';

export function PlayerBar() {
  const {
    currentTrack,
    playing,
    position,
    duration,
    volume,
    muted,
    repeat,
    shuffle,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setRepeat,
    toggleShuffle,
    showQueue,
    setShowQueue,
    showAmplifier,
    setShowAmplifier,
    favorites,
    addToFavorites,
    removeFromFavorites,
  } = usePlayerStore();

  const { seek, buffering, error } = useAudioPlayer();

  const isFav = currentTrack ? favorites.some(f => f.id === currentTrack.id) : false;

  const toggleFav = () => {
    if (!currentTrack) return;
    if (isFav) removeFromFavorites(currentTrack.id);
    else addToFavorites(currentTrack);
  };

  const cycleRepeat = () => {
    const modes = ['none', 'queue', 'track'] as const;
    const idx = modes.indexOf(repeat);
    setRepeat(modes[(idx + 1) % 3]);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      borderTop: '1px solid var(--border)',
      background: 'rgba(8,8,8,0.95)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
    }}>
      {/* Seekbar */}
      <div style={{ padding: '0 24px' }}>
        <WaveformSeekbar position={position} duration={duration} onSeek={seek} />
      </div>

      {/* Controls row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        alignItems: 'center',
        padding: '0 24px 16px',
        gap: '16px',
      }}>
        {/* Track info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {currentTrack?.thumbnail ? (
            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-glass)' }}>
              <Image src={currentTrack.thumbnail} alt="" width={44} height={44} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-glass)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, opacity: 0.3 }}>♫</span>
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
              {currentTrack?.title || 'No track playing'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack?.artist || '—'}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleFav}
            className="btn-icon"
            style={{ flexShrink: 0, color: isFav ? 'white' : 'var(--text-tertiary)' }}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={isFav ? 'white' : 'none'} />
          </motion.button>
        </div>

        {/* Playback controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={toggleShuffle} style={{ color: shuffle ? 'white' : 'var(--text-secondary)' }} title="Shuffle">
            <Shuffle size={16} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={prevTrack} style={{ color: 'var(--text-primary)' }} title="Previous">
            <SkipBack size={18} fill="currentColor" />
          </motion.button>
          <motion.button
            whileHover={currentTrack ? { scale: 1.05 } : undefined}
            whileTap={currentTrack ? { scale: 0.92 } : undefined}
            className="btn-icon-lg"
            onClick={togglePlay}
            disabled={!currentTrack}
            style={{ opacity: currentTrack ? 1 : 0.3 }}
            title={playing ? 'Pause' : 'Play'}
          >
            {buffering ? <Spinner size={22} /> : playing ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
            )}
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={nextTrack} style={{ color: 'var(--text-primary)' }} title="Next">
            <SkipForward size={18} fill="currentColor" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={cycleRepeat} style={{ color: repeat !== 'none' ? 'white' : 'var(--text-secondary)', position: 'relative' }} title={`Repeat: ${repeat}`}>
            {repeat === 'track' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </motion.button>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
          {/* Time */}
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-jetbrains-mono), monospace', whiteSpace: 'nowrap' }}>
            {formatTime(position)} / {formatTime(duration)}
          </span>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <motion.button whileTap={{ scale: 0.85 }} className="btn-icon" onClick={toggleMute} style={{ color: 'var(--text-secondary)' }}>
              {muted || volume === 0 ? <VolumeX size={16} /> : volume < 50 ? <Volume1 size={16} /> : volume > 100 ? <Volume size={16} /> : <Volume2 size={16} />}
            </motion.button>
            <input
              type="range" min={0} max={150} step={1}
              value={muted ? 0 : volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="slider"
              style={{ width: '80px' }}
              title={`Volume: ${volume}%`}
            />
          </div>

          {/* Queue toggle */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="btn-icon"
            onClick={() => setShowQueue(!showQueue)}
            style={{ color: showQueue ? 'white' : 'var(--text-tertiary)' }}
            title="Queue"
          >
            <ListMusic size={16} />
          </motion.button>

          {/* Amplifier toggle */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAmplifier(!showAmplifier)}
            className="btn"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: showAmplifier ? 'white' : 'var(--text-tertiary)',
              borderColor: showAmplifier ? 'var(--border-active)' : 'var(--border)',
              background: showAmplifier ? 'var(--bg-glass)' : 'transparent',
              padding: '5px 10px',
            }}
          >
            <SlidersHorizontal size={12} />
            AMPLIFIER
          </motion.button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ padding: '8px 24px', background: 'rgba(255,68,68,0.1)', borderTop: '1px solid rgba(255,68,68,0.2)', fontSize: 12, color: '#ff8888' }}>
          ⚠ {error} — Make sure the API server is running on port 3001
        </div>
      )}
    </div>
  );
}
