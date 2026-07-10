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

export default function ForestWalk({ phase: experiencePhase, onDoorReached, onUnlocked }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [walkPhase, setWalkPhase] = useState<WalkPhase>('walk');
  const [opacity, setOpacity] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [unlockAnim, setUnlockAnim] = useState(false);
  const [doorOpenAngle, setDoorOpenAngle] = useState(0);
  const cameraXRef = useRef(0);
  const cameraZoomRef = useRef(1);
  const animRef = useRef<number>(0);
  const firefliesRef = useRef<FireflyGuide[]>([]);
  const pathProgressRef = useRef(0);
  const startTimeRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isHoveringLockRef = useRef(false);
  const lockParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; size: number }[]>([]);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 200);
    startTimeRef.current = Date.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Init guide fireflies
    firefliesRef.current = Array.from({length: 8}, (_, i) => ({
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

    // Forest walk sequence
    const walkSequence = async () => {
      // Walk toward door - 8 seconds
      await delay(8000);
      setWalkPhase('gate');
      await delay(4000);
      setWalkPhase('door');
      onDoorReached();
    };
    walkSequence();
  }, [onDoorReached]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (walkPhase !== 'door') {
        isHoveringLockRef.current = false;
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      const doorW = 120, doorH = H * 0.55;
      const lockX = (W * 1.1) - cameraXRef.current + (doorW / 2 - 20);
      const lockY = H - 40 - (doorH * 0.45);

      const dx = e.clientX - lockX;
      const dy = e.clientY - lockY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const hovering = dist < 60;
      if (hovering !== isHoveringLockRef.current) {
        isHoveringLockRef.current = hovering;
        canvas.style.cursor = hovering ? 'pointer' : 'default';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = (ts: number) => {
      const t = ts * 0.001;

      // Handle window resize dynamically inside draw loop
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Time-based smooth camera movement
      const elapsed = Date.now() - startTimeRef.current;
      const easeOutQuad = (t: number) => t * (2 - t);
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      if (walkPhase === 'walk') {
        const p = Math.min(1, elapsed / 8000);
        cameraXRef.current = easeInOutQuad(p) * W * 0.35;
        pathProgressRef.current = p;
      } else if (walkPhase === 'gate') {
        const p = Math.min(1, (elapsed - 8000) / 4000);
        cameraXRef.current = (W * 0.35) + easeOutQuad(p) * W * 0.05;
      } else {
        const p = Math.min(1, (elapsed - 12000) / 3000);
        cameraXRef.current = (W * 0.40) + easeOutQuad(p) * W * 0.20;
      }

      // Camera bob effect for walking realism
      const isMoving = elapsed < 15000;
      const walkBob = isMoving ? Math.sin(elapsed * 0.006) * 6 * Math.min(1, (15000 - elapsed) / 2000) : 0;

      if (walkPhase === 'lock-zoom' || walkPhase === 'password') {
        cameraZoomRef.current = Math.min(2.5, cameraZoomRef.current + 0.02); // slightly faster zoom
      }

      ctx.save();
      ctx.translate(-cameraXRef.current, walkBob);
      ctx.scale(cameraZoomRef.current, cameraZoomRef.current);
      ctx.translate((1 - cameraZoomRef.current) * W / 2, (1 - cameraZoomRef.current) * H / 2);

      // Forest path
      drawForestPath(ctx, W, H, t, pathProgressRef.current);

      // Ancient gate
      if (walkPhase === 'gate' || walkPhase === 'door' || walkPhase === 'lock-zoom' ||
          walkPhase === 'password' || walkPhase === 'unlocking' || walkPhase === 'open') {
        drawAncientGate(ctx, W * 0.85, H, t, walkPhase === 'gate');
      }

      // The Door with hover support
      if (['door', 'lock-zoom', 'password', 'unlocking', 'open'].includes(walkPhase)) {
        drawMagicDoor(ctx, W * 1.1, H, t, doorOpenAngle, walkPhase, isHoveringLockRef.current);
      }

      // Guide fireflies
      firefliesRef.current.forEach(ff => {
        ff.glow += ff.glowDir * 0.03;
        if (ff.glow > 1 || ff.glow < 0.2) ff.glowDir *= -1;

        // Move toward target
        const dx = ff.tx - ff.x, dy = ff.ty - ff.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
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

        const color = '#E8C06A';
        ctx.save();
        ctx.globalAlpha = ff.glow;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();

      // Render lock hover particles in screen-space
      if (walkPhase === 'door') {
        const doorW = 120, doorH = H * 0.55;
        const lockX = (W * 1.1) - cameraXRef.current + (doorW / 2 - 20);
        const lockY = H - 40 - (doorH * 0.45);

        if (isHoveringLockRef.current && Math.random() < 0.4) {
          lockParticlesRef.current.push({
            x: lockX + (Math.random() - 0.5) * 10,
            y: lockY + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.5,
            life: 1.0,
            size: Math.random() * 2 + 1,
          });
        }

        lockParticlesRef.current.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
          if (p.life <= 0) {
            lockParticlesRef.current.splice(idx, 1);
            return;
          }
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = '#E8C06A';
          ctx.shadowColor = '#E8C06A';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [walkPhase, doorOpenAngle]);

  const handleLockClick = useCallback(() => {
    if (walkPhase !== 'door') return;
    setWalkPhase('lock-zoom');
    setTimeout(() => {
      setWalkPhase('password');
      setShowPassword(true);
    }, 1500);
  }, [walkPhase]);

  const handlePasswordSubmit = useCallback(() => {
    if (password.toLowerCase() === 'akanksha') {
      setError('');
      setUnlockAnim(true);
      setWalkPhase('unlocking');
      setShowPassword(false);

      // Open door sequence
      const startTime = Date.now();
      const animateDoor = () => {
        const elapsed = Date.now() - startTime;
        const duration = 2500;
        const progress = Math.min(1, elapsed / duration);
        // Ease in out cubic for smooth opening
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const angle = ease * 105;
        setDoorOpenAngle(angle);
        
        if (progress < 1) {
          requestAnimationFrame(animateDoor);
        } else {
          setWalkPhase('open');
          setTimeout(() => onUnlocked(), 2500);
        }
      };
      requestAnimationFrame(animateDoor);
    } else {
      setShake(true);
      setError("Hmm... ye sahi magic word nhi hai. Try again! 🥺");
      setTimeout(() => setShake(false), 600);
    }
  }, [password, onUnlocked]);

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

      {/* Lock clickable area covering screen for bulletproof clickability */}
      {walkPhase === 'door' && (
        <>
          <div
            role="button"
            aria-label="Click the lock to enter"
            tabIndex={0}
            onClick={handleLockClick}
            onKeyDown={e => e.key === 'Enter' && handleLockClick()}
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'pointer',
              zIndex: 3,
            }}
          />
          <p style={{
            position: 'absolute',
            bottom: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(14px, 2vw, 20px)',
            fontStyle: 'italic',
            color: 'rgba(200,212,232,0.6)',
            letterSpacing: '0.05em',
            zIndex: 4,
            animation: 'breathe 3s ease-in-out infinite',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            Click the magic lock to unlock memories...
          </p>
        </>
      )}

      {/* Password Modal */}
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
            {/* Lock icon */}
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

      {/* Door opened - golden light reveal */}
      {walkPhase === 'open' && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,200,80,0.2), transparent 60%)',
          zIndex: 5,
          animation: 'fadeIn 2s ease forwards',
          pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}

function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

function drawForestPath(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, progress: number) {
  // Stone path
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

  // Path stones
  for (let i = 0; i < 16; i++) {
    const py = H * 0.62 + (i / 16) * H * 0.35;
    const pw = 40 + Math.sin(i * 2.3) * 20;
    const px = W / 2 + Math.sin(i * 1.7) * 15;
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(i) * 0.2;
    ctx.fillStyle = '#2a2a3e';
    ctx.beginPath();
    ctx.ellipse(px, py, pw, 12, Math.sin(i) * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Moss
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#3a5a3a';
    ctx.beginPath();
    ctx.ellipse(px - 5, py - 3, pw * 0.3, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Glowing flowers along path
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + t * 0.1;
    const px = W * 0.38 + Math.cos(angle * 3) * 40 + i * W * 0.02;
    const py = H * 0.65 + Math.sin(i * 1.7) * 30 + i * H * 0.025;
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.3 * Math.sin(t * 2 + i);
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#4DAFFF';
    ctx.shadowColor = '#4DAFFF';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }

  // Dense forest sides
  for (let side = 0; side < 2; side++) {
    const sx = side === 0 ? 0.05 : 0.75;
    for (let i = 0; i < 12; i++) {
      const x = (sx + i * 0.025) * W;
      const treeH = H * 0.5 + Math.sin(i * 2.1) * H * 0.1;
      const sway = Math.sin(t * 0.4 + i) * 5;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#020814';
      ctx.beginPath();
      ctx.moveTo(x + sway, H - treeH);
      ctx.lineTo(x - 22, H);
      ctx.lineTo(x + 22, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Fog
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

function drawAncientGate(
  ctx: CanvasRenderingContext2D,
  centerX: number, H: number, t: number, isActive: boolean
) {
  const gateH = H * 0.6;
  const gateW = 200;
  ctx.save();
  ctx.translate(centerX, H - 40);

  // Left pillar
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(-gateW / 2 - 20, -gateH, 30, gateH);
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(-gateW / 2 - 25, -gateH - 20, 40, 25);

  // Right pillar
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(gateW / 2 - 10, -gateH, 30, gateH);
  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(gateW / 2 - 15, -gateH - 20, 40, 25);

  // Arch
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(0, -gateH + 5, gateW / 2 + 10, Math.PI, 0, false);
  ctx.stroke();

  // Blue crystals on pillars
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

  // Vines
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

function drawMagicDoor(
  ctx: CanvasRenderingContext2D,
  centerX: number, H: number, t: number, openAngle: number, phase: WalkPhase,
  isHoveringLock: boolean
) {
  const doorW = 120, doorH = H * 0.55;
  ctx.save();
  ctx.translate(centerX, H - 40);

  // Door frame
  ctx.strokeStyle = '#2a1800';
  ctx.lineWidth = 20;
  ctx.strokeRect(-doorW / 2 - 10, -doorH - 10, doorW + 20, doorH + 10);

  // Portal glow behind the door
  if (openAngle > 0) {
    const portalIntensity = openAngle / 105;
    
    ctx.save();
    // Inner light
    const portalGrad = ctx.createLinearGradient(0, -doorH, 0, 0);
    portalGrad.addColorStop(0, `rgba(255,250,200,${0.9 * portalIntensity})`);
    portalGrad.addColorStop(0.5, `rgba(255,220,120,${0.8 * portalIntensity})`);
    portalGrad.addColorStop(1, `rgba(255,180,50,${0.6 * portalIntensity})`);
    ctx.fillStyle = portalGrad;
    ctx.fillRect(-doorW / 2, -doorH, doorW, doorH);

    // Magical rays
    ctx.globalCompositeOperation = 'screen';
    const numRays = 7;
    for(let i=0; i<numRays; i++) {
       const rayAngle = (Math.PI/2) + Math.sin(t * 1.5 + i) * 0.8;
       const rayLength = 150 + Math.sin(t * 2 + i * 2) * 100 * portalIntensity;
       const rayWidth = 15 + Math.sin(t * 3 + i) * 10;
       
       const rayGrad = ctx.createLinearGradient(0, -doorH/2, Math.cos(rayAngle) * rayLength, -doorH/2 - Math.sin(rayAngle) * rayLength);
       rayGrad.addColorStop(0, `rgba(255,230,150,${0.4 * portalIntensity})`);
       rayGrad.addColorStop(1, 'rgba(255,200,100,0)');
       
       ctx.beginPath();
       ctx.moveTo(0, -doorH/2);
       ctx.lineTo(Math.cos(rayAngle) * rayLength, -doorH/2 - Math.sin(rayAngle) * rayLength);
       ctx.strokeStyle = rayGrad;
       ctx.lineWidth = rayWidth;
       ctx.stroke();
    }
    ctx.restore();
  }

  // Door with opening perspective
  ctx.save();
  if (openAngle > 0) {
    const rad = (openAngle * Math.PI) / 180;
    // Move origin to left hinge (-doorW / 2)
    ctx.translate(-doorW / 2, 0);
    // Apply 3D-like perspective: scale X, skew Y
    ctx.transform(Math.cos(rad), Math.sin(rad) * 0.15, 0, 1, 0, 0);
    // Move origin back
    ctx.translate(doorW / 2, 0);
  }

  // Door body
  const doorGrad = ctx.createLinearGradient(-doorW / 2, -doorH, doorW / 2, 0);
  doorGrad.addColorStop(0, '#3a2010');
  doorGrad.addColorStop(0.5, '#2a1808');
  doorGrad.addColorStop(1, '#1a1005');
  ctx.fillStyle = doorGrad;
  ctx.fillRect(-doorW / 2, -doorH, doorW, doorH);

  // Door panels
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(-doorW / 2 + 10, -doorH + 15, doorW / 2 - 15, doorH * 0.45 - 15);
  ctx.fillRect(5, -doorH + 15, doorW / 2 - 15, doorH * 0.45 - 15);
  ctx.fillRect(-doorW / 2 + 10, -doorH * 0.5, doorW - 20, doorH * 0.45);

  // Carved patterns
  ctx.strokeStyle = 'rgba(180,120,50,0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, -doorH * (0.3 + i * 0.25), 15, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Metal reinforcements
  ctx.strokeStyle = '#2a2010';
  ctx.lineWidth = 4;
  ctx.strokeRect(-doorW / 2, -doorH, doorW, doorH);
  ctx.beginPath();
  ctx.moveTo(-doorW / 2, -doorH / 2);
  ctx.lineTo(doorW / 2, -doorH / 2);
  ctx.stroke();

  // Vines on door
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#1a3a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-doorW / 2 + 5, -doorH);
  ctx.bezierCurveTo(-doorW / 2 + 30, -doorH * 0.8, -doorW / 2 + 10, -doorH * 0.6, -doorW / 2 + 25, -doorH * 0.4);
  ctx.stroke();
  ctx.restore();

  // Inner door shading when open to enhance 3D effect
  if (openAngle > 0) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.6, openAngle / 100)})`;
    ctx.fillRect(-doorW / 2, -doorH, doorW, doorH);
  }

  ctx.restore();

  // Lock (only shown when door phase)
  if (phase === 'door' || phase === 'lock-zoom') {
    const lockY = -doorH * 0.45;
    const lockVibe = isHoveringLock ? Math.sin(t * 60) * 1.5 : 0;
    const lockSwing = Math.sin(t * 0.8) * 4 + lockVibe;
    ctx.save();
    ctx.translate(doorW / 2 - 20 + lockSwing, lockY);

    // Lock body
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.roundRect(-14, -10, 28, 24, 4);
    ctx.fill();

    // Lock shackle
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -10, 10, Math.PI, 0, false);
    ctx.stroke();

    // Lock keyhole
    ctx.fillStyle = '#3a2808';
    ctx.beginPath();
    ctx.arc(0, -2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-3, -2, 6, 10);

    // Lock engravings glow
    ctx.save();
    ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3);
    ctx.strokeStyle = '#E8C06A';
    ctx.lineWidth = 0.5;
    ctx.shadowColor = '#E8C06A';
    ctx.shadowBlur = isHoveringLock ? 25 : 8;
    ctx.beginPath();
    ctx.arc(0, -2, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  ctx.restore();
}
