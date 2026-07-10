'use client';

import { useEffect, useState, useRef } from 'react';

interface Props { onComplete: () => void; }

export default function FriendshipChapter({ onComplete }: Props) {
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
      triggerScene(1, 2000),
      triggerScene(2, 5000),
      triggerScene(3, 8000),
      setTimeout(() => { if (!cancelled) onCompleteRef.current(); }, 12000),
    ];

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, []);

  const scenes = [
    {
      bg: 'linear-gradient(135deg, #F5E8C8, #EDE0B8)',
      emoji: '🚶‍♂️🚶‍♀️',
      title: 'Class Ke Baad...',
      text: 'Kuch bhi ho, hum dono hamesha ek hi direction me saath chalte the.',
    },
    {
      bg: 'linear-gradient(135deg, #E8F0FF, #D8E8FF)',
      emoji: '💬',
      title: 'Pehli Baar Baat',
      text: 'Chhoti-chhoti baatein. Textbooks aur homework ki share. Bahut pyara feel hota tha.',
    },
    {
      bg: 'linear-gradient(135deg, #F0E8FF, #E0D8FF)',
      emoji: '✨',
      title: 'Dheere Dheere...',
      text: 'Pata hi nahi chala kab do strangers ek dusre ke itne close aa gye.',
    },
  ];

  const currentScene = scenes[scene] || scenes[0];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: currentScene.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'all 1.5s ease',
      padding: '48px',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: contentOpacity,
        transition: 'opacity 0.5s ease',
      }}>
        <div style={{ fontSize: 'clamp(40px, 8vw, 80px)', marginBottom: '24px' }}>
          {currentScene.emoji}
        </div>
        <h2 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(20px, 4vw, 40px)',
          color: '#1a1040',
          letterSpacing: '0.08em',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          {currentScene.title}
        </h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(18px, 3vw, 28px)',
          color: '#2a2060',
          maxWidth: '600px',
          textAlign: 'center',
          lineHeight: 1.7,
        }}>
          {currentScene.text}
        </p>
      </div>
    </div>
  );
}
