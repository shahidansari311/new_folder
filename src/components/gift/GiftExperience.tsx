'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  onComplete: () => void;
}

type GiftPhase = 'floating' | 'clicked' | 'opening' | 'blooming' | 'bouquet' | 'dissolving';

interface Petal {
  x: number; y: number; vx: number; vy: number;
  rotation: number; rotSpeed: number; size: number;
  color: string; life: number; opacity: number;
}

const PETAL_COLORS = ['#FFB6C1', '#FF69B4', '#FFC0CB', '#FFD4E1', '#F8A0B0', '#E8C06A'];

export default function GiftExperience({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<GiftPhase>('floating');
  const [giftClick, setGiftClick] = useState(false);
  const [showBouquet, setShowBouquet] = useState(false);
  const [lidAngle, setLidAngle] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [showInstruction, setShowInstruction] = useState(false);
  const animRef = useRef<number>(0);
  const petalsRef = useRef<Petal[]>([]);
  const timeRef = useRef(0);
  const giftYRef = useRef(0);
  const giftScaleRef = useRef(1);
  const lightRef = useRef(0);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
    setTimeout(() => setShowInstruction(true), 1500);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    giftYRef.current = H * 0.45;

    const spawnPetals = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        petalsRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed * (0.3 + Math.random()),
          vy: Math.sin(angle) * speed * (0.3 + Math.random()) - 2,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          size: Math.random() * 12 + 6,
          color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
          life: 1,
          opacity: 0.8 + Math.random() * 0.2,
        });
      }
    };

    const draw = (ts: number) => {
      const t = ts * 0.001;
      timeRef.current = t;
      ctx.clearRect(0, 0, W, H);

      const giftX = W / 2;
      let gy = giftYRef.current;

      if (phase === 'floating') {
        gy = H * 0.45 + Math.sin(t * 0.7) * 12;
      }
      if (phase === 'blooming' || phase === 'bouquet') {
        lightRef.current = Math.min(1, lightRef.current + 0.02);
      }

      // Draw golden light glow when opening
      if (phase === 'opening' || phase === 'blooming') {
        const glow = ctx.createRadialGradient(giftX, gy - 30, 0, giftX, gy - 30, 200 * lightRef.current);
        glow.addColorStop(0, `rgba(255, 200, 80, ${0.3 * lightRef.current})`);
        glow.addColorStop(0.5, `rgba(232, 192, 106, ${0.1 * lightRef.current})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(giftX, gy - 30, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      // Petals
      petalsRef.current = petalsRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.life -= 0.004;
        p.opacity = p.life;
        if (p.life <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // Ellipse petal
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();

        // Ripple when hitting lake
        if (p.y > H * 0.72) {
          ctx.save();
          ctx.globalAlpha = 0.1;
          ctx.strokeStyle = '#C8D4E8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(p.x, H * 0.74, 15, 5, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        return true;
      });

      // Draw the gift box
      ctx.save();
      ctx.translate(giftX, gy);
      ctx.scale(giftScaleRef.current, giftScaleRef.current);

      const giftW = 160, giftH = 130;

      // Water reflection
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.scale(1, -0.3);
      ctx.translate(0, -gy * 3.5);
      drawGiftBox(ctx, giftW, giftH, lidAngle, t, lightRef.current);
      ctx.restore();

      // Main gift
      drawGiftBox(ctx, giftW, giftH, lidAngle, t, lightRef.current);

      // Floating particles around gift
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.3;
        const px = Math.cos(angle) * (giftW * 0.7 + Math.sin(t + i) * 20);
        const py = Math.sin(angle) * (giftH * 0.4 + Math.cos(t + i) * 10) - 20;
        const pOpacity = 0.3 + 0.4 * Math.sin(t * 2 + i);
        ctx.save();
        ctx.globalAlpha = pOpacity;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#E8C06A';
        ctx.shadowColor = '#E8C06A';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // Flowers blooming
      if (phase === 'blooming') {
        drawBloomingFlowers(ctx, giftX, gy - giftH/2, t, lightRef.current);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, lidAngle]);

  const handleGiftClick = useCallback(() => {
    if (phase !== 'floating') return;
    setGiftClick(true);
    setShowInstruction(false);
    setPhase('clicked');

    // Bounce then open
    giftScaleRef.current = 0.95;
    setTimeout(() => { giftScaleRef.current = 1.05; }, 200);
    setTimeout(() => { giftScaleRef.current = 1; }, 400);

    // Start opening sequence
    setTimeout(() => {
      setPhase('opening');
      let angle = 0;
      const openInterval = setInterval(() => {
        angle = Math.min(angle + 3, 90);
        setLidAngle(angle);
        if (angle >= 90) {
          clearInterval(openInterval);
          lightRef.current = 0;
          setTimeout(() => {
            setPhase('blooming');
            setTimeout(() => {
              setPhase('bouquet');
              setShowBouquet(true);
            }, 3000);
          }, 500);
        }
      }, 30);
    }, 1200);
  }, [phase]);

  const handleBouquetClose = useCallback(() => {
    setShowBouquet(false);
    setPhase('dissolving');

    // Spawn lots of petals
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 80; i++) {
        setTimeout(() => {
          const cx = canvas.width / 2 + (Math.random() - 0.5) * 200;
          const cy = canvas.height * 0.45;
          petalsRef.current.push({
            x: cx, y: cy,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 5 - 2,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.15,
            size: Math.random() * 15 + 8,
            color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
            life: 1,
            opacity: 0.9,
          });
        }, i * 30);
      }
    }

    setTimeout(() => onComplete(), 3000);
  }, [onComplete]);

  return (
    <div id="gift-experience" style={{ position: 'fixed', inset: 0, zIndex: 15, opacity, transition: 'opacity 1.5s ease' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Clickable gift area */}
      {(phase === 'floating' || phase === 'clicked') && (
        <div
          role="button"
          aria-label="Open the birthday gift"
          tabIndex={0}
          onClick={handleGiftClick}
          onKeyDown={e => e.key === 'Enter' && handleGiftClick()}
          style={{
            position: 'absolute',
            left: '50%', top: '45%',
            transform: 'translate(-50%, -50%)',
            width: '200px', height: '160px',
            cursor: 'pointer',
            zIndex: 2,
            borderRadius: '12px',
          }}
        />
      )}

      {/* Instruction */}
      {showInstruction && (
        <p style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(14px, 2vw, 20px)',
          fontStyle: 'italic',
          color: 'rgba(200,212,232,0.6)',
          letterSpacing: '0.05em',
          zIndex: 3,
          animation: 'breathe 3s ease-in-out infinite',
          textAlign: 'center',
        }}>
          Click to unwrap your gift...
        </p>
      )}

      {/* Bouquet Modal */}
      {showBouquet && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(2,6,23,0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 1s ease forwards',
        }}>
          <div style={{
            position: 'relative',
            width: 'min(720px, 94vw)',
            padding: '24px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #E8C06A, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '4px',
              }}>
                A Bouquet For You 💐
              </h2>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '15px',
                fontStyle: 'italic',
                color: 'rgba(200,212,232,0.8)',
                lineHeight: '1.4',
              }}>
                Dear Love, I miss you very much and love you 🥺 <br />
                <span style={{ fontSize: '12px', opacity: 0.6 }}>— Sincerely, Shahid</span>
              </p>
            </div>

            {/* Embedded Bouquet */}
            <div style={{
              width: '100%',
              height: 'clamp(350px, 55vh, 500px)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#FAF6EE',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15)',
            }}>
              <iframe
                src="https://digibouquet.vercel.app/bouquet/968ae890-66dc-4b9c-8f5e-4351ceca3da7"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="A Bouquet for Akanksha"
              />
            </div>

            <button
              onClick={handleBouquetClose}
              style={{
                alignSelf: 'center',
                padding: '12px 32px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #E8C06A, #D4A574)',
                border: 'none',
                color: '#020617',
                fontFamily: "'Cinzel', serif",
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(232,192,106,0.3)',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'none'; }}
            >
              Continue the Journey ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function drawGiftBox(
  ctx: CanvasRenderingContext2D,
  giftW: number, giftH: number,
  lidAngle: number, t: number, lightIntensity: number
) {
  const hw = giftW / 2, hh = giftH / 2;

  // Box shadow
  ctx.save();
  ctx.globalAlpha = 0.3;
  const shadowG = ctx.createRadialGradient(0, hh + 20, 0, 0, hh + 20, giftW * 0.7);
  shadowG.addColorStop(0, 'rgba(0,0,0,0.5)');
  shadowG.addColorStop(1, 'transparent');
  ctx.fillStyle = shadowG;
  ctx.beginPath();
  ctx.ellipse(0, hh + 15, giftW * 0.6, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  const bodyG = ctx.createLinearGradient(-hw, -hh + 30, hw, hh);
  bodyG.addColorStop(0, '#1e1270');
  bodyG.addColorStop(0.5, '#140e50');
  bodyG.addColorStop(1, '#0a0830');
  ctx.fillStyle = bodyG;
  ctx.save();
  roundRect2(ctx, -hw, -hh + 30, giftW, giftH - 30, 10);
  ctx.fill();
  ctx.restore();

  // Golden ribbon horizontal
  ctx.fillStyle = '#E8C06A';
  ctx.fillRect(-hw, -hh + 40, giftW, 12);

  // Golden ribbon vertical
  ctx.fillRect(-10, -hh + 30, 20, giftH - 30);

  // Light escaping through lid gap
  if (lightIntensity > 0) {
    ctx.save();
    ctx.globalAlpha = lightIntensity * 0.6;
    const escapeGlow = ctx.createLinearGradient(0, -hh + 28, 0, -hh + 35);
    escapeGlow.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
    escapeGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = escapeGlow;
    ctx.fillRect(-hw, -hh + 28, giftW, 8);
    ctx.restore();
  }

  // Lid with opening animation
  ctx.save();
  ctx.translate(0, -hh + 30);
  ctx.rotate(-(lidAngle * Math.PI / 180));

  const lidG = ctx.createLinearGradient(-hw - 6, 0, hw + 6, -22);
  lidG.addColorStop(0, '#2e1ea0');
  lidG.addColorStop(1, '#1a1060');
  ctx.fillStyle = lidG;
  roundRect2(ctx, -hw - 6, -22, giftW + 12, 24, 8);
  ctx.fill();

  // Lid ribbon
  ctx.fillStyle = '#E8C06A';
  ctx.fillRect(-hw - 6, -10, giftW + 12, 8);
  ctx.fillRect(-10, -22, 20, 22);

  // Bow on lid
  ctx.translate(0, -22);
  drawBow2(ctx, t);
  ctx.restore();
}

function drawBow2(ctx: CanvasRenderingContext2D, t: number) {
  const sway = Math.sin(t * 1.2) * 2;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath(); ctx.ellipse(-18 + sway, -10, 18, 11, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(18 + sway, -10, 18, 11, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sway * 0.5, -4, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#E8C06A'; ctx.fill();
}

function drawBloomingFlowers(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, t: number, progress: number
) {
  const flowers = [
    { dx: -60, dy: -20, color: '#FF69B4', r: 30 },
    { dx: 0, dy: -40, color: '#FFD4E1', r: 35 },
    { dx: 60, dy: -15, color: '#FFB6C1', r: 28 },
    { dx: -30, dy: -60, color: '#E8C06A', r: 22 },
    { dx: 30, dy: -55, color: '#FF69B4', r: 25 },
  ];

  flowers.forEach((f, idx) => {
    const bloom = Math.max(0, Math.min(1, progress * 3 - idx * 0.3));
    if (bloom <= 0) return;

    ctx.save();
    ctx.translate(x + f.dx, y + f.dy);
    ctx.scale(bloom, bloom);
    ctx.rotate(t * 0.2 + idx);

    // Petals
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i / 6) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(0, -f.r * 0.6, f.r * 0.3, f.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.globalAlpha = 0.85 * bloom;
      ctx.fill();
      ctx.restore();
    }

    // Center
    ctx.beginPath();
    ctx.arc(0, 0, f.r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.globalAlpha = 1 * bloom;
    ctx.fill();

    ctx.restore();
  });
}

function roundRect2(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
