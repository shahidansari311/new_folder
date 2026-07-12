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
  { text: "[Write anything extra you want to add here...]" },
  { text: "" },
  { text: "i love you but yrr ab dur rehna hi sahi hai" },
  { text: "humtumhe kabhi deserve hi nhi karte the tu, best ho" },
  { text: "bahut yaad aati hai tumhari sachhi yrr" },
  { text: "sorry bye please contact mat karna ab bss ye mera last hai" },
  { text: "Tumhe pta hai ye jo website hai wo automatically countdown khatam hoga 12 september ko raat 12 baje thoda animation me dikkat hai ignore karna please hum perfect developer nhi ban paye " },
  { text: "Mujhe tumse bahut baat karna tha" },
  { text: "Yrr ab ke status or story dekh ke mujhe sach me lagta hai hum bahut piche reh gye hai aur tum aage nikal gyi hum tumhe deserve hi nhi karte hai tum cool ho gyi but hum wahi reh gye , please tum move on kar lo mujhse tumhe mujhse bahut achha ladka mil jayega sayd mil bhi gya hoga bye sorry" },
  { text: "I mean humara last hai iske baad sb khatam" },
  { text: "mujhe nhi pta hum isko deploy karnege bhi ki nhi" },
  { text: "but kisi se bol ke search karwa dene" },
  { text: "" },
  { text: "Always yours,", italic: true },
  { text: "Shahid. 💙", italic: true },
];

export default function BirthdayLetter({ onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  const [isOpen, setIsOpen] = useState(false);
  const [showLetterContent, setShowLetterContent] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // When envelope is clicked, animate opening then transition to full letter
  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      setShowLetterContent(true);
    }, 2000); // Wait 2s for envelope opening animation
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #020617, #081326)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      overflow: 'hidden'
    }}>
      {!showLetterContent ? (
        /* ENVELOPE UI */
        <div 
          onClick={!isOpen ? handleOpen : undefined}
          style={{
            position: 'relative',
            width: 'min(400px, 80vw)',
            height: '250px',
            cursor: isOpen ? 'default' : 'pointer',
            perspective: '1000px',
            transition: 'transform 0.5s ease',
            transform: isOpen ? 'scale(1.1) translateY(40px)' : 'scale(1)',
            animation: !isOpen ? 'float 4s ease-in-out infinite' : 'none',
          }}
        >
          {/* Envelope Back */}
          <div style={{
            position: 'absolute', inset: 0,
            background: '#C79853',
            borderRadius: '4px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }} />
          
          {/* Letter Peeking out */}
          <div style={{
            position: 'absolute',
            top: 10, left: 20, right: 20, height: '230px',
            background: '#FDFBF7',
            borderRadius: '4px',
            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
            transform: isOpen ? 'translateY(-150px)' : 'translateY(0)',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          }}>
             <div style={{ fontSize: '24px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.5s 0.8s' }}>💌</div>
          </div>

          {/* Envelope Front Flaps (Left/Right/Bottom) */}
          <div style={{
            position: 'absolute', inset: 0,
            background: '#E8C06A',
            clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
            borderRadius: '4px',
            zIndex: 2,
            border: '1px solid rgba(255,255,255,0.2)',
          }} />

          {/* Envelope Top Flap */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
            background: '#DEB258',
            clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
            transformOrigin: 'top',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
            zIndex: isOpen ? 0 : 3,
          }} />

          {/* Wax Seal */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '45px', height: '45px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a71d2a, #7a151f)',
            zIndex: 4,
            boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            transition: 'opacity 0.3s ease',
            opacity: isOpen ? 0 : 1,
          }}>
            ❤️
          </div>
          
          {!isOpen && (
            <div style={{
              position: 'absolute', bottom: -50, width: '100%', textAlign: 'center',
              color: 'rgba(255,255,255,0.5)', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em',
              animation: 'breathe 2s infinite'
            }}>
              Tap to open
            </div>
          )}
        </div>
      ) : (
        /* LETTER CONTENT FULL SCREEN */
        <div style={{
          width: 'min(640px, 92vw)',
          height: '85vh',
          position: 'relative',
          borderRadius: '4px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          overflowY: 'auto',
          overflowX: 'hidden',
          maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
          animation: 'expandLetter 1s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}>
          {/* Paper texture */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.03), transparent 60%)',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* Scrolling Content */}
          <div
            style={{
              padding: '80px 40px',
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
            
            {/* Complete Button */}
            <div style={{ marginTop: '60px', marginBottom: '40px' }}>
              <button
                onClick={onComplete}
                style={{
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
            </div>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(232, 192, 106, 0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(232, 192, 106, 0.5); }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes expandLetter {
          0% { transform: scale(0.8) translateY(100px); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
        }
      `}</style>
    </div>
  );
}
