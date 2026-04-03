import type { Channel } from '../types';

interface M3UEntry {
  name: string;
  streamUrl: string;
  tvgId: string;
  groupTitle: string;
  logo: string;
}

const parseAttribute = (line: string, attr: string): string => {
  const regex = new RegExp(`${attr}="([^"]*)"`, 'i');
  const match = line.match(regex);
  return match ? match[1] : '';
};

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const channels: Channel[] = [];
  let currentEntry: Partial<M3UEntry> | null = null;
  let idCounter = 0;

  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const namePart = line.split(',').slice(1).join(',').trim();
      currentEntry = {
        name: namePart,
        tvgId: parseAttribute(line, 'tvg-id'),
        groupTitle: parseAttribute(line, 'group-title'),
        logo: parseAttribute(line, 'tvg-logo'),
      };
    } else if (line.startsWith('http') && currentEntry) {
      channels.push({
        id: `ch-${idCounter++}`,
        name: currentEntry.name || 'Unknown Channel',
        streamUrl: line,
        tvgId: currentEntry.tvgId || '',
        groupTitle: currentEntry.groupTitle || '',
        logo: currentEntry.logo || '',
      });
      currentEntry = null;
    } else if (!line.startsWith('#')) {
      // Non-comment, non-http line after EXTINF might still be a stream URL
      if (currentEntry && line.length > 0) {
        channels.push({
          id: `ch-${idCounter++}`,
          name: currentEntry.name || 'Unknown Channel',
          streamUrl: line,
          tvgId: currentEntry.tvgId || '',
          groupTitle: currentEntry.groupTitle || '',
          logo: currentEntry.logo || '',
        });
        currentEntry = null;
      }
    }
  }

  return channels;
};

export const CORS_PROXY = 'https://corsproxy.io/?url=';

export const fetchM3U = async (url: string): Promise<Channel[]> => {
  const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const response = await fetch(proxiedUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return parseM3U(text);
};
