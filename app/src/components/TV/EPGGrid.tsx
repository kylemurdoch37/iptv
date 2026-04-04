import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Program } from '../../types';

const CELL_HEIGHT = 64;
const CHANNEL_COL_WIDTH = 160;
const SLOT_WIDTH = 120; // pixels per 30 min
const NUM_SLOTS = 4; // 2 hours = 4 x 30min slots

function getSlotStart(slotIndex: number, baseTime: Date): Date {
  const d = new Date(baseTime);
  d.setMinutes(slotIndex < 0 ? d.getMinutes() + slotIndex * 30 : d.getMinutes() + slotIndex * 30);
  return d;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const US_UK = new Set(['us', 'gb', 'uk']);

function isUsUk(ch: { groupTitle: string; id: string; tvgId: string }): boolean {
  if (US_UK.has(ch.groupTitle.toLowerCase())) return true;
  if (ch.id.endsWith('.us') || ch.id.endsWith('.uk')) return true;
  if (ch.tvgId.endsWith('.us') || ch.tvgId.endsWith('.uk')) return true;
  return false;
}

export const EPGGrid: React.FC = () => {
  const { channels, workingChannels, epgData, setProgramPopup, setActiveChannelId, setCurrentView, showAllChannels, setShowAllChannels } = useStore();
  // Use tested working channels once available, otherwise show all (with loading state)
  const baseChannels = workingChannels.length > 0 ? workingChannels : channels;
  const displayChannels = showAllChannels ? baseChannels : baseChannels.filter(isUsUk);
  const hiddenCount = baseChannels.length - baseChannels.filter(isUsUk).length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Round to nearest 30 mins
  const baseTime = new Date(now);
  baseTime.setMinutes(baseTime.getMinutes() >= 30 ? 30 : 0, 0, 0);

  // Generate time slots: from 30 min before now to 2 hours ahead
  const slotCount = NUM_SLOTS + 2; // a bit of context before and after
  const slots: Date[] = [];
  for (let i = -2; i <= NUM_SLOTS; i++) {
    const slot = new Date(baseTime);
    slot.setMinutes(slot.getMinutes() + i * 30);
    slots.push(slot);
  }

  const timelineStart = slots[0];
  const timelineEnd = new Date(slots[slots.length - 1]);
  const totalDurationMs = timelineEnd.getTime() - timelineStart.getTime();

  const msToPixels = (ms: number) => (ms / (30 * 60 * 1000)) * SLOT_WIDTH;

  const getProgramsForChannel = (channelId: string): Program[] => {
    const programs = epgData.get(channelId) || [];
    return programs.filter(
      (p) => p.endTime > timelineStart && p.startTime < timelineEnd
    );
  };

  const getProgramStyle = (program: Program) => {
    const startMs = Math.max(program.startTime.getTime() - timelineStart.getTime(), 0);
    const endMs = Math.min(program.endTime.getTime() - timelineStart.getTime(), totalDurationMs);
    const left = msToPixels(startMs);
    const width = Math.max(msToPixels(endMs - startMs) - 2, 4);
    const isLive = program.startTime <= now && program.endTime > now;
    return { left, width, isLive };
  };

  const nowLineLeft = msToPixels(now.getTime() - timelineStart.getTime());

  const handleProgramClick = (program: Program, channelId: string, channelName: string) => {
    setProgramPopup({ program, channelId, channelName });
  };

  const handleWatchChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setCurrentView('player');
  };

  if (displayChannels.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: '16px',
          color: 'var(--color-text-dim)',
        }}
      >
        <div style={{ fontSize: '40px' }}>📡</div>
        <div style={{ fontFamily: 'var(--font-main)', fontSize: '16px' }}>Loading channel guide...</div>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Fetching your favourite channels
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* EPG Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,45,120,0.2)',
          flexShrink: 0,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'Impact, var(--font-main)',
              fontSize: '18px',
              color: 'white',
              letterSpacing: '2px',
            }}
          >
            📺 TV GUIDE
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif' }}>
            Your personalised channel schedule
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!showAllChannels && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllChannels(true)}
              style={{
                background: 'rgba(255,45,120,0.08)',
                border: '1px solid rgba(255,45,120,0.4)',
                borderRadius: '4px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '900',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,45,120,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,45,120,0.08)'; }}
            >
              🌍 View all {hiddenCount.toLocaleString()} more channels
            </button>
          )}
          {showAllChannels && (
            <button
              onClick={() => setShowAllChannels(false)}
              style={{
                background: 'rgba(255,45,120,0.08)',
                border: '1px solid rgba(255,45,120,0.4)',
                borderRadius: '4px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '900',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,45,120,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,45,120,0.08)'; }}
            >
              🇬🇧🇺🇸 UK & US only
            </button>
          )}
          <div
            style={{
              background: 'rgba(255,45,120,0.1)',
              border: '1px solid var(--color-primary)',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '900',
              color: 'var(--color-primary)',
            }}
          >
            🕐 {formatTime(now)}
          </div>
        </div>
      </div>

      {/* Grid container with sticky columns */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div ref={scrollRef} style={{ overflowX: 'auto', overflowY: 'auto', height: '100%' }}>
          <div style={{ minWidth: `${CHANNEL_COL_WIDTH + (slotCount + 1) * SLOT_WIDTH}px` }}>

            {/* Time header row */}
            <div
              style={{
                display: 'flex',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'rgba(7,7,32,0.98)',
                borderBottom: '2px solid rgba(255,45,120,0.3)',
              }}
            >
              {/* Channel header cell */}
              <div
                style={{
                  width: `${CHANNEL_COL_WIDTH}px`,
                  flexShrink: 0,
                  height: '36px',
                  background: 'rgba(7,7,32,0.98)',
                  position: 'sticky',
                  left: 0,
                  zIndex: 11,
                  borderRight: '2px solid rgba(255,45,120,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  fontSize: '10px',
                  fontWeight: '900',
                  color: 'var(--color-text-dim)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Channel
              </div>

              {/* Time slots */}
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ display: 'flex' }}>
                  {slots.map((slot, i) => (
                    <div
                      key={i}
                      style={{
                        width: `${SLOT_WIDTH}px`,
                        flexShrink: 0,
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        borderLeft: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '12px',
                        fontWeight: '900',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      {formatTime(slot)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Channel rows */}
            <div style={{ position: 'relative' }}>
              {displayChannels.map((channel, rowIdx) => {
                const programs = getProgramsForChannel(channel.id);

                return (
                  <div
                    key={channel.id}
                    style={{
                      display: 'flex',
                      borderBottom: '1px solid rgba(255,45,120,0.1)',
                      height: `${CELL_HEIGHT}px`,
                    }}
                  >
                    {/* Channel name cell (sticky) */}
                    <div
                      style={{
                        width: `${CHANNEL_COL_WIDTH}px`,
                        flexShrink: 0,
                        background: rowIdx % 2 === 0 ? 'rgba(7,7,32,0.98)' : 'rgba(12,12,36,0.98)',
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        borderRight: '2px solid rgba(255,45,120,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleWatchChannel(channel.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,45,120,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowIdx % 2 === 0 ? 'rgba(7,7,32,0.98)' : 'rgba(12,12,36,0.98)';
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255,45,120,0.15)',
                          border: '1px solid rgba(255,45,120,0.3)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          flexShrink: 0,
                          fontWeight: '900',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {channel.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '900',
                          color: 'white',
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {channel.name}
                      </span>
                    </div>

                    {/* Programs area */}
                    <div
                      style={{
                        flex: 1,
                        position: 'relative',
                        background: rowIdx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Vertical slot lines */}
                      {slots.map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: `${i * SLOT_WIDTH}px`,
                            width: '1px',
                            background: 'rgba(255,255,255,0.04)',
                          }}
                        />
                      ))}

                      {/* Now line */}
                      {nowLineLeft > 0 && nowLineLeft < (slotCount + 1) * SLOT_WIDTH && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: `${nowLineLeft}px`,
                            width: '2px',
                            background: 'var(--color-primary)',
                            boxShadow: '0 0 6px var(--color-primary)',
                            zIndex: 3,
                          }}
                        />
                      )}

                      {/* Program cells */}
                      {programs.map((program) => {
                        const { left, width, isLive } = getProgramStyle(program);
                        return (
                          <div
                            key={program.id}
                            onClick={() => handleProgramClick(program, channel.id, channel.name)}
                            title={program.title}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              bottom: '4px',
                              left: `${left}px`,
                              width: `${width}px`,
                              background: isLive
                                ? 'linear-gradient(135deg, rgba(255,45,120,0.4), rgba(255,45,120,0.15))'
                                : 'rgba(255,255,255,0.06)',
                              border: isLive
                                ? '1px solid var(--color-primary)'
                                : '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '3px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              transition: 'all 0.15s ease',
                              zIndex: 2,
                              boxShadow: isLive ? '0 0 10px rgba(255,45,120,0.3)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isLive
                                ? 'linear-gradient(135deg, rgba(255,45,120,0.55), rgba(255,45,120,0.25))'
                                : 'rgba(255,45,120,0.15)';
                              e.currentTarget.style.borderColor = 'var(--color-primary)';
                              e.currentTarget.style.zIndex = '4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = isLive
                                ? 'linear-gradient(135deg, rgba(255,45,120,0.4), rgba(255,45,120,0.15))'
                                : 'rgba(255,255,255,0.06)';
                              e.currentTarget.style.borderColor = isLive
                                ? 'var(--color-primary)'
                                : 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.zIndex = '2';
                            }}
                          >
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: '900',
                                color: isLive ? 'var(--color-primary)' : 'white',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                lineHeight: '1.3',
                              }}
                            >
                              {isLive && (
                                <span
                                  style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    display: 'inline-block',
                                    marginRight: '4px',
                                    boxShadow: '0 0 4px var(--color-primary)',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              )}
                              {program.title}
                            </div>
                            {width > 100 && (
                              <div
                                style={{
                                  fontSize: '9px',
                                  color: 'rgba(255,255,255,0.4)',
                                  fontFamily: 'Arial, sans-serif',
                                  marginTop: '2px',
                                }}
                              >
                                {formatTime(program.startTime)}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {programs.length === 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '16px',
                            transform: 'translateY(-50%)',
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.2)',
                            fontFamily: 'Arial, sans-serif',
                          }}
                        >
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
