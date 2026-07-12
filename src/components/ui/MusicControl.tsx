'use client';

import { useState, useEffect } from 'react';

interface MusicControlProps {
  muted: boolean;
  onToggle: () => void;
}

/**
 * A floating, premium glass music toggle button (bottom-right corner).
 * Shows an animated sound wave when playing, a muted icon when silent.
 */
export default function MusicControl({ muted, onToggle }: MusicControlProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      id="music-toggle"
      onClick={onToggle}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        opacity: visible ? 0.8 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.5)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,192,106,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.opacity = '0.8';
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
      }}
    >
      {/* Sound wave bars or mute icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5px',
        width: '24px',
        height: '24px',
        position: 'relative',
      }}>
        {muted ? (
          // Muted icon — speaker with X
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(200,212,232,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(200,212,232,0.15)" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          // Sound wave bars — animated
          <>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: '3px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(180deg, #E8C06A, #D4A574)',
                  animation: `soundBar ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s`,
                  height: '14px',
                  transformOrigin: 'center',
                }}
              />
            ))}
          </>
        )}
      </div>

      <style>{`
        @keyframes soundBar {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </button>
  );
}
