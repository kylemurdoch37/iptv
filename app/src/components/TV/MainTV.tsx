import React from 'react';
import { useStore } from '../../store/useStore';
import { Header } from '../Layout/Header';
import { Sidebar } from '../Layout/Sidebar';
import { EPGGrid } from './EPGGrid';
import { VideoPlayer } from './VideoPlayer';
import { ProgramPopup } from './ProgramPopup';
import { NotificationCenter } from '../UI/Notification';
import { TestingProgress } from '../UI/TestingProgress';
import { Sparkles } from '../UI/Sparkles';
import { useChannels } from '../../hooks/useChannels';
import { useEPG } from '../../hooks/useEPG';
import { useNotifications } from '../../hooks/useNotifications';
import { useStreamTester } from '../../hooks/useStreamTester';

export const MainTV: React.FC = () => {
  const { currentView } = useStore();

  useChannels();
  useStreamTester();
  useEPG();
  useNotifications();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
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
      <TestingProgress />
    </div>
  );
};
