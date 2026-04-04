import React from 'react';
import { useStore } from '../../store/useStore';
import { Header } from '../Layout/Header';
import { Sidebar } from '../Layout/Sidebar';
import { BottomNav } from '../Layout/BottomNav';
import { EPGGrid } from './EPGGrid';
import { MobileChannelList } from './MobileChannelList';
import { VideoPlayer } from './VideoPlayer';
import { ProgramPopup } from './ProgramPopup';
import { NotificationCenter } from '../UI/Notification';
import { TestingProgress } from '../UI/TestingProgress';
import { Sparkles } from '../UI/Sparkles';
import { useChannels } from '../../hooks/useChannels';
import { useEPG } from '../../hooks/useEPG';
import { useNotifications } from '../../hooks/useNotifications';
import { useStreamTester } from '../../hooks/useStreamTester';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const MainTV: React.FC = () => {
  const { currentView } = useStore();
  const { isMobile } = useBreakpoint();

  useChannels();
  useStreamTester();
  useEPG();
  useNotifications();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh', // dvh for mobile browsers (handles address bar correctly)
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Sparkles count={isMobile ? 4 : 8} />
      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            // On mobile, add bottom padding so content doesn't hide behind the bottom nav
            paddingBottom: isMobile ? '60px' : 0,
          }}
        >
          {currentView === 'epg' && (
            isMobile ? <MobileChannelList /> : <EPGGrid />
          )}
          {currentView === 'player' && <VideoPlayer />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}

      <ProgramPopup />
      <NotificationCenter />
      <TestingProgress />
    </div>
  );
};
