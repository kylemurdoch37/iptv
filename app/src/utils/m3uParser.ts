import type { Channel } from '../types';

export function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];
  const lines = content.split('\n').map(l => l.trim());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('#EXTINF:')) {
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const lastComma = line.lastIndexOf(',');
      const channelName = lastComma >= 0 ? line.substring(lastComma + 1).trim() : '';

      // Advance past any extra directive lines to find the URL
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('#')) j++;

      const streamUrl = (j < lines.length && !lines[j].startsWith('#')) ? lines[j].trim() : '';

      // Only add if we have both a name and a stream URL
      if (streamUrl && (tvgNameMatch?.[1] || channelName)) {
        channels.push({
          id: tvgIdMatch?.[1] || tvgNameMatch?.[1] || channelName || `ch-${channels.length}`,
          name: tvgNameMatch?.[1] || channelName,
          streamUrl,
          tvgId: tvgIdMatch?.[1] || '',
          groupTitle: groupMatch?.[1] || '',
          logo: tvgLogoMatch?.[1] || '',
        });
        i = j + 1;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }

  return channels;
}

// Emergency fallback — only channels with confirmed public HLS URLs.
// These are used when all remote fetches fail.
export const FALLBACK_CHANNELS: Channel[] = [
  {
    id: 'al-jazeera-english',
    name: 'Al Jazeera English',
    streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
    tvgId: 'AlJazeeraEnglish.int',
    groupTitle: 'News',
    logo: '',
  },
  {
    id: 'france24-en',
    name: 'France 24 (English)',
    streamUrl: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8',
    tvgId: 'France24English.fr',
    groupTitle: 'News',
    logo: '',
  },
  {
    id: 'dw-english',
    name: 'DW English',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    tvgId: 'DWEnglish.de',
    groupTitle: 'News',
    logo: '',
  },
  {
    id: 'nasa-tv',
    name: 'NASA TV',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    tvgId: 'NASATV.us',
    groupTitle: 'Science',
    logo: '',
  },
  {
    id: 'bbc-one',
    name: 'BBC One',
    streamUrl: 'https://vs-hls-push-ww-live.akamaized.net/pool_904/live/bbc_one_london/bbc_one_london.isml/master.m3u8',
    tvgId: 'BBCOne.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'mtv',
    name: 'MTV',
    streamUrl: 'https://170.254.18.106/MTV/index.m3u8',
    tvgId: 'MTV.us',
    groupTitle: 'US',
    logo: '',
  },
];
