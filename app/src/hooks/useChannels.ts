import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { parseM3U, FALLBACK_CHANNELS } from '../utils/m3uParser';
import { matchChannelsToShows } from '../utils/channelMatcher';
import { shows } from '../data/showMappings';
import type { Channel } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?url=';

// All iptv-org streams via their API
const IPTV_API_STREAMS = 'https://iptv-org.github.io/api/streams.json';
const IPTV_API_CHANNELS = 'https://iptv-org.github.io/api/channels.json';

// Additional M3U sources
const EXTRA_M3U = [
  'https://daddylive.dad/playlist/m3u',
];

interface APIStream {
  channel: string | null;
  title: string;
  url: string;
  quality: string | null;
  label: string | null;
  user_agent: string | null;
  referrer: string | null;
}

interface APIChannel {
  id: string;
  name: string;
  alt_names: string[];
  country: string;
  categories: string[];
  is_nsfw: boolean;
  logo?: string;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!resp.ok) throw new Error(`${resp.status} ${url}`);
  return resp.json() as Promise<T>;
}

async function fetchM3U(url: string): Promise<string> {
  const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const resp = await fetch(proxied, { signal: AbortSignal.timeout(20000) });
  if (!resp.ok) throw new Error(`${resp.status} ${url}`);
  return resp.text();
}

export function useChannels() {
  const { profile, setChannels, setTestingProgress } = useStore();

  useEffect(() => {
    if (!profile.setupComplete) return;

    const favouriteShows = shows.filter((s) =>
      profile.favouriteShowIds.includes(s.id)
    );

    async function loadAllChannels() {
      setTestingProgress({ phase: 'fetching', done: 0, total: 0 });

      // Fetch iptv-org API data + extra M3U sources in parallel
      const [streamsResult, channelsResult, ...m3uResults] = await Promise.allSettled([
        fetchJSON<APIStream[]>(IPTV_API_STREAMS),
        fetchJSON<APIChannel[]>(IPTV_API_CHANNELS),
        ...EXTRA_M3U.map(fetchM3U),
      ]);

      // Build channel metadata map
      const channelMeta = new Map<string, APIChannel>();
      if (channelsResult.status === 'fulfilled') {
        for (const ch of channelsResult.value) {
          if (!ch.is_nsfw) {
            channelMeta.set(ch.id, ch);
            channelMeta.set(ch.name.toLowerCase(), ch);
            for (const alt of ch.alt_names ?? []) {
              channelMeta.set(alt.toLowerCase(), ch);
            }
          }
        }
      }

      const allChannels: Channel[] = [];
      const seen = new Set<string>();

      const addChannel = (ch: Channel) => {
        const key = ch.streamUrl.toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        allChannels.push(ch);
      };

      // 1. iptv-org API streams (the full database)
      if (streamsResult.status === 'fulfilled') {
        for (const s of streamsResult.value) {
          if (!s.url || s.label === 'Geo-blocked') continue;
          const meta = s.channel ? channelMeta.get(s.channel) : null;
          const name = meta?.name ?? s.title ?? s.channel ?? 'Unknown';
          if (!name) continue;
          addChannel({
            id: s.channel ?? `stream-${allChannels.length}`,
            name,
            streamUrl: s.url,
            tvgId: s.channel ?? '',
            groupTitle: meta?.country ?? '',
            logo: meta?.logo ?? '',
          });
        }
      }

      // 2. Extra M3U sources (daddylive etc.)
      for (const result of m3uResults) {
        if (result.status !== 'fulfilled') continue;
        const parsed = parseM3U(result.value);
        for (const ch of parsed) {
          const meta = channelMeta.get(ch.tvgId) ?? channelMeta.get(ch.name.toLowerCase());
          addChannel({
            ...ch,
            logo: meta?.logo ?? ch.logo,
          });
        }
      }

      // Fallback if everything failed
      if (allChannels.length === 0) {
        setChannels(FALLBACK_CHANNELS);
        setTestingProgress({ phase: 'complete', done: 0, total: 0 });
        return;
      }

      // Sort: matched channels first, then alphabetically
      const matched = new Set(
        matchChannelsToShows(allChannels, favouriteShows).map((c) => c.id + c.streamUrl)
      );
      allChannels.sort((a, b) => {
        const aMatch = matched.has(a.id + a.streamUrl) ? 0 : 1;
        const bMatch = matched.has(b.id + b.streamUrl) ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
        return a.name.localeCompare(b.name);
      });

      setChannels(allChannels);
      setTestingProgress({ phase: 'testing', done: 0, total: allChannels.length });
    }

    loadAllChannels().catch(() => {
      setChannels(FALLBACK_CHANNELS);
      setTestingProgress({ phase: 'complete', done: 0, total: 0 });
    });
  }, [profile.setupComplete, profile.favouriteShowIds, setChannels, setTestingProgress]);
}
