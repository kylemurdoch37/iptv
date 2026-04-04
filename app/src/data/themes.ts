import type { Theme } from '../types';

export const themes: Record<string, Theme> = {
  'crystal': { id: 'crystal', name: 'Crystal Dream', primary: '#ff2d78', secondary: '#00e5ff', bg: '#070720', accent: '#ffd700' },
  'midnight': { id: 'midnight', name: 'Midnight Sky', primary: '#7b2fff', secondary: '#00e5ff', bg: '#020210', accent: '#ffffff' },
  'bubblegum': { id: 'bubblegum', name: 'Bubblegum', primary: '#ff6eb4', secondary: '#ffb3de', bg: '#1a0015', accent: '#ffe4f5' },
  'matrix': { id: 'matrix', name: 'Matrix', primary: '#00ff41', secondary: '#00cc33', bg: '#000d00', accent: '#00ff41' },
  'classic-sky': { id: 'classic-sky', name: 'Classic Sky', primary: '#00a0d1', secondary: '#ffffff', bg: '#003366', accent: '#ffcc00' },
};

export const themeOrder = ['crystal', 'midnight', 'bubblegum', 'matrix', 'classic-sky'];
