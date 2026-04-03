import type { Theme, ThemeKey } from '../types';

export const themes: Record<ThemeKey, Theme> = {
  'crystal': { name: 'Crystal Dream', primary: '#ff2d78', secondary: '#00e5ff', bg: '#070720', accent: '#ffd700' },
  'midnight': { name: 'Midnight Sky', primary: '#7b2fff', secondary: '#00e5ff', bg: '#020210', accent: '#ffffff' },
  'bubblegum': { name: 'Bubblegum', primary: '#ff6eb4', secondary: '#ffb3de', bg: '#1a0015', accent: '#ffe4f5' },
  'matrix': { name: 'Matrix', primary: '#00ff41', secondary: '#00cc33', bg: '#000d00', accent: '#00ff41' },
  'classic-sky': { name: 'Classic Sky', primary: '#00a0d1', secondary: '#ffffff', bg: '#003366', accent: '#ffcc00' },
};

export const themeOrder: ThemeKey[] = ['crystal', 'midnight', 'bubblegum', 'matrix', 'classic-sky'];

export const applyTheme = (key: ThemeKey) => {
  const theme = themes[key];
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-bg', theme.bg);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-glow', theme.primary + '66');
  root.style.setProperty('--color-panel-border', theme.primary + '4d');
};
