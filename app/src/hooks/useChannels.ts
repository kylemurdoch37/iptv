import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { parseM3U, FALLBACK_CHANNELS } from '../utils/m3uParser';
import { matchChannelsToShows } from '../utils/channelMatcher';
import { shows } from '../data/showMappings';

const CORS_PROXY = 'https://corsproxy.io/?url=';
const M3U_URL = 'https://iptv-org.github.io/iptv/countries/gb.m3u';

export function useChannels() {
  const { profile, setChannels } = useStore();

  useEffect(() => {
    if (!profile.setupComplete) return;

    const favouriteShows = shows.filter((s) =>
      profile.favouriteShowIds.includes(s.id)
    );

    async function fetchChannels() {
      try {
        const url = `${CORS_PROXY}${encodeURIComponent(M3U_URL)}`;
        const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!resp.ok) throw new Error('Failed to fetch M3U');
        const text = await resp.text();
        const allChannels = parseM3U(text);
        const matched = matchChannelsToShows(allChannels, favouriteShows);
        if (matched.length > 0) {
          setChannels(matched);
        } else {
          setChannels(FALLBACK_CHANNELS);
        }
      } catch {
        // Use fallback channels
        const matched = matchChannelsToShows(FALLBACK_CHANNELS, favouriteShows);
        setChannels(matched.length > 0 ? matched : FALLBACK_CHANNELS);
      }
    }

    fetchChannels();
  }, [profile.setupComplete, profile.favouriteShowIds, setChannels]);
}
