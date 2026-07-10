'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Phase } from '@/app/page';

interface Props {
  phase: Phase;
  onDoorReached: () => void;
  onUnlocked: () => void;
}

type WalkPhase = 'walk' | 'gate' | 'door' | 'lock-zoom' | 'password' | 'unlocking' | 'open';

interface FireflyGuide {
  x: number; y: number; tx: number; ty: number;
  glow: number; glowDir: number; speed: number;
  waiting: boolean; waitTimer: number;
}

// Pre-calculate natural, non-repeating positions for forest elements
const TREES_LEFT = Array.from({ length: 7 }, (_, i) => ({
  x: 0.02 + Math.random() * 0.15,
  h: 0.45 + Math.random() * 0.15,
  swaySpeed: 0.3 + Math.random() * 0.3
}));
const TREES_RIGHT = Array.from({ length: 7 }, (_, i) => ({
  x: 0.75 + Math.random() * 0.2,
  h: 0.45 + Math.random() * 0.15,
  swaySpeed: 0.3 + Math.random() * 0.3
}));
const GROUND_PATCHES = Array.from({ length: 10 }, (_, i) => ({
  xOffset: (Math.random() - 0.5) * 30,
  y: 0.6 + Math.random() * 0.35,
  w: 30 + Math.random() * 30
}));
const WILL_O_WISPS = Array.from({ length: 8 }, (_, i) => ({
  x: 0.35 + Math.random() * 0.3,
  y: 0.6 + Math.random() * 0.3,
  speed: 1 + Math.random() * 2,
  phase: Math.random() * Math.PI * 2
}));

export default function ForestWalk({ phase: experiencePhase, onDoorReached, onUnlocked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [walkPhase, setWalkPhase] = useState<WalkPhase>('walk');
  const [opacity, setOpacity] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [lockUnlocking, setLockUnlocking] = useState(false);
  const [doorSwungOpen, setDoorSwungOpen] = useState(false);
  const [lockHover, setLockHover] = useState(false);

  const cameraXRef = useRef(0);
  const animRef = useRef<number>(0);
  const firefliesRef = useRef<FireflyGuide[]>([]);
  const pathProgressRef = useRef(0);
  const startTimeRef = useRef(0);

  // Keep latest callbacks in refs so the mount effect never needs to re-run
  // just because the parent re-rendered with new function identities.
  const onDoorReachedRef = useRef(onDoorReached);
  const onUnlockedRef = useRef(onUnlocked);
  const unlockedFiredRef = useRef(false);
  useEffect(() => { onDoorReachedRef.current = onDoorReached; }, [onDoorReached]);
  useEffect(() => { onUnlockedRef.current = onUnlocked; }, [onUnlocked]);

  // ---- One-time mount setup: fade in, size canvas, seed fireflies, run the
  // walk -> gate -> door timeline exactly once. ----
  useEffect(() => {
    let cancelled = false;
    setTimeout(() => setOpacity(1), 200);
    startTimeRef.current = Date.now();

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      firefliesRef.current = Array.from({ length: 8 }, (_, i) => ({
        x: canvas.width * 0.3 + i * 30,
        y: canvas.height * 0.5,
        tx: canvas.width * 0.3 + i * 30,
        ty: canvas.height * 0.5,
        glow: Math.random(),
        glowDir: 1,
        speed: 0.02 + Math.random() * 0.01,
        waiting: false,
        waitTimer: 0,
      }));
    }

    const t1 = setTimeout(() => {
      if (cancelled) return;
      setWalkPhase('gate');
    }, 8000);

    const t2 = setTimeout(() => {
      if (cancelled) return;
      setWalkPhase('door');
      onDoorReachedRef.current();
    }, 12000);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []); // <-- runs once, no matter how many times the parent re-renders

  // ---- Background canvas: forest path + approaching gate + fireflies.
  // No longer depends on door-open state, so it never restarts mid-unlock. ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = (ts: number) => {
      const t = ts * 0.001;

      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      const elapsed = Date.now() - startTimeRef.current;
      const easeOutQuad = (p: number) => p * (2 - p);
      const easeInOutQuad = (p: number) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);

      if (walkPhase === 'walk') {
        const p = Math.min(1, elapsed / 8000);
        cameraXRef.current = easeInOutQuad(p) * W * 0.35;
        pathProgressRef.current = p;
      } else if (walkPhase === 'gate') {
        const p = Math.min(1, (elapsed - 8000) / 4000);
        cameraXRef.current = W * 0.35 + easeOutQuad(p) * W * 0.05;
      } else {
        const p = Math.min(1, (elapsed - 12000) / 3000);
        cameraXRef.current = W * 0.4 + easeOutQuad(p) * W * 0.1;
      }

      const isMoving = elapsed < 15000;
      const walkBob = isMoving ? Math.sin(elapsed * 0.006) * 6 * Math.min(1, (15000 - elapsed) / 2000) : 0;

      ctx.save();
      ctx.translate(-cameraXRef.current, walkBob);

      drawForestPath(ctx, W, H, t, pathProgressRef.current);

      if (walkPhase === 'gate') {
        drawAncientGate(ctx, W * 0.85, H, t);
      }

      firefliesRef.current.forEach(ff => {
        ff.glow += ff.glowDir * 0.03;
        if (ff.glow > 1 || ff.glow < 0.2) ff.glowDir *= -1;

        const dx = ff.tx - ff.x, dy = ff.ty - ff.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          ff.x += dx * ff.speed;
          ff.y += dy * ff.speed;
        } else if (!ff.waiting) {
          ff.waiting = true;
          ff.waitTimer = 60 + Math.random() * 120;
        }
        if (ff.waiting) {
          ff.waitTimer--;
          if (ff.waitTimer <= 0) {
            ff.waiting = false;
            const progress = pathProgressRef.current;
            ff.tx = W * (0.3 + progress * 0.6) + (Math.random() - 0.5) * 80;
            ff.ty = H * 0.4 + Math.random() * H * 0.2;
          }
        }

        ctx.save();
        ctx.globalAlpha = ff.glow;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#E8C06A';
        ctx.shadowColor = '#E8C06A';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [walkPhase]);

  const doorVisible = ['door', 'lock-zoom', 'password', 'unlocking', 'open'].includes(walkPhase);

  const handleLockClick = useCallback(() => {
    if (walkPhase !== 'door') return;
    setWalkPhase('lock-zoom');
    setTimeout(() => {
      setWalkPhase('password');
      setShowPassword(true);
    }, 1200);
  }, [walkPhase]);

  const handlePasswordSubmit = useCallback(() => {
    if (password.toLowerCase() === 'akanksha') {
      setError('');
      setShowPassword(false);
      setWalkPhase('unlocking');
      setLockUnlocking(true); // lock shackle pops open + drops away

      // Let the lock finish falling, then swing the door itself open.
      setTimeout(() => setDoorSwungOpen(true), 700);
    } else {
      setShake(true);
      setError('Hmm... ye sahi magic word nhi hai. Try again! 🥺');
      setTimeout(() => setShake(false), 600);
    }
  }, [password]);

  // Fires once, exactly when the door's CSS swing-open transition really ends.
  const handleDoorTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform') return;
    if (unlockedFiredRef.current) return;
    unlockedFiredRef.current = true;
    setWalkPhase('open');
    setTimeout(() => onUnlockedRef.current(), 1200);
  }, []);

  return (
    <div id="forest-walk" style={{
      position: 'fixed', inset: 0, zIndex: 12,
      opacity, transition: 'opacity 2s ease',
    }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {doorVisible && (
        <div className="door-stage">
          <div className={`door-wrap ${walkPhase === 'lock-zoom' || walkPhase === 'password' ? 'zoomed' : ''}`}>
            <div
              className={`door-panel ${doorSwungOpen ? 'door-open' : ''}`}
              onTransitionEnd={handleDoorTransitionEnd}
            >
              <div className="door-panel-face" />
              <div className="door-panel-inner-light" style={{ opacity: doorSwungOpen ? 1 : 0 }} />

              {(walkPhase === 'door' || walkPhase === 'lock-zoom') && (
                <button
                  type="button"
                  aria-label="Click the lock to enter"
                  className={`lock-hang ${lockHover ? 'lock-hover' : ''} ${lockUnlocking ? 'lock-unlocking' : ''}`}
                  onClick={handleLockClick}
                  onMouseEnter={() => setLockHover(true)}
                  onMouseLeave={() => setLockHover(false)}
                >
                  <svg viewBox="0 0 60 60" width="100%" height="100%">
                    <path
                      className="lock-shackle"
                      d="M18 26 V18 a12 12 0 0 1 24 0 V26"
                      fill="none"
                      stroke="#8B6914"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <rect x="12" y="24" width="36" height="28" rx="6" fill="#8B6914" />
                    <circle cx="30" cy="35" r="5" fill="#3a2808" />
                    <rect x="27" y="35" width="6" height="10" fill="#3a2808" />
                    <circle cx="30" cy="35" r="9" fill="none" stroke="#E8C06A" strokeWidth="1" className="lock-glow" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {walkPhase === 'door' && (
            <p className="door-hint">Click the magic lock to unlock memories...</p>
          )}
        </div>
      )}

      {showPassword && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(2,6,23,0.7)',
          backdropFilter: 'blur(12px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.8s ease forwards',
        }}>
          <div
            style={{
              width: 'min(480px, 90vw)',
              padding: '48px 40px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              textAlign: 'center',
              animation: shake ? 'shake 0.5s ease' : 'none',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '24px', filter: 'drop-shadow(0 0 20px rgba(232,192,106,0.6))' }}>
              🔐
            </div>

            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(14px, 2vw, 18px)',
              letterSpacing: '0.08em',
              color: '#F0F4FF',
              marginBottom: '12px',
              fontWeight: 500,
            }}>
              Ye journey sirf kisi bohot special ke liye hai.
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(13px, 1.8vw, 16px)',
              color: 'rgba(200,212,232,0.7)',
              marginBottom: '32px',
              lineHeight: 1.7,
            }}>
              Agar aapko wo magic word pata hai, toh memories aapka welcome karengi.
            </p>

            <input
              id="magic-password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Magic word enter karein..."
              autoFocus
              autoComplete="off"
              style={{
                width: '100%',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                color: '#F0F4FF',
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                outline: 'none',
                marginBottom: '8px',
                caretColor: '#4DAFFF',
                textAlign: 'center',
                letterSpacing: '0.15em',
                transition: 'all 0.3s ease',
              }}
              onFocus={e => { e.target.style.borderColor = '#4DAFFF'; e.target.style.boxShadow = '0 0 0 3px rgba(77,175,255,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />

            {error && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: '14px',
                color: 'rgba(200,150,100,0.9)',
                marginBottom: '16px',
                animation: 'fadeIn 0.3s ease',
              }}>
                {error}
              </p>
            )}

            <button
              onClick={handlePasswordSubmit}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(232,192,106,0.3), rgba(212,165,116,0.2))',
                border: '1px solid rgba(232,192,106,0.4)',
                color: '#E8C06A',
                fontFamily: "'Cinzel', serif",
                fontSize: '13px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(232,192,106,0.5), rgba(212,165,116,0.3))';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(232,192,106,0.3), rgba(212,165,116,0.2))';
              }}
            >
              Memories Unlock Karein ✨
            </button>
          </div>
        </div>
      )}

      {walkPhase === 'open' && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,200,80,0.25), transparent 60%)',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 2s ease forwards',
          pointerEvents: 'none',
        }}>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(24px, 4vw, 48px)',
            color: '#F0F4FF',
            letterSpacing: '0.1em',
            textShadow: '0 0 20px rgba(255,225,140,0.8)',
            animation: 'fadeInUp 1.5s ease 0.5s forwards',
            opacity: 0,
          }}>
            Welcome to our memories...
          </h2>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @keyframes breathe {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        @keyframes lockSwing {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        @keyframes lockDrop {
          to { transform: translateY(80px) rotate(20deg); opacity: 0; }
        }

        .door-stage {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1800px;
        }

        .door-wrap {
          position: relative;
          transition: transform 1.1s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeIn 1s ease forwards;
        }
        .door-wrap.zoomed {
          transform: scale(1.55);
        }

        .door-panel {
          position: relative;
          width: min(320px, 42vw);
          height: min(600px, 74vh);
          transform-origin: left center;
          transform-style: preserve-3d;
          transition: transform 2.2s cubic-bezier(0.65, 0, 0.35, 1);
          border: 8px solid #241407;
          border-radius: 6px;
          box-shadow: 0 30px 90px rgba(0,0,0,0.65), inset 0 0 50px rgba(0,0,0,0.5);
          background:
            linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%),
            linear-gradient(160deg, #4a2a14 0%, #2a1808 55%, #180d04 100%);
        }
        .door-panel.door-open {
          transform: rotateY(-108deg);
        }

        .door-panel-face {
          position: absolute;
          inset: 14px;
          border: 2px solid rgba(180,120,50,0.35);
          border-radius: 4px;
          background:
            repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 26px);
        }
        .door-panel-face::before {
          content: '';
          position: absolute;
          inset: 18px;
          border: 2px solid rgba(180,120,50,0.25);
          border-radius: 4px;
        }

        .door-panel-inner-light {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(255,225,140,0.9), rgba(255,180,60,0.3) 60%, transparent 80%);
          transition: opacity 1.4s ease;
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .lock-hang {
          position: absolute;
          right: -22px;
          top: 42%;
          width: 56px;
          height: 56px;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          transform-origin: top center;
          animation: lockSwing 3s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(232,192,106,0.5));
          transition: filter 0.25s ease, transform 0.25s ease;
        }
        .lock-hang.lock-hover {
          filter: drop-shadow(0 0 18px rgba(232,192,106,0.9));
        }
        .lock-hang.lock-unlocking {
          animation: lockDrop 0.6s ease forwards;
        }
        .lock-hang.lock-unlocking .lock-shackle {
          transform: translateY(-6px) rotate(-35deg);
          transform-origin: 42px 26px;
        }
        .lock-shackle {
          transition: transform 0.4s ease;
        }
        .lock-glow {
          animation: breathe 2.5s ease-in-out infinite;
        }

        .door-hint {
          position: absolute;
          bottom: 12%;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(14px, 2vw, 20px);
          font-style: italic;
          color: rgba(200,212,232,0.6);
          letter-spacing: 0.05em;
          animation: breathe 3s ease-in-out infinite;
          text-align: center;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

function drawForestPath(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, progress: number) {
  const pathGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
  pathGrad.addColorStop(0, '#1a1a2e');
  pathGrad.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = pathGrad;
  ctx.beginPath();
  ctx.moveTo(W * 0.35, H * 0.6);
  ctx.lineTo(W * 0.65, H * 0.6);
  ctx.lineTo(W * 0.85, H);
  ctx.lineTo(W * 0.15, H);
  ctx.closePath();
  ctx.fill();

  // Non-repeating ground patches
  GROUND_PATCHES.forEach((patch, i) => {
    const py = H * patch.y;
    const px = W / 2 + patch.xOffset;
    ctx.save();
    ctx.globalAlpha = 0.4 + (i % 3) * 0.1;
    ctx.fillStyle = '#2a2a3e';
    ctx.beginPath();
    ctx.ellipse(px, py, patch.w, 12, patch.w * 0.01, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Non-repeating glowing wisps
  WILL_O_WISPS.forEach(wisp => {
    const angle = wisp.phase + t * wisp.speed * 0.2;
    const px = W * wisp.x + Math.cos(angle) * 30;
    const py = H * wisp.y + Math.sin(angle) * 20;
    ctx.save();
    ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * wisp.speed + wisp.phase);
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#4DAFFF';
    ctx.shadowColor = '#4DAFFF';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  });

  // Non-repeating organic trees (Left)
  TREES_LEFT.forEach((tree, i) => {
    const x = tree.x * W;
    const treeH = H * tree.h;
    const sway = Math.sin(t * tree.swaySpeed + i) * 4;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#020814';
    ctx.beginPath();
    ctx.moveTo(x + sway, H - treeH);
    ctx.lineTo(x - 25, H);
    ctx.lineTo(x + 25, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Non-repeating organic trees (Right)
  TREES_RIGHT.forEach((tree, i) => {
    const x = tree.x * W;
    const treeH = H * tree.h;
    const sway = Math.sin(t * tree.swaySpeed + i + 5) * 4;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#020814';
    ctx.beginPath();
    ctx.moveTo(x + sway, H - treeH);
    ctx.lineTo(x - 25, H);
    ctx.lineTo(x + 25, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  const fog = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.7);
  fog.addColorStop(0, 'transparent');
  fog.addColorStop(0.5, 'rgba(11,20,55,0.25)');
  fog.addColorStop(1, 'transparent');
  ctx.save();
  ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 0.3);
  ctx.fillStyle = fog;
  ctx.fillRect(0, H * 0.55, W, H * 0.18);
  ctx.restore();
}

function drawAncientGate(ctx: CanvasRenderingContext2D, centerX: number, H: number, t: number) {
  const gateH = H * 0.6;
  const gateW = 200;
  ctx.save();
  ctx.translate(centerX, H - 40);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(-gateW / 2 - 20, -gateH, 30, gateH);
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(-gateW / 2 - 25, -gateH - 20, 40, 25);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(gateW / 2 - 10, -gateH, 30, gateH);
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(gateW / 2 - 15, -gateH - 20, 40, 25);

  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(0, -gateH + 5, gateW / 2 + 10, Math.PI, 0, false);
  ctx.stroke();

  const crystalPositions = [-gateW / 2 - 5, gateW / 2 + 15];
  crystalPositions.forEach(px => {
    for (let i = 0; i < 3; i++) {
      const cy = -gateH * 0.3 - i * gateH * 0.15;
      ctx.save();
      ctx.globalAlpha = 0.6 + 0.3 * Math.sin(t * 2 + i);
      ctx.fillStyle = '#4DAFFF';
      ctx.shadowColor = '#4DAFFF';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(px, cy - 12);
      ctx.lineTo(px + 6, cy);
      ctx.lineTo(px, cy + 5);
      ctx.lineTo(px - 6, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  });

  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#1a3a1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-gateW / 2 - 5, -gateH * 0.1 - i * gateH * 0.2);
    ctx.bezierCurveTo(
      -gateW / 2 + 20 + Math.sin(i) * 10, -gateH * 0.2 - i * gateH * 0.2,
      -gateW / 2 + 10, -gateH * 0.3 - i * gateH * 0.2,
      -gateW / 2 - 5 + 30, -gateH * 0.35 - i * gateH * 0.2
    );
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}