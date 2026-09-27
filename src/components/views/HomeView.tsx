'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { usePlayerStore, Track } from '@/store/playerStore';
import { Play, Sparkles, Sliders, Volume2, ShieldCheck, Zap, Disc3 } from 'lucide-react';
import { SpectrumAnalyzer } from '@/components/ui/SpectrumAnalyzer';

const CURATED_DEMO_TRACKS: Track[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    duration: 213,
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
    sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    sourceType: 'youtube'
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    duration: 3600,
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop',
    sourceUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    sourceType: 'youtube'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    duration: 282,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    sourceUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    sourceType: 'youtube'
  },
  {
    id: '9bZkp7q19f0',
    title: 'Gangnam Style',
    artist: 'PSY',
    duration: 252,
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    sourceUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    sourceType: 'youtube'
  }
];

const PRESET_HIGHLIGHTS = [
  { id: 'pure', name: 'Pure', desc: 'Flat studio response. True source transparency.', icon: '◈' },
  { id: 'bass-boost', name: 'Bass Boost', desc: 'Deep sub-bass harmonic resonance and punch.', icon: '◎' },
  { id: 'vocal', name: 'Vocal Clarity', desc: 'Brings voices forward, reducing low-end mud.', icon: '◍' },
  { id: 'studio', name: 'Studio Reference', desc: 'Controlled dynamics and mastering limiter curve.', icon: '◈' },
  { id: 'headphones', name: 'Wide Holographic', desc: '120% stereo expansion for immersive cans.', icon: '⊙' },
];

export function HomeView() {
  const {
    playTrack,
    playing,
    currentTrack,
    setActiveTab,
    activePresetId,
    applyPreset,
    presets,
    fetchPresets,
  } = usePlayerStore();

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleSelectPreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) applyPreset(preset);
  };

  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        padding: '36px 40px',
        background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, rgba(15,15,15,0.85) 70%), #0d0d0d',
        border: '1px solid var(--border-active)',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-50px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: '16px',
            color: '#fff'
          }}>
            <Sparkles size={14} />
            <span>Next-Gen Audio Enhancement</span>
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '14px',
            color: '#ffffff'
          }}>
            Vexa Amplifier Studio
          </h1>

          <p style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '26px'
          }}>
            Stream any track instantly with a server-side FFmpeg DSP pipeline. 10-band parametric EQ, psychoacoustic bass enhancement, Mid/Side stereo widening, and broadcast-grade true-peak limiting.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('search')}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 600 }}
            >
              Search & Play Any Music
            </button>
            <button
              onClick={() => {
                const track = CURATED_DEMO_TRACKS[0];
                playTrack(track);
              }}
              className="btn btn-ghost"
              style={{ padding: '12px 20px', fontSize: '14px' }}
            >
              <Play size={16} fill="currentColor" />
              <span>Quick Test Demo</span>
            </button>
          </div>
        </div>

        {/* Mini Spectrum Analyzer Box */}
        <div style={{
          position: 'absolute',
          right: '40px',
          bottom: '24px',
          width: '280px',
          padding: '16px',
          borderRadius: '14px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid var(--border)',
          display: 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span>DSP SPECTRUM</span>
            <span>{playing ? 'STREAMING 192KBPS' : 'STANDBY'}</span>
          </div>
          <SpectrumAnalyzer playing={playing} height={48} />
        </div>
      </div>

      {/* Preset Fast Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>Acoustic Mastering Presets</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Instant DSP acoustic profiles calibrated for studio fidelity</p>
          </div>
          <button
            onClick={() => usePlayerStore.getState().setShowAmplifier(true)}
            className="btn btn-ghost"
            style={{ fontSize: '12px' }}
          >
            <Sliders size={14} />
            <span>Open Custom EQ</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {PRESET_HIGHLIGHTS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'var(--bg-glass)',
                  border: isSelected ? '1px solid #ffffff' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
                onMouseEnter={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-active)')}
                onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px' }}>{preset.icon}</span>
                  {isSelected && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#fff', color: '#000' }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {preset.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Tracks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>Demo & High Fidelity Tracks</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Test dynamic range, stereo width, and low-frequency depth</p>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="btn btn-ghost"
            style={{ fontSize: '12px' }}
          >
            Search More
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {CURATED_DEMO_TRACKS.map((track) => {
            const isPlayingThis = currentTrack?.id === track.id && playing;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'var(--bg-glass)',
                  border: isPlayingThis ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-glass)')}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                  background: '#222'
                }}>
                  {track.thumbnail && (
                    <Image src={track.thumbnail} alt="" width={52} height={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: isPlayingThis ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    {isPlayingThis ? <Disc3 className="animate-spin" size={20} /> : <Play size={18} fill="#fff" />}
                  </div>
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: isPlayingThis ? '#fff' : 'var(--text-primary)'
                  }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.artist}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DSP Pipeline Architecture Features */}
      <div style={{
        borderRadius: '16px',
        padding: '24px 28px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}><Volume2 size={20} /></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>10-Band Parametric EQ</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Precision second-order biquad filters ranging from 31 Hz sub to 16 kHz air band.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}><Zap size={20} /></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Mid/Side Spatializer</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Expands stereo separation cleanly up to 150% without center channel cancellation.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}><ShieldCheck size={20} /></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>True Peak Limiter</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Guarantees zero digital clipping or inter-sample overs on heavy bass lines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
