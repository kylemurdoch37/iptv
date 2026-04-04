import React from 'react';
import { useStore } from '../../store/useStore';
import { shows } from '../../data/showMappings';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const Sidebar: React.FC = () => {
  const { isMobile } = useBreakpoint();
  const { channels, workingChannels, activeChannelId, setActiveChannelId, setCurrentView, profile, epgData } = useStore();

  // On mobile, the sidebar is replaced by BottomNav + MobileChannelList
  if (isMobile) return null;
  const displayChannels = workingChannels.length > 0 ? workingChannels : channels;

  const now = new Date();

  const getCurrentProgram = (channelId: string) => {
    const programs = epgData.get(channelId) || [];
    return programs.find((p) => p.startTime <= now && p.endTime > now);
  };

  const favouriteShows = shows.filter((s) => profile.favouriteShowIds.includes(s.id));
  const favouriteChannelNames = new Set<string>();
  for (const show of favouriteShows) {
    for (const ch of show.channels) {
      favouriteChannelNames.add(ch.toLowerCase());
    }
  }

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    setCurrentView('player');
  };

  return (
    <aside
      style={{
        width: '250px',
        flexShrink: 0,
        background: 'rgba(7,7,32,0.8)',
        backdropFilter: 'blur(10px)',
        borderRight: '2px solid rgba(255,45,120,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {/* My Channels section */}
      <div style={{ padding: '16px 12px 8px' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--color-primary)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>💅</span> My Channels
        </div>

        {displayChannels.length === 0 ? (
          <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', padding: '8px 0' }}>
            Loading channels...
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {displayChannels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              const currentProg = getCurrentProgram(channel.id);

              return (
                <button
                  key={channel.id}
                  onClick={() => handleChannelClick(channel.id)}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(255,45,120,0.3), rgba(255,45,120,0.1))'
                      : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isActive ? 'var(--color-primary)' : 'rgba(255,45,120,0.15)'}`,
                    borderRadius: '4px',
                    color: 'white',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-main)',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 0 15px rgba(255,45,120,0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255,45,120,0.5)';
                      e.currentTarget.style.background = 'rgba(255,45,120,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255,45,120,0.15)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '900',
                      color: isActive ? 'var(--color-primary)' : 'white',
                      marginBottom: currentProg ? '4px' : '0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                          display: 'inline-block',
                          animation: 'pulse-glow 1s infinite',
                          boxShadow: '0 0 6px var(--color-primary)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {channel.name}
                  </div>
                  {currentProg && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'var(--color-text-dim)',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {currentProg.title}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Browse Categories */}
      <div style={{ padding: '16px 12px 8px', borderTop: '1px solid rgba(255,45,120,0.15)' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--color-secondary)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>✨</span> Categories
        </div>

        {['Reality', 'Drama', 'Soap', 'Music', 'Entertainment', 'Food'].map((cat) => (
          <div
            key={cat}
            style={{
              padding: '8px 10px',
              fontSize: '11px',
              fontWeight: '900',
              color: 'var(--color-text-dim)',
              cursor: 'pointer',
              borderRadius: '4px',
              marginBottom: '2px',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-secondary)';
              e.currentTarget.style.background = 'rgba(0,229,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-dim)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {cat}
          </div>
        ))}
      </div>
    </aside>
  );
};
