import type { Channel } from '../types';

const normalize = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, '');

const similarity = (a: string, b: string): number => {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  // Check word overlap
  const wordsA = na.split('');
  const wordsB = nb.split('');
  let matches = 0;
  const shorter = wordsA.length < wordsB.length ? wordsA : wordsB;
  const longer = wordsA.length >= wordsB.length ? wordsA : wordsB;
  shorter.forEach(char => {
    const idx = longer.indexOf(char);
    if (idx !== -1) {
      matches++;
      longer.splice(idx, 1);
    }
  });
  return matches / Math.max(wordsA.length, wordsB.length);
};

export const matchChannelsByName = (
  targetNames: string[],
  allChannels: Channel[],
  threshold = 0.6
): Channel[] => {
  const matched: Channel[] = [];
  const usedIds = new Set<string>();

  for (const targetName of targetNames) {
    let bestMatch: Channel | null = null;
    let bestScore = 0;

    for (const channel of allChannels) {
      const score = similarity(channel.name, targetName);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = channel;
      }
    }

    if (bestMatch && !usedIds.has(bestMatch.id)) {
      matched.push(bestMatch);
      usedIds.add(bestMatch.id);
    }
  }

  return matched;
};

export const fallbackChannels: Channel[] = [
  {
    id: 'fallback-bbc1',
    name: 'BBC One',
    streamUrl: 'https://vs-hls-push-ww-live.akamaized.net/pool_904/live/ww/bbc_one_london/bbc_one_london.isml/master.m3u8',
    tvgId: 'bbc1.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-bbc2',
    name: 'BBC Two',
    streamUrl: 'https://vs-hls-push-ww-live.akamaized.net/pool_904/live/ww/bbc_two_england/bbc_two_england.isml/master.m3u8',
    tvgId: 'bbc2.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-itv',
    name: 'ITV',
    streamUrl: 'https://stream.live.ott.kaltura.com/api/manifest/uiconf_id/56320851/entry_id/1_6oa47xvt/format/applehttp/protocol/https/a.m3u8',
    tvgId: 'itv.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-ch4',
    name: 'Channel 4',
    streamUrl: 'https://ngrp.channel4.com/cfhls/live/ch4/high/Channel4.m3u8',
    tvgId: 'channel4.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-ch5',
    name: 'Channel 5',
    streamUrl: 'https://nmxlive.akamaized.net/hls/live/529965/Live_1/index.m3u8',
    tvgId: 'channel5.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-itv2',
    name: 'ITV2',
    streamUrl: 'https://stream.live.ott.kaltura.com/api/manifest/uiconf_id/56320851/entry_id/1_iqo5jwqv/format/applehttp/protocol/https/a.m3u8',
    tvgId: 'itv2.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-bbcthree',
    name: 'BBC Three',
    streamUrl: 'https://vs-hls-push-ww-live.akamaized.net/pool_904/live/ww/bbc_three/bbc_three.isml/master.m3u8',
    tvgId: 'bbc3.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-e4',
    name: 'E4',
    streamUrl: 'https://ngrp.channel4.com/cfhls/live/e4/high/E4.m3u8',
    tvgId: 'e4.uk',
    groupTitle: 'UK',
    logo: '',
  },
  {
    id: 'fallback-vh1',
    name: 'VH1',
    streamUrl: 'https://linear-67.frequency.stream/dist/cx/ch4813/index.m3u8',
    tvgId: 'vh1.us',
    groupTitle: 'US',
    logo: '',
  },
  {
    id: 'fallback-mtv',
    name: 'MTV',
    streamUrl: 'https://linear-64.frequency.stream/dist/cx/ch4808/index.m3u8',
    tvgId: 'mtv.us',
    groupTitle: 'US',
    logo: '',
  },
  {
    id: 'fallback-bravo',
    name: 'Bravo',
    streamUrl: 'https://linear-70.frequency.stream/dist/cx/ch5025/index.m3u8',
    tvgId: 'bravo.us',
    groupTitle: 'US',
    logo: '',
  },
  {
    id: 'fallback-skyatl',
    name: 'Sky Atlantic',
    streamUrl: 'https://linear-23.frequency.stream/dist/cx/ch2600/index.m3u8',
    tvgId: 'skyatlantic.uk',
    groupTitle: 'UK',
    logo: '',
  },
];
