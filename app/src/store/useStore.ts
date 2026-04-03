import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Channel, UserProfile, ThemeKey, Program, NotificationData } from '../types';
import { applyTheme } from '../data/themes';

interface AppActions {
  completeSetup: () => void;
  setProfile: (profile: UserProfile) => void;
  setFavouriteShowIds: (ids: string[]) => void;
  setAllChannels: (channels: Channel[]) => void;
  setFavouriteChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  setEpgData: (data: Record<string, Program[]>) => void;
  setTheme: (theme: ThemeKey) => void;
  setView: (view: 'epg' | 'player') => void;
  showNotification: (notification: NotificationData) => void;
  dismissNotification: () => void;
  setChannelsLoading: (loading: boolean) => void;
  setEpgLoading: (loading: boolean) => void;
  resetSetup: () => void;
}

const initialState: AppState = {
  setupComplete: false,
  profile: null,
  favouriteShowIds: [],
  favouriteChannels: [],
  allChannels: [],
  epgData: {},
  currentChannel: null,
  currentTheme: 'crystal',
  view: 'epg',
  notification: null,
  channelsLoading: false,
  epgLoading: false,
};

export const useStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      ...initialState,

      completeSetup: () => set({ setupComplete: true }),

      setProfile: (profile) => set({ profile }),

      setFavouriteShowIds: (ids) => set({ favouriteShowIds: ids }),

      setAllChannels: (channels) => set({ allChannels: channels }),

      setFavouriteChannels: (channels) => set({ favouriteChannels: channels }),

      setCurrentChannel: (channel) => set({ currentChannel: channel }),

      setEpgData: (data) => set({ epgData: data }),

      setTheme: (theme) => {
        applyTheme(theme);
        set({ currentTheme: theme });
      },

      setView: (view) => set({ view }),

      showNotification: (notification) => set({ notification }),

      dismissNotification: () => set({ notification: null }),

      setChannelsLoading: (loading) => set({ channelsLoading: loading }),

      setEpgLoading: (loading) => set({ epgLoading: loading }),

      resetSetup: () => set({ ...initialState }),
    }),
    {
      name: 'crystal-tv-storage',
      partialize: (state) => ({
        setupComplete: state.setupComplete,
        profile: state.profile,
        favouriteShowIds: state.favouriteShowIds,
        currentTheme: state.currentTheme,
      }),
    }
  )
);
