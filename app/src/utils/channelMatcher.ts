import type { Channel, Show } from '../types';

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  
  // Count common characters
  let common = 0;
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  for (const ch of shorter) {
    if (longer.includes(ch)) common++;
  }
  return common / Math.max(na.length, nb.length);
}

export function matchChannelsToShows(
  allChannels: Channel[],
  favouriteShows: Show[]
): Channel[] {
  const wantedChannelNames = new Set<string>();
  for (const show of favouriteShows) {
    for (const ch of show.channels) {
      wantedChannelNames.add(ch);
    }
  }

  const matched: Channel[] = [];
  const seen = new Set<string>();

  for (const wantedName of wantedChannelNames) {
    let bestChannel: Channel | null = null;
    let bestScore = 0;

    for (const channel of allChannels) {
      const score = similarity(channel.name, wantedName);
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestChannel = channel;
      }
    }

    if (bestChannel && !seen.has(bestChannel.id)) {
      seen.add(bestChannel.id);
      matched.push(bestChannel);
    }
  }

  return matched;
}

export function getChannelForShow(channels: Channel[], show: Show): Channel | undefined {
  for (const wantedName of show.channels) {
    let bestChannel: Channel | undefined;
    let bestScore = 0;

    for (const channel of channels) {
      const score = similarity(channel.name, wantedName);
      if (score > bestScore && score > 0.5) {
        bestScore = score;
        bestChannel = channel;
      }
    }

    if (bestChannel) return bestChannel;
  }
  return undefined;
}
