import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const BATCH_SIZE = 50;       // concurrent tests per batch
const TEST_TIMEOUT_MS = 6000;

// Test a stream URL by making a no-cors HEAD request.
// no-cors means we can't read the response but we CAN tell if the
// network request succeeded (server responded) vs failed (offline/unreachable).
async function testStream(url: string): Promise<boolean> {
  try {
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: AbortSignal.timeout(TEST_TIMEOUT_MS),
    });
    return true; // opaque response = server is up
  } catch {
    return false;
  }
}

async function runBatch(urls: string[]): Promise<Map<string, boolean>> {
  const results = await Promise.allSettled(urls.map((u) => testStream(u)));
  const map = new Map<string, boolean>();
  urls.forEach((url, i) => {
    const r = results[i];
    map.set(url, r.status === 'fulfilled' ? r.value : false);
  });
  return map;
}

export function useStreamTester() {
  const {
    channels,
    workingChannels,
    setWorkingChannels,
    testingProgress,
    setTestingProgress,
    streamCache,
    updateStreamCache,
  } = useStore();

  const runningRef = useRef(false);

  useEffect(() => {
    if (testingProgress.phase !== 'testing') return;
    if (channels.length === 0) return;
    if (runningRef.current) return;

    runningRef.current = true;

    async function runTests() {
      const now = Date.now();
      const working: typeof channels = [];
      let done = 0;

      for (let i = 0; i < channels.length; i += BATCH_SIZE) {
        const batch = channels.slice(i, i + BATCH_SIZE);

        // Split into cached and uncached
        const needsTest: typeof channels = [];
        for (const ch of batch) {
          const cached = streamCache[ch.streamUrl];
          if (cached && now - cached.testedAt < CACHE_TTL_MS) {
            // Use cached result
            if (cached.ok) working.push(ch);
            done++;
          } else {
            needsTest.push(ch);
          }
        }

        // Test uncached streams
        if (needsTest.length > 0) {
          const results = await runBatch(needsTest.map((c) => c.streamUrl));
          for (const ch of needsTest) {
            const ok = results.get(ch.streamUrl) ?? false;
            updateStreamCache(ch.streamUrl, ok);
            if (ok) working.push(ch);
            done++;
          }
        }

        // Update progress and working list after every batch
        setTestingProgress({ done, total: channels.length });
        setWorkingChannels([...working]);
      }

      setTestingProgress({ phase: 'complete', done, total: channels.length });
      runningRef.current = false;
    }

    runTests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testingProgress.phase, channels.length]);
}
