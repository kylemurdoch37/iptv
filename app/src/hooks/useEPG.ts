import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { generateMockEPG } from '../utils/epgParser';

export function useEPG() {
  const { channels, setEpgData } = useStore();

  useEffect(() => {
    if (channels.length === 0) return;

    const channelIds = channels.map((c) => c.id);
    // Always use mock EPG since XMLTV fetching is complex with CORS
    // and the EPG endpoint requires specific channel XML files
    const mockData = generateMockEPG(channelIds);
    setEpgData(mockData);

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      const fresh = generateMockEPG(channelIds);
      setEpgData(fresh);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [channels, setEpgData]);
}
