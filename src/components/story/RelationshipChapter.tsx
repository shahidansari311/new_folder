'use client';
import { useEffect, useState } from 'react';
interface Props { onComplete: () => void; }
export default function RelationshipChapter({ onComplete }: Props) {
  const [scene, setScene] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(1);

  useEffect(() => {
    const triggerScene = (nextScene: number) => {
      setContentOpacity(0);
      setTimeout(() => {
        setScene(nextScene);
        setContentOpacity(1);
      }, 500);
    };

    const t = [
      setTimeout(() => triggerScene(1), 3500),
      setTimeout(() => triggerScene(2), 8000),
      setTimeout(() => triggerScene(3), 13000),
      setTimeout(() => onComplete(), 17000),
    ];
    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  const scenes = [
    { bg: 'linear-gradient(135deg, #0B1437, #162060)', emoji: '🌙✨', title: 'Aasman Chamakne Laga', text: 'Saare taare humare liye ek sath chamakne lage.' },
    { bg: 'linear-gradient(135deg, #0f1860, #1a1080)', emoji: '🤗', title: 'Pehli Hug', text: 'Wo khali classroom. Khidki se aati chaandni. Aur wo khamoshi jisne sab kuch bol diya.' },
    { bg: 'linear-gradient(135deg, #081326, #162080)', emoji: '🌊💫', title: 'Lake Ke Paas', text: 'Jugnu. Aasman me lights. Paani pe chaand ki roshni. Aur tum.' },
  ];
  const s = scenes[scene] || scenes[0];
  return (
    <div style={{
      position: 'fixed', inset: 0, background: s.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'all 2s ease', padding: '48px',
    }}>
      <FloatingStars />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: contentOpacity,
        transition: 'opacity 0.5s ease',
        zIndex: 2,
      }}>
        <div style={{ fontSize: 'clamp(40px, 8vw, 80px)', marginBottom: '24px', filter: 'drop-shadow(0 0 30px rgba(232,192,106,0.6))' }}>{s.emoji}</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 5vw, 52px)', color: '#E8C06A', textAlign: 'center', marginBottom: '20px', textShadow: '0 0 40px rgba(232,192,106,0.4)' }}>{s.title}</h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'clamp(16px, 2.5vw, 26px)', color: 'rgba(200,212,232,0.85)', maxWidth: '500px', textAlign: 'center', lineHeight: 1.8 }}>{s.text}</p>
      </div>
    </div>
  );
}
function FloatingStars() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {Array.from({length: 30}, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          borderRadius: '50%',
          background: '#E8C06A',
          boxShadow: '0 0 6px rgba(232,192,106,0.8)',
          animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        }} />
      ))}
    </div>
  );
}
