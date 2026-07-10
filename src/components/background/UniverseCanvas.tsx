'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Phase } from '@/app/page';

interface Props {
  phase: Phase;
}

interface Star {
  x: number; y: number; r: number;
  opacity: number; twinkleSpeed: number; twinkleOffset: number;
  color: string;
}

interface ShootingStar {
  x: number; y: number; vx: number; vy: number;
  length: number; opacity: number; active: boolean;
}

interface Firefly {
  x: number; y: number;
  vx: number; vy: number;
  glow: number; glowDir: number;
  size: number; life: number;
}

interface AuroraLayer {
  points: number[];
  color: string;
  speed: number;
  offset: number;
  opacity: number;
}

interface Cloud {
  x: number; y: number; w: number; h: number;
  speed: number; opacity: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  opacity: number; size: number;
  color: string; life: number;
}

export default function UniverseCanvas({ phase }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);

  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const auroraRef = useRef<AuroraLayer[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const initWorld = useCallback((w: number, h: number) => {
    // Stars
    starsRef.current = Array.from({ length: 800 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.7,
      r: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: ['#F0F4FF', '#C8D4E8', '#B8B8E8', '#4DAFFF', '#D4A574'][Math.floor(Math.random() * 5)],
    }));

    // Shooting stars
    shootingStarsRef.current = Array.from({ length: 5 }, () => ({
      x: -200, y: -200, vx: 0, vy: 0,
      length: 120, opacity: 0, active: false,
    }));

    // Fireflies
    firefliesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: h * 0.4 + Math.random() * h * 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      glow: Math.random(),
      glowDir: Math.random() > 0.5 ? 1 : -1,
      size: Math.random() * 2 + 1,
      life: Math.random() * Math.PI * 2,
    }));

    // Aurora layers
    auroraRef.current = [
      { points: Array.from({length:8}, (_,i) => i * w/7), color: '#4DAFFF', speed: 0.0008, offset: 0, opacity: 0.25 },
      { points: Array.from({length:8}, (_,i) => i * w/7), color: '#A855F7', speed: 0.0006, offset: Math.PI, opacity: 0.18 },
      { points: Array.from({length:8}, (_,i) => i * w/7), color: '#4CAF8A', speed: 0.0004, offset: Math.PI/2, opacity: 0.1 },
    ];

    // Clouds
    cloudsRef.current = Array.from({ length: 8 }, () => ({
      x: Math.random() * w * 1.5,
      y: Math.random() * h * 0.3 + h * 0.05,
      w: Math.random() * 250 + 100,
      h: Math.random() * 60 + 30,
      speed: Math.random() * 0.08 + 0.02,
      opacity: Math.random() * 0.12 + 0.04,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initWorld(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouse);

    // Trigger shooting stars periodically
    const shootInterval = setInterval(() => {
      const idle = shootingStarsRef.current.find(s => !s.active);
      if (idle) {
        idle.x = Math.random() * canvas.width;
        idle.y = Math.random() * canvas.height * 0.4;
        const angle = Math.random() * 0.5 + 0.2;
        const speed = Math.random() * 8 + 6;
        idle.vx = Math.cos(angle) * speed;
        idle.vy = Math.sin(angle) * speed;
        idle.opacity = 1;
        idle.active = true;
      }
    }, 8000 + Math.random() * 12000);

    const draw = (timestamp: number) => {
      const dt = timestamp - timeRef.current;
      timeRef.current = timestamp;
      const t = timestamp * 0.001;
      const W = canvas.width;
      const H = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#020617');
      sky.addColorStop(0.3, '#081326');
      sky.addColorStop(0.6, '#0B1437');
      sky.addColorStop(1, '#101B4D');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // ── Aurora ──
      auroraRef.current.forEach(aurora => {
        aurora.offset += aurora.speed;
        ctx.save();
        ctx.globalAlpha = aurora.opacity * (0.7 + 0.3 * Math.sin(t * 0.3));
        ctx.globalCompositeOperation = 'screen';
        const grad = ctx.createLinearGradient(0, H * 0.05, 0, H * 0.45);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.3, aurora.color + '60');
        grad.addColorStop(0.7, aurora.color + '30');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, H * 0.1);
        for (let i = 0; i <= 8; i++) {
          const px = (i / 8) * W;
          const py = H * 0.15 + Math.sin(i * 0.8 + aurora.offset + mx * 0.5) * H * 0.12 +
                     Math.cos(i * 0.5 + t * 0.4) * H * 0.06;
          ctx.lineTo(px, py);
        }
        ctx.lineTo(W, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // ── Stars ──
      starsRef.current.forEach(star => {
        const twinkle = Math.sin(t * star.twinkleSpeed * 60 + star.twinkleOffset);
        const alpha = star.opacity * (0.6 + 0.4 * twinkle);
        const parallax = (mx - 0.5) * star.r * 3;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x + parallax, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = star.r * 3;
        ctx.fill();
        ctx.restore();
      });

      // ── Shooting Stars ──
      shootingStarsRef.current.forEach(s => {
        if (!s.active) return;
        s.x += s.vx;
        s.y += s.vy;
        s.opacity -= 0.012;
        if (s.opacity <= 0 || s.x > W + 200 || s.y > H + 200) {
          s.active = false;
          return;
        }
        ctx.save();
        ctx.globalAlpha = s.opacity;
        const trail = ctx.createLinearGradient(
          s.x - s.vx * 15, s.y - s.vy * 15,
          s.x, s.y
        );
        trail.addColorStop(0, 'transparent');
        trail.addColorStop(1, '#F0F4FF');
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 15, s.y - s.vy * 15);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.restore();
      });

      // ── Moon ──
      const moonX = W * 0.72 + (mx - 0.5) * 20;
      const moonY = H * 0.18 + (my - 0.5) * 10;
      const moonR = Math.min(W, H) * 0.085;

      // Moon halo layers
      [0.04, 0.08, 0.15].forEach((strength, i) => {
        const haloR = moonR * (1.5 + i * 0.8) + Math.sin(t * 0.5) * 5;
        const haloGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.9, moonX, moonY, haloR);
        haloGrad.addColorStop(0, `rgba(176, 196, 255, ${strength})`);
        haloGrad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, haloR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Moon surface
      const moonGrad = ctx.createRadialGradient(
        moonX - moonR * 0.25, moonY - moonR * 0.25, 0,
        moonX, moonY, moonR
      );
      moonGrad.addColorStop(0, '#F8FAFF');
      moonGrad.addColorStop(0.4, '#E8EEFF');
      moonGrad.addColorStop(0.8, '#C0CFF0');
      moonGrad.addColorStop(1, '#8090C8');
      ctx.save();
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.shadowColor = '#B0C4FF';
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.restore();

      // Moon craters
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.globalCompositeOperation = 'multiply';
      [[0.2, -0.1, 0.12], [-0.25, 0.2, 0.08], [0.1, 0.3, 0.06]].forEach(([dx, dy, cr]) => {
        ctx.beginPath();
        ctx.arc(moonX + dx * moonR, moonY + dy * moonR, cr * moonR, 0, Math.PI * 2);
        ctx.fillStyle = '#607080';
        ctx.fill();
      });
      ctx.restore();

      // ── Clouds ──
      cloudsRef.current.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.w < 0) cloud.x = W + cloud.w;
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        const cg = ctx.createRadialGradient(
          cloud.x + cloud.w/2, cloud.y + cloud.h/2, 0,
          cloud.x + cloud.w/2, cloud.y + cloud.h/2, cloud.w/2
        );
        cg.addColorStop(0, 'rgba(200, 212, 232, 0.8)');
        cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.ellipse(cloud.x + cloud.w/2, cloud.y + cloud.h/2, cloud.w/2, cloud.h/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });

      // ── Forest Silhouette ──
      drawForest(ctx, W, H, t, mx);

      // ── Lake ──
      drawLake(ctx, W, H, moonX, moonY, moonR, t);

      // ── Fog ──
      const fogGrad = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.75);
      fogGrad.addColorStop(0, 'transparent');
      fogGrad.addColorStop(0.5, 'rgba(11, 20, 55, 0.3)');
      fogGrad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalAlpha = 0.6 + 0.2 * Math.sin(t * 0.2);
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, H * 0.55, W, H * 0.2);
      ctx.restore();

      // ── Fireflies ──
      firefliesRef.current.forEach(ff => {
        ff.life += 0.03;
        ff.glow += ff.glowDir * 0.02;
        if (ff.glow > 1 || ff.glow < 0) ff.glowDir *= -1;

        // React gently to mouse
        const dx = ff.x - mx * W;
        const dy = ff.y - my * H;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
          ff.vx += dx / dist * 0.05;
          ff.vy += dy / dist * 0.05;
        }

        ff.vx += (Math.random() - 0.5) * 0.05;
        ff.vy += (Math.random() - 0.5) * 0.05;
        ff.vx *= 0.97;
        ff.vy *= 0.97;
        ff.x += ff.vx;
        ff.y += ff.vy;

        // Bounds
        if (ff.x < 0) ff.x = W;
        if (ff.x > W) ff.x = 0;
        if (ff.y < H * 0.35) ff.y = H * 0.35;
        if (ff.y > H * 0.95) ff.y = H * 0.95;

        const glowColor = '#E8C06A';
        const alpha = ff.glow * 0.9;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12 + ff.glow * 8;
        ctx.fill();
        ctx.restore();
      });

      // ── Magical Particles ──
      if (Math.random() < 0.15) {
        particlesRef.current.push({
          x: Math.random() * W,
          y: H * 0.5 + Math.random() * H * 0.4,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.5 + 0.1),
          opacity: Math.random() * 0.6 + 0.3,
          size: Math.random() * 2 + 0.5,
          color: ['#4DAFFF', '#C8D4E8', '#E8C06A', '#A855F7'][Math.floor(Math.random()*4)],
          life: 1,
        });
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.003;
        p.opacity = p.life * 0.7;
        if (p.life <= 0) return false;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(shootInterval);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [initWorld]);

  return (
    <canvas
      ref={canvasRef}
      id="universe-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}

function drawForest(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, mx: number) {
  // Background trees
  for (let i = 0; i < 40; i++) {
    const x = (i / 40) * W * 1.1 - W * 0.05;
    const baseH = H * (0.28 + Math.sin(i * 2.3) * 0.08);
    const treeH = H * 0.25 + Math.sin(i * 1.7) * H * 0.08;
    const sway = Math.sin(t * 0.5 + i * 0.8) * 3;

    ctx.save();
    ctx.globalAlpha = 0.6 + Math.sin(i) * 0.2;

    // Draw pine tree shape
    const grad = ctx.createLinearGradient(x, H - baseH - treeH, x, H - baseH);
    grad.addColorStop(0, '#050E22');
    grad.addColorStop(1, '#0A1830');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + sway, H - baseH - treeH);
    ctx.lineTo(x - 18 + sway * 0.5, H - baseH);
    ctx.lineTo(x + 18 + sway * 0.5, H - baseH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Foreground trees - darker, larger
  for (let i = 0; i < 20; i++) {
    const x = (i / 20) * W * 1.05 - W * 0.025;
    const baseH = H * (0.1 + Math.sin(i * 3.1) * 0.04);
    const treeH = H * 0.35 + Math.sin(i * 2.1) * H * 0.1;
    const sway = Math.sin(t * 0.4 + i * 1.2 + mx) * 4;

    ctx.save();
    ctx.globalAlpha = 0.85;
    const grad = ctx.createLinearGradient(x, H - baseH - treeH, x, H - baseH);
    grad.addColorStop(0, '#020814');
    grad.addColorStop(1, '#040C20');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + sway, H - baseH - treeH);
    ctx.lineTo(x - 28 + sway * 0.5, H - baseH);
    ctx.lineTo(x + 28 + sway * 0.5, H - baseH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawLake(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  moonX: number, moonY: number, moonR: number,
  t: number
) {
  const lakeTop = H * 0.72;
  const lakeH = H * 0.28;

  // Lake base
  const lakeGrad = ctx.createLinearGradient(0, lakeTop, 0, H);
  lakeGrad.addColorStop(0, '#081326');
  lakeGrad.addColorStop(0.5, '#0B1437');
  lakeGrad.addColorStop(1, '#020617');
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(0, lakeTop, W, lakeH);

  // Moon reflection
  const refX = moonX;
  const refY = lakeTop + (lakeTop - moonY) * 0.3 + 20;
  const refGrad = ctx.createRadialGradient(refX, refY, 0, refX, refY, moonR * 2.5);
  refGrad.addColorStop(0, 'rgba(248, 250, 255, 0.25)');
  refGrad.addColorStop(0.5, 'rgba(192, 207, 240, 0.1)');
  refGrad.addColorStop(1, 'transparent');
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = refGrad;
  ctx.ellipse(refX, refY, moonR * 1.5, moonR * 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ripples
  for (let i = 0; i < 6; i++) {
    const rippleY = lakeTop + 20 + i * 18;
    const rippleW = (W * 0.3) * (1 - i * 0.08);
    const rippleX = refX + Math.sin(t * 0.3 + i) * 5;
    ctx.save();
    ctx.globalAlpha = (0.08 - i * 0.01) * Math.abs(Math.sin(t * 0.5 + i));
    ctx.strokeStyle = '#C8D4E8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(rippleX, rippleY, rippleW, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Star reflections in lake
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 30; i++) {
    const sx = Math.sin(i * 2.3) * W/2 + W/2;
    const sy = lakeTop + Math.sin(i * 1.7) * lakeH * 0.6 + lakeH * 0.2;
    const sr = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.arc(sx + Math.sin(t * 0.3 + i) * 3, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = '#C8D4E8';
    ctx.fill();
  }
  ctx.restore();
}
