'use client';
import { useEffect, useState, useRef } from 'react';
interface Props { onComplete: () => void; }

export default function FightChapter({ onComplete }: Props) {
  const [scene, setScene] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(1);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let transitionTimer: NodeJS.Timeout;

    const triggerScene = (nextScene: number, delay: number) => {
      return setTimeout(() => {
        if (cancelled) return;
        setContentOpacity(0);
        transitionTimer = setTimeout(() => {
          if (cancelled) return;
          setScene(nextScene);
          setContentOpacity(1);
        }, 500);
      }, delay);
    };

    const timers = [
      triggerScene(1, 3000),
      triggerScene(2, 7000),
      triggerScene(3, 11000),
      setTimeout(() => { if (!cancelled) onCompleteRef.current(); }, 14000),
    ];

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, []);

  const scenes = [
    { bg: 'linear-gradient(180deg, #1a1a3a 0%, #2a1020 100%)', rain: true,
      icon: '🌧️', title: 'Wo Baarish', subtitle: 'Lagta tha jaise aasman ko bhi pata tha ki kuch galat hua hai.' },
    { bg: 'linear-gradient(180deg, #0d0d2a 0%, #1a0a20 100%)', rain: true,
      icon: '💔', title: 'Wo Khamoshi', subtitle: 'Mai aage badh raha tha... Aur tum wahi ruk gyi.' },
    { bg: 'linear-gradient(180deg, #0d1a2a 0%, #101a30 100%)', rain: false,
      icon: '🤝', title: 'Tumne Mera Haath Pakda', subtitle: 'Dheere se. Peeche se. Tumne mera haath pakad liya.\n\nAur wahi sab kuch ruk gya.' },
  ];

  const s = scenes[scene] || scenes[0];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: s.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'all 2s ease',
      overflow: 'hidden', padding: '48px',
    }}>
      {s.rain && <RainEffect />}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: contentOpacity,
        transition: 'opacity 0.5s ease',
        zIndex: 2,
      }}>
        <div style={{ fontSize: 'clamp(50px, 10vw, 100px)', marginBottom: '24px', filter: 'drop-shadow(0 0 20px rgba(77,175,255,0.5))' }}>{s.icon}</div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(24px, 5vw, 52px)',
          color: '#C8D4E8',
          textAlign: 'center', marginBottom: '20px',
        }}>{s.title}</h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(16px, 2.5vw, 24px)',
          color: 'rgba(200,212,232,0.7)',
          maxWidth: '500px', textAlign: 'center',
          lineHeight: 1.8, whiteSpace: 'pre-line',
        }}>{s.subtitle}</p>
      </div>
    </div>
  );
}

function RainEffect() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
      {Array.from({length: 60}, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}%`,
          width: '1px',
          height: `${Math.random() * 60 + 20}px`,
          background: 'linear-gradient(transparent, rgba(77,175,255,0.4))',
          animation: `rain ${Math.random() * 0.5 + 0.5}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-50px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
