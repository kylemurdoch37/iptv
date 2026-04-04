import React from 'react';
import { useStore } from '../../store/useStore';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, activeChannelId } = useStore();

  const tabs = [
    { id: 'epg' as const, icon: '📺', label: 'Guide' },
    { id: 'player' as const, icon: '▶', label: 'Watch', disabled: !activeChannelId },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(7,7,32,0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '2px solid var(--color-primary)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 200,
        boxShadow: '0 -4px 30px rgba(255,45,120,0.15)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setCurrentView(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: isActive
                ? 'linear-gradient(180deg, rgba(255,45,120,0.15), transparent)'
                : 'transparent',
              border: 'none',
              borderTop: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: isActive ? 'var(--color-primary)' : tab.disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
              cursor: tab.disabled ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              padding: '6px 0 4px',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-main)',
                fontWeight: '900',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
