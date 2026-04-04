import React from 'react';
import { useStore } from '../../store/useStore';

export const TestingProgress: React.FC = () => {
  const { testingProgress, workingChannels, channels, clearStreamCache } = useStore();
  const { phase, done, total } = testingProgress;

  if (phase === 'idle' || phase === 'complete') return null;

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 200,
        background: 'rgba(7,7,32,0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,45,120,0.3)',
        borderRadius: '6px',
        padding: '12px 16px',
        minWidth: '260px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        animation: 'slide-in-right 0.3s ease',
      }}
    >
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
        borderRadius: '6px 6px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {phase === 'fetching' ? (
          <>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTop: '2px solid var(--color-primary)',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Fetching streams...
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '14px' }}>📡</span>
            <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Testing streams
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--color-secondary)', fontWeight: '900' }}>
              {pct}%
            </span>
          </>
        )}
      </div>

      {phase === 'testing' && (
        <>
          {/* Progress bar */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'Arial, sans-serif', color: 'var(--color-text-dim)' }}>
            <span>{done.toLocaleString()} / {total.toLocaleString()} tested</span>
            <span style={{ color: 'var(--color-secondary)' }}>
              ✓ {workingChannels.length.toLocaleString()} live
            </span>
          </div>
        </>
      )}

      {phase === 'testing' && done > 0 && (
        <button
          onClick={clearStreamCache}
          style={{
            marginTop: '8px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            padding: 0,
          }}
        >
          Reset cache
        </button>
      )}
    </div>
  );
};
