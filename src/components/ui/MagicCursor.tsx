'use client';
import { useEffect, useRef } from 'react';

export default function MagicCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
    };

    const animate = () => {
      ringX += (dotX - ringX) * 0.12;
      ringY += (dotY - ringY) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.left = `${dotX}px`;
        dotRef.current.style.top = `${dotY}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    animate();

    // Hide on touch devices
    const isMobile = window.matchMedia('(hover: none)').matches;
    if (isMobile) {
      if (dotRef.current) dotRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: '#F0F4FF',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'exclusion',
          boxShadow: '0 0 8px rgba(77,175,255,0.6)',
        }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          width: '36px', height: '36px',
          borderRadius: '50%',
          border: '1.5px solid rgba(240,244,255,0.4)',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
        }}
        aria-hidden="true"
      />
    </>
  );
}
