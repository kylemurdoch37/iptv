import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { parseM3U, FALLBACK_CHANNELS } from '../utils/m3uParser';
import { matchChannelsToShows } from '../utils/channelMatcher';
import { shows } from '../data/showMappings';
import type { Channel } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?url=';

// Primary stream source (user-specified)
const DADDYLIVE_URL = 'https://daddylive.dad/playlist/m3u';

// iptv-org API for channel metadata + logos
const API_CHANNELS_URL = 'https://iptv-org.github.io/api/channels.json';

// iptv-org M3U fallbacks (country-filtered, reliable)
const IPTV_ORG_SOURCES = [
  'https://iptv-org.github.io/iptv/countries/gb.m3u',
  'https://iptv-org.github.io/iptv/countries/us.m3u',
];

interface APIChannel {
  id: string;
  name: string;
  alt_names: string[];
  country: string;
  categories: string[];
  is_nsfw: boolean;
  logo?: string;
}

async function fetchText(url: string, timeout = 20000): Promise<string> {
  const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const resp = await fetch(proxied, { signal: AbortSignal.timeout(timeout) });
  if (!resp.ok) throw new Error(`${resp.status} ${url}`);
  return resp.text();
}

async function fetchAPIChannels(): Promise<Map<string, APIChannel>> {
  try {
    const resp = await fetch(API_CHANNELS_URL, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error('API unavailable');
    const data: APIChannel[] = await resp.json();
    const map = new Map<string, APIChannel>();
    for (const ch of data) {
      if (!ch.is_nsfw) map.set(ch.id, ch);
      // Also index by normalised name for fuzzy matching
      map.set(ch.name.toLowerCase(), ch);
      for (const alt of ch.alt_names ?? []) {
        map.set(alt.toLowerCase(), ch);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

function enrichWithAPI(channels: Channel[], apiMap: Map<string, APIChannel>): Channel[] {
  return channels.map((ch) => {
    // Try matching by tvg-id first, then by normalised name
    const apiCh =
      apiMap.get(ch.tvgId) ??
      apiMap.get(ch.name.toLowerCase());

    if (!apiCh) return ch;
    return {
      ...ch,
      logo: apiCh.logo ?? ch.logo,
      groupTitle: apiCh.country === 'GB' ? 'UK' : apiCh.country === 'US' ? 'US' : ch.groupTitle,
    };
  });
}

export function useChannels() {
  const { profile, setChannels } = useStore();

  useEffect(() => {
    if (!profile.setupComplete) return;

    const favouriteShows = shows.filter((s) =>
      profile.favouriteShowIds.includes(s.id)
    );

    async function fetchChannels() {
      // Fetch API metadata and all M3U sources in parallel
      const [apiMap, daddyliveResult, ...iptvOrgResults] = await Promise.allSettled([
        fetchAPIChannels(),
        fetchText(DADDYLIVE_URL),
        ...IPTV_ORG_SOURCES.map((u) => fetchText(u)),
      ]);

      // Parse all M3U sources
      const parsedSources = [daddyliveResult, ...iptvOrgResults]
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .flatMap((r) => parseM3U(r.value));

      const metadata = apiMap.status === 'fulfilled' ? apiMap.value : new Map<string, APIChannel>();

      if (parsedSources.length === 0) {
        // Everything failed — use hardcoded fallback
        const enriched = enrichWithAPI(FALLBACK_CHANNELS, metadata);
        const matched = matchChannelsToShows(enriched, favouriteShows);
        setChannels(matched.length > 0 ? matched : enriched);
        return;
      }

      // Deduplicate by name (prefer daddylive entries as they come first)
      const seen = new Set<string>();
      const unique = parsedSources.filter((ch) => {
        const key = ch.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Enrich with API metadata (logos, correct grouping)
      const enriched = enrichWithAPI(unique, metadata);

      // Match against favourite shows
      const matched = matchChannelsToShows(enriched, favouriteShows);
      setChannels(matched.length > 0 ? matched : enriched.slice(0, 60));
    }

    fetchChannels();
  }, [profile.setupComplete, profile.favouriteShowIds, setChannels]);
}
