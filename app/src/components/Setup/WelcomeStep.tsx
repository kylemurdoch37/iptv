import React from 'react';
import { Sparkles } from '../UI/Sparkles';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <Sparkles count={25} />

      <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
        {/* Big title */}
        <h1
          style={{
            fontFamily: 'Impact, var(--font-main)',
            fontSize: 'clamp(42px, 8vw, 84px)',
            fontWeight: '900',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            textShadow:
              '0 0 20px var(--color-primary), 0 0 40px var(--color-primary), 0 0 80px rgba(255,45,120,0.5)',
            marginBottom: '16px',
            lineHeight: '1',
          }}
        >
          ✦ CRYSTAL TV ✦
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 3vw, 22px)',
            color: 'var(--color-secondary)',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            letterSpacing: '2px',
            marginBottom: '48px',
            textShadow: '0 0 15px rgba(0,229,255,0.5)',
          }}
        >
          Your personalised telly, darling.
        </p>

        {/* Decorative box */}
        <div
          className="sky-box"
          style={{
            padding: '32px 40px',
            marginBottom: '40px',
            display: 'inline-block',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-dim)',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
              lineHeight: '1.8',
              marginBottom: '8px',
            }}
          >
            Stream your favourite shows.
            <br />
            Get notified when they're live.
            <br />
            Look fabulous doing it.
          </p>
          <div style={{ color: 'var(--color-accent)', fontSize: '20px', marginTop: '8px' }}>
            ✦ ✧ ✦ ✧ ✦
          </div>
        </div>

        <div>
          <button onClick={onNext} className="btn-primary" style={{ fontSize: '16px', padding: '16px 48px' }}>
            Start Setup ✨
          </button>
        </div>

        <p style={{ marginTop: '24px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Arial, sans-serif' }}>
          Takes less than 2 minutes · No account needed
        </p>
      </div>
    </div>
  );
};
