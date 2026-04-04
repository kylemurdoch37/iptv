import React, { useState } from 'react';
import { shows } from '../../data/showMappings';
import { useStore } from '../../store/useStore';

interface ShowSelectorStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const ShowSelectorStep: React.FC<ShowSelectorStepProps> = ({ onNext, onBack }) => {
  const { profile, setProfile } = useStore();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(profile.favouriteShowIds)
  );
  const [filter, setFilter] = useState<string>('All');

  const genres = ['All', ...Array.from(new Set(shows.map((s) => s.genre)))];

  const filteredShows = filter === 'All' ? shows : shows.filter((s) => s.genre === filter);

  const toggleShow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const handleNext = () => {
    setProfile({ favouriteShowIds: Array.from(selected) });
    onNext();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1,
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '900px', width: '100%' }} className="animate-fade-in">
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                background: step <= 3 ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                boxShadow: step <= 3 ? '0 0 8px var(--color-primary)' : 'none',
              }}
            />
          ))}
        </div>

        <h2
          style={{
            fontFamily: 'Impact, var(--font-main)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            textAlign: 'center',
            marginBottom: '6px',
            color: 'white',
          }}
        >
          Pick your{' '}
          <span style={{ color: 'var(--color-primary)' }}>faves</span>{' '}
          ✨
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontFamily: 'Arial, sans-serif', marginBottom: '20px', fontSize: '14px' }}>
          Select shows and we'll build your personal channel guide
          {selected.size > 0 && (
            <span style={{ color: 'var(--color-primary)', marginLeft: '8px' }}>
              · {selected.size} selected
            </span>
          )}
        </p>

        {/* Genre filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setFilter(genre)}
              style={{
                padding: '6px 14px',
                background: filter === genre ? 'var(--color-secondary)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${filter === genre ? 'var(--color-secondary)' : 'rgba(0,229,255,0.2)'}`,
                borderRadius: '20px',
                color: filter === genre ? 'var(--color-bg)' : 'var(--color-secondary)',
                fontFamily: 'var(--font-main)',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Show grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          {filteredShows.map((show) => {
            const isSelected = selected.has(show.id);
            return (
              <button
                key={show.id}
                onClick={() => toggleShow(show.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(255,45,120,0.08))'
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'rgba(255,45,120,0.2)'}`,
                  borderRadius: '6px',
                  padding: '16px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 0 20px rgba(255,45,120,0.3), inset 0 0 20px rgba(255,45,120,0.05)' : 'none',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255,45,120,0.6)';
                    e.currentTarget.style.background = 'rgba(255,45,120,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255,45,120,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Checkmark overlay */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      boxShadow: '0 0 10px var(--color-primary)',
                      animation: 'bounce-in 0.3s ease',
                    }}
                  >
                    ✓
                  </div>
                )}

                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{show.emoji}</div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '900',
                    color: isSelected ? 'var(--color-primary)' : 'white',
                    marginBottom: '6px',
                    lineHeight: '1.3',
                    fontFamily: 'var(--font-main)',
                  }}
                >
                  {show.name}
                </div>
                <span className="genre-tag">{show.genre}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onBack} className="btn-ghost">
            ← Back
          </button>
          <button onClick={handleNext} className="btn-primary" disabled={selected.size === 0}>
            {selected.size === 0 ? 'Pick at least one 💖' : `Done (${selected.size} shows) →`}
          </button>
        </div>
      </div>
    </div>
  );
};
