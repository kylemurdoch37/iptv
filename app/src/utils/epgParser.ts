import type { Program } from '../types';

export function parseXMLTV(xmlText: string, channelIds: string[]): Map<string, Program[]> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const programs = new Map<string, Program[]>();

  const programmeElements = doc.querySelectorAll('programme');
  programmeElements.forEach((el, idx) => {
    const channelId = el.getAttribute('channel') || '';
    if (!channelIds.includes(channelId)) return;

    const startStr = el.getAttribute('start') || '';
    const stopStr = el.getAttribute('stop') || '';
    const title = el.querySelector('title')?.textContent || 'Unknown';
    const desc = el.querySelector('desc')?.textContent || '';

    const startTime = parseXMLTVDate(startStr);
    const endTime = parseXMLTVDate(stopStr);

    if (!startTime || !endTime) return;

    const program: Program = {
      id: `prog-${channelId}-${idx}`,
      channelId,
      title,
      description: desc,
      startTime,
      endTime,
    };

    if (!programs.has(channelId)) programs.set(channelId, []);
    programs.get(channelId)!.push(program);
  });

  return programs;
}

function parseXMLTVDate(dateStr: string): Date | null {
  // Format: YYYYMMDDHHMMSS +HHMM
  const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
  if (!match) return null;

  const [, year, month, day, hour, min, sec, tz] = match;
  let offset = 0;
  if (tz) {
    const tzSign = tz[0] === '+' ? 1 : -1;
    const tzHour = parseInt(tz.slice(1, 3));
    const tzMin = parseInt(tz.slice(3, 5));
    offset = tzSign * (tzHour * 60 + tzMin);
  }

  const utcMs = Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(min),
    parseInt(sec)
  ) - offset * 60 * 1000;

  return new Date(utcMs);
}

export function generateMockEPG(channelIds: string[]): Map<string, Program[]> {
  const programs = new Map<string, Program[]>();

  const showTitles = [
    "Morning News", "The Breakfast Show", "Cooking with Stars", "Drama Hour",
    "Game Show Bonanza", "Evening News", "Reality Showdown", "Late Night Live",
    "Music Hits", "Documentary Night", "Sports Roundup", "Comedy Club",
    "RuPaul's Drag Race", "Love Island", "EastEnders", "Coronation Street",
    "The Crown", "Bridgerton", "Strictly Come Dancing", "Big Brother",
    "The Great British Bake Off", "MasterChef", "The Traitors", "Made in Chelsea",
  ];

  const descriptions = [
    "Join us for an exciting hour of entertainment.",
    "Don't miss this spectacular episode full of drama and surprises.",
    "The best contestants face off in tonight's challenge.",
    "Exclusive behind-the-scenes footage and special guests.",
    "A fan-favourite episode that you won't want to miss.",
  ];

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(6, 0, 0, 0);

  for (const channelId of channelIds) {
    const channelPrograms: Program[] = [];
    let currentTime = new Date(startOfDay);
    let progIdx = 0;

    while (currentTime < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)) {
      const durationMins = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
      const endTime = new Date(currentTime.getTime() + durationMins * 60 * 1000);
      const title = showTitles[(progIdx + channelId.charCodeAt(0)) % showTitles.length];
      const desc = descriptions[progIdx % descriptions.length];

      channelPrograms.push({
        id: `mock-${channelId}-${progIdx}`,
        channelId,
        title,
        description: desc,
        startTime: new Date(currentTime),
        endTime,
      });

      currentTime = endTime;
      progIdx++;
    }

    programs.set(channelId, channelPrograms);
  }

  return programs;
}
