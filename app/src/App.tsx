import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { SetupWizard } from './components/Setup/SetupWizard';
import { MainTV } from './components/TV/MainTV';
import { themes } from './data/themes';

function App() {
  const { profile, currentView, setCurrentView } = useStore();

  // Apply saved theme on mount
  useEffect(() => {
    const themeId = profile.themeId || 'crystal';
    const theme = themes[themeId] || themes['crystal'];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-glow', `${theme.primary}66`);
    root.style.setProperty('--color-panel-border', `${theme.primary}4D`);
    document.body.style.backgroundColor = theme.bg;
  }, [profile.themeId]);

  // Sync view with setup state
  useEffect(() => {
    if (!profile.setupComplete && currentView !== 'setup') {
      setCurrentView('setup');
    } else if (profile.setupComplete && currentView === 'setup') {
      setCurrentView('epg');
    }
  }, [profile.setupComplete, currentView, setCurrentView]);

  return (
    <>
      {currentView === 'setup' && <SetupWizard />}
      {(currentView === 'epg' || currentView === 'player') && <MainTV />}
    </>
  );
}

export default App;
