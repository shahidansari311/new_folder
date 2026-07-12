'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import MagicCursor from '@/components/ui/MagicCursor';

// Dynamic imports for performance
const UniverseCanvas = dynamic(() => import('@/components/background/UniverseCanvas'), { ssr: false });
const CountdownPage = dynamic(() => import('@/components/countdown/CountdownPage'), { ssr: false });
const MidnightSequence = dynamic(() => import('@/components/midnight/MidnightSequence'), { ssr: false });
const GiftExperience = dynamic(() => import('@/components/gift/GiftExperience'), { ssr: false });
const ForestWalk = dynamic(() => import('@/components/door/ForestWalk'), { ssr: false });
const StoryEngine = dynamic(() => import('@/components/story/StoryEngine'), { ssr: false });
const FadeOverlay = dynamic(() => import('@/components/ui/FadeOverlay'), { ssr: false });
const ILoveYouBubbles = dynamic(() => import('@/components/ui/ILoveYouBubbles'), { ssr: false });
const HappyBirthdayTag = dynamic(() => import('@/components/ui/HappyBirthdayTag'), { ssr: false });
const AudioManager = dynamic(() => import('@/components/ui/AudioManager'), { ssr: false });
const MusicControl = dynamic(() => import('@/components/ui/MusicControl'), { ssr: false });

// Experience phases
export type Phase =
  | 'enter'
  | 'countdown'
  | 'midnight'
  | 'gift'
  | 'forest-walk'
  | 'door'
  | 'story';

export default function UniversePage() {
  // ⚡ SET TO true TO TEST AS IF IT'S THE BIRTHDAY — set false before deploying!
  const DEV_TESTING = false;

  const now = new Date();
  // 12 September 2026 00:00:00 local time
  const BIRTHDAY = DEV_TESTING
    ? new Date(Date.now() + 10_000) // 10 seconds from now for testing
    : new Date('2026-09-12T00:00:00');
  const BIRTHDAY_END = new Date('2026-09-13T00:00:00');
  const isBirthday = !DEV_TESTING && (now >= BIRTHDAY && now <= BIRTHDAY_END);

  const [phase, setPhase] = useState<Phase>('enter');
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [muted, setMuted] = useState(false);
  const [enterReady, setEnterReady] = useState(false);
  const [enterFading, setEnterFading] = useState(false);

  // Fade in the enter screen
  useEffect(() => {
    const t = setTimeout(() => setEnterReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  // For dev/testing: allow URL param to skip to phase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const devPhase = params.get('phase') as Phase | null;
    if (devPhase) setPhase(devPhase);
  }, []);

  function transitionTo(nextPhase: Phase, delay = 0) {
    setFadeOpacity(1);
    setTimeout(() => {
      setPhase(nextPhase);
      setTimeout(() => setFadeOpacity(0), 400);
    }, 700 + delay);
  }

  // Enter button click — unlocks audio & starts experience
  const handleEnter = useCallback(() => {
    if (enterFading) return;
    setEnterFading(true);
    // Short delay so the fade-out animation plays, then transition
    setTimeout(() => {
      setPhase(isBirthday ? 'midnight' : 'countdown');
    }, 1200);
  }, [isBirthday, enterFading]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SONG MAPPING:
     
     • countdown phase  → countdown song (dreamy/anticipatory)
     • midnight phase   → birthday song (celebratory/magical)  
     • gift + beyond    → ambient song (single song for the rest)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const isCountdown = phase === 'countdown';
  const isMidnight = phase === 'midnight';
  const isRestOfExperience = phase !== 'enter' && !isCountdown && !isMidnight;

  return (
    <main
      id="universe-root"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#020617' }}
    >
      {/* Living background universe - always rendered */}
      <UniverseCanvas phase={phase === 'enter' ? 'countdown' : phase} />

      {/* ━━━ ENTER SCREEN ━━━ */}
      {phase === 'enter' && (
        <div
          id="enter-screen"
          onClick={handleEnter}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: enterFading ? 0 : enterReady ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Radial glow behind */}
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(77,175,255,0.08) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)',
            animation: 'breathe 5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Moon crescent */}
          <div style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            marginBottom: '32px',
            filter: 'drop-shadow(0 0 30px rgba(232,192,106,0.5))',
            animation: 'float-slow 6s ease-in-out infinite',
          }}>
            🌙
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(12px, 2vw, 18px)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(200,212,232,0.5)',
            fontWeight: 400,
            marginBottom: '48px',
          }}>
            A Universe Awaits
          </h1>

          {/* Enter button */}
          <button
            id="enter-button"
            style={{
              padding: '16px 48px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(200,212,232,0.8)',
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(10px, 1.3vw, 13px)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              animation: 'pulse-glow-subtle 3s ease-in-out infinite',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(232,192,106,0.4)';
              el.style.color = '#E8C06A';
              el.style.transform = 'scale(1.05)';
              el.style.boxShadow = '0 8px 40px rgba(232,192,106,0.2), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(255,255,255,0.12)';
              el.style.color = 'rgba(200,212,232,0.8)';
              el.style.transform = 'scale(1)';
              el.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)';
            }}
          >
            Enter ✨
          </button>

          {/* Volume hint */}
          <div style={{
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '9999px',
            background: 'rgba(232,192,106,0.06)',
            border: '1px solid rgba(232,192,106,0.15)',
          }}>
            <span style={{ fontSize: '16px' }}>🔊</span>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(9px, 1.1vw, 12px)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(232,192,106,0.7)',
              fontWeight: 400,
            }}>
              Please keep your volume high
            </span>
          </div>

          {/* Hint */}
          <p style={{
            marginTop: '20px',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(11px, 1.2vw, 14px)',
            fontStyle: 'italic',
            color: 'rgba(200,212,232,0.3)',
            letterSpacing: '0.05em',
            animation: 'breathe 4s ease-in-out infinite',
          }}>
            tap anywhere to begin
          </p>

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: i % 2 === 0 ? '#E8C06A' : 'rgba(77,175,255,0.8)',
                boxShadow: `0 0 8px ${i % 2 === 0 ? 'rgba(232,192,106,0.5)' : 'rgba(77,175,255,0.4)'}`,
                left: `${15 + i * 17}%`,
                top: `${30 + Math.sin(i * 1.5) * 25}%`,
                animation: `float-slow ${5 + i * 1.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.6}s`,
                opacity: 0.6,
                pointerEvents: 'none',
              }}
            />
          ))}

          <style>{`
            @keyframes pulse-glow-subtle {
              0%, 100% { box-shadow: 0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08); }
              50% { box-shadow: 0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px rgba(232,192,106,0.1); }
            }
          `}</style>
        </div>
      )}

      {/* Global interactive love bubbles floating in background */}
      {phase !== 'enter' && phase !== 'countdown' && <ILoveYouBubbles />}

      {/* Happy Birthday tag centered at top after countdown ends */}
      {phase !== 'enter' && phase !== 'countdown' && <HappyBirthdayTag />}

      {/* ━━━ AUDIO LAYER ━━━ */}
      {/* Song 1: Countdown — plays only during countdown */}
      <AudioManager
        songKey="countdown"
        playing={isCountdown && !muted}
        volume={0.4}
        fadeDuration={800}
        loop={true}
      />

      {/* Song 2: Birthday — plays during midnight sequence */}
      <AudioManager
        songKey="birthday"
        playing={isMidnight && !muted}
        volume={0.5}
        fadeDuration={2000}
        loop={true}
      />

      {/* Song 3: Ambient — plays for the entire rest of the experience */}
      <AudioManager
        songKey="ambient"
        playing={isRestOfExperience && !muted}
        volume={0.35}
        fadeDuration={3000}
        loop={true}
      />

      {/* Floating music mute/unmute toggle */}
      {phase !== 'enter' && <MusicControl muted={muted} onToggle={toggleMute} />}

      {/* Experience layers */}
      {phase === 'countdown' && (
        <CountdownPage
          targetDate={BIRTHDAY}
          onComplete={() => transitionTo('midnight')}
        />
      )}

      {phase === 'midnight' && (
        <MidnightSequence
          onComplete={() => transitionTo('gift', 800)}
        />
      )}

      {phase === 'gift' && (
        <GiftExperience
          onComplete={() => transitionTo('forest-walk', 500)}
        />
      )}

      {(phase === 'forest-walk' || phase === 'door') && (
        <ForestWalk
          phase={phase}
          onDoorReached={() => setPhase('door')}
          onUnlocked={() => transitionTo('story', 1200)}
        />
      )}

      {phase === 'story' && <StoryEngine />}

      {/* Global fade overlay for transitions */}
      <FadeOverlay opacity={fadeOpacity} />

      {/* Premium custom cursor */}
      <MagicCursor />
    </main>
  );
}
