import type { Show } from '../types';

export const shows: Show[] = [
  { id: 'rupauls-drag-race', name: "RuPaul's Drag Race", emoji: '💃', genre: 'Reality', channels: ['VH1', 'MTV'] },
  { id: 'love-island', name: 'Love Island', emoji: '🌴', genre: 'Reality', channels: ['ITV2'] },
  { id: 'eastenders', name: 'EastEnders', emoji: '🍵', genre: 'Soap', channels: ['BBC One'] },
  { id: 'coronation-street', name: 'Coronation Street', emoji: '☕', genre: 'Soap', channels: ['ITV'] },
  { id: 'game-of-thrones', name: 'Game of Thrones', emoji: '⚔️', genre: 'Drama', channels: ['Sky Atlantic', 'HBO'] },
  { id: 'house-of-dragon', name: 'House of the Dragon', emoji: '🐉', genre: 'Drama', channels: ['Sky Atlantic', 'HBO'] },
  { id: 'the-crown', name: 'The Crown', emoji: '👑', genre: 'Drama', channels: ['Netflix', 'Channel 4'] },
  { id: 'bridgerton', name: 'Bridgerton', emoji: '🌹', genre: 'Drama', channels: ['Netflix'] },
  { id: 'the-voice', name: 'The Voice', emoji: '🎤', genre: 'Music', channels: ['ITV', 'NBC'] },
  { id: 'x-factor', name: 'X Factor', emoji: '⭐', genre: 'Music', channels: ['ITV'] },
  { id: 'strictly', name: 'Strictly Come Dancing', emoji: '💃', genre: 'Entertainment', channels: ['BBC One'] },
  { id: 'big-brother', name: 'Big Brother', emoji: '👁️', genre: 'Reality', channels: ['Channel 5', 'ITV2'] },
  { id: 'bake-off', name: 'The Great British Bake Off', emoji: '🍰', genre: 'Food', channels: ['Channel 4'] },
  { id: 'masterchef', name: 'MasterChef', emoji: '🍽️', genre: 'Food', channels: ['BBC One'] },
  { id: 'drag-race-uk', name: 'Drag Race UK', emoji: '🇬🇧', genre: 'Reality', channels: ['BBC Three', 'BBC iPlayer'] },
  { id: 'real-housewives', name: 'The Real Housewives', emoji: '🥂', genre: 'Reality', channels: ['Bravo', 'ITV2'] },
  { id: 'satc', name: 'Sex and the City', emoji: '👠', genre: 'Drama', channels: ['Sky Comedy', 'HBO'] },
  { id: 'emily-in-paris', name: 'Emily in Paris', emoji: '🗼', genre: 'Drama', channels: ['Netflix', 'Channel 4'] },
  { id: 'kuwtk', name: 'Keeping Up with the Kardashians', emoji: '📱', genre: 'Reality', channels: ['E!', 'hayu'] },
  { id: 'antm', name: "America's Next Top Model", emoji: '📸', genre: 'Reality', channels: ['VH1', 'MTV'] },
  { id: 'project-runway', name: 'Project Runway', emoji: '👗', genre: 'Reality', channels: ['Bravo', 'Lifetime'] },
  { id: 'drag-race-all-stars', name: "RuPaul's Drag Race All Stars", emoji: '💫', genre: 'Reality', channels: ['VH1', 'Paramount+'] },
  { id: 'made-in-chelsea', name: 'Made in Chelsea', emoji: '🏰', genre: 'Reality', channels: ['Channel 4', 'E4'] },
  { id: 'the-traitors', name: 'The Traitors', emoji: '🗡️', genre: 'Reality', channels: ['BBC One', 'Peacock'] },
];

export const getShowById = (id: string): Show | undefined => shows.find(s => s.id === id);

export const getChannelsForShows = (showIds: string[]): string[] => {
  const channelSet = new Set<string>();
  showIds.forEach(id => {
    const show = getShowById(id);
    if (show) {
      show.channels.forEach(ch => channelSet.add(ch));
    }
  });
  return Array.from(channelSet);
};
