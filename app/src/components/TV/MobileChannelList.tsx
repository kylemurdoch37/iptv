import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

const US_UK = new Set(['us', 'gb', 'uk']);
function isUsUk(ch: { groupTitle: string; id: string; tvgId: string }): boolean {
  if (US_UK.has(ch.groupTitle.toLowerCase())) return true;
  if (ch.id.endsWith('.us') || ch.id.endsWith('.uk')) return true;
  if (ch.tvgId.endsWith('.us') || ch.tvgId.endsWith('.uk')) return true;
  return false;
}

export const MobileChannelList: React.FC = () => {
  const {
    channels, workingChannels, epgData,
    activeChannelId, setActiveChannelId, setCurrentView,
    showAllChannels, setShowAllChannels,
    allStreamsLoaded, setAllStreamsLoaded,
  } = useStore();

  const [search, setSearch] = useState('');

  const baseChannels = workingChannels.length > 0 ? workingChannels : channels;
  const filtered = showAllChannels ? baseChannels : baseChannels.filter(isUsUk);
  const displayed = search.trim()
    ? filtered.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : filtered;

  const hiddenCount = baseChannels.length - baseChannels.filter(isUsUk).length;
  const now = new Date();

  const getCurrentProgram = (channelId: string) => {
    const progs = epgData.get(channelId) || [];
    return progs.find((p) => p.startTime <= now && p.endTime > now);
  };

  const handleWatch = (channelId: string) => {
    setActiveChannelId(channelId);
    setCurrentView('player');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header bar */}
      <div
        style={{
          padding: '12px 16px 10px',
          borderBottom: '1px solid rgba(255,45,120,0.2)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Impact, var(--font-main)', fontSize: '16px', color: 'white', letterSpacing: '2px' }}>
            📺 TV GUIDE
          </h2>
          <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--color-primary)', fontFamily: 'var(--font-main)' }}>
            {displayed.length} channels
          </div>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,45,120,0.3)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Filter toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {!allStreamsLoaded && (
            <button
              onClick={() => { setShowAllChannels(true); setAllStreamsLoaded(true); }}
              style={{
                flex: 1,
                background: 'rgba(255,45,120,0.08)',
                border: '1px solid rgba(255,45,120,0.4)',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: '900',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              🌍 Load all channels
            </button>
          )}
          {allStreamsLoaded && !showAllChannels && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllChannels(true)}
              style={{
                flex: 1,
                background: 'rgba(255,45,120,0.08)',
                border: '1px solid rgba(255,45,120,0.4)',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: '900',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              🌍 +{hiddenCount.toLocaleString()} more
            </button>
          )}
          {allStreamsLoaded && showAllChannels && (
            <button
              onClick={() => setShowAllChannels(false)}
              style={{
                flex: 1,
                background: 'rgba(255,45,120,0.08)',
                border: '1px solid rgba(255,45,120,0.4)',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '11px',
                fontWeight: '900',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              🇬🇧🇺🇸 UK & US only
            </button>
          )}
        </div>
      </div>

      {/* Channel list */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {displayed.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
            {channels.length === 0 ? 'Loading channels...' : 'No channels found'}
          </div>
        ) : (
          displayed.map((channel) => {
            const isActive = channel.id === activeChannelId;
            const prog = getCurrentProgram(channel.id);

            return (
              <button
                key={channel.id + channel.streamUrl}
                onClick={() => handleWatch(channel.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(255,45,120,0.06))'
                    : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,45,120,0.08)',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                {/* Channel badge */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    background: isActive ? 'rgba(255,45,120,0.3)' : 'rgba(255,45,120,0.1)',
                    border: `2px solid ${isActive ? 'var(--color-primary)' : 'rgba(255,45,120,0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '900',
                    color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-main)',
                    boxShadow: isActive ? '0 0 12px rgba(255,45,120,0.4)' : 'none',
                  }}
                >
                  {channel.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '900',
                      fontFamily: 'var(--font-main)',
                      color: isActive ? 'var(--color-primary)' : 'white',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: 'var(--color-primary)', display: 'inline-block',
                          marginRight: '6px', verticalAlign: 'middle',
                          boxShadow: '0 0 6px var(--color-primary)',
                          animation: 'pulse-glow 1s infinite',
                        }}
                      />
                    )}
                    {channel.name}
                  </div>
                  {prog ? (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-dim)',
                        fontFamily: 'Arial, sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px',
                      }}
                    >
                      <span
                        style={{
                          background: 'var(--color-primary)',
                          color: 'white',
                          fontSize: '9px',
                          fontWeight: '900',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          marginRight: '6px',
                          letterSpacing: '0.5px',
                          verticalAlign: 'middle',
                        }}
                      >
                        LIVE
                      </span>
                      {prog.title}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>
                      Tap to watch
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <span style={{ fontSize: '16px', color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                  ›
                </span>
              </button>
            );
          })
        )}
        {/* Spacer for bottom nav */}
        <div style={{ height: '16px' }} />
      </div>
    </div>
  );
};
