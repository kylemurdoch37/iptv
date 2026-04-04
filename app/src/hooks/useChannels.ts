import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { parseM3U, FALLBACK_CHANNELS } from '../utils/m3uParser';
import { matchChannelsToShows } from '../utils/channelMatcher';
import { shows } from '../data/showMappings';
import type { Channel } from '../types';

const CORS_PROXY = 'https://corsproxy.io/?url=';

// Fast default sources — UK + US country playlists (~200–400 channels each)
const DEFAULT_M3U_SOURCES = [
  'https://iptv-org.github.io/iptv/countries/gb.m3u',
  'https://iptv-org.github.io/iptv/countries/us.m3u',
  'https://daddylive.dad/playlist/m3u',
];

// Full channel metadata (logos, alt names) — needed for both phases
const IPTV_API_CHANNELS = 'https://iptv-org.github.io/api/channels.json';

// Full stream database — only fetched on demand
const IPTV_API_STREAMS = 'https://iptv-org.github.io/api/streams.json';

interface APIStream {
  channel: string | null;
  title: string;
  url: string;
  quality: string | null;
  label: string | null;
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
  // Try direct first (iptv-org GitHub Pages has open CORS), fall back to proxy
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (resp.ok) return resp.text();
  } catch { /* fall through */ }
  const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const resp = await fetch(proxied, { signal: AbortSignal.timeout(20000) });
  if (!resp.ok) throw new Error(`${resp.status} ${url}`);
  return resp.text();
}

function buildChannelMetaMap(apiChannels: APIChannel[]): Map<string, APIChannel> {
  const map = new Map<string, APIChannel>();
  for (const ch of apiChannels) {
    if (ch.is_nsfw) continue;
    map.set(ch.id, ch);
    map.set(ch.name.toLowerCase(), ch);
    for (const alt of ch.alt_names ?? []) {
      map.set(alt.toLowerCase(), ch);
    }
  }
  return map;
}

function dedupeAndSort(
  incoming: Channel[],
  existing: Channel[],
  favouriteShowIds: string[]
): Channel[] {
  const seen = new Set<string>(existing.map((c) => c.streamUrl.toLowerCase()));
  const merged = [...existing];

  for (const ch of incoming) {
    const key = ch.streamUrl.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(ch);
  }

  const favouriteShows = shows.filter((s) => favouriteShowIds.includes(s.id));
  const matched = new Set(
    matchChannelsToShows(merged, favouriteShows).map((c) => c.id + c.streamUrl)
  );
  merged.sort((a, b) => {
    const aM = matched.has(a.id + a.streamUrl) ? 0 : 1;
    const bM = matched.has(b.id + b.streamUrl) ? 0 : 1;
    if (aM !== bM) return aM - bM;
    return a.name.localeCompare(b.name);
  });

  return merged;
}

export function useChannels() {
  const { profile, channels, setChannels, setTestingProgress, allStreamsLoaded } = useStore();
  const fullLoadDone = useRef(false);

  // ── Phase 1: fast startup load (UK + US M3Us only) ──────────────────────
  useEffect(() => {
    if (!profile.setupComplete) return;

    async function loadDefault() {
      setTestingProgress({ phase: 'fetching', done: 0, total: 0 });

      const [channelsResult, ...m3uResults] = await Promise.allSettled([
        fetchJSON<APIChannel[]>(IPTV_API_CHANNELS),
        ...DEFAULT_M3U_SOURCES.map(fetchM3U),
      ]);

      const channelMeta =
        channelsResult.status === 'fulfilled'
          ? buildChannelMetaMap(channelsResult.value)
          : new Map<string, APIChannel>();

      const incoming: Channel[] = [];
      for (const result of m3uResults) {
        if (result.status !== 'fulfilled') continue;
        for (const ch of parseM3U(result.value)) {
          const meta = channelMeta.get(ch.tvgId) ?? channelMeta.get(ch.name.toLowerCase());
          incoming.push({ ...ch, logo: meta?.logo ?? ch.logo });
        }
      }

      if (incoming.length === 0) {
        setChannels(FALLBACK_CHANNELS);
        setTestingProgress({ phase: 'complete', done: 0, total: 0 });
        return;
      }

      const sorted = dedupeAndSort(incoming, [], profile.favouriteShowIds);
      setChannels(sorted);
      setTestingProgress({ phase: 'testing', done: 0, total: sorted.length });
    }

    loadDefault().catch(() => {
      setChannels(FALLBACK_CHANNELS);
      setTestingProgress({ phase: 'complete', done: 0, total: 0 });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.setupComplete]);

  // ── Phase 2: full stream load (triggered by "View all channels") ─────────
  useEffect(() => {
    if (!allStreamsLoaded || fullLoadDone.current || !profile.setupComplete) return;
    fullLoadDone.current = true;

    async function loadFull() {
      setTestingProgress({ phase: 'fetching', done: 0, total: 0 });

      const [streamsResult, channelsResult] = await Promise.allSettled([
        fetchJSON<APIStream[]>(IPTV_API_STREAMS),
        fetchJSON<APIChannel[]>(IPTV_API_CHANNELS),
      ]);

      if (streamsResult.status !== 'fulfilled') return; // already have default channels

      const channelMeta =
        channelsResult.status === 'fulfilled'
          ? buildChannelMetaMap(channelsResult.value)
          : new Map<string, APIChannel>();

      const incoming: Channel[] = [];
      for (const s of streamsResult.value) {
        if (!s.url || s.label === 'Geo-blocked') continue;
        const meta = s.channel ? channelMeta.get(s.channel) : null;
        const name = meta?.name ?? s.title ?? s.channel ?? '';
        if (!name) continue;
        incoming.push({
          id: s.channel ?? `stream-${incoming.length}`,
          name,
          streamUrl: s.url,
          tvgId: s.channel ?? '',
          groupTitle: meta?.country ?? '',
          logo: meta?.logo ?? '',
        });
      }

      // Merge with existing channels (already-loaded UK/US ones stay at top)
      const currentChannels = useStore.getState().channels;
      const merged = dedupeAndSort(incoming, currentChannels, profile.favouriteShowIds);
      setChannels(merged);
      setTestingProgress({ phase: 'testing', done: 0, total: merged.length });
    }

    loadFull().catch(() => {
      // Keep existing channels if full load fails
      setTestingProgress({ phase: 'complete', done: 0, total: 0 });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStreamsLoaded, profile.setupComplete]);
}
