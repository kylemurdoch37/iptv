import React from 'react';
import { themes, themeOrder } from '../../data/themes';
import { useStore } from '../../store/useStore';

export const ThemeSelector: React.FC = () => {
  const { profile, setProfile } = useStore();

  const handleCycleTheme = () => {
    const currentIdx = themeOrder.indexOf(profile.themeId);
    const nextIdx = (currentIdx + 1) % themeOrder.length;
    const nextThemeId = themeOrder[nextIdx];
    setProfile({ themeId: nextThemeId });

    // Apply theme CSS variables
    const theme = themes[nextThemeId];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-glow', `${theme.primary}66`);
    root.style.setProperty('--color-panel-border', `${theme.primary}4D`);
    document.body.style.backgroundColor = theme.bg;
  };

  const currentTheme = themes[profile.themeId] || themes['crystal'];

  return (
    <button
      onClick={handleCycleTheme}
      title={`Theme: ${currentTheme.name} (click to switch)`}
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: `2px solid ${currentTheme.primary}`,
        borderRadius: '4px',
        color: 'white',
        padding: '6px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-main)',
        fontSize: '11px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 15px ${currentTheme.primary}66`;
        e.currentTarget.style.background = `${currentTheme.primary}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
      }}
    >
      <span>🎨</span>
      <span>{currentTheme.name}</span>
    </button>
  );
};
