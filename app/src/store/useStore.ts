import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Channel, Program, UserProfile, Notification, ProgramPopupData } from '../types';

export interface TestingProgress {
  phase: 'idle' | 'fetching' | 'testing' | 'complete';
  done: number;
  total: number;
}

export interface StreamCacheEntry {
  ok: boolean;
  testedAt: number; // timestamp ms
}

interface StoreState {
  // Profile
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;

  // Channels
  channels: Channel[];           // all fetched channels
  workingChannels: Channel[];    // tested & confirmed working
  setChannels: (channels: Channel[]) => void;
  setWorkingChannels: (channels: Channel[]) => void;
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;

  // Stream testing
  testingProgress: TestingProgress;
  setTestingProgress: (p: Partial<TestingProgress>) => void;
  streamCache: Record<string, StreamCacheEntry>;
  updateStreamCache: (url: string, ok: boolean) => void;
  clearStreamCache: () => void;

  // EPG
  epgData: Map<string, Program[]>;
  setEpgData: (data: Map<string, Program[]>) => void;

  // View
  currentView: 'setup' | 'epg' | 'player';
  setCurrentView: (view: 'setup' | 'epg' | 'player') => void;
  showAllChannels: boolean;
  setShowAllChannels: (show: boolean) => void;
  allStreamsLoaded: boolean;
  setAllStreamsLoaded: (loaded: boolean) => void;

  // Program popup
  programPopup: ProgramPopupData | null;
  setProgramPopup: (data: ProgramPopupData | null) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  dismissedNotifications: string[];
  addDismissedNotification: (key: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      profile: {
        name: '',
        avatar: '✨',
        favouriteShowIds: [],
        setupComplete: false,
        themeId: 'crystal',
      },
      setProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      channels: [],
      workingChannels: [],
      setChannels: (channels) => set({ channels }),
      setWorkingChannels: (channels) => set({ workingChannels: channels }),
      activeChannelId: null,
      setActiveChannelId: (id) => set({ activeChannelId: id }),

      testingProgress: { phase: 'idle', done: 0, total: 0 },
      setTestingProgress: (p) =>
        set((state) => ({ testingProgress: { ...state.testingProgress, ...p } })),
      streamCache: {},
      updateStreamCache: (url, ok) =>
        set((state) => ({
          streamCache: {
            ...state.streamCache,
            [url]: { ok, testedAt: Date.now() },
          },
        })),
      clearStreamCache: () => set({ streamCache: {} }),

      epgData: new Map(),
      setEpgData: (epgData) => set({ epgData }),

      currentView: 'setup',
      setCurrentView: (currentView) => set({ currentView }),
      showAllChannels: false,
      setShowAllChannels: (showAllChannels) => set({ showAllChannels }),
      allStreamsLoaded: false,
      setAllStreamsLoaded: (allStreamsLoaded) => set({ allStreamsLoaded }),

      programPopup: null,
      setProgramPopup: (programPopup) => set({ programPopup }),

      notifications: [],
      addNotification: (notification) =>
        set((state) => ({ notifications: [...state.notifications, notification] })),
      removeNotification: (id) =>
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),

      dismissedNotifications: [],
      addDismissedNotification: (key) =>
        set((state) => ({ dismissedNotifications: [...state.dismissedNotifications, key] })),
    }),
    {
      name: 'crystal-tv-storage',
      partialize: (state) => ({
        profile: state.profile,
        dismissedNotifications: state.dismissedNotifications,
        streamCache: state.streamCache,
      }),
    }
  )
);
