import React from 'react';
import { useStore } from '../../store/useStore';

export const ProgramPopup: React.FC = () => {
  const { programPopup, setProgramPopup, setActiveChannelId, setCurrentView } = useStore();

  if (!programPopup) return null;

  const { program, channelName } = programPopup;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const now = new Date();
  const isLive = program.startTime <= now && program.endTime > now;
  const durationMins = Math.round((program.endTime.getTime() - program.startTime.getTime()) / 60000);

  const handleWatch = () => {
    setActiveChannelId(programPopup.channelId);
    setCurrentView('player');
    setProgramPopup(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setProgramPopup(null);
      }}
    >
      <div
        className="animate-bounce-in"
        style={{
          background: 'rgba(7,7,32,0.98)',
          border: '2px solid var(--color-primary)',
          borderRadius: '6px',
          padding: '28px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 0 40px var(--color-glow), 0 20px 60px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top glow bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-primary))',
          }}
        />

        {/* Close button */}
        <button
          onClick={() => setProgramPopup(null)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            color: 'white',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Live badge */}
        {isLive && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--color-primary)',
              borderRadius: '3px',
              padding: '3px 10px',
              marginBottom: '12px',
              fontSize: '11px',
              fontWeight: '900',
              letterSpacing: '2px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'white',
                animation: 'pulse-glow 1s infinite',
              }}
            />
            LIVE NOW
          </div>
        )}

        {/* Channel name */}
        <div style={{ fontSize: '11px', color: 'var(--color-secondary)', fontWeight: '900', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>
          {channelName}
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Impact, var(--font-main)',
            fontSize: '24px',
            color: 'white',
            marginBottom: '12px',
            lineHeight: '1.2',
          }}
        >
          {program.title}
        </h3>

        {/* Time info */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            fontSize: '12px',
            color: 'var(--color-text-dim)',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <span>🕐 {formatTime(program.startTime)} – {formatTime(program.endTime)}</span>
          <span>⏱ {durationMins} min</span>
        </div>

        {/* Description */}
        {program.description && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-dim)',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}
          >
            {program.description}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleWatch} className="btn-primary" style={{ flex: 1 }}>
            {isLive ? '▶ Watch Live' : '📺 Go to Channel'}
          </button>
          <button onClick={() => setProgramPopup(null)} className="btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
