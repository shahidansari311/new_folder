'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  targetDate: Date;
  onComplete: () => void;
}

interface Digit {
  current: string;
  previous: string;
  animating: boolean;
}

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });

  useEffect(() => {
    const calc = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return { days, hours, minutes, seconds, done: false };
    };

    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function RollingDigit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  const [display, setDisplay] = useState(str);
  const [prev, setPrev] = useState(str);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (str !== display) {
      setPrev(display);
      setRolling(true);
      setTimeout(() => {
        setDisplay(str);
        setRolling(false);
      }, 400);
    }
  }, [str, display]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{
        position: 'relative',
        width: 'clamp(80px, 14vw, 160px)',
        height: 'clamp(90px, 16vw, 180px)',
        overflow: 'hidden',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Reflection overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          borderRadius: '16px',
          zIndex: 2,
        }} />

        {/* Previous digit - rolling out */}
        {rolling && (
          <div style={{
            position: 'absolute',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(48px, 9vw, 110px)',
            fontWeight: 300,
            color: '#F0F4FF',
            textShadow: '0 0 30px rgba(77,175,255,0.5)',
            animation: 'rollUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
            lineHeight: 1,
            zIndex: 1,
          }}>
            {prev}
          </div>
        )}

        {/* Current digit - rolling in */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 9vw, 110px)',
          fontWeight: 300,
          color: '#F0F4FF',
          textShadow: '0 0 30px rgba(77,175,255,0.4), 0 0 60px rgba(77,175,255,0.2)',
          animation: rolling ? 'rollDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          position: 'relative',
          zIndex: 1,
        }}>
          {display}
        </div>

        {/* Bottom line accent */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: '15%', right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(77,175,255,0.5), transparent)',
        }} />
      </div>

      <span style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 'clamp(8px, 1.2vw, 13px)',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'rgba(200,212,232,0.6)',
        fontWeight: 400,
      }}>
        {label}
      </span>
    </div>
  );
}

export default function CountdownPage({ targetDate, onComplete }: Props) {
  const { days, hours, minutes, seconds, done } = useCountdown(targetDate);
  const [frozen, setFrozen] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const triggered = useRef(false);

  // Fade in
  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  // When countdown done
  useEffect(() => {
    if (done && !triggered.current) {
      triggered.current = true;
      setFrozen(true);
      setTimeout(() => onComplete(), 1000);
    }
  }, [done, onComplete]);

  return (
    <div
      id="countdown-page"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transition: 'opacity 2s ease',
        padding: '24px',
      }}
    >
      {/* Cosmic subtle vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2,6,23,0.5) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Moon indicator text */}
      <p style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 'clamp(10px, 1.5vw, 13px)',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        color: 'rgba(200,212,232,0.45)',
        marginBottom: 'clamp(32px, 5vh, 64px)',
        fontWeight: 400,
      }}>
        12 September 2026
      </p>

      {/* Countdown glass panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(8px, 2vw, 24px)',
        padding: 'clamp(24px, 4vw, 48px)',
        borderRadius: '24px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glass shimmer */}
        <div style={{
          position: 'absolute',
          top: 0, left: '-100%',
          width: '50%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          animation: 'shimmer 8s ease infinite',
          pointerEvents: 'none',
        }} />

        <RollingDigit value={frozen ? 0 : days} label="Days" />
        <Separator />
        <RollingDigit value={frozen ? 0 : hours} label="Hours" />
        <Separator />
        <RollingDigit value={frozen ? 0 : minutes} label="Minutes" />
        <Separator />
        <RollingDigit value={frozen ? 0 : seconds} label="Seconds" />
      </div>

      {/* Subtitle */}
      <p style={{
        marginTop: 'clamp(32px, 5vh, 56px)',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(14px, 2vw, 20px)',
        fontStyle: 'italic',
        color: 'rgba(200,212,232,0.45)',
        letterSpacing: '0.05em',
        animation: 'breathe 4s ease-in-out infinite',
      }}>
        A special universe is waiting...
      </p>

      {/* Floating firefly accents */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px', height: '4px',
            borderRadius: '50%',
            background: '#E8C06A',
            boxShadow: '0 0 10px 3px rgba(232,192,106,0.6)',
            left: `${20 + i * 12}%`,
            top: `${40 + Math.sin(i) * 20}%`,
            animation: `float-slow ${6 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}

function Separator() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(8px, 2vw, 16px)',
      marginBottom: '28px',
    }}>
      {[0, 1].map(i => (
        <div
          key={i}
          style={{
            width: 'clamp(5px, 0.8vw, 8px)',
            height: 'clamp(5px, 0.8vw, 8px)',
            borderRadius: '50%',
            background: 'rgba(200,212,232,0.5)',
            boxShadow: '0 0 8px rgba(77,175,255,0.4)',
            animation: `twinkle ${2 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
