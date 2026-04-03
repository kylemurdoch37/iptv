import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { shows } from '../data/showMappings';

export function useNotifications() {
  const {
    profile,
    channels,
    epgData,
    addNotification,
    dismissedNotifications,
    addDismissedNotification,
  } = useStore();

  const checkForFavourites = useCallback(() => {
    if (!profile.setupComplete || channels.length === 0) return;

    const now = new Date();
    const soon = new Date(now.getTime() + 15 * 60 * 1000);

    const favouriteShows = shows.filter((s) =>
      profile.favouriteShowIds.includes(s.id)
    );
    const favouriteTitles = new Set(
      favouriteShows.map((s) => s.name.toLowerCase())
    );

    for (const channel of channels) {
      const programs = epgData.get(channel.id) || [];
      for (const program of programs) {
        const isLiveNow = program.startTime <= now && program.endTime > now;
        const isStartingSoon = program.startTime > now && program.startTime <= soon;

        if (!isLiveNow && !isStartingSoon) continue;

        const titleLower = program.title.toLowerCase();
        const isFavourite = Array.from(favouriteTitles).some(
          (fav) => titleLower.includes(fav) || fav.includes(titleLower)
        );

        if (!isFavourite) continue;

        const notifKey = `${program.id}-${channel.id}`;
        if (dismissedNotifications.includes(notifKey)) continue;

        const statusText = isLiveNow ? 'is now live' : 'starts in 15 minutes';
        const message = `${profile.name}, "${program.title}" ${statusText} on ${channel.name}! 💖`;

        addNotification({
          id: `notif-${Date.now()}-${Math.random()}`,
          message,
          channelId: channel.id,
          showName: program.title,
          channelName: channel.name,
        });

        addDismissedNotification(notifKey);
        break; // One notification at a time
      }
    }
  }, [
    profile,
    channels,
    epgData,
    addNotification,
    dismissedNotifications,
    addDismissedNotification,
  ]);

  useEffect(() => {
    checkForFavourites();
    const interval = setInterval(checkForFavourites, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkForFavourites]);
}
