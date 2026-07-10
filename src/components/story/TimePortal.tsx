'use client';

import { useEffect, useRef, useState } from 'react';

interface Props { onComplete: () => void; }

export default function TimePortal({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [year, setYear] = useState(2026);
  const [showCalendar, setShowCalendar] = useState(false);
  const animRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    // Portal sequence
    let goldOpacity = 0;

    const draw = (ts: number) => {
      const t = ts * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;

      // White-golden portal light
      goldOpacity = Math.min(1, goldOpacity + 0.008);
      const portalGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H));
      portalGrad.addColorStop(0, `rgba(255, 220, 100, ${goldOpacity * 0.9})`);
      portalGrad.addColorStop(0.3, `rgba(255, 200, 80, ${goldOpacity * 0.6})`);
      portalGrad.addColorStop(0.7, `rgba(255, 180, 60, ${goldOpacity * 0.3})`);
      portalGrad.addColorStop(1, 'rgba(2,6,23,1)');
      ctx.fillStyle = portalGrad;
      ctx.fillRect(0, 0, W, H);

      // Floating memory objects
      const memItems = [
        { icon: '📸', x: 0.2, y: 0.3, speed: 0.5 },
        { icon: '📱', x: 0.8, y: 0.2, speed: 0.7 },
        { icon: '📝', x: 0.1, y: 0.7, speed: 0.4 },
        { icon: '💬', x: 0.9, y: 0.6, speed: 0.6 },
        { icon: '📚', x: 0.3, y: 0.8, speed: 0.5 },
        { icon: '✏️', x: 0.7, y: 0.75, speed: 0.8 },
      ];

      if (goldOpacity > 0.3) {
        memItems.forEach((item, i) => {
          const px = item.x * W + Math.sin(t * item.speed + i) * 30;
          const py = item.y * H + Math.cos(t * item.speed * 0.7 + i) * 20;
          ctx.save();
          ctx.globalAlpha = 0.4 + 0.2 * Math.sin(t + i);
          ctx.font = `${Math.min(W, H) * 0.04}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(item.icon, px, py);
          ctx.restore();
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    const t1 = setTimeout(() => {
      if (!cancelled) setShowCalendar(true);
    }, 2000);

    // Year counting down
    let yr = 2026;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    const yearInterval = setInterval(() => {
      if (cancelled) return;
      yr--;
      setYear(yr);
      if (yr <= 2020) {
        clearInterval(yearInterval);
        t2 = setTimeout(() => {
          if (cancelled) return;
          setShowCalendar(false);
          t3 = setTimeout(() => {
            if (!cancelled) onCompleteRef.current();
          }, 1500);
        }, 2000);
      }
    }, 400);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current);
      clearInterval(yearInterval);
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 25 }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />

      {showCalendar && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          <div style={{
            padding: '40px 60px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(48px, 10vw, 120px)',
              fontWeight: 600,
              color: '#020617',
              letterSpacing: '-0.02em',
              transition: 'all 0.3s ease',
              lineHeight: 1,
            }}>
              {year}
            </div>
            {year === 2020 && (
              <>
                <div style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(20px, 4vw, 48px)',
                  color: '#020617',
                  opacity: 0.8,
                  marginTop: '8px',
                }}>
                  October
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(40px, 8vw, 96px)',
                  fontWeight: 300,
                  color: '#020617',
                }}>
                  20
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
