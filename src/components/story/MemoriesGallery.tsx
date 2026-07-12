'use client';

import { useState } from 'react';
import SecretLetterModal from './SecretLetterModal';

interface ChatMessage {
  sender: 'Shahid' | 'Akanksha';
  text: string;
  time: string;
  type: 'text' | 'emoji';
}

interface ChatMemory {
  id: number;
  title: string;
  date: string;
  icon: string;
  color: string;
  preview: string;
  messages: ChatMessage[];
}

const CHAT_MEMORIES: ChatMemory[] = [
  {
    id: 11,
    title: 'Continuous Tense',
    date: '16 Aug 2024',
    icon: '🎒',
    color: '#334155',
    preview: 'Akanksha: Pasand to mai bhi aapki thi...',
    messages: [
      { sender: 'Akanksha', text: 'Heyyy..', time: '8:51 PM', type: 'text' },
      { sender: 'Shahid', text: 'Hyy hyy', time: '8:52 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Ohh aagye', time: '8:52 PM', type: 'text' },
      { sender: 'Shahid', text: 'Yahi pe the 🧐🧐 Aa kya gye', time: '8:52 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Acha jii', time: '8:53 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Ek min pasand to mai bhi aapki thi. Ek time pe 😒', time: '1:07 PM', type: 'text' },
      { sender: 'Shahid', text: 'Saman ki baat ho rhi 😒 Insan ki nahi. Ek time pe kya?', time: '1:08 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Past 😒', time: '1:08 PM', type: 'text' },
      { sender: 'Shahid', text: 'Continuous tense 😒', time: '1:08 PM', type: 'text' },
      { sender: 'Akanksha', text: '😒 lagta nii h', time: '1:08 PM', type: 'text' },
    ],
  },
  {
    id: 8,
    title: 'Chhoti Si Kissi',
    date: '08 Jan 2025',
    icon: '💋',
    color: '#991b1b',
    preview: 'Shahid: Cutie 😙😙😙✨ | Shahid: Kissi...',
    messages: [
      { sender: 'Shahid', text: 'Cutie 😙😙😙✨', time: '9:07 PM', type: 'text' },
      { sender: 'Shahid', text: 'Love you 😙✨', time: '9:08 PM', type: 'text' },
      { sender: 'Akanksha', text: '🫶🙈', time: '9:19 PM', type: 'text' },
      { sender: 'Shahid', text: 'Khana kha li shona 😙😙✨', time: '9:20 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Jii. Aur aap', time: '9:33 PM', type: 'text' },
      { sender: 'Shahid', text: 'Ha 😙😙✨', time: '9:36 PM', type: 'text' },
      { sender: 'Shahid', text: 'Kissi 😙😙😙', time: '9:37 PM', type: 'text' },
      { sender: 'Akanksha', text: '🤭🤭', time: '9:38 PM', type: 'text' },
    ],
  },
  {
    id: 1,
    title: 'Chhoti Chhoti Baatein',
    date: '11 Sep 2025',
    icon: '💬',
    color: '#1e293b',
    preview: 'Shahid: 😗 love you | Akanksha: Love you🫶...',
    messages: [
      { sender: 'Shahid', text: '😗 love you', time: '11:58 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Love you🫶🖇️', time: '12:05 AM', type: 'text' },
      { sender: 'Shahid', text: 'Aise hi bol rhe the 😙', time: '12:06 AM', type: 'text' },
    ],
  },
  {
    id: 2,
    title: 'Pyar Ka Izhaar',
    date: '12 Sep 2025',
    icon: '💖',
    color: '#4c1d95',
    preview: 'Akanksha: Love youu🥹❤️ | Shahid: Love you...',
    messages: [
      { sender: 'Akanksha', text: 'Love youu🥹❤️', time: '1:42 AM', type: 'text' },
      { sender: 'Shahid', text: 'Love you', time: '1:42 AM', type: 'text' },
      { sender: 'Akanksha', text: 'Love you ur thankuu', time: '8:41 PM', type: 'text' },
      { sender: 'Shahid', text: 'Love you ♥️😗😗', time: '8:42 PM', type: 'text' },
    ],
  },
  {
    id: 3,
    title: 'Birthday Anticipation',
    date: '02 Oct 2025',
    icon: '🎂',
    color: '#065f46',
    preview: 'Akanksha: Happy birthday aane wala h...',
    messages: [
      { sender: 'Akanksha', text: 'Happy birthday aane wala h meri jaan ka😙😙', time: '10:33 PM', type: 'text' },
      { sender: 'Shahid', text: 'Hmm 🥹🥹 hum soche bhul gyi', time: '10:35 PM', type: 'text' },
      { sender: 'Shahid', text: 'Kyu ki sb bhul gye mera birthday 🥹', time: '10:35 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Aisa thode h phale hi sb batane lage😒', time: '10:37 PM', type: 'text' },
    ],
  },
  {
    id: 4,
    title: 'Midnight Surprise',
    date: '03 Oct 2025',
    icon: '🎈',
    color: '#1e1b4b',
    preview: 'Akanksha: Happy birthdayy myy lovee❤️...',
    messages: [
      { sender: 'Akanksha', text: 'Happy birthdayy myy lovee❤️🧿🌼 cutie mutie', time: '12:00 AM', type: 'text' },
      { sender: 'Akanksha', text: '🌼🧿❤️😗', time: '12:00 AM', type: 'text' },
      { sender: 'Shahid', text: 'Thank you 😗😗', time: '12:00 AM', type: 'text' },
      { sender: 'Akanksha', text: 'Happy birthdayy babe🧿❤️', time: '3:27 AM', type: 'text' },
    ],
  },
  {
    id: 5,
    title: 'Zindagi Ka Khoobsurat Hissa',
    date: '03 Oct 2025',
    icon: '🌹',
    color: '#881337',
    preview: 'Akanksha: Once again, happy birthday...',
    messages: [
      { sender: 'Akanksha', text: '“Once again, happy birthday meri jaan! ❤️🧿 Ummeed karti hu ki aane wale har birthday pe mai aapke saath rahun… chahe hamesha aise hi ladte-jhagadte, roothte-manate hi sahi, par aap meri zindagi ka sabse khoobsurat hissa bane raho. 🫂🎀✨”', time: '9:11 PM', type: 'text' },
      { sender: 'Shahid', text: 'Thank you dhyan se jana ♥️🌞', time: '9:15 PM', type: 'text' },
    ],
  },
  {
    id: 6,
    title: 'Maje Maje',
    date: '11 Jan 2025',
    icon: '👶',
    color: '#0f766e',
    preview: 'Akanksha: Aisa baby ho jaye...',
    messages: [
      { sender: 'Akanksha', text: 'Kitna cute h 🩷', time: '11:39 PM', type: 'text' },
      { sender: 'Shahid', text: 'Hmm hmm ❤️🫠', time: '11:40 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Aisa baby ho jaye maje maje🤩', time: '11:41 PM', type: 'text' },
      { sender: 'Shahid', text: 'Achha 🫠🫠', time: '11:42 PM', type: 'text' },
    ],
  },
  {
    id: 7,
    title: 'Always & Forever',
    date: '15 Oct 2025',
    icon: '♾️',
    color: '#581c87',
    preview: 'Akanksha: I love you genuiely...',
    messages: [
      { sender: 'Akanksha', text: 'I love you genuiely mai aapse ladna ni chahti ha aapko space de dungii par plz aise to nii', time: '12:59 AM', type: 'text' },
      { sender: 'Akanksha', text: 'I am sorry mai aise ni chhod sakti I love you💞🙂‍↕️🫰 always and forever', time: '1:01 AM', type: 'text' },
      { sender: 'Akanksha', text: 'Na mano par i love you💞🫰🥹', time: '1:16 AM', type: 'text' },
    ],
  },
  {
    id: 12,
    title: 'Mai Gir Gyi To',
    date: '24 Nov 2024',
    icon: '🛵',
    color: '#0f172a',
    preview: 'Akanksha: Mai gir gyi to😒...',
    messages: [
      { sender: 'Akanksha', text: 'Ku mujhe kuch ni pta😉', time: '12:57 AM', type: 'text' },
      { sender: 'Shahid', text: 'Sb pta hai', time: '12:57 AM', type: 'text' },
      { sender: 'Akanksha', text: 'Mai gir gyi to😒', time: '12:57 AM', type: 'text' },
      { sender: 'Shahid', text: 'Sb jankari daba ke rkhi ho 🫠', time: '12:57 AM', type: 'text' },
      { sender: 'Shahid', text: 'Nhi girogi 😒', time: '12:57 AM', type: 'text' },
      { sender: 'Akanksha', text: 'Abhi pta hi ky h🌚', time: '12:58 AM', type: 'text' },
      { sender: 'Shahid', text: 'Abhi se practice karo waise baithne ka', time: '12:58 AM', type: 'text' },
    ],
  },
  {
    id: 13,
    title: 'Doraemon & Calls',
    date: '29 Sep 2025',
    icon: '📺',
    color: '#0369a1',
    preview: 'Akanksha: Doreamon dekh rhi thi...',
    messages: [
      { sender: 'Akanksha', text: 'Doreamon dekh rhi thi', time: '11:54 PM', type: 'text' },
      { sender: 'Shahid', text: 'Mujhe to mana kar di call karne se 🌞', time: '11:54 PM', type: 'text' },
      { sender: 'Shahid', text: 'Achha achha dekho dekho 🌞', time: '11:54 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Maine kb kiya😒😒', time: '11:55 PM', type: 'text' },
      { sender: 'Shahid', text: 'Ki thi 🌞', time: '11:55 PM', type: 'text' },
      { sender: 'Akanksha', text: 'Aap khud ni karte😒', time: '11:55 PM', type: 'text' },
      { sender: 'Shahid', text: 'Nhi 🌞 ab mana kar di', time: '11:55 PM', type: 'text' },
    ],
  },
  {
    id: 999,
    title: 'A Secret Letter',
    date: 'For You',
    icon: '💌',
    color: '#831843',
    preview: 'Tap to open the envelope...',
    messages: [],
  },
];

interface Props {
  onComplete: () => void;
}

export default function MemoriesGallery({ onComplete }: Props) {
  const [selected, setSelected] = useState<ChatMemory | null>(null);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #020617, #0b1437)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '50px 24px 40px',
        overflowY: 'auto',
      }}
    >
      {/* Title Header */}
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(20px, 4vw, 36px)',
          color: '#E8C06A',
          letterSpacing: '0.12em',
          marginBottom: '8px',
          textAlign: 'center',
          textShadow: '0 0 30px rgba(232,192,106,0.4)',
        }}
      >
        Our Happy Chats
      </h2>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          color: 'rgba(200,212,232,0.6)',
          marginBottom: '32px',
          fontSize: 'clamp(14px, 2vw, 18px)',
        }}
      >
        Golden conversation moments from WhatsApp
      </p>

      {/* Chats List (Mock Messaging Inbox) */}
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {CHAT_MEMORIES.map((chat, idx) => (
          <div
            key={chat.id}
            onClick={() => setSelected(chat)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(chat)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: `fadeInUp 0.6s ease ${idx * 0.1}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(232, 192, 106, 0.3)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Round Avatar Icon */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${chat.color}, #1f2937)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '16px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                flexShrink: 0,
              }}
            >
              {chat.icon}
            </div>

            {/* Content Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h4
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#F0F4FF',
                  }}
                >
                  {chat.title}
                </h4>
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '9px',
                    color: 'rgba(232, 192, 106, 0.8)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {chat.date}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(200, 212, 232, 0.5)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {chat.preview}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Journey Button */}
      <button
        onClick={onComplete}
        style={{
          marginTop: '44px',
          padding: '14px 44px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, rgba(232,192,106,0.2), rgba(212,165,116,0.1))',
          border: '1px solid rgba(232,192,106,0.4)',
          color: '#E8C06A',
          fontFamily: "'Cinzel', serif",
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,192,106,0.35), rgba(212,165,116,0.2))';
          e.currentTarget.style.boxShadow = '0 4px 25px rgba(232,192,106,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,192,106,0.2), rgba(212,165,116,0.1))';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
        }}
      >
        Continue Journey
      </button>

      {/* Selected Chat Dialogue Modal */}
      {selected && (
        selected.id === 999 ? (
          <SecretLetterModal onClose={() => setSelected(null)} />
        ) : (
          <div
            onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {/* Phone Frame Chat Window */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(450px, 95vw)',
              height: 'min(620px, 85vh)',
              borderRadius: '24px',
              background: '#0B0F19',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'chatZoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Profile Pic Avatar */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4DAFFF, #A855F7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  marginRight: '12px',
                  boxShadow: '0 0 15px rgba(77, 175, 255, 0.3)',
                }}
              >
                👩
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#F0F4FF',
                  }}
                >
                  Akanksha ✨
                </h3>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    color: '#E8C06A',
                    letterSpacing: '0.05em',
                  }}
                >
                  {selected.date}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#C8D4E8',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat Bubbles Container */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'radial-gradient(circle at center, #0B0F19 0%, #030712 100%)',
              }}
            >
              {selected.messages.map((msg, i) => {
                const isMe = msg.sender === 'Shahid';
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      animation: `fadeInUp 0.4s ease ${i * 0.1}s forwards`,
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4DAFFF, #A855F7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          marginRight: '8px',
                          flexShrink: 0,
                        }}
                      >
                        👩
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '75%' }}>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe
                            ? 'linear-gradient(135deg, #0084FF, #006EE6)'
                            : 'rgba(255, 255, 255, 0.08)',
                          border: isMe ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          color: '#F0F4FF',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '13.5px',
                          lineHeight: 1.45,
                          wordBreak: 'break-word',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {msg.text}
                      </div>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '9px',
                          color: 'rgba(200, 212, 232, 0.4)',
                          marginTop: '4px',
                          textAlign: isMe ? 'right' : 'left',
                          paddingLeft: isMe ? '0' : '4px',
                          paddingRight: isMe ? '4px' : '0',
                        }}
                      >
                        {msg.time} {isMe && '✓✓'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Footer Input Box */}
            <div
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  color: 'rgba(200,212,232,0.4)',
                }}
              >
                Type a message...
              </div>
              <div style={{ fontSize: '18px', cursor: 'default', opacity: 0.7 }}>❤️</div>
            </div>
          </div>
        </div>
        )
      )}

      {/* Custom Keyframes for zooming chat dialog */}
      <style>{`
        @keyframes chatZoomIn {
          0% {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
