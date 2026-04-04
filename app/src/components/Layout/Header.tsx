import React from 'react';
import { useStore } from '../../store/useStore';
import { ThemeSelector } from '../UI/ThemeSelector';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const Header: React.FC = () => {
  const { profile, currentView, setCurrentView } = useStore();
  const { isMobile } = useBreakpoint();

  return (
    <header
      style={{
        height: isMobile ? '52px' : '60px',
        background: 'rgba(7,7,32,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '2px solid var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 14px' : '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 30px var(--color-glow)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <button
        onClick={() => setCurrentView('epg')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <h1
          style={{
            fontFamily: 'Impact, var(--font-main)',
            fontSize: isMobile ? '17px' : '22px',
            fontWeight: '900',
            letterSpacing: isMobile ? '2px' : '3px',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 10px var(--color-primary))',
          }}
        >
          ✦ CRYSTAL TV ✦
        </h1>
      </button>

      {/* Center Nav — desktop only (mobile uses BottomNav) */}
      {!isMobile && (
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCurrentView('epg')}
            style={{
              background: currentView === 'epg' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
              border: `2px solid ${currentView === 'epg' ? 'var(--color-primary)' : 'rgba(255,45,120,0.3)'}`,
              borderRadius: '4px',
              color: 'white',
              padding: '6px 16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
            }}
          >
            📺 Guide
          </button>
          <button
            onClick={() => setCurrentView('player')}
            style={{
              background: currentView === 'player' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
              border: `2px solid ${currentView === 'player' ? 'var(--color-primary)' : 'rgba(255,45,120,0.3)'}`,
              borderRadius: '4px',
              color: 'white',
              padding: '6px 16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
            }}
          >
            ▶ Watch
          </button>
        </nav>
      )}

      {/* Right: Profile + Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        <ThemeSelector />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,45,120,0.3)',
            borderRadius: '4px',
            padding: isMobile ? '4px 8px' : '6px 12px',
          }}
        >
          <span style={{ fontSize: isMobile ? '16px' : '18px' }}>{profile.avatar}</span>
          {!isMobile && (
            <span
              style={{
                fontFamily: 'var(--font-main)',
                fontSize: '12px',
                fontWeight: '900',
                color: 'var(--color-text)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {profile.name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
