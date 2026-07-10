'use client';

import { useEffect, useRef, useState } from 'react';

interface Props { onComplete: () => void; }

interface Message {
  id: number;
  sender: 'me' | 'you';
  text: string;
  time: string;
  type: 'text' | 'emoji' | 'voice';
  emoji?: string;
}

// Hinglish romantic and happy birthday messages from the repository chat logs
const MESSAGES: Message[] = [
  { id: 1, sender: 'you', text: 'Heyyy..', time: '12:05 AM', type: 'text' },
  { id: 2, sender: 'me', text: 'Happy Birthdayy Babe! ❤️🧿', time: '12:05 AM', type: 'text' },
  { id: 3, sender: 'you', text: 'Thankuuu so mucch 🥹🥹', time: '12:06 AM', type: 'text' },
  { id: 4, sender: 'you', text: 'Love youu🥹❤️', time: '12:06 AM', type: 'text' },
  { id: 5, sender: 'me', text: 'Love you too 😗 always and forever', time: '12:06 AM', type: 'text' },
  { id: 6, sender: 'you', text: 'Seriously best moment create kar diya aapne 🥹🥹', time: '12:07 AM', type: 'text' },
  { id: 7, sender: 'me', text: 'Tumhe pasand aaya na? Bss yahi chahiye tha 😙✨', time: '12:07 AM', type: 'text' },
  { id: 8, sender: 'you', text: 'Bohot jyada yrr! Par aapne ek br bhi pta ni chalne diya 🥺', time: '12:08 AM', type: 'text' },
  { id: 9, sender: 'me', text: 'Hehe surprise tha na 🌚 Kuch khaye aap?', time: '12:08 AM', type: 'text' },
  { id: 10, sender: 'you', text: 'Nhi abhi... Aapne kuch khaya?', time: '12:09 AM', type: 'text' },
  { id: 11, sender: 'me', text: 'Nhi, bread kha ke chale the socho... Tumhare liye etna struggle 🥹', time: '12:09 AM', type: 'text' },
  { id: 12, sender: 'you', text: 'Yrr tabhi mai sochuu... You are the best! ❤️', time: '12:10 AM', type: 'text' },
  { id: 13, sender: 'me', text: 'Ab jaldi se milte hai subah, cake cut karenge 😙🎂', time: '12:10 AM', type: 'text' },
  { id: 14, sender: 'you', text: 'Yessy babe! Jaldi aao ab, wait ni ho rha 🙈❤️', time: '12:11 AM', type: 'text' },
  { id: 15, sender: 'me', text: 'Bas aane hi wala hu. I love you so much! 💞', time: '12:11 AM', type: 'text' },
  { id: 16, sender: 'you', text: 'I love you moreee! 🫶🖇️', time: '12:12 AM', type: 'text' },
];

export default function MessengerScene({ onComplete }: Props) {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [typingFor, setTypingFor] = useState<'me' | 'you' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 0;
    const showNext = () => {
      if (idx >= MESSAGES.length) {
        setTimeout(() => onComplete(), 3000);
        return;
      }
      const msg = MESSAGES[idx];
      setTypingFor(msg.sender);
      setTimeout(() => {
        setTypingFor(null);
        setVisibleMessages(prev => [...prev, msg]);
        idx++;
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
        setTimeout(showNext, 1200 + Math.random() * 800);
      }, 1000 + msg.text.length * 20);
    };
    const timer = setTimeout(showNext, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020617',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Messenger UI */}
      <div style={{
        width: 'min(480px, 95vw)',
        height: 'min(700px, 90vh)',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(255,255,255,0.04)',
        }}>
          {/* Avatar */}
          <div style={{
            width: '44px', height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4DAFFF, #A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 0 20px rgba(77,175,255,0.4)',
          }}>
            👩
          </div>
          <div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              color: '#F0F4FF',
            }}>
              Akanksha ✨
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              color: '#4DAFFF',
            }}>
              Active now
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '20px' }}>💬</div>
        </div>

        {/* Messages */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            scrollBehavior: 'smooth',
          }}
        >
          {/* Date separator */}
          <div style={{
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: 'rgba(200,212,232,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '8px 0',
          }}>
            October 2020
          </div>

          {visibleMessages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {typingFor && (
            <TypingIndicator sender={typingFor} />
          )}
        </div>

        {/* Input bar */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <div style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: 'rgba(200,212,232,0.4)',
          }}>
            Aa
          </div>
          <div style={{ fontSize: '20px', cursor: 'pointer' }}>👍</div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isMe = message.sender === 'me';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isMe ? 'flex-end' : 'flex-start',
      animation: 'fadeInUp 0.4s ease forwards',
    }}>
      {!isMe && (
        <div style={{
          width: '28px', height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4DAFFF, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', marginRight: '8px', flexShrink: 0,
          alignSelf: 'flex-end',
        }}>
          👩
        </div>
      )}
      <div>
        <div style={{
          maxWidth: '260px',
          padding: message.type === 'emoji' ? '8px 12px' : '10px 16px',
          borderRadius: isMe
            ? '20px 20px 4px 20px'
            : '20px 20px 20px 4px',
          background: isMe
            ? 'linear-gradient(135deg, #0084FF, #006EE6)'
            : 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          fontSize: message.type === 'emoji' ? '28px' : '14px',
          fontFamily: "'Inter', sans-serif",
          color: '#F0F4FF',
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}>
          {message.type === 'emoji' ? message.emoji : message.text}
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px',
          color: 'rgba(200,212,232,0.4)',
          marginTop: '3px',
          textAlign: isMe ? 'right' : 'left',
          paddingLeft: isMe ? 0 : '4px',
          paddingRight: isMe ? '4px' : 0,
        }}>
          {message.time} {isMe && '✓✓'}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ sender }: { sender: 'me' | 'you' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: sender === 'me' ? 'flex-end' : 'flex-start',
      alignItems: 'center',
      gap: '4px',
      padding: '0 4px',
    }}>
      {sender === 'you' && (
        <div style={{
          width: '28px', height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4DAFFF, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', marginRight: '8px',
        }}>
          👩
        </div>
      )}
      <div style={{
        padding: '12px 16px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: 'rgba(200,212,232,0.6)',
            animation: `typingDot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
