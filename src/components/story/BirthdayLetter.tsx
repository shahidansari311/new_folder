'use client';
import { useEffect, useRef, useState } from 'react';
interface Props { onComplete: () => void; }

const LETTER_LINES = [
  { text: "Babe 🥺", type: "title" },
  { text: "Mujhe samajh nhi aa rha ye kaha se shuru karu 😒" },
  { text: "" },
  { text: "Tum jab us class me aayi thi, tab mujhe lagta tha sab normal hai." },
  { text: "Wahi light blue shirt, khule baal... kuch to alag lg rha tha 🧐" },
  { text: "" },
  { text: "Mujhe yaad nhi humne pehli baat kya ki thi." },
  { text: "Bas itna yaad hai ki hum dono bahut hase the 🤩" },
  { text: "" },
  { text: "Aur kitna achha lag rha tha etni aasani se baat karna 🤗" },
  { text: "Saare taare humare liye ek sath chamakne lage ✨" },
  { text: "" },
  { text: "Chale ab point pe aate h 😃" },
  { text: "Tum mere liye kitni special ho, mai shabdo me bata ni sakta. 🥺" },
  { text: "Isliye tumhare is birthday pe, maine tumhare liye ye chhota sa universe banaya h 💕" },
  { text: "Kyu ki ek duniya tumhare liye bahut chhoti lagti hai." },
  { text: "" },
  { text: "Happy Birthday, Akanksha. Hamesha aise hi khush rehna 🤩" },
  { text: "" },
  { text: "i love you but yrr ab dur rehna hi sahi hai" },
  { text: "humtumhe kabhi deserve hi nhi karte the tu, best ho" },
  { text: "bahut yaad aati hai tumhari sachhi yrr" },
  { text: "sorry bye please contact mat karna ab bss ye mera last hai" },
  { text: "i mean humara last hai iske baad sb khatam" },
  { text: "mujhe nhi pta hum isko deploy karnege bhi ki nhi" },
  { text: "but kisi se bol e search karwa dene" },
  { text: "" },
  { text: "Always yours,", italic: true },
  { text: "The boy from that classroom. 💙", italic: true },
];

export default function BirthdayLetter({ onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    
    // The animation takes 50s. Show continue button near the end.
    const btnTimer = setTimeout(() => {
      if (!cancelled) setShowButton(true);
    }, 45000);

    return () => {
      cancelled = true;
      clearTimeout(btnTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #020617, #081326)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      overflow: 'hidden'
    }}>
      {/* Letter container */}
      <div style={{
        width: 'min(640px, 92vw)',
        height: '85vh',
        position: 'relative',
        borderRadius: '4px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
      }}>
        {/* Paper texture */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.03), transparent 60%)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* Auto Scrolling Content */}
        <div
          className="scrolling-letter"
          style={{
            padding: '40px',
            position: 'absolute',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Decorative top */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💌</div>
            <div style={{
              width: '80px', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(232,192,106,0.5), transparent)',
              margin: '0 auto',
            }} />
          </div>

          {/* Letter lines */}
          {LETTER_LINES.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: line.italic ? "'Dancing Script', cursive" : "'Cormorant Garamond', serif",
                fontSize: line.type === 'title'
                  ? 'clamp(22px, 4vw, 32px)'
                  : line.italic
                    ? 'clamp(18px, 3vw, 26px)'
                    : 'clamp(16px, 2.5vw, 24px)',
                fontStyle: line.italic ? 'italic' : 'normal',
                fontWeight: line.type === 'title' ? 600 : 400,
                color: line.type === 'title' ? '#E8C06A' : 'rgba(200,212,232,0.9)',
                lineHeight: 1.8,
                textAlign: 'center',
                minHeight: line.text === '' ? '20px' : undefined,
                letterSpacing: line.type === 'title' ? '0.05em' : '0.02em',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {line.text}
            </div>
          ))}

          {/* Signature flourish */}
          <div style={{
            marginTop: '60px',
            borderTop: '1px solid rgba(232,192,106,0.2)',
            paddingTop: '32px',
            textAlign: 'center',
            width: '60%',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌙</div>
            <p style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '12px',
              letterSpacing: '0.3em',
              color: 'rgba(200,212,232,0.5)',
              textTransform: 'uppercase',
            }}>
              12 September 2026
            </p>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      {showButton && (
        <button
          onClick={onComplete}
          style={{
            position: 'absolute',
            bottom: '40px',
            padding: '16px 48px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(232,192,106,0.2), rgba(212,165,116,0.1))',
            border: '1px solid rgba(232,192,106,0.4)',
            color: '#E8C06A',
            fontFamily: "'Cinzel', serif",
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.4s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 1s ease forwards',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,192,106,0.4), rgba(212,165,116,0.2))';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(232,192,106,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,192,106,0.2), rgba(212,165,116,0.1))';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
          }}
        >
          End Chapter ✨
        </button>
      )}

      <style>{`
        .scrolling-letter {
          animation: scrollUp 50s linear forwards;
        }

        @keyframes scrollUp {
          0% {
            transform: translateY(100vh);
          }
          100% {
            transform: translateY(-110%);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
