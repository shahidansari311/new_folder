'use client';
import { useEffect, useRef, useState } from 'react';
interface Props { onComplete: () => void; }

const LETTER_LINES = [
  { delay: 0.5, text: "Dear Akanksha," },
  { delay: 1.5, text: "" },
  { delay: 2.0, text: "Mujhe samajh nhi aa rha ye letter kaha se shuru karu." },
  { delay: 3.2, text: "Jo mai bolna chahta hu, uske liye words hamesha kam pad jaate hain." },
  { delay: 4.5, text: "" },
  { delay: 5.0, text: "Par phir bhi ek koshish kr rha hu." },
  { delay: 6.0, text: "" },
  { delay: 6.8, text: "Tum jab us class me aayi thi, tab mujhe lagta tha sab normal hai." },
  { delay: 8.2, text: "Wahi light blue shirt, khule baal, aur school bag." },
  { delay: 9.5, text: "Wo mere liye ek din sab kuch ban jayega, maine kabhi socha ni tha." },
  { delay: 11.0, text: "" },
  { delay: 11.5, text: "Mujhe yaad nhi humne pehli baat kya ki thi." },
  { delay: 12.8, text: "Bas itna yaad hai ki hum dono bahut hase the." },
  { delay: 14.0, text: "" },
  { delay: 14.8, text: "Aur kitna achha lag rha tha etni aasani se baat karna," },
  { delay: 16.0, text: "ek aisi ladki se jise mai theek se jaanta bhi ni tha." },
  { delay: 17.5, text: "" },
  { delay: 18.2, text: "Bahut saari fight hui, silences aaye, aur wo baarish bhi." },
  { delay: 19.8, text: "Aur wo moment jab tumne piche se mera haath pakda tha." },
  { delay: 21.3, text: "" },
  { delay: 22.0, text: "Tumne mujhe sikhaya ki pyaar me koi drama ni chahiye hota." },
  { delay: 23.5, text: "Bas ek dusre ke sath rehna hi kaafi hai." },
  { delay: 25.0, text: "" },
  { delay: 25.8, text: "Tum mere liye kitni special ho, mai shabdo me bata ni sakta. 🥺" },
  { delay: 27.2, text: "Isliye tumhare is birthday pe, maine tumhare liye ye chhota sa universe banaya h." },
  { delay: 28.8, text: "Kyu ki ek duniya tumhare liye bahut chhoti lagti hai." },
  { delay: 30.2, text: "" },
  { delay: 31.0, text: "Happy Birthday, Akanksha. Hamesha aise hi khush rehna aur apna khyaal rakhna. 💙" },
  { delay: 32.5, text: "" },
  { delay: 33.2, text: "Always yours,", italic: true },
  { delay: 34.2, text: "The boy from that classroom. 💙", italic: true },
];

export default function BirthdayLetter({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    LETTER_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, line.delay * 1000);
    });

    const lastDelay = LETTER_LINES[LETTER_LINES.length - 1].delay * 1000;
    const completeTimer = setTimeout(() => onComplete(), lastDelay + 5000);
    return () => clearTimeout(completeTimer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #020617, #081326)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      {/* Letter paper */}
      <div style={{
        width: 'min(640px, 92vw)',
        maxHeight: '85vh',
        position: 'relative',
      }}>
        {/* Paper texture */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.03), transparent 60%)',
          pointerEvents: 'none',
          zIndex: 2, borderRadius: '4px',
        }} />

        <div
          ref={containerRef}
          style={{
            padding: 'clamp(32px, 6vw, 60px)',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            maxHeight: '85vh',
            overflowY: 'auto',
            scrollBehavior: 'smooth',
          }}
        >
          {/* Decorative top */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💌</div>
            <div style={{
              width: '60px', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(232,192,106,0.5), transparent)',
              margin: '0 auto',
            }} />
          </div>

          {/* Letter lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {LETTER_LINES.map((line, i) => (
              <div
                key={i}
                style={{
                  fontFamily: (line as any).italic ? "'Dancing Script', cursive" : "'Cormorant Garamond', serif",
                  fontSize: i === 0
                    ? 'clamp(18px, 3vw, 26px)'
                    : (line as any).italic
                      ? 'clamp(16px, 2.5vw, 22px)'
                      : 'clamp(15px, 2vw, 20px)',
                  fontStyle: (line as any).italic ? 'italic' : 'normal',
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? '#E8C06A' : 'rgba(200,212,232,0.88)',
                  lineHeight: 1.8,
                  minHeight: line.text === '' ? '16px' : undefined,
                  opacity: visibleLines.includes(i) ? 1 : 0,
                  transform: visibleLines.includes(i) ? 'none' : 'translateY(8px)',
                  transition: 'opacity 0.8s ease, transform 0.8s ease',
                  letterSpacing: i === 0 ? '0.02em' : '0.01em',
                }}
              >
                {line.text}
              </div>
            ))}
          </div>

          {/* Signature flourish */}
          {visibleLines.length >= LETTER_LINES.length && (
            <div style={{
              marginTop: '32px',
              borderTop: '1px solid rgba(232,192,106,0.2)',
              paddingTop: '24px',
              textAlign: 'center',
              animation: 'fadeIn 1s ease',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌙</div>
              <p style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: 'rgba(200,212,232,0.4)',
                textTransform: 'uppercase',
              }}>
                12 September 2026
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
