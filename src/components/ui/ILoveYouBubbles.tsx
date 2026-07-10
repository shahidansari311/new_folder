'use client';

import { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  left: number;
  size: number;
  text: string;
  duration: number;
  driftX: number;
  driftDuration: number;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  vx: number;
  vy: number;
  opacity: number;
}

const LOVE_PHRASES = [
  'I Love You ❤️',
  'Love youu 😙',
  'Always & Forever 🧿',
  'Mera Babu 🌸',
  'Cutie Mutie 🌼',
  'Sona Mona 💞',
  'Jaan-E-Jaan 🫂',
  'Meri Jaan 👑',
  'I Love You Moreee 🫶',
];

const COLORS = [
  'rgba(244, 63, 94, 0.15)',  // Rose
  'rgba(236, 72, 153, 0.15)', // Pink
  'rgba(168, 85, 247, 0.15)', // Purple
  'rgba(232, 192, 106, 0.15)', // Gold
];

export default function ILoveYouBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Periodically spawn new bubbles
    const spawnInterval = setInterval(() => {
      const id = Date.now() + Math.random();
      const newBubble: Bubble = {
        id,
        left: Math.random() * 90 + 5, // Keep away from extreme edges
        size: Math.random() * 60 + 80, // Size between 80px and 140px
        text: LOVE_PHRASES[Math.floor(Math.random() * LOVE_PHRASES.length)],
        duration: Math.random() * 12 + 10, // Rise time 10-22 seconds
        driftX: (Math.random() - 0.5) * 60, // Left-right drift in pixels
        driftDuration: Math.random() * 4 + 3, // Drift side-to-side duration
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };

      setBubbles(prev => [...prev, newBubble]);

      // Automatically clean up bubble after its lifetime
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== id));
      }, newBubble.duration * 1000 + 500);
    }, 2500);

    return () => clearInterval(spawnInterval);
  }, []);

  // Update particles positions
  useEffect(() => {
    if (particles.length === 0) return;

    const frame = requestAnimationFrame(function updatePhysics() {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.08, // Subtle gravity
            opacity: p.opacity - 0.02,
          }))
          .filter(p => p.opacity > 0)
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [particles]);

  const popBubble = (e: React.MouseEvent<HTMLDivElement>, bubble: Bubble) => {
    e.stopPropagation();

    // Get click position for spawning particles
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Spawn heart particles
    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const speed = Math.random() * 2 + 2;
      return {
        id: Date.now() + Math.random() + i,
        x: clickX,
        y: clickY,
        emoji: ['❤️', '💖', '✨', '🧿', '🫶'][Math.floor(Math.random() * 5)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Upward bias
        opacity: 1,
      };
    });

    setParticles(prev => [...prev, ...newParticles]);
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 90, // Above normal components, below cursor and overlays
        overflow: 'hidden',
      }}
    >
      {/* Floating Bubbles */}
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          onClick={(e) => popBubble(e, bubble)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const clickEvent = e as unknown as React.MouseEvent<HTMLDivElement>;
              popBubble(clickEvent, bubble);
            }
          }}
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25), ${bubble.color} 50%, rgba(255, 180, 200, 0.05) 100%)`,
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255,255,255,0.3)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto', // Allow clicking/popping individual bubbles
            userSelect: 'none',
            WebkitUserSelect: 'none',
            textAlign: 'center',
            padding: '12px',
            animation: `floatUp ${bubble.duration}s linear forwards, drift ${bubble.driftDuration}s ease-in-out infinite`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(10px, 1.5vw, 13px)',
              color: '#F0F4FF',
              fontWeight: 500,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              lineHeight: 1.2,
            }}
          >
            {bubble.text}
          </span>
        </div>
      ))}

      {/* Pop Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.x,
            top: p.y,
            fontSize: '18px',
            pointerEvents: 'none',
            opacity: p.opacity,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.05s linear',
            zIndex: 95,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Global CSS for Bubble Animations */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.9);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes drift {
          0%, 100% {
            margin-left: 0px;
          }
          50% {
            margin-left: 40px;
          }
        }
      `}</style>
    </div>
  );
}
