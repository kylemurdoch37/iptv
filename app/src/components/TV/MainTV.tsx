import React from 'react';
import { useStore } from '../../store/useStore';
import { Header } from '../Layout/Header';
import { Sidebar } from '../Layout/Sidebar';
import { EPGGrid } from './EPGGrid';
import { VideoPlayer } from './VideoPlayer';
import { ProgramPopup } from './ProgramPopup';
import { NotificationCenter } from '../UI/Notification';
import { Sparkles } from '../UI/Sparkles';
import { useChannels } from '../../hooks/useChannels';
import { useEPG } from '../../hooks/useEPG';
import { useNotifications } from '../../hooks/useNotifications';

export const MainTV: React.FC = () => {
  const { currentView } = useStore();

  // Initialize data hooks
  useChannels();
  useEPG();
  useNotifications();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Subtle background sparkles */}
      <Sparkles count={8} />

      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {currentView === 'epg' && <EPGGrid />}
          {currentView === 'player' && <VideoPlayer />}
        </main>
      </div>

      <ProgramPopup />
      <NotificationCenter />
    </div>
  );
};
