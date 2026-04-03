import type { Channel } from '../types';

export function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];
  const lines = content.split('\n').map(l => l.trim());
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('#EXTINF:')) {
      const meta: Partial<Channel> = {
        tvgId: '',
        groupTitle: '',
        logo: '',
        streamUrl: '',
        name: '',
        id: '',
      };

      // Parse attributes from #EXTINF line
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      
      // Channel name is after the last comma
      const lastCommaIdx = line.lastIndexOf(',');
      const channelName = lastCommaIdx >= 0 ? line.substring(lastCommaIdx + 1).trim() : '';

      meta.tvgId = tvgIdMatch ? tvgIdMatch[1] : '';
      meta.name = tvgNameMatch ? tvgNameMatch[1] : channelName;
      if (!meta.name) meta.name = channelName;
      meta.logo = tvgLogoMatch ? tvgLogoMatch[1] : '';
      meta.groupTitle = groupMatch ? groupMatch[1] : '';

      // Next line should be the stream URL
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('#')) {
        j++;
      }
      if (j < lines.length && lines[j] && !lines[j].startsWith('#')) {
        meta.streamUrl = lines[j];
        meta.id = meta.tvgId || meta.name || `channel-${channels.length}`;
        channels.push(meta as Channel);
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

export const FALLBACK_CHANNELS: Channel[] = [
  {
    id: 'bbc-one',
    name: 'BBC One',
    streamUrl: 'https://vs-hls-push-ww-live.akamaized.net/pool_904/live/bbc_one_london/bbc_one_london.isml/master.m3u8',
    tvgId: 'bbc-one.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'bbc-two',
    name: 'BBC Two',
    streamUrl: 'https://vs-hls-push-ww-live.akamaized.net/pool_904/live/bbc_two_england/bbc_two_england.isml/master.m3u8',
    tvgId: 'bbc-two.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'itv',
    name: 'ITV',
    streamUrl: 'https://itvpnpdotcom.blue.content.itv.com/itv/3840x2160p25/2.0/hls/playlist.m3u8',
    tvgId: 'itv.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'channel4',
    name: 'Channel 4',
    streamUrl: 'https://f1tv.formula1.com/stream/4.m3u8',
    tvgId: 'channel4.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'itv2',
    name: 'ITV2',
    streamUrl: '',
    tvgId: 'itv2.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'channel5',
    name: 'Channel 5',
    streamUrl: '',
    tvgId: 'channel5.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'e4',
    name: 'E4',
    streamUrl: '',
    tvgId: 'e4.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'bbc-three',
    name: 'BBC Three',
    streamUrl: '',
    tvgId: 'bbc-three.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'sky-atlantic',
    name: 'Sky Atlantic',
    streamUrl: '',
    tvgId: 'sky-atlantic.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'vh1',
    name: 'VH1',
    streamUrl: '',
    tvgId: 'vh1.us',
    groupTitle: 'US',
    logo: '',
  },
  {
    id: 'mtv',
    name: 'MTV',
    streamUrl: '',
    tvgId: 'mtv.us',
    groupTitle: 'US',
    logo: '',
  },
  {
    id: 'bravo',
    name: 'Bravo',
    streamUrl: '',
    tvgId: 'bravo.us',
    groupTitle: 'US',
    logo: '',
  },
  {
    id: 'sky-comedy',
    name: 'Sky Comedy',
    streamUrl: '',
    tvgId: 'sky-comedy.uk',
    groupTitle: 'UK',
    logo: '',
  },
];
