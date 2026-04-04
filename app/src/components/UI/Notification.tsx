import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Notification as NotificationType } from '../../types';

interface NotificationItemProps {
  notification: NotificationType;
  onDismiss: () => void;
  onWatch: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  onWatch,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 30000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      style={{
        background: 'rgba(7,7,32,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '2px solid var(--color-primary)',
        borderRadius: '4px',
        padding: '16px 20px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 0 30px var(--color-glow), 0 8px 32px rgba(0,0,0,0.8)',
        animation: 'slide-in-top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--color-primary), var(--color-secondary), transparent)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>📺</span>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-secondary)',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '4px',
            }}
          >
            Now Live ✦
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'white',
              lineHeight: '1.5',
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
            }}
          >
            {notification.message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            marginLeft: 'auto',
            flexShrink: 0,
            lineHeight: '1',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onWatch}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          Watch Now ✨
        </button>
        <button
          onClick={onDismiss}
          className="btn-ghost"
          style={{ padding: '8px 14px', fontSize: '12px' }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification, setActiveChannelId, setCurrentView } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '420px',
        padding: '0 16px',
      }}
    >
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onDismiss={() => removeNotification(notif.id)}
          onWatch={() => {
            setActiveChannelId(notif.channelId);
            setCurrentView('player');
            removeNotification(notif.id);
          }}
        />
      ))}
    </div>
  );
};
