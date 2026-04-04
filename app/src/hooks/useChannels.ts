import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { parseM3U, FALLBACK_CHANNELS } from '../utils/m3uParser';
import { matchChannelsToShows } from '../utils/channelMatcher';
import { shows } from '../data/showMappings';

const CORS_PROXY = 'https://corsproxy.io/?url=';
const M3U_SOURCES = [
  'https://iptv-org.github.io/iptv/countries/gb.m3u',
  'https://iptv-org.github.io/iptv/countries/us.m3u',
];

async function fetchM3U(url: string): Promise<string> {
  const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const resp = await fetch(proxied, { signal: AbortSignal.timeout(20000) });
  if (!resp.ok) throw new Error(`Failed to fetch ${url}`);
  return resp.text();
}

export function useChannels() {
  const { profile, setChannels } = useStore();

  useEffect(() => {
    if (!profile.setupComplete) return;

    const favouriteShows = shows.filter((s) =>
      profile.favouriteShowIds.includes(s.id)
    );

    async function fetchChannels() {
      try {
        // Fetch UK + US playlists in parallel, ignore individual failures
        const results = await Promise.allSettled(M3U_SOURCES.map(fetchM3U));

        const allChannels = results
          .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
          .flatMap((r) => parseM3U(r.value));

        if (allChannels.length === 0) throw new Error('No channels loaded');

        const matched = matchChannelsToShows(allChannels, favouriteShows);
        setChannels(matched.length > 0 ? matched : allChannels.slice(0, 50));
      } catch {
        const matched = matchChannelsToShows(FALLBACK_CHANNELS, favouriteShows);
        setChannels(matched.length > 0 ? matched : FALLBACK_CHANNELS);
      }
    }

    fetchChannels();
  }, [profile.setupComplete, profile.favouriteShowIds, setChannels]);
}
