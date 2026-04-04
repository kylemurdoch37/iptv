import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { ConfettiExplosion } from '../UI/Sparkles';

interface CompleteStepProps {
  onEnter: () => void;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({ onEnter }) => {
  const { profile } = useStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        textAlign: 'center',
        zIndex: 1,
        position: 'relative',
      }}
    >
      {showConfetti && <ConfettiExplosion />}

      <div className="animate-bounce-in" style={{ maxWidth: '560px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px', filter: 'drop-shadow(0 0 20px rgba(255,45,120,0.8))' }}>
          {profile.avatar}
        </div>

        <h2
          style={{
            fontFamily: 'Impact, var(--font-main)',
            fontSize: 'clamp(28px, 5vw, 48px)',
            color: 'white',
            marginBottom: '12px',
            lineHeight: '1.2',
          }}
        >
          You're all set,{' '}
          <span style={{ color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary)' }}>
            {profile.name}
          </span>
          ! 💖
        </h2>

        <p
          style={{
            color: 'var(--color-secondary)',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            marginBottom: '40px',
            lineHeight: '1.6',
          }}
        >
          Your personalised channel guide is ready.
          <br />
          We'll ping you when your faves come on. Iconic.
        </p>

        <div
          className="sky-box"
          style={{
            padding: '24px 32px',
            marginBottom: '32px',
            display: 'inline-block',
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif', lineHeight: '2' }}>
            <div>
              <span style={{ color: 'var(--color-accent)' }}>✦</span>{' '}
              {profile.favouriteShowIds.length} shows selected
            </div>
            <div>
              <span style={{ color: 'var(--color-accent)' }}>✦</span>{' '}
              Live notifications enabled
            </div>
            <div>
              <span style={{ color: 'var(--color-accent)' }}>✦</span>{' '}
              Custom channel guide ready
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={onEnter}
            className="btn-primary"
            style={{
              fontSize: '18px',
              padding: '18px 56px',
              letterSpacing: '3px',
            }}
          >
            Enter Crystal TV ✦
          </button>
        </div>

        <div style={{ marginTop: '24px', color: 'rgba(255,255,255,0.2)', fontSize: '20px', letterSpacing: '8px' }}>
          ✦ ✧ ✦ ✧ ✦ ✧ ✦
        </div>
      </div>
    </div>
  );
};
