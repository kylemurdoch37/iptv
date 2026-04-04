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
  startTime: Date;
  endTime: Date;
}

export interface UserProfile {
  name: string;
  avatar: string;
  favouriteShowIds: string[];
  setupComplete: boolean;
  themeId: string;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  accent: string;
}

export interface Notification {
  id: string;
  message: string;
  channelId: string;
  showName: string;
  channelName: string;
}

export interface ProgramPopupData {
  program: Program;
  channelId: string;
  channelName: string;
}
