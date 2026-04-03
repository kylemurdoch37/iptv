import React, { useState } from 'react';
import { avatarOptions } from '../../data/showMappings';
import { useStore } from '../../store/useStore';

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({ onNext, onBack }) => {
  const { profile, setProfile } = useStore();
  const [name, setName] = useState(profile.name || '');
  const [avatar, setAvatar] = useState(profile.avatar || '✨');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!name.trim()) {
      setError('Pop your name in, gorgeous! 💖');
      return;
    }
    setProfile({ name: name.trim(), avatar });
    onNext();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        zIndex: 1,
        position: 'relative',
      }}
    >
      <div className="animate-fade-in" style={{ maxWidth: '500px', width: '100%' }}>
        {/* Step indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                background: step <= 2 ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                boxShadow: step <= 2 ? '0 0 8px var(--color-primary)' : 'none',
              }}
            />
          ))}
        </div>

        <h2
          style={{
            fontFamily: 'Impact, var(--font-main)',
            fontSize: 'clamp(24px, 5vw, 40px)',
            textAlign: 'center',
            marginBottom: '8px',
            color: 'white',
          }}
        >
          What's your name,{' '}
          <span style={{ color: 'var(--color-primary)' }}>gorgeous?</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif', marginBottom: '32px' }}>
          We'll personalise your experience just for you.
        </p>

        <div className="sky-box" style={{ padding: '32px' }}>
          {/* Name input */}
          <div style={{ marginBottom: '28px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'var(--color-secondary)',
                marginBottom: '10px',
              }}
            >
              Your Name
            </label>
            <input
              className="styled-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Kylie, Beyoncé, Sasha..."
              maxLength={30}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              autoFocus
            />
            {error && (
              <p style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '6px', fontFamily: 'Arial, sans-serif' }}>
                {error}
              </p>
            )}
          </div>

          {/* Avatar picker */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'var(--color-secondary)',
                marginBottom: '12px',
              }}
            >
              Pick Your Vibe
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  style={{
                    width: '56px',
                    height: '56px',
                    fontSize: '28px',
                    background:
                      avatar === emoji
                        ? 'rgba(255,45,120,0.2)'
                        : 'rgba(255,255,255,0.05)',
                    border: `3px solid ${avatar === emoji ? 'var(--color-primary)' : 'rgba(255,45,120,0.2)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                      avatar === emoji
                        ? '0 0 20px var(--color-glow)'
                        : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (avatar !== emoji) {
                      e.currentTarget.style.borderColor = 'rgba(255,45,120,0.6)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (avatar !== emoji) {
                      e.currentTarget.style.borderColor = 'rgba(255,45,120,0.2)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
          <button onClick={onBack} className="btn-ghost">
            ← Back
          </button>
          <button onClick={handleNext} className="btn-primary">
            Next Step →
          </button>
        </div>
      </div>
    </div>
  );
};
