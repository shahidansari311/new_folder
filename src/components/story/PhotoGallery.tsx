'use client';

import { useState, useEffect } from 'react';

// Helper to transform Google Drive viewer links into direct image/video fetch links
function getDirectDriveLink(url: string, type: 'image' | 'video') {
  const match = url.match(/\/d\/(.+?)\//);
  if (match && match[1]) {
    const id = match[1];
    if (type === 'image') {
      // Use the thumbnail trick which avoids strict CORP blocking for images
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    } else {
      // Route videos through our Next.js API proxy to strip CORP headers and enable streaming
      return `/api/drive-proxy?id=${id}`;
    }
  }
  return url;
}

export interface GalleryItem {
  id: number;
  url: string;
  caption: string;
  extraText?: string;
}

const GALLERY_IMAGES: GalleryItem[] = [
  { id: 1, url: 'https://drive.google.com/file/d/1rKfrHquFix38TFe1GKDkHnuSiaizG0cA/view?usp=drive_link', caption: 'Choti si akanskha ✨' },
  { id: 2, url: 'https://drive.google.com/file/d/14E_H5xxYcJFZZHEmvsioyw1UHU7FNti7/view?usp=drive_link', caption: 'Looking gorgeous as always 💖' },
  { id: 3, url: 'https://drive.google.com/file/d/1h2HdFLHjm1krAv_M0JbZbvCABYAYGn6B/view?usp=drive_link', caption: 'My favorite picture of you 🦋' },
  { id: 4, url: 'https://drive.google.com/file/d/1yxeShCdd5ZAI33XCQ2nJDw997cLtH-aQ/view?usp=drive_link', caption: 'The cutest person in the universe 🌍' },
  { id: 5, url: 'https://drive.google.com/file/d/1YLPtDk7kZPVpHXm3gybhJpSs6xcugYsw/view?usp=drive_link', caption: 'Forever mine ♾️', extraText: 'If I had to live my life over again, I would find you sooner so I could love you longer.' },
  { id: 6, url: 'https://drive.google.com/file/d/1JSIN65C7hGqGMe68Tk3p85FORgyxLmpZ/view?usp=drive_link', caption: 'So precious 🥺❤️' },
  { id: 7, url: 'https://drive.google.com/file/d/1VQ952VPvk_hd9assp90OAFsDopWQQzB-/view?usp=drive_link', caption: 'Lost in your eyes 💫' },
  { id: 8, url: 'https://drive.google.com/file/d/1LBvaL_oJoU8EyVBdnffsH-GAPtSEXBnd/view?usp=drive_link', caption: 'Every moment with you is magic ✨' },
  { id: 9, url: 'https://drive.google.com/file/d/1n0V-GkUPSuXZyfBocPmpEd7zxCy8tqp-/view?usp=drive_link', caption: 'Just perfect ❤️' },
  { id: 10, url: 'https://drive.google.com/file/d/1rMX3E-nRZQ0VMQNUm075Rz48lqXm5C1e/view?usp=drive_link', caption: 'Always making my heart skip a beat 💓' },
  { id: 11, url: 'https://drive.google.com/file/d/1tSssAZW_0vkXz7XALgWw1HABf48NGfCl/view?usp=drive_link', caption: 'So full of life and joy 🌸' },
  { id: 12, url: 'https://drive.google.com/file/d/1elcGJGKmMvQKETiGtI9lAuVrKcIjBDH2/view?usp=drive_link', caption: 'Can’t stop looking at you 🥰' },
  { id: 13, url: 'https://drive.google.com/file/d/1IbPeAgHk__-8HuWftCRB_oTJFWSnQclx/view?usp=drive_link', caption: 'That one time we laughed so hard 😂' },
  { id: 14, url: 'https://drive.google.com/file/d/1MZCt0S63no-P1avs5olTsKVHzZcXm10h/view?usp=drive_link', caption: 'Always shining bright 🌟' },
  { id: 15, url: 'https://drive.google.com/file/d/15adHeJnWbeXMIpZkAFWKQdsV6NNUB56n/view?usp=drive_link', caption: 'My peace and happiness 🥺' },
  { id: 16, url: 'https://drive.google.com/file/d/1Q-4LhnZ81q-WeiTE7nhhNaMDi6L06noU/view?usp=drive_link', caption: 'Your vibe is everything ✨' },
  { id: 17, url: 'https://drive.google.com/file/d/1oSewlxNCZVuGOLDFzoUsLuP-zG7al4jV/view?usp=drive_link', caption: 'You make every day better 💕' },
  { id: 18, url: 'https://drive.google.com/file/d/1h-8vrJOWtCx-rRDYVdupDDHaN-eolsNK/view?usp=drive_link', caption: 'Just beautiful. Period. 💯' },
  { id: 19, url: 'https://drive.google.com/file/d/1Voi7ZDoS3tMOrZYrbk7psCsxSyAKmymu/view?usp=drive_link', caption: 'That goofy smile 🥺😂' },
  { id: 20, url: 'https://drive.google.com/file/d/1AmG-goGGWwCGdQvRQWq0zDg6elNQWS1o/view?usp=drive_link', caption: 'You look amazing even when you don’t try 😳' },
  { id: 21, url: 'https://drive.google.com/file/d/1pPhP8hVhSJIvu1vUjwlzpM0TmlDk60ki/view?usp=drive_link', caption: 'My sunshine ☀️' },
  { id: 22, url: 'https://drive.google.com/file/d/1bIxqyQ-DqSGoAaEmALA7mKClGixD1LLX/view?usp=drive_link', caption: 'Can stare at this picture forever ⏳' },
  { id: 23, url: 'https://drive.google.com/file/d/1errX2hEGf7wMAz0cgdhhgSnRmJdlxU8q/view?usp=drive_link', caption: 'The one who holds my heart 🔐' },
  { id: 24, url: 'https://drive.google.com/file/d/1Yosg_Q_szF8orHoL4z6r9iRP2FcHuECT/view?usp=drive_link', caption: 'Memories to last a lifetime 📸' },
  { id: 25, url: 'https://drive.google.com/file/d/1Gb9YYnQJJpWtbAW1p9gDm2ai98klAZtH/view?usp=drive_link', caption: 'Love you always ❤️' },
  { id: 26, url: 'https://drive.google.com/file/d/1tLdOYXJxdqD6MPysHSVy5qLY7tnqNzpQ/view?usp=drive_link', caption: 'Love you always ❤️' },
  { id: 27, url: 'https://drive.google.com/file/d/1OVbCU032CN_6NM7ya4WrvX4nWPsQfEUk/view?usp=drive_link', caption: '❤️' },
  { id: 28, url: 'https://drive.google.com/file/d/1Rk6wA35Cm6pzjS5sNtMiEaHE1V3MJgOk/view?usp=drive_link', caption: 'Love you always ❤️' },
  { id: 29, url: 'https://drive.google.com/file/d/10P0Fg1654C2ITtqmy05rU0Vncjvtsu21/view?usp=drive_link', caption: 'Love you always ❤️' },
  { id: 30, url: 'https://drive.google.com/file/d/17uPfAsxOt6kuZ4L4-ms6qSa46W0uzVoM/view?usp=drive_link', caption: 'Tumhari roti ❤️' }
];

const GALLERY_VIDEOS: GalleryItem[] = [
  { id: 1, url: 'https://drive.google.com/file/d/1HEfkPWUDOF_BmtvZ8XxjspqvGG2kuAaV/view?usp=drive_link', caption: 'Peaceful moments together 🍃' },
  { id: 2, url: 'https://drive.google.com/file/d/1wxAagtT6fI9h0pAmg8BX_X_hud3aR3ij/view?usp=drive_link', caption: 'Just being happy 😊' },
  { id: 3, url: 'https://drive.google.com/file/d/1iASXHrVr0iHFe3yryjelgzCs_EFLKHv9/view?usp=drive_link', caption: 'tumhara speech 🌃' },
  { id: 4, url: 'https://drive.google.com/file/d/1I_rAJcOIWHyifsgmM9Ogb0Z3ewWAj2W9/view?usp=drive_link', caption: 'You are my star ✨' },
  { id: 5, url: 'https://drive.google.com/file/d/1VMuB0cXsFr7bhf-5Z3drTSV_qW8bCHse/view?usp=drive_link', caption: 'Beautiful sunsets 🌅' },
];

interface CarouselProps {
  items: GalleryItem[];
  type: 'image' | 'video';
  title: string;
}

function CarouselDeck({ items, type, title }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);

  const handleNext = () => {
    if (animatingOut) return;
    setAnimatingOut(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
      setAnimatingOut(false);
    }, 400); // Wait for swipe animation
  };

  const activeItem = items[activeIndex];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '80px' }}>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(20px, 4vw, 32px)',
        color: 'rgba(232,192,106,0.9)',
        marginBottom: '24px',
        letterSpacing: '0.1em',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      }}>
        {title}
      </h3>
      
      <div
        style={{
          position: 'relative',
          width: 'min(400px, 85vw)',
          height: 'min(550px, 60vh)',
          perspective: '1000px',
        }}
      >
        {items.map((item, idx) => {
          const isTop = idx === activeIndex;
          
          // Calculate relative position in the stack (0 = top, 1 = behind, etc.)
          let diff = idx - activeIndex;
          if (diff < 0) diff += items.length;

          const isNext = diff === 1;
          const isThird = diff === 2;
          
          // Only render top 4 cards for performance
          if (diff > 3 && idx !== activeIndex) return null;

          let transform = '';
          let zIndex = 10 - diff;
          let opacity = 1;
          
          if (isTop) {
            transform = animatingOut 
              ? 'translate(-150%, -20%) rotate(-15deg) scale(0.95)' // Swipe away effect
              : 'translate(0, 0) scale(1)';
            opacity = animatingOut ? 0 : 1;
          } else if (isNext) {
            transform = animatingOut
              ? 'translate(0, 0) scale(1)' // Moves up to top
              : 'translate(0, 20px) scale(0.95)';
          } else if (isThird) {
            transform = animatingOut
              ? 'translate(0, 20px) scale(0.95)'
              : 'translate(0, 40px) scale(0.9)';
          } else {
            transform = animatingOut
              ? 'translate(0, 40px) scale(0.9)'
              : 'translate(0, 60px) scale(0.85)';
            opacity = diff > 2 ? 0 : 0.6; // Fade out the deepest card
          }

          const directUrl = getDirectDriveLink(item.url, type);

          return (
            <div
              key={item.id}
              onClick={isTop ? handleNext : undefined}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: isTop ? 'pointer' : 'default',
                background: '#0a0a0a',
                boxShadow: isTop 
                  ? '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(232,192,106,0.15)'
                  : '0 10px 30px rgba(0,0,0,0.5)',
                transform,
                opacity,
                zIndex,
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {type === 'image' ? (
                <img
                  src={directUrl}
                  alt={item.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <video
                  src={directUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none',
                    opacity: isTop && !animatingOut ? 1 : 0.6,
                    transition: 'opacity 0.4s ease',
                  }}
                />
              )}
              {/* Caption Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                  padding: '40px 20px 20px',
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(18px, 3vw, 24px)',
                  fontStyle: 'italic',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  opacity: isTop && !animatingOut ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  transitionDelay: isTop && !animatingOut ? '0.2s' : '0s',
                }}
              >
                {item.caption}
              </div>
            </div>
          );
        })}
        
        {/* Special Extra Text Overlay (Glassmorphism Box) */}
        {activeItem.extraText && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(10, 15, 30, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(232, 192, 106, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              color: '#F0F4FF',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              lineHeight: 1.6,
              textAlign: 'center',
              zIndex: 30, // Above the cards
              pointerEvents: 'none',
              opacity: animatingOut ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✨</div>
            {activeItem.extraText}
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  onComplete: () => void;
}

export default function PhotoGallery({ onComplete }: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) setLoaded(true);
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

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
        overflowX: 'hidden',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease',
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(24px, 5vw, 42px)',
          color: '#E8C06A',
          letterSpacing: '0.12em',
          marginBottom: '12px',
          textAlign: 'center',
          textShadow: '0 0 30px rgba(232,192,106,0.4)',
        }}
      >
        My Favorite Views
      </h2>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          color: 'rgba(200,212,232,0.6)',
          marginBottom: '60px',
          fontSize: 'clamp(16px, 2.5vw, 22px)',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        "Just a small collection of the most beautiful person I know..."
      </p>

      <CarouselDeck items={GALLERY_IMAGES} type="image" title="Photos" />
      
      <CarouselDeck items={GALLERY_VIDEOS} type="video" title="Videos" />

      {/* Continue Journey Button */}
      <button
        onClick={onComplete}
        style={{
          marginTop: '20px',
          marginBottom: '40px',
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
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 1s ease 1s forwards',
          opacity: 0,
          zIndex: 20,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,192,106,0.35), rgba(212,165,116,0.2))';
          e.currentTarget.style.boxShadow = '0 4px 25px rgba(232,192,106,0.3)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,192,106,0.2), rgba(212,165,116,0.1))';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Read My Letter 💌
      </button>

      <style>{`
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
        
        /* Hide scrollbar for a cleaner look */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2); 
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(232, 192, 106, 0.3); 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(232, 192, 106, 0.5); 
        }
      `}</style>
    </div>
  );
}
