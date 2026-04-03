export interface Show {
  id: string;
  name: string;
  emoji: string;
  genre: string;
  channels: string[];
}

export interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  tvgId: string;
  groupTitle: string;
  logo: string;
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  description: string;
  start: Date;
  stop: Date;
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  accent: string;
}

export type ThemeKey = 'crystal' | 'midnight' | 'bubblegum' | 'matrix' | 'classic-sky';

export interface AppState {
  setupComplete: boolean;
  profile: UserProfile | null;
  favouriteShowIds: string[];
  favouriteChannels: Channel[];
  allChannels: Channel[];
  epgData: Record<string, Program[]>;
  currentChannel: Channel | null;
  currentTheme: ThemeKey;
  view: 'epg' | 'player';
  notification: NotificationData | null;
  channelsLoading: boolean;
  epgLoading: boolean;
}

export interface NotificationData {
  id: string;
  message: string;
  showName: string;
  channelName: string;
  channel: Channel;
}
