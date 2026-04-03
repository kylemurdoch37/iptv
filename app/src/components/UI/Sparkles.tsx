import React, { useMemo } from 'react';

interface SparkleProps {
  count?: number;
}

interface SparkleItem {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  char: string;
}

const SPARKLE_CHARS = ['✦', '✧', '★', '✨', '⋆', '·', '✺', '❋'];

export const Sparkles: React.FC<SparkleProps> = ({ count = 20 }) => {
  const sparkles = useMemo<SparkleItem[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 8}s`,
      size: `${10 + Math.random() * 14}px`,
      char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
    }));
  }, [count]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {sparkles.map((s) => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: s.left,
            bottom: '-20px',
            fontSize: s.size,
            color: Math.random() > 0.5 ? 'var(--color-primary)' : 'var(--color-accent)',
            animation: `sparkle-float ${s.duration} ${s.delay} infinite linear`,
            opacity: 0,
            userSelect: 'none',
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
};

export const ConfettiExplosion: React.FC = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${1.5 + Math.random() * 1.5}s`,
      char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
      color: ['#ff2d78', '#00e5ff', '#ffd700', '#ff69b4', '#fff'][Math.floor(Math.random() * 5)],
      size: `${12 + Math.random() * 10}px`,
    }));
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '40%',
            left: p.left,
            fontSize: p.size,
            color: p.color,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-out forwards`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
};
