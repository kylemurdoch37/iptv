import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Channel, Program, UserProfile, Notification, ProgramPopupData } from '../types';

interface StoreState {
  // Profile
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  
  // Channels
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;
  
  // EPG
  epgData: Map<string, Program[]>;
  setEpgData: (data: Map<string, Program[]>) => void;
  
  // View
  currentView: 'setup' | 'epg' | 'player';
  setCurrentView: (view: 'setup' | 'epg' | 'player') => void;
  
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
      setChannels: (channels) => set({ channels }),
      activeChannelId: null,
      setActiveChannelId: (id) => set({ activeChannelId: id }),

      epgData: new Map(),
      setEpgData: (epgData) => set({ epgData }),

      currentView: 'setup',
      setCurrentView: (currentView) => set({ currentView }),

      programPopup: null,
      setProgramPopup: (programPopup) => set({ programPopup }),

      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      dismissedNotifications: [],
      addDismissedNotification: (key) =>
        set((state) => ({
          dismissedNotifications: [...state.dismissedNotifications, key],
        })),
    }),
    {
      name: 'crystal-tv-storage',
      partialize: (state) => ({
        profile: state.profile,
        dismissedNotifications: state.dismissedNotifications,
      }),
    }
  )
);
