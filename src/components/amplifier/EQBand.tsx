'use client';

interface EQBandProps {
  freq: string;
  value: number;
  onChange: (v: number) => void;
}

export function EQBand({ freq, value, onChange }: EQBandProps) {
  const height = 160;
  const thumbPos = ((12 - value) / 24) * height;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      flex: 1,
    }}>
      {/* dB value */}
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        color: Math.abs(value) > 0.5 ? 'white' : 'var(--text-tertiary)',
        minWidth: 32,
        textAlign: 'center',
      }}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}
      </span>

      {/* Vertical slider track */}
      <div style={{ position: 'relative', height, width: 24, display: 'flex', justifyContent: 'center' }}>
        {/* Track */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 2,
          background: 'var(--border)',
          borderRadius: 99,
        }} />
        {/* Center line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8,
          height: 1,
          background: 'var(--border-active)',
        }} />
        {/* Fill */}
        {value !== 0 && (
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 2,
            background: 'white',
            borderRadius: 99,
            ...(value > 0 ? {
              bottom: '50%',
              height: `${(value / 12) * 50}%`,
            } : {
              top: '50%',
              height: `${(Math.abs(value) / 12) * 50}%`,
            }),
          }} />
        )}
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: thumbPos - 6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 8px rgba(255,255,255,0.4)',
            cursor: 'pointer',
            zIndex: 2,
          }}
        />
        {/* Invisible slider */}
        <input
          type="range"
          min={-12}
          max={12}
          step={0.5}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            writingMode: 'vertical-lr',
            direction: 'rtl',
          }}
        />
      </div>

      {/* Frequency label */}
      <span style={{
        fontSize: 9,
        color: 'var(--text-tertiary)',
        textAlign: 'center',
        fontWeight: 500,
        letterSpacing: '0.05em',
      }}>
        {freq}
      </span>
    </div>
  );
}
