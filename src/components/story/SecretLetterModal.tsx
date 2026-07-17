'use client';
import { useState } from 'react';

interface Props {
  onClose: () => void;
}

const CUSTOM_LETTER_LINES = [
  { text: "Babu 🥺", type: "title" },
  { text: "Hey hello hyy bahut din ho gye baat kiye hue 🥹 kaisi ho" },
  { text: "Janti ho tum mujhe bahut jyada bahut jyada wali pasand ho, sachi bahut jyada. Tumhe miss bhi bahut karte hai. ❤️" },
  { text: "Janti ho 17 April ko na 🤩 kya mast sapna aaya tha..." },
  { text: "" },
  { text: "\"Hey shona, aaj janti ho hum n tumhe sapne me dekhe." },
  { text: "Hum dono ki shaadi ho gayi thi. 💍" },
  { text: "Tum mere ghar pe bahu ban ke aayi ho aur mummy papa ne khud humari shaadi karayi thi. 🥹" },
  { text: "Literally yrr, maja aa gaya wo sapna dekh ke... sach me. ❤️" },
  { text: "Aur janti ho, naya wala ghar tha jo abhi bana hai na, usme the hum log." },
  { text: "Uske baad hum dono ko Ghaziabad aana tha. 🏡✨\"" },
  { text: "" },
  { text: "Ye exact message tha jo tumhe bhejne ke liye rakhe the... 😭" },
  { text: "Par pata nahi kaise apne aap ko hi bhej diye." },
  { text: "" },
  { text: "Bas itna hi... tum yaad bahut aati ho. 💙" },
  { text: "" },
  { text: "Always yours,", italic: true },
  { text: "Shahid. 💙", italic: true },
];

export default function SecretLetterModal({ onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLetterContent, setShowLetterContent] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      setShowLetterContent(true);
    }, 1500); 
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(15px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {!showLetterContent ? (
          /* ENVELOPE UI */
          <div 
            onClick={!isOpen ? handleOpen : undefined}
            style={{
              position: 'relative',
              width: 'min(360px, 80vw)',
              height: '220px',
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
              top: 10, left: 20, right: 20, height: '200px',
              background: '#FDFBF7',
              borderRadius: '4px',
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
              transform: isOpen ? 'translateY(-140px)' : 'translateY(0)',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '20px',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            }}>
               <div style={{ fontSize: '24px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.5s 0.8s' }}>💌</div>
            </div>

            {/* Envelope Front Flaps */}
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
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
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
                position: 'absolute', bottom: -40, width: '100%', textAlign: 'center',
                color: 'rgba(255,255,255,0.5)', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em',
                animation: 'breathe 2s infinite'
              }}>
                Tap to open
              </div>
            )}
          </div>
        ) : (
          /* LETTER CONTENT */
          <div style={{
            width: 'min(500px, 90vw)',
            height: 'min(700px, 80vh)',
            position: 'relative',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            overflowY: 'auto',
            overflowX: 'hidden',
            animation: 'chatZoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}>
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', color: '#333', fontSize: '16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>

            <div
              style={{
                padding: '60px 40px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>💌</div>
                <div style={{
                  width: '60px', height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(232,192,106,0.8), transparent)',
                  margin: '0 auto',
                }} />
              </div>

              {CUSTOM_LETTER_LINES.map((line, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: line.italic ? "'Dancing Script', cursive" : "'Cormorant Garamond', serif",
                    fontSize: line.type === 'title' ? '28px' : line.italic ? '22px' : '18px',
                    fontStyle: line.italic ? 'italic' : 'normal',
                    fontWeight: line.type === 'title' ? 600 : 500,
                    color: line.type === 'title' ? '#a71d2a' : '#334155',
                    lineHeight: 1.8,
                    textAlign: 'center',
                    minHeight: line.text === '' ? '20px' : undefined,
                  }}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
