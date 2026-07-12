'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  onComplete: () => void;
}

type GiftPhase = 'floating' | 'clicked' | 'opening' | 'blooming' | 'bouquet' | 'dissolving';

// --- Math & Easing Utilities ---
const easeOutElastic = (x: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};
const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

// --- Interfaces ---
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'dust' | 'magic' | 'pollen' | 'ray';
  angle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  rotation?: number;
  rotSpeed?: number;
}

interface RibbonSegment {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

const PETAL_COLORS = ['#FFB6C1', '#FF69B4', '#FFC0CB', '#FFD4E1', '#F8A0B0', '#E8C06A'];

export default function GiftExperience({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React State
  const [phase, setPhase] = useState<GiftPhase>('floating');
  const [showBouquet, setShowBouquet] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [showInstruction, setShowInstruction] = useState(false);
  
  // Timers Cleanup
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  
  // Canvas State & Physics Refs (Avoids re-renders)
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  
  // Interaction & Camera
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });
  const cameraRef = useRef({ zoom: 1, targetZoom: 1, yOffset: 0, targetYOffset: 0 });
  
  // Gift State
  const giftRef = useRef({
    x: 0, y: 0,
    baseY: 0,
    scaleX: 1, scaleY: 1,
    targetScaleX: 1, targetScaleY: 1,
    rotation: 0,
    lidAngle: 0,
    lightIntensity: 0,
    targetLight: 0,
    bloomProgress: 0,
    unlocked: false,
    vibration: 0,
  });

  // Ribbon Cloth Physics
  const ribbonLeftRef = useRef<RibbonSegment[]>([]);
  const ribbonRightRef = useRef<RibbonSegment[]>([]);
  
  // Particles
  const particlesRef = useRef<Particle[]>([]);

  // Update complete ref
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Initial Mount
  useEffect(() => {
    let cancelled = false;
    const t1 = setTimeout(() => { if (!cancelled) setOpacity(1); }, 100);
    const t2 = setTimeout(() => { if (!cancelled) setShowInstruction(true); }, 2500);
    
    // Init Mouse
    mouseRef.current.x = window.innerWidth / 2;
    mouseRef.current.y = window.innerHeight / 2;
    mouseRef.current.targetX = mouseRef.current.x;
    mouseRef.current.targetY = mouseRef.current.y;

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      timersRef.current.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Mouse Move Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      giftRef.current.x = canvas.width / 2;
      giftRef.current.baseY = canvas.height * 0.45;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize Cloth Ribbon
    const initRibbon = () => {
      ribbonLeftRef.current = Array.from({ length: 8 }, () => ({ x: 0, y: 0, oldX: 0, oldY: 0 }));
      ribbonRightRef.current = Array.from({ length: 8 }, () => ({ x: 0, y: 0, oldX: 0, oldY: 0 }));
    };
    initRibbon();

    // Spawn ambient dust
    for(let i = 0; i < 50; i++) spawnParticle('dust');

    let lastTime = performance.now();

    const draw = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // Cap dt
      lastTime = timestamp;
      const t = timestamp * 0.001;
      timeRef.current = t;
      const W = canvas.width, H = canvas.height;

      // Mouse Lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Calculate distance to gift for interaction
      const gState = giftRef.current;
      const distToGift = Math.hypot(mouseRef.current.x - gState.x, mouseRef.current.y - gState.baseY);
      const hoverFactor = Math.max(0, 1 - distToGift / 300) * (mouseRef.current.active ? 1 : 0);

      // Background Clear (Deep cinematic dark)
      ctx.fillStyle = '#020510';
      ctx.fillRect(0, 0, W, H);
      
      // Lake reflection gradient background
      const bgGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
      bgGrad.addColorStop(0, '#020510');
      bgGrad.addColorStop(1, '#051025');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);

      // Camera Lerp
      cameraRef.current.zoom += (cameraRef.current.targetZoom - cameraRef.current.zoom) * 0.02;
      cameraRef.current.yOffset += (cameraRef.current.targetYOffset - cameraRef.current.yOffset) * 0.02;

      ctx.save();
      // Apply Camera
      ctx.translate(W/2, H/2 + cameraRef.current.yOffset);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);
      ctx.translate(-W/2, -H/2);

      // Update Gift State Physics
      if (phase === 'floating') {
        // Layered sine waves for organic breathing
        gState.y = gState.baseY + Math.sin(t * 0.8) * 12 + Math.sin(t * 1.5) * 4;
        gState.rotation = Math.sin(t * 0.5) * 0.02 + (mouseRef.current.x - W/2) * 0.0001;
        gState.targetLight = hoverFactor * 0.4;
      }
      
      // Squeeze physics
      gState.scaleX += (gState.targetScaleX - gState.scaleX) * 0.15;
      gState.scaleY += (gState.targetScaleY - gState.scaleY) * 0.15;
      
      // Light physics
      gState.lightIntensity += (gState.targetLight - gState.lightIntensity) * 0.02;

      // Volumetric Background Glow
      if (gState.lightIntensity > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const outerGlow = ctx.createRadialGradient(gState.x, gState.y, 0, gState.x, gState.y, 400 * cameraRef.current.zoom);
        outerGlow.addColorStop(0, `rgba(255, 200, 80, ${gState.lightIntensity * 0.15})`);
        outerGlow.addColorStop(0.4, `rgba(232, 192, 106, ${gState.lightIntensity * 0.05})`);
        outerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Draw Particles (Background)
      updateAndDrawParticles(ctx, dt, t, W, H, gState, hoverFactor, false);

      // Draw Gift Reflection
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.translate(gState.x, gState.y);
      ctx.scale(1, -0.3);
      ctx.translate(0, -250);
      drawCinematicGift(ctx, t, gState, hoverFactor);
      ctx.restore();

      // God Rays if opening
      if (gState.lightIntensity > 0.3) {
        drawGodRays(ctx, gState.x, gState.y - 20, t, gState.lightIntensity);
      }

      // Draw Main Gift
      ctx.save();
      ctx.translate(gState.x, gState.y + (Math.random() - 0.5) * gState.vibration);
      ctx.scale(gState.scaleX, gState.scaleY);
      ctx.rotate(gState.rotation);
      drawCinematicGift(ctx, t, gState, hoverFactor);
      
      if (phase === 'blooming' || phase === 'bouquet') {
        drawCinematicFlowers(ctx, 0, -40, t, gState.bloomProgress);
      }
      ctx.restore();

      // Draw Particles (Foreground)
      updateAndDrawParticles(ctx, dt, t, W, H, gState, hoverFactor, true);

      ctx.restore(); // Camera restore
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  // --- Interaction Sequence ---
  const handleGiftClick = useCallback(() => {
    if (phase !== 'floating') return;
    setShowInstruction(false);
    setPhase('clicked');

    const gState = giftRef.current;
    
    // 1. Gift Compresses & Vibrates (Intensified)
    gState.targetScaleX = 1.15;
    gState.targetScaleY = 0.8;
    gState.vibration = 6;
    gState.targetLight = 0.8; // Light leaks

    // Spawn magic particles rapidly
    let magicInterval = setInterval(() => {
      for(let i=0; i<5; i++) spawnParticle('magic');
      for(let i=0; i<2; i++) spawnParticle('ray');
    }, 40);

    // 2. Swell & Unlock
    timersRef.current.push(setTimeout(() => {
      gState.targetScaleX = 0.9;
      gState.targetScaleY = 1.2;
      gState.vibration = 12;
      gState.targetLight = 2.0;
      cameraRef.current.targetZoom = 1.25; // Camera pushes in deeper
      cameraRef.current.targetYOffset = 60;

      // Unlock snap
      timersRef.current.push(setTimeout(() => {
        gState.targetScaleX = 1;
        gState.targetScaleY = 1;
        gState.vibration = 0;
        gState.unlocked = true; // Ribbon detaches
        clearInterval(magicInterval);
        
        // Massive burst of light & particles (Flash bang effect)
        gState.lightIntensity = 4.0;
        for(let i=0; i<80; i++) spawnParticle('ray');
        for(let i=0; i<60; i++) spawnParticle('magic');
        for(let i=0; i<30; i++) spawnParticle('pollen');

        // 3. Slow Lid Open
        setPhase('opening');
        let openStartTime = performance.now();
        const animateLid = () => {
          const elapsed = (performance.now() - openStartTime) / 1000;
          const duration = 2.8; // slow open
          if (elapsed < duration) {
            const progress = elapsed / duration;
            // Elastic out for natural wooden weight overshoot
            gState.lidAngle = easeOutElastic(progress) * 125; 
            gState.targetLight = 1.5 + progress * 1.5;
            requestAnimationFrame(animateLid);
          } else {
            gState.lidAngle = 125;
            // 4. Blooming Phase
            setPhase('blooming');
            let bloomStartTime = performance.now();
            const animateBloom = () => {
              const bElapsed = (performance.now() - bloomStartTime) / 1000;
              const bDuration = 3.5;
              if (bElapsed < bDuration) {
                gState.bloomProgress = easeOutCubic(bElapsed / bDuration);
                requestAnimationFrame(animateBloom);
              } else {
                gState.bloomProgress = 1;
                // 5. Bouquet Modal
                timersRef.current.push(setTimeout(() => {
                  setPhase('bouquet');
                  setShowBouquet(true);
                  cameraRef.current.targetZoom = 1; // Pull back
                  cameraRef.current.targetYOffset = 0;
                }, 1200));
              }
            };
            animateBloom();
          }
        };
        animateLid();

      }, 1000)); // Snap delay
    }, 1500)); // Swell delay

  }, [phase]);

  const handleBouquetClose = useCallback(() => {
    setShowBouquet(false);
    setPhase('dissolving');

    // Cinematic exit transition
    cameraRef.current.targetZoom = 1.5;
    cameraRef.current.targetYOffset = 200; // Look up to the sky
    giftRef.current.targetLight = 0;

    // Massive pollen release
    for(let i=0; i<100; i++) spawnParticle('pollen');

    timersRef.current.push(setTimeout(() => onCompleteRef.current(), 3500));
  }, []);

  // --- Rendering Helpers ---
  function spawnParticle(type: 'dust' | 'magic' | 'pollen' | 'ray') {
    const W = window.innerWidth, H = window.innerHeight;
    const gState = giftRef.current;
    
    let p: Particle = {
      id: Math.random(), x: 0, y: 0, vx: 0, vy: 0,
      size: 1, color: '#FFF', life: 1, maxLife: 1, type
    };

    if (type === 'dust') {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.vx = (Math.random() - 0.5) * 20;
      p.vy = -Math.random() * 10 - 5;
      p.size = Math.random() * 1.5 + 0.5;
      p.color = `rgba(232, 192, 106, ${Math.random() * 0.4 + 0.1})`;
      p.maxLife = Math.random() * 10 + 10;
    } else if (type === 'magic') {
      p.orbitRadius = Math.random() * 100 + 80;
      p.angle = Math.random() * Math.PI * 2;
      p.orbitSpeed = (Math.random() - 0.5) * 2;
      p.y = gState.baseY + (Math.random() - 0.5) * 50; // Z-axis approximation
      p.size = Math.random() * 2.5 + 1;
      p.color = '#E8C06A';
      p.maxLife = Math.random() * 2 + 1;
    } else if (type === 'ray') {
      p.x = gState.x;
      p.y = gState.y - 20;
      const a = -Math.PI/2 + (Math.random() - 0.5) * 1.5;
      const s = Math.random() * 400 + 200;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.size = Math.random() * 4 + 2;
      p.color = '#FFD700';
      p.maxLife = Math.random() * 1.5 + 0.5;
    } else if (type === 'pollen') {
      p.x = gState.x + (Math.random() - 0.5) * 100;
      p.y = gState.y - 60 + (Math.random() - 0.5) * 40;
      p.vx = (Math.random() - 0.5) * 100;
      p.vy = -Math.random() * 150 - 50;
      p.size = Math.random() * 4 + 2;
      p.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      p.maxLife = Math.random() * 4 + 2;
      p.rotation = Math.random() * Math.PI * 2;
      p.rotSpeed = (Math.random() - 0.5) * 10;
    }
    p.life = p.maxLife;
    particlesRef.current.push(p);
  }

  function updateAndDrawParticles(
    ctx: CanvasRenderingContext2D, dt: number, t: number, 
    W: number, H: number, gState: any, hoverFactor: number, foreground: boolean
  ) {
    ctx.save();
    
    particlesRef.current = particlesRef.current.filter(p => {
      p.life -= dt;
      if (p.life <= 0) return false;

      // Sort by type loosely: dust is bg/fg mixed, magic orbits, pollen is fg
      const isFg = p.type === 'pollen' || p.type === 'ray' || (p.type === 'magic' && Math.sin(p.angle!) > 0);
      if (foreground !== isFg && p.type !== 'dust') return true; 

      const progress = p.life / p.maxLife;
      let alpha = p.type === 'dust' ? Math.sin(progress * Math.PI) : easeOutCubic(progress);

      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'dust') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Float towards light if intense
        if (gState.lightIntensity > 0.5) {
          const dx = gState.x - p.x;
          const dy = gState.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < 400) {
            p.vx += (dx / dist) * 10 * dt;
            p.vy += (dy / dist) * 10 * dt;
          }
        }
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      } 
      else if (p.type === 'magic') {
        p.angle! += p.orbitSpeed! * dt;
        // Hover pulls magic closer
        const currentRadius = p.orbitRadius! * (1 - hoverFactor * 0.3);
        p.x = gState.x + Math.cos(p.angle!) * currentRadius;
        const orbitY = p.y + Math.sin(p.angle!) * currentRadius * 0.2; // isometric squash
        
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, orbitY, p.size, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      else if (p.type === 'ray') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 2, p.size * 0.5, Math.atan2(p.vy, p.vx), 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      else if (p.type === 'pollen') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 80 * dt; // Gravity
        p.vx += Math.sin(t * 3 + p.id) * 40 * dt; // Wind flutter
        p.rotation! += p.rotSpeed! * dt;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation!);
        ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI*2); ctx.fill();
        ctx.rotate(-p.rotation!);
        ctx.translate(-p.x, -p.y);
      }

      return true;
    });

    // Replenish dust
    if (particlesRef.current.filter(p => p.type === 'dust').length < 50) spawnParticle('dust');

    ctx.restore();
  }

  function drawGodRays(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, intensity: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(cx, cy);
    
    const numRays = 12;
    for(let i=0; i<numRays; i++) {
      const angle = (i / numRays) * Math.PI - Math.PI; // Upper half
      const sway = Math.sin(t * 0.5 + i) * 0.2;
      const rayAlpha = (Math.sin(t * 2 + i * 13) * 0.5 + 0.5) * intensity * 0.3;
      
      const grad = ctx.createLinearGradient(0, 0, Math.cos(angle+sway)*600, Math.sin(angle+sway)*600);
      grad.addColorStop(0, `rgba(255, 230, 150, ${rayAlpha})`);
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(Math.cos(angle+sway+0.1)*600, Math.sin(angle+sway+0.1)*600);
      ctx.lineTo(Math.cos(angle+sway-0.1)*600, Math.sin(angle+sway-0.1)*600);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCinematicGift(ctx: CanvasRenderingContext2D, t: number, gState: any, hover: number) {
    const W = 160, H = 130;
    const hw = W/2, hh = H/2;
    
    // Drop Shadow
    ctx.save();
    const shadowStretch = 1 + hover * 0.2;
    const shadowGrad = ctx.createRadialGradient(0, hh + 20, 0, 0, hh + 20, hw * shadowStretch);
    shadowGrad.addColorStop(0, `rgba(0,0,0,${0.6 - hover*0.2})`);
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath(); ctx.ellipse(0, hh + 15, W * 0.6 * shadowStretch, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Box Body (Premium Velvet Blue)
    const bodyGrad = ctx.createLinearGradient(-hw, -hh+30, hw, hh);
    bodyGrad.addColorStop(0, '#150a3b'); // Dark rich purple/blue
    bodyGrad.addColorStop(0.5, '#0b0524');
    bodyGrad.addColorStop(1, '#050212');
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, -hw, -hh+30, W, H-30, 12);
    ctx.fill();

    // Core Light leaking from inside (Ambient Occlusion inverted)
    if (gState.lightIntensity > 0) {
      const coreGrad = ctx.createLinearGradient(0, -hh+30, 0, 0);
      coreGrad.addColorStop(0, `rgba(255, 220, 120, ${gState.lightIntensity * 0.8})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(-hw + 5, -hh+30, W - 10, 40);
    }

    // Ribbon (Body)
    const ribbonGrad = ctx.createLinearGradient(-hw, 0, hw, 0);
    ribbonGrad.addColorStop(0, '#B8860B');
    ribbonGrad.addColorStop(0.5, '#FFD700');
    ribbonGrad.addColorStop(1, '#B8860B');
    ctx.fillStyle = ribbonGrad;
    
    // Vertical ribbon
    ctx.fillRect(-12, -hh+30, 24, H-30);
    // Horizontal ribbon
    ctx.fillRect(-hw, -hh+50, W, 14);

    // Dynamic Lid
    ctx.save();
    ctx.translate(0, -hh+30);
    // Offset lid pivot slightly back for 3D effect
    ctx.rotate(-(gState.lidAngle * Math.PI / 180));

    // Inner lid glow
    if (gState.lidAngle > 0) {
       ctx.fillStyle = `rgba(255, 200, 100, ${Math.min(1, gState.lidAngle/90)})`;
       roundRect(ctx, -hw-2, -4, W+4, 10, 4);
       ctx.fill();
    }

    // Lid Base
    const lidGrad = ctx.createLinearGradient(-hw-8, -26, hw+8, 0);
    lidGrad.addColorStop(0, '#1c0e4c');
    lidGrad.addColorStop(0.5, '#150a3b');
    lidGrad.addColorStop(1, '#0b0524');
    ctx.fillStyle = lidGrad;
    roundRect(ctx, -hw-8, -26, W+16, 26, 8);
    ctx.fill();

    // Lid Ribbon
    ctx.fillStyle = ribbonGrad;
    ctx.fillRect(-12, -26, 24, 26);
    ctx.fillRect(-hw-8, -16, W+16, 14);

    // Lid Rim Highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    roundRect(ctx, -hw-7, -25, W+14, 24, 7);
    ctx.stroke();

    // The Bow (Only if locked)
    if (!gState.unlocked) {
      ctx.translate(0, -26);
      drawCinematicBow(ctx, t, hover, gState.vibration);
    }
    ctx.restore();

    // Cloth Physics Ribbon Tails (Only if unlocked)
    if (gState.unlocked) {
       drawRibbonCloth(ctx, t, -15, -hh+30, ribbonLeftRef.current, -1);
       drawRibbonCloth(ctx, t, 15, -hh+30, ribbonRightRef.current, 1);
    }
  }

  function drawCinematicBow(ctx: CanvasRenderingContext2D, t: number, hover: number, vibration: number) {
    const sway = Math.sin(t * 2) * (3 + hover * 5) + (Math.random()-0.5)*vibration;
    
    ctx.save();
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    const goldGrad = ctx.createLinearGradient(-25, -15, 25, 10);
    goldGrad.addColorStop(0, '#DAA520');
    goldGrad.addColorStop(0.5, '#FFF8DC');
    goldGrad.addColorStop(1, '#B8860B');
    ctx.fillStyle = goldGrad;

    // Left Loop
    ctx.save();
    ctx.rotate(-0.3 + sway * 0.01);
    ctx.beginPath();
    ctx.bezierCurveTo(-5, 0, -35, -25, -45, -5);
    ctx.bezierCurveTo(-45, 10, -15, 5, -5, 0);
    ctx.fill();
    // Inner fold
    ctx.fillStyle = '#8B6508';
    ctx.beginPath(); ctx.ellipse(-25, -7, 10, 4, -0.4, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Right Loop
    ctx.save();
    ctx.fillStyle = goldGrad;
    ctx.rotate(0.3 + sway * 0.01);
    ctx.beginPath();
    ctx.bezierCurveTo(5, 0, 35, -25, 45, -5);
    ctx.bezierCurveTo(45, 10, 15, 5, 5, 0);
    ctx.fill();
    // Inner fold
    ctx.fillStyle = '#8B6508';
    ctx.beginPath(); ctx.ellipse(25, -7, 10, 4, 0.4, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Center Knot
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }

  // Verlet integration for ribbon falling off
  function drawRibbonCloth(ctx: CanvasRenderingContext2D, t: number, startX: number, startY: number, segments: RibbonSegment[], dir: number) {
    const segLen = 15;
    const gravity = 0.5;
    const wind = Math.sin(t * 3) * 0.2 + dir * 0.1;

    // Head is anchored at startX, startY initially, then falls
    if (segments[0].y === 0) {
      // Init
      for(let i=0; i<segments.length; i++) {
        segments[i].x = startX + i * dir * 5;
        segments[i].y = startY + i * 10;
        segments[i].oldX = segments[i].x;
        segments[i].oldY = segments[i].y;
      }
    } else {
      // Free fall after unlocking
      segments[0].oldY = segments[0].y;
      segments[0].y += gravity * 2; // Falls away
      segments[0].x += dir * 2;
    }

    // Verlet integration
    for(let i=1; i<segments.length; i++) {
      const seg = segments[i];
      const vx = seg.x - seg.oldX;
      const vy = seg.y - seg.oldY;
      seg.oldX = seg.x;
      seg.oldY = seg.y;
      seg.x += vx + wind;
      seg.y += vy + gravity;
    }

    // Constraints
    for(let k=0; k<3; k++) {
      for(let i=1; i<segments.length; i++) {
        const p1 = segments[i-1];
        const p2 = segments[i];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) continue;
        const diff = segLen - dist;
        const percent = diff / dist / 2;
        const ox = dx * percent;
        const oy = dy * percent;
        
        if (i > 1) { // Root moves freely now, but relative distance must hold
          p1.x -= ox; p1.y -= oy;
        }
        p2.x += ox; p2.y += oy;
      }
    }

    // Draw Ribbon Curve
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for(let i=1; i<segments.length-1; i++) {
      const xc = (segments[i].x + segments[i+1].x) / 2;
      const yc = (segments[i].y + segments[i+1].y) / 2;
      ctx.quadraticCurveTo(segments[i].x, segments[i].y, xc, yc);
    }
    ctx.lineTo(segments[segments.length-1].x, segments[segments.length-1].y);
    
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = '#FFD700'; // Highlight
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  function drawCinematicFlowers(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, progress: number) {
    if (progress <= 0) return;
    const flowers = [
      { dx: -70, dy: -40, color: '#FF69B4', r: 35, delay: 0.1 },
      { dx: 0, dy: -70, color: '#FFD4E1', r: 45, delay: 0 },
      { dx: 70, dy: -30, color: '#FFB6C1', r: 32, delay: 0.2 },
      { dx: -35, dy: -90, color: '#E8C06A', r: 28, delay: 0.3 },
      { dx: 40, dy: -85, color: '#FF69B4', r: 30, delay: 0.4 },
    ];

    flowers.forEach((f, idx) => {
      // Individual staggered blooming
      const localP = Math.max(0, Math.min(1, (progress - f.delay) * 2));
      if (localP <= 0) return;
      
      const bloom = easeOutElastic(localP);
      const sway = Math.sin(t * 1.5 + idx) * 0.1;

      ctx.save();
      ctx.translate(x + f.dx * bloom, y + f.dy * bloom);
      ctx.scale(bloom, bloom);
      ctx.rotate(t * 0.2 + idx + sway);

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 10;

      // Petals
      const numPetals = 7;
      for (let i = 0; i < numPetals; i++) {
        ctx.save();
        ctx.rotate((i / numPetals) * Math.PI * 2);
        
        // Complex petal gradient
        const pGrad = ctx.createLinearGradient(0, 0, 0, -f.r);
        pGrad.addColorStop(0, '#FFFFFF');
        pGrad.addColorStop(0.3, f.color);
        pGrad.addColorStop(1, '#FF1493'); // Deeper edge
        
        ctx.beginPath();
        // Organic petal shape
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-f.r*0.4, -f.r*0.3, -f.r*0.5, -f.r*0.8, 0, -f.r);
        ctx.bezierCurveTo(f.r*0.5, -f.r*0.8, f.r*0.4, -f.r*0.3, 0, 0);
        
        ctx.fillStyle = pGrad;
        ctx.fill();
        
        // Petal vein
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(0, -f.r*0.7);
        ctx.stroke();

        ctx.restore();
      }

      // Center Stigma
      ctx.beginPath();
      ctx.arc(0, 0, f.r * 0.25, 0, Math.PI * 2);
      const cGrad = ctx.createRadialGradient(0,0,0, 0,0, f.r*0.25);
      cGrad.addColorStop(0, '#FFD700');
      cGrad.addColorStop(1, '#D2691E');
      ctx.fillStyle = cGrad;
      ctx.fill();

      // Pollen dots
      ctx.fillStyle = '#FFF8DC';
      for(let i=0; i<8; i++){
         const a = (i/8)*Math.PI*2 + t;
         const d = f.r * 0.3;
         ctx.beginPath(); ctx.arc(Math.cos(a)*d, Math.sin(a)*d, 2, 0, Math.PI*2); ctx.fill();
      }

      ctx.restore();
    });
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

  return (
    <div id="gift-experience" style={{ position: 'fixed', inset: 0, zIndex: 15, opacity, transition: 'opacity 1.5s ease', cursor: phase === 'floating' ? 'pointer' : 'default' }} onClick={handleGiftClick}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Instruction */}
      {showInstruction && phase === 'floating' && (
        <p style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(16px, 2.5vw, 24px)',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: '0.08em',
          zIndex: 3,
          animation: 'breathe 3s ease-in-out infinite',
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}>
          Gently click to unwrap the magic...
        </p>
      )}

      {/* Bouquet Modal (Cinematic Entrance) */}
      {showBouquet && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(10,15,40,0.7) 0%, rgba(2,5,15,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 2s ease forwards',
        }}>
          <div style={{
            position: 'relative',
            width: 'min(760px, 94vw)',
            padding: '32px',
            borderRadius: '32px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.2)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            animation: 'scaleUpFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            opacity: 0,
            transform: 'translateY(40px) scale(0.95)',
          }}>
            <div style={{ animation: 'fadeInUp 1s ease 0.5s forwards', opacity: 0 }}>
              <h2 style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFF8DC, #E8C06A, #D4A574)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px',
                filter: 'drop-shadow(0 4px 12px rgba(232,192,106,0.4))',
              }}>
                A Bouquet For You 💐
              </h2>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                fontStyle: 'italic',
                color: 'rgba(230,240,255,0.8)',
                lineHeight: '1.5',
              }}>
                Dear Love, I miss you very much and love you 🥺 <br />
                <span style={{ fontSize: '14px', opacity: 0.6, letterSpacing: '0.1em' }}>— SINCERELY, SHAHID</span>
              </p>
            </div>

            {/* Embedded Bouquet with Delayed Fade In */}
            <div style={{
              width: '100%',
              height: 'clamp(350px, 55vh, 550px)',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)',
              background: '#FAF6EE',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.1)',
              animation: 'fadeIn 1s ease 1.2s forwards',
              opacity: 0,
            }}>
              <iframe
                src="https://digibouquet.vercel.app/bouquet/968ae890-66dc-4b9c-8f5e-4351ceca3da7"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="A Bouquet for Akanksha"
              />
            </div>

            <button
              onClick={handleBouquetClose}
              style={{
                alignSelf: 'center',
                padding: '16px 48px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(232,192,106,0.2), rgba(212,165,116,0.1))',
                border: '1px solid rgba(232,192,106,0.5)',
                color: '#E8C06A',
                fontFamily: "'Cinzel', serif",
                fontSize: '12px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                animation: 'fadeInUp 1s ease 1.8s forwards',
                opacity: 0,
              }}
              onMouseEnter={e => { 
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(232,192,106,0.4), rgba(212,165,116,0.2))';
                (e.target as HTMLElement).style.transform = 'translateY(-4px) scale(1.02)'; 
                (e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(232,192,106,0.4)';
              }}
              onMouseLeave={e => { 
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(232,192,106,0.2), rgba(212,165,116,0.1))';
                (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; 
                (e.target as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
              }}
            >
              Continue the Journey ✨
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleUpFade {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
