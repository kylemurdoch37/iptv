import type { Program } from '../types';

const parseXmltvDate = (dateStr: string): Date => {
  // XMLTV format: 20240101120000 +0000
  const cleaned = dateStr.replace(/\s+[+-]\d{4}$/, '').trim();
  const year = cleaned.substring(0, 4);
  const month = cleaned.substring(4, 6);
  const day = cleaned.substring(6, 8);
  const hour = cleaned.substring(8, 10);
  const min = cleaned.substring(10, 12);
  const sec = cleaned.substring(12, 14) || '00';
  return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
};

export const parseXMLTV = (xmlText: string): Record<string, Program[]> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const programmes = doc.querySelectorAll('programme');
  const result: Record<string, Program[]> = {};

  programmes.forEach((prog, index) => {
    const channelId = prog.getAttribute('channel') || '';
    const start = prog.getAttribute('start') || '';
    const stop = prog.getAttribute('stop') || '';
    const titleEl = prog.querySelector('title');
    const descEl = prog.querySelector('desc');

    const program: Program = {
      id: `prog-${index}`,
      channelId,
      title: titleEl?.textContent || 'Unknown Programme',
      description: descEl?.textContent || '',
      start: parseXmltvDate(start),
      stop: parseXmltvDate(stop),
    };

    if (!result[channelId]) result[channelId] = [];
    result[channelId].push(program);
  });

  return result;
};

export const generateMockEPG = (channelIds: string[]): Record<string, Program[]> => {
  const mockShows = [
    { title: 'Morning News', duration: 60 },
    { title: 'Breakfast Show', duration: 90 },
    { title: 'Daytime Drama', duration: 30 },
    { title: 'Chat Show', duration: 60 },
    { title: 'Reality Special', duration: 60 },
    { title: 'Drama Series', duration: 45 },
    { title: 'Comedy Hour', duration: 30 },
    { title: 'Documentary', duration: 60 },
    { title: 'Evening News', duration: 30 },
    { title: 'Prime Time Drama', duration: 60 },
    { title: 'Reality Show', duration: 60 },
    { title: 'Late Night Talk', duration: 60 },
    { title: 'Music Show', duration: 30 },
    { title: 'Film', duration: 120 },
    { title: 'Highlights', duration: 30 },
  ];

  const result: Record<string, Program[]> = {};

  channelIds.forEach(channelId => {
    const programs: Program[] = [];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    let current = startOfDay.getTime();
    let progIndex = 0;

    while (current < startOfDay.getTime() + 24 * 60 * 60 * 1000) {
      const show = mockShows[progIndex % mockShows.length];
      const start = new Date(current);
      const stop = new Date(current + show.duration * 60 * 1000);
      programs.push({
        id: `mock-${channelId}-${progIndex}`,
        channelId,
        title: show.title,
        description: `Watch ${show.title} on this channel. An entertaining programme for all the family.`,
        start,
        stop,
      });
      current = stop.getTime();
      progIndex++;
    }

    result[channelId] = programs;
  });

  return result;
};

export const fetchEPG = async (url: string): Promise<Record<string, Program[]>> => {
  const proxiedUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxiedUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return parseXMLTV(text);
};

export const getCurrentProgram = (programs: Program[]): Program | null => {
  const now = new Date();
  return programs.find(p => p.start <= now && p.stop > now) || null;
};

export const getUpcomingPrograms = (programs: Program[], count = 3): Program[] => {
  const now = new Date();
  return programs.filter(p => p.start > now).slice(0, count);
};
