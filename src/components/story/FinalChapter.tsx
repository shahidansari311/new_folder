'use client';
import { useEffect, useState, useRef } from 'react';

export default function FinalChapter() {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const t = [
      setTimeout(() => { if (!cancelled) setPhase(1); }, 1000),
      setTimeout(() => { if (!cancelled) setPhase(2); }, 4000),
      setTimeout(() => { if (!cancelled) setPhase(3); }, 8000),
    ];
    return () => {
      cancelled = true;
      t.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    const hearts: {x:number;y:number;vy:number;size:number;opacity:number;color:string}[] = [];

    const spawn = () => {
      hearts.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vy: -(Math.random() * 1.5 + 0.5),
        size: Math.random() * 20 + 10,
        opacity: Math.random() * 0.5 + 0.4,
        color: ['#E8C06A', '#D4A574', '#C8D4E8', '#A855F7'][Math.floor(Math.random()*4)],
      });
    };

    const spawnInterval = setInterval(spawn, 300);

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hearts.forEach((h, i) => {
        h.y += h.vy;
        h.opacity -= 0.003;
        if (h.opacity <= 0 || h.y < -50) { hearts.splice(i, 1); return; }
        ctx.save();
        ctx.globalAlpha = h.opacity;
        ctx.fillStyle = h.color;
        ctx.font = `${h.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('💙', h.x, h.y);
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); clearInterval(spawnInterval); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #020617, #081326, #0B1437)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} aria-hidden />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '600px' }}>
        {/* Stars */}
        <div style={{
          fontSize: 'clamp(24px, 5vw, 48px)',
          marginBottom: '32px',
          animation: 'breathe 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 20px rgba(232,192,106,0.6))',
        }}>
          🌙✨💙
        </div>

        {phase >= 1 && (
          <div style={{ animation: 'fadeInUp 1s ease forwards', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Image Placeholder for Birthday Girl */}
            <div style={{
              width: '120px', height: '120px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(232,192,106,0.15), rgba(255,255,255,0.05))',
              border: '2px solid rgba(232,192,106,0.6)',
              boxShadow: '0 0 30px rgba(232,192,106,0.3)',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '40px', opacity: 0.8 }}>👸</span>
              {/* Add her photo here by uncommenting the img tag and putting the file in /public */}
              {/* <img src="/birthday-girl.jpg" alt="Birthday Girl" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} /> */}
            </div>

            <h1 style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 'clamp(36px, 8vw, 90px)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #E8C06A, #FFD700, #D4A574)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(232,192,106,0.5))',
              marginBottom: '16px',
            }}>
              Happy Birthday, Akanksha!
            </h1>
          </div>
        )}

        {phase >= 2 && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            color: 'rgba(200,212,232,0.85)',
            lineHeight: 1.9,
            marginBottom: '32px',
            animation: 'fadeInUp 1s ease 0.3s both',
          }}>
            Tum is universe ki moon ho.<br/>
            Sab kuch tumhare aas-paas hi ghoomta hai.<br/>
            Aur tumhari wajah se hi sab chamakta hai. 💙
          </p>
        )}

        {phase >= 3 && (
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 1s ease 0.6s both',
          }}>
            <button
              onClick={() => window.location.search = '?phase=story&chapter=memories'}
              style={{
                padding: '14px 32px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(200,212,232,0.8)',
                fontFamily: "'Cinzel', serif",
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(232,192,106,0.4)'; (e.target as HTMLElement).style.color = '#E8C06A'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.target as HTMLElement).style.color = 'rgba(200,212,232,0.8)'; }}
            >
              Revisit Memories
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '14px 32px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(232,192,106,0.25), rgba(212,165,116,0.15))',
                border: '1px solid rgba(232,192,106,0.4)',
                color: '#E8C06A',
                fontFamily: "'Cinzel', serif",
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
            >
              Start Over ✨
            </button>
          </div>
        )}

        {/* Moon glow behind */}
        <div style={{
          position: 'absolute',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(77,175,255,0.08), transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
          animation: 'breathe 5s ease-in-out infinite',
        }} />
      </div>
    </div>
  );
}
