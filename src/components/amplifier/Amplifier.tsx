'use client';
import { useState, useEffect } from 'react';
import { usePlayerStore, CompressorSettings, LimiterSettings, BassSettings } from '@/store/playerStore';
import { EQBand } from './EQBand';
import { motion, AnimatePresence } from 'framer-motion';

const EQ_FREQS = ['31', '62', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

export function Amplifier() {
  const {
    settings,
    updateEq,
    setPreamp,
    setBass,
    setClarity,
    setStereoWidth,
    setCompressor,
    setLimiter,
    setEnhanced,
    applyPreset,
    resetSettings,
    activePresetId,
    presets,
    fetchPresets,
  } = usePlayerStore();

  const [activeSection, setActiveSection] = useState<'eq' | 'dynamics' | 'enhance'>('eq');
  const [abMode, setAbMode] = useState<'original' | 'enhanced'>('enhanced');

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleAbToggle = (mode: 'original' | 'enhanced') => {
    setAbMode(mode);
    setEnhanced(mode === 'enhanced');
  };

  const tabs = [
    { id: 'eq', label: 'EQ' },
    { id: 'dynamics', label: 'Dynamics' },
    { id: 'enhance', label: 'Enhance' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white' }}>
            Amplifier
          </span>
        </div>

        {/* A/B Toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 2,
          gap: 2,
        }}>
          {(['original', 'enhanced'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => handleAbToggle(mode)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                border: 'none',
                background: abMode === mode ? 'white' : 'transparent',
                color: abMode === mode ? '#080808' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              {mode === 'original' ? 'Orig' : 'Enhanced'}
            </button>
          ))}
        </div>
      </div>

      {/* Presets strip */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '12px 20px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border)',
        scrollbarWidth: 'none',
      }}>
        {presets.map(preset => (
          <motion.button
            key={preset.id}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => applyPreset(preset)}
            style={{
              position: 'relative',
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activePresetId === preset.id ? 'rgba(255,255,255,0.4)' : 'var(--border)',
              color: activePresetId === preset.id ? 'white' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {activePresetId === preset.id && (
              <motion.span
                layoutId="preset-pill-bg"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', zIndex: 0 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {preset.icon && <span style={{ marginRight: 4 }}>{preset.icon}</span>}
              {preset.name}
            </span>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.94 }}
          onClick={resetSettings}
          style={{
            flexShrink: 0,
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 11,
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
          }}
        >
          Reset
        </motion.button>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              position: 'relative',
              padding: '10px 16px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              color: activeSection === tab.id ? 'white' : 'var(--text-tertiary)',
              marginBottom: -1,
              transition: 'color 0.2s ease',
            }}
          >
            {tab.label}
            {activeSection === tab.id && (
              <motion.div
                layoutId="amplifier-tab-underline"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'white' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <AnimatePresence mode="wait">
        {/* EQ Section */}
        {activeSection === 'eq' && (
          <motion.div key="eq" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {/* Preamp */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="label">Preamp</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'var(--text-secondary)' }}>
                  {settings.preamp > 0 ? '+' : ''}{settings.preamp.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range" min={-12} max={12} step={0.5}
                value={settings.preamp}
                onChange={e => setPreamp(Number(e.target.value))}
                className="slider"
              />
            </div>

            {/* 10-band EQ */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', marginBottom: 8 }}>
              {EQ_FREQS.map((freq, i) => (
                <EQBand
                  key={freq}
                  freq={freq}
                  value={settings.eq[i] || 0}
                  onChange={v => updateEq(i, v)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Dynamics Section */}
        {activeSection === 'dynamics' && (
          <motion.div key="dynamics" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Compressor */}
            <div>
              <span className="label" style={{ display: 'block', marginBottom: 12 }}>Compressor</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {([
                  { label: 'Threshold', key: 'threshold', min: -40, max: 0, step: 0.5, unit: 'dB', val: settings.compressor.threshold },
                  { label: 'Ratio', key: 'ratio', min: 1, max: 20, step: 0.5, unit: ':1', val: settings.compressor.ratio },
                  { label: 'Attack', key: 'attack', min: 1, max: 100, step: 1, unit: 'ms', val: settings.compressor.attack },
                  { label: 'Release', key: 'release', min: 10, max: 1000, step: 10, unit: 'ms', val: settings.compressor.release },
                ] as { label: string; key: keyof CompressorSettings; min: number; max: number; step: number; unit: string; val: number }[]).map(({ label, key, min, max, step, unit, val }) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'white' }}>
                        {val}{unit}
                      </span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step} value={val}
                      onChange={e => setCompressor({ [key]: Number(e.target.value) })}
                      className="slider"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Limiter */}
            <div>
              <span className="label" style={{ display: 'block', marginBottom: 12 }}>Limiter</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {([
                  { label: 'Ceiling', key: 'ceiling', min: -12, max: 0, step: 0.1, unit: ' dBTP', val: settings.limiter.ceiling },
                  { label: 'Release', key: 'release', min: 10, max: 500, step: 5, unit: 'ms', val: settings.limiter.release },
                ] as { label: string; key: keyof LimiterSettings; min: number; max: number; step: number; unit: string; val: number }[]).map(({ label, key, min, max, step, unit, val }) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'white' }}>
                        {val}{unit}
                      </span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step} value={val}
                      onChange={e => setLimiter({ [key]: Number(e.target.value) })}
                      className="slider"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhance Section */}
        {activeSection === 'enhance' && (
          <motion.div key="enhance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Bass */}
            <div>
              <span className="label" style={{ display: 'block', marginBottom: 12 }}>Bass Enhancement</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {([
                  { label: 'Amount', key: 'amount', min: 0, max: 1, step: 0.01, display: `${Math.round(settings.bass.amount * 100)}%`, val: settings.bass.amount },
                  { label: 'Frequency', key: 'frequency', min: 40, max: 200, step: 5, display: `${settings.bass.frequency} Hz`, val: settings.bass.frequency },
                  { label: 'Width', key: 'width', min: 0.3, max: 2, step: 0.1, display: settings.bass.width.toFixed(1), val: settings.bass.width },
                ] as { label: string; key: keyof BassSettings; min: number; max: number; step: number; display: string; val: number }[]).map(({ label, key, min, max, step, display, val }) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'white' }}>{display}</span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step} value={val}
                      onChange={e => setBass({ [key]: Number(e.target.value) })}
                      className="slider"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Clarity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="label">Clarity / Presence</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'white' }}>
                  {Math.round(settings.clarity * 100)}%
                </span>
              </div>
              <input
                type="range" min={0} max={1} step={0.01}
                value={settings.clarity}
                onChange={e => setClarity(Number(e.target.value))}
                className="slider"
              />
            </div>

            {/* Stereo Width */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="label">Stereo Width</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains-mono), monospace', color: 'white' }}>
                  {settings.stereoWidth}%
                </span>
              </div>
              <input
                type="range" min={0} max={150} step={1}
                value={settings.stereoWidth}
                onChange={e => setStereoWidth(Number(e.target.value))}
                className="slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Mono</span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Normal</span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Wide</span>
              </div>
            </div>

            {/* Loudness target */}
            <div>
              <span className="label" style={{ display: 'block', marginBottom: 12 }}>Loudness Target</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[-16, -14, -12, -10].map(lufs => (
                  <button
                    key={lufs}
                    onClick={() => usePlayerStore.getState().setCompressor({ threshold: lufs - 4 })}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: 11,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {lufs} LUFS
                  </button>
                ))}
                <button
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Original
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
