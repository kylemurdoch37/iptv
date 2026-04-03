import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { useStore } from '../../store/useStore';

export const VideoPlayer: React.FC = () => {
  const { channels, activeChannelId, setActiveChannelId, setCurrentView, epgData } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const now = new Date();
  const getCurrentProgram = (channelId: string) => {
    const programs = epgData.get(channelId) || [];
    return programs.find((p) => p.startTime <= now && p.endTime > now);
  };
  const getNextProgram = (channelId: string) => {
    const programs = epgData.get(channelId) || [];
    return programs.find((p) => p.startTime > now);
  };

  const currentProgram = activeChannel ? getCurrentProgram(activeChannel.id) : null;
  const nextProgram = activeChannel ? getNextProgram(activeChannel.id) : null;

  const loadStream = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    // Cleanup old HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setError(null);
    setIsLoading(true);

    if (!url) {
      setError('No stream URL available for this channel. This is a demo build.');
      setIsLoading(false);
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(`Stream error: ${data.type}. Try another channel.`);
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        setError('Failed to load stream. Try another channel.');
        setIsLoading(false);
      }, { once: true });
    } else {
      // Fallback: try as direct src
      video.src = url;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeChannel) {
      loadStream(activeChannel.streamUrl);
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel, loadStream]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const switchChannel = (channelId: string) => {
    setActiveChannelId(channelId);
  };

  if (!activeChannel) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          color: 'var(--color-text-dim)',
        }}
      >
        <div style={{ fontSize: '48px' }}>📺</div>
        <div style={{ fontFamily: 'var(--font-main)', fontSize: '16px' }}>No channel selected</div>
        <button onClick={() => setCurrentView('epg')} className="btn-primary">
          Open TV Guide
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      {/* Video container */}
      <div
        id="video-container"
        style={{
          position: 'relative',
          flex: 1,
          background: '#000',
          cursor: showControls ? 'default' : 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        />

        {/* Loading spinner */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTop: '3px solid var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ color: 'var(--color-text-dim)', fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>
              Loading stream...
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && !isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.85)',
              flexDirection: 'column',
              gap: '16px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px' }}>📡</div>
            <div style={{ color: 'white', fontFamily: 'var(--font-main)', fontSize: '16px' }}>
              Stream Unavailable
            </div>
            <div style={{ color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif', fontSize: '13px', maxWidth: '400px' }}>
              {error}
            </div>
            <button onClick={() => loadStream(activeChannel.streamUrl)} className="btn-secondary" style={{ marginTop: '8px' }}>
              Try Again
            </button>
          </div>
        )}

        {/* Channel info overlay (top-left) */}
        {showControls && !error && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(7,7,32,0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,45,120,0.4)',
              borderRadius: '4px',
              padding: '10px 16px',
              transition: 'opacity 0.3s',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--color-secondary)', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              {activeChannel.name}
            </div>
            {currentProgram && (
              <div style={{ fontSize: '13px', color: 'white', fontFamily: 'var(--font-main)', marginBottom: '2px' }}>
                {currentProgram.title}
              </div>
            )}
            {nextProgram && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif' }}>
                Next: {nextProgram.title}
              </div>
            )}
          </div>
        )}

        {/* Back button */}
        {showControls && (
          <button
            onClick={() => setCurrentView('epg')}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(7,7,32,0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,45,120,0.4)',
              borderRadius: '4px',
              color: 'white',
              padding: '8px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
              fontSize: '11px',
              fontWeight: '900',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
            }}
          >
            ← Guide
          </button>
        )}

        {/* Controls bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(7,7,32,0.95))',
            padding: '40px 20px 16px',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 15px var(--color-glow)',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                flexShrink: 0,
              }}
            >
              {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{
                width: '80px',
                cursor: 'pointer',
                accentColor: 'var(--color-primary)',
              }}
            />

            {/* Channel info */}
            <div style={{ flex: 1, marginLeft: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--color-primary)' }}>
                {activeChannel.name}
              </div>
              {currentProgram && (
                <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif' }}>
                  {currentProgram.title}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                padding: '6px 10px',
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {isFullscreen ? '⊡' : '⊞'}
            </button>
          </div>
        </div>
      </div>

      {/* Channel strip below */}
      <div
        style={{
          background: 'rgba(7,7,32,0.95)',
          borderTop: '2px solid rgba(255,45,120,0.2)',
          padding: '10px',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {channels.map((ch) => {
            const isActive = ch.id === activeChannel.id;
            return (
              <button
                key={ch.id}
                onClick={() => switchChannel(ch.id)}
                style={{
                  background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isActive ? 'var(--color-primary)' : 'rgba(255,45,120,0.2)'}`,
                  borderRadius: '4px',
                  color: 'white',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-main)',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 0 15px rgba(255,45,120,0.4)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255,45,120,0.6)';
                    e.currentTarget.style.background = 'rgba(255,45,120,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255,45,120,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                {ch.name}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
