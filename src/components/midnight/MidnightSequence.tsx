'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: () => void;
}

type Scene =
  | 'freeze'
  | 'fade-black'
  | 'heartbeat'
  | 'spark'
  | 'spark-rise'
  | 'fireworks'
  | 'world-return'
  | 'lanterns'
  | 'title'
  | 'gift';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; life: number; opacity: number; gravity: number;
}

interface Firework {
  x: number; y: number; particles: Particle[];
  active: boolean;
}

interface Lantern {
  x: number; y: number; vy: number; vx: number;
  size: number; opacity: number; glow: number;
}

const FIREWORK_COLORS = ['#FFD700', '#E8C06A', '#C0C0C0', '#4DAFFF', '#B8B8E8', '#D4A574'];

export default function MidnightSequence({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene>('freeze');
  const [blackOpacity, setBlackOpacity] = useState(0);
  const [showHeartbeat, setShowHeartbeat] = useState(false);
  const [showSpark, setShowSpark] = useState(false);
  const [sparkY, setSparkY] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [titlePhase, setTitlePhase] = useState<'forming'|'glowing'|'dissolving'>('forming');
  const [showGift, setShowGift] = useState(false);
  const animRef = useRef<number>(0);
  const fireworksRef = useRef<Firework[]>([]);
  const lanternsRef = useRef<Lantern[]>([]);
  const starsRef = useRef<{x:number,y:number,r:number,opacity:number}[]>([]);
  const giftYRef = useRef(150);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Init star positions for title formation
    starsRef.current = Array.from({length: 200}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random(),
    }));

    // SEQUENCE
    // Scene 1: Freeze (already in freeze)
    setTimeout(() => {
      // Scene 2: Fade to black
      setScene('fade-black');
      setBlackOpacity(1);
    }, 1200);

    setTimeout(() => {
      setScene('heartbeat');
      setShowHeartbeat(true);
    }, 2500);

    setTimeout(() => {
      setShowHeartbeat(false);
      setScene('spark');
      setShowSpark(true);
      setSparkY(window.innerHeight - 100);
    }, 4200);

    // Spark rises
    setTimeout(() => setScene('spark-rise'), 4500);

    // Fireworks start
    setTimeout(() => {
      setBlackOpacity(0.3);
      setScene('fireworks');
      triggerFireworks(canvas);
    }, 6500);

    // World returns
    setTimeout(() => {
      setBlackOpacity(0);
      setScene('world-return');
    }, 9000);

    // Lanterns
    setTimeout(() => {
      setScene('lanterns');
      initLanterns(canvas);
    }, 11000);

    // Title (Happy Birthday Akanksha)
    setTimeout(() => {
      setScene('title');
      setShowTitle(true);
      setTitlePhase('forming');
    }, 14000);

    setTimeout(() => setTitlePhase('glowing'), 16500);

    setTimeout(() => setTitlePhase('dissolving'), 19000);

    setTimeout(() => {
      setShowTitle(false);
      setScene('gift');
      setShowGift(true);
    }, 21000);

    // Complete - move to gift experience
    setTimeout(() => onComplete(), 27000);
  }, [onComplete]);

  function triggerFireworks(canvas: HTMLCanvasElement) {
    const launchFirework = (delay: number) => {
      setTimeout(() => {
        const fw: Firework = {
          x: canvas.width * (0.2 + Math.random() * 0.6),
          y: canvas.height * (0.1 + Math.random() * 0.4),
          active: true,
          particles: Array.from({length: 120}, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
            return {
              x: 0, y: 0,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color,
              size: Math.random() * 3 + 1,
              life: 1,
              opacity: 1,
              gravity: 0.08,
            };
          }),
        };
        fireworksRef.current.push(fw);
      }, delay);
    };

    for (let i = 0; i < 12; i++) {
      launchFirework(i * 800 + Math.random() * 400);
    }
  }

  function initLanterns(canvas: HTMLCanvasElement) {
    lanternsRef.current = Array.from({length: 60}, (_, i) => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 200,
      vy: -(Math.random() * 1.2 + 0.4),
      vx: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 20 + 12,
      opacity: Math.random() * 0.4 + 0.5,
      glow: Math.random(),
    }));
  }

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let sparkYPos = window.innerHeight - 100;
    let sparkTrail: {x:number,y:number,opacity:number}[] = [];

    const draw = (ts: number) => {
      const t = ts * 0.001;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Spark animation
      if (scene === 'spark-rise' || scene === 'fireworks') {
        sparkYPos = Math.max(H * 0.15, sparkYPos - 5);
        sparkTrail.push({ x: W / 2 + Math.sin(ts * 0.05) * 3, y: sparkYPos, opacity: 1 });
        sparkTrail = sparkTrail.slice(-40);

        sparkTrail.forEach((p, i) => {
          const alpha = (i / sparkTrail.length) * 0.8;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y + (sparkTrail.length - i) * 1.5, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#E8C06A';
          ctx.shadowColor = '#E8C06A';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        });

        // Spark head
        ctx.save();
        ctx.beginPath();
        ctx.arc(W/2, sparkYPos, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
      }

      // Fireworks
      if (['fireworks', 'world-return', 'lanterns', 'title', 'gift'].includes(scene)) {
        fireworksRef.current.forEach(fw => {
          if (!fw.active) return;
          let allDead = true;
          fw.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.life -= 0.012;
            p.opacity = p.life;
            if (p.life > 0) allDead = false;

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(fw.x + p.x, fw.y + p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.size * 4;
            ctx.fill();
            ctx.restore();
          });
          if (allDead) fw.active = false;
        });
        fireworksRef.current = fireworksRef.current.filter(f => f.active || f.particles.length > 0);
      }

      // Lanterns
      if (['lanterns', 'title', 'gift'].includes(scene)) {
        lanternsRef.current.forEach(l => {
          l.y += l.vy;
          l.x += l.vx;
          l.glow = Math.sin(ts * 0.003 + l.x) * 0.3 + 0.7;
          if (l.y < -100) l.y = canvas.height + 50;

          ctx.save();
          ctx.globalAlpha = l.opacity * l.glow;

          // Lantern body
          const lg = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.size * 2);
          lg.addColorStop(0, 'rgba(232, 192, 106, 0.9)');
          lg.addColorStop(0.5, 'rgba(200, 140, 60, 0.5)');
          lg.addColorStop(1, 'transparent');
          ctx.fillStyle = lg;
          ctx.beginPath();
          ctx.ellipse(l.x, l.y, l.size, l.size * 1.4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Lantern glow
          const gg = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.size * 4);
          gg.addColorStop(0, 'rgba(255, 200, 80, 0.15)');
          gg.addColorStop(1, 'transparent');
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(l.x, l.y, l.size * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      // Gift
      if (scene === 'gift' || showGift) {
        giftYRef.current = Math.max(H * 0.3, giftYRef.current - 0.5);
        drawGift(ctx, W/2, giftYRef.current, t);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [scene, showGift]);

  return (
    <div id="midnight-sequence" style={{ position: 'fixed', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
      {/* Black overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#020617',
        opacity: blackOpacity,
        transition: 'opacity 1.5s ease',
        zIndex: 1,
      }} />

      {/* Canvas for effects */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Heartbeat */}
      {showHeartbeat && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,165,116,0.8), transparent)',
            animation: 'heartbeat-pulse 0.6s ease forwards',
          }} />
        </div>
      )}

      {/* Happy Birthday Title */}
      {showTitle && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '16px',
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(24px, 5vw, 72px)',
            color: '#F0F4FF',
            letterSpacing: '0.15em',
            textShadow: '0 0 40px rgba(77,175,255,0.8), 0 0 80px rgba(77,175,255,0.4)',
            opacity: titlePhase === 'dissolving' ? 0 : 1,
            transform: titlePhase === 'forming' ? 'scale(0.8)' : 'scale(1)',
            transition: 'all 2.5s cubic-bezier(0.16,1,0.3,1)',
            textAlign: 'center',
          }}>
            Happy Birthday
          </div>
          <div style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(36px, 8vw, 110px)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #E8C06A, #FFD700, #D4A574)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 30px rgba(232,192,106,0.7))',
            opacity: titlePhase === 'dissolving' ? 0 : 1,
            transform: titlePhase === 'forming' ? 'scale(0.7) translateY(20px)' : 'scale(1) translateY(0)',
            transition: 'all 3s cubic-bezier(0.16,1,0.3,1) 0.3s',
            textAlign: 'center',
          }}>
            Akanksha
          </div>
        </div>
      )}

      <style>{`
        @keyframes heartbeat-pulse {
          0% { transform: scale(0.5); opacity: 0; }
          40% { transform: scale(1.4); opacity: 0.9; }
          60% { transform: scale(0.9); }
          80% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function drawGift(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const w = 80, h = 70;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 0.5) * 0.03);

  // Box body
  const boxGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
  boxGrad.addColorStop(0, '#1a1060');
  boxGrad.addColorStop(1, '#0d0840');
  ctx.fillStyle = boxGrad;
  roundRect(ctx, -w/2, -h/2 + 15, w, h - 15, 8);
  ctx.fill();

  // Box lid
  const lidGrad = ctx.createLinearGradient(-w/2, -h/2, w/2, -h/2 + 15);
  lidGrad.addColorStop(0, '#2a1880');
  lidGrad.addColorStop(1, '#160d50');
  ctx.fillStyle = lidGrad;
  roundRect(ctx, -w/2 - 4, -h/2, w + 8, 20, 6);
  ctx.fill();

  // Golden ribbon horizontal
  ctx.fillStyle = '#E8C06A';
  ctx.fillRect(-w/2, -h/2 + 15, w, 8);

  // Golden ribbon vertical
  ctx.fillRect(-6, -h/2, 12, h);

  // Bow
  ctx.save();
  ctx.translate(0, -h/2 + 5);
  drawBow(ctx, t);
  ctx.restore();

  // Glow aura
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.8);
  glow.addColorStop(0, 'rgba(232,192,106,0.3)');
  glow.addColorStop(1, 'transparent');
  ctx.globalAlpha = 0.6 + 0.2 * Math.sin(t * 2);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBow(ctx: CanvasRenderingContext2D, t: number) {
  const swing = Math.sin(t * 1.5) * 3;
  ctx.fillStyle = '#E8C06A';
  // Left loop
  ctx.save();
  ctx.rotate(-0.3 + swing * 0.01);
  ctx.beginPath();
  ctx.ellipse(-14, -8, 14, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Right loop
  ctx.save();
  ctx.rotate(0.3 + swing * 0.01);
  ctx.beginPath();
  ctx.ellipse(14, -8, 14, 9, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Center knot
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD700';
  ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
