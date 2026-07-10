'use client';

import { useEffect, useRef, useState } from 'react';

interface Props { onComplete: () => void; }

export default function ClassroomScene({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    let girlX = -150;
    let girlWalking = false;
    let girlSeated = false;
    let boyLookGirl = 0;
    let sequence = 0;
    let seqTimer = 0;

    const draw = (ts: number) => {
      const t = ts * 0.001;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Classroom background
      drawClassroom(ctx, W, H, t);

      // Dust particles
      for (let i = 0; i < 15; i++) {
        const px = ((i * 137 + t * 8) % W);
        const py = H * 0.2 + ((i * 89 + t * 3) % (H * 0.5));
        ctx.save();
        ctx.globalAlpha = 0.1 + 0.05 * Math.sin(t + i);
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#E8C06A';
        ctx.fill();
        ctx.restore();
      }

      // Boy character
      const boyX = W * 0.6;
      const boyY = H * 0.62;
      drawCharacter(ctx, boyX, boyY, t, 'boy', boyLookGirl);

      // Girl character
      if (sequence >= 2) {
        if (!girlSeated) {
          girlX = Math.min(W * 0.38, girlX + 1.2);
          if (girlX >= W * 0.38) girlSeated = true;
        }
        const girlY = girlSeated ? H * 0.62 : H * 0.65;
        drawCharacter(ctx, girlX, girlY, t, 'girl', 0);
      }

      // Sequence advancement
      seqTimer++;
      if (seqTimer > 180 && sequence === 0) { sequence = 1; } // Door opens
      if (seqTimer > 300 && sequence === 1) { sequence = 2; girlX = -150; } // Girl enters
      if (seqTimer > 480 && sequence === 2 && girlSeated) {
        sequence = 3;
        boyLookGirl = 1;
        setTimeout(() => { boyLookGirl = 0; }, 1500);
      }
      if (seqTimer > 660 && sequence === 3) {
        sequence = 4;
        setShowTimeline(true);
        setTimeout(() => {
          setShowTimeline(false);
          setTimeout(() => onComplete(), 2000);
        }, 3000);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [onComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 22 }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />

      {showTimeline && (
        <div style={{
          position: 'absolute',
          bottom: '8%', left: '50%',
          transform: 'translateX(-50%)',
          padding: '16px 28px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease forwards',
          zIndex: 2,
          maxWidth: '400px',
        }}>
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'rgba(200,212,232,0.8)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            20 October 2020
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '16px',
            color: 'rgba(240,244,255,0.9)',
            lineHeight: 1.6,
          }}>
            First time we saw each other after coaching reopened.
          </p>
        </div>
      )}
    </div>
  );
}

function drawClassroom(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  // Background wall - warm cream
  const wallGrad = ctx.createLinearGradient(0, 0, W, H);
  wallGrad.addColorStop(0, '#F5E8C8');
  wallGrad.addColorStop(0.5, '#EDE0B8');
  wallGrad.addColorStop(1, '#D8C898');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, H);

  // Floor
  const floorGrad = ctx.createLinearGradient(0, H * 0.65, 0, H);
  floorGrad.addColorStop(0, '#8B7355');
  floorGrad.addColorStop(1, '#6B5535');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, H * 0.65, W, H * 0.35);

  // Chalkboard
  const boardW = W * 0.5, boardH = H * 0.35;
  const boardX = (W - boardW) / 2, boardY = H * 0.08;
  ctx.fillStyle = '#2d4a2d';
  ctx.fillRect(boardX, boardY, boardW, boardH);
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 8;
  ctx.strokeRect(boardX, boardY, boardW, boardH);

  // Chalk writing on board
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = '#F0F4FF';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(boardX + 20, boardY + 30 + i * 40);
    ctx.lineTo(boardX + boardW * (0.3 + Math.sin(i) * 0.2), boardY + 30 + i * 40);
    ctx.stroke();
  }
  ctx.restore();

  // Windows with sunlight
  [0.08, 0.88].forEach(wx => {
    const windowX = W * wx, windowY = H * 0.15;
    const windowW = W * 0.08, windowH = H * 0.3;

    // Sky through window
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(windowX, windowY, windowW, windowH);

    // Window frame
    ctx.strokeStyle = '#A08040';
    ctx.lineWidth = 4;
    ctx.strokeRect(windowX, windowY, windowW, windowH);

    // Sunlight rays
    ctx.save();
    ctx.globalAlpha = 0.15 + 0.05 * Math.sin(t * 0.5);
    const rayGrad = ctx.createLinearGradient(windowX, windowY, windowX + 200, windowY + windowH * 1.5);
    rayGrad.addColorStop(0, 'rgba(255,200,80,0.8)');
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(windowX, windowY);
    ctx.lineTo(windowX + windowW, windowY);
    ctx.lineTo(windowX + windowW + 200, windowY + windowH * 1.5);
    ctx.lineTo(windowX + 200, windowY + windowH * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Curtains
    ctx.save();
    ctx.globalAlpha = 0.7;
    const curtainMove = Math.sin(t * 0.3) * 5;
    ctx.fillStyle = '#D4B896';
    ctx.beginPath();
    ctx.moveTo(windowX - 5, windowY);
    ctx.bezierCurveTo(windowX + 15 + curtainMove, windowY + windowH * 0.3, windowX + 5, windowY + windowH * 0.6, windowX + 10, windowY + windowH);
    ctx.lineTo(windowX - 5, windowY + windowH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Wooden benches (rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const bx = W * 0.2 + col * W * 0.22;
      const by = H * 0.62 + row * H * 0.08;
      ctx.fillStyle = '#8B6914';
      ctx.fillRect(bx, by, W * 0.18, 12);
      ctx.fillStyle = '#6B5010';
      ctx.fillRect(bx + 5, by + 12, 8, 20);
      ctx.fillRect(bx + W * 0.18 - 13, by + 12, 8, 20);
    }
  }

  // Teacher desk
  ctx.fillStyle = '#6B5010';
  ctx.fillRect(W * 0.35, H * 0.52, W * 0.3, H * 0.08);

  // Ceiling fan (rotating)
  const fanX = W / 2, fanY = H * 0.06;
  ctx.save();
  ctx.translate(fanX, fanY);
  ctx.rotate(t * 2);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i / 4) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(40, 0);
    ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.fillRect(30, -4, 20, 8);
    ctx.restore();
  }
  ctx.restore();
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, t: number,
  type: 'boy' | 'girl',
  lookAngle: number
) {
  const breathe = Math.sin(t * 1.2) * 1.5;
  const blink = Math.floor(t * 2) % 60 < 3 ? 0.2 : 1;

  ctx.save();
  ctx.translate(x, y);

  // Body (seated)
  const bodyColor = type === 'boy' ? '#1a3a6a' : '#4a90d9';
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, -20 + breathe * 0.5, 20, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shirt details
  if (type === 'girl') {
    // Blue checked pattern suggestion
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = -18; i < 18; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, -45);
      ctx.lineTo(i, -10);
      ctx.stroke();
    }
  }

  // Arms
  ctx.fillStyle = type === 'boy' ? '#1a3a6a' : '#4a90d9';
  // Left arm on desk
  ctx.save();
  ctx.rotate(-0.3);
  ctx.fillRect(-25, -15, 10, 20);
  ctx.restore();
  // Right arm on desk
  ctx.save();
  ctx.rotate(0.3);
  ctx.fillRect(15, -15, 10, 20);
  ctx.restore();

  // Head
  const headX = lookAngle * 8;
  const headY = -48 + breathe * 0.3;
  const skinColor = '#F5C5A0';
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(headX, headY, 16, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#2a1500';
  if (type === 'girl') {
    // Long hair
    ctx.beginPath();
    ctx.arc(headX, headY, 16, 0, Math.PI, true);
    ctx.fill();
    // Side hair flowing
    ctx.beginPath();
    ctx.moveTo(headX - 16, headY);
    ctx.bezierCurveTo(headX - 22, headY + 18, headX - 20, headY + 38, headX - 18, headY + 53);
    ctx.bezierCurveTo(headX - 10, headY + 53, headX - 8, headY + 43, headX - 16, headY);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + 16, headY);
    ctx.bezierCurveTo(headX + 22, headY + 18, headX + 20, headY + 38, headX + 18, headY + 53);
    ctx.bezierCurveTo(headX + 10, headY + 53, headX + 8, headY + 43, headX + 16, headY);
    ctx.fill();
  } else {
    // Short hair
    ctx.beginPath();
    ctx.arc(headX, headY - 4, 16, Math.PI, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillRect(headX - 16, headY - 4, 32, 10);
  }

  // Eyes
  ctx.fillStyle = '#2a1500';
  ctx.save();
  ctx.globalAlpha = blink;
  ctx.beginPath();
  ctx.ellipse(headX - 6, headY - 2, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(headX + 6, headY - 2, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Notebook on desk
  ctx.fillStyle = '#F8F0E0';
  ctx.fillRect(-15, -5, 28, 18);
  ctx.strokeStyle = '#DDD';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-12, -1 + i * 5);
    ctx.lineTo(10, -1 + i * 5);
    ctx.stroke();
  }

  ctx.restore();
}
