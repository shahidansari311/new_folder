'use client';

import { useState, useEffect } from 'react';

// NOTE TO DEVELOPER: 
// Replace these Unsplash URLs with the actual paths to Akanksha's images.
// Place your images in the `public/gallery/` folder and reference them like: '/gallery/image1.jpg'
const GALLERY_IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'That beautiful smile that lights up my world ✨',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'Looking gorgeous as always 💖',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'My favorite picture of you 🦋',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'The cutest person in the universe 🌍',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'Forever mine ♾️',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'So precious 🥺❤️',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'Lost in your eyes 💫',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'Every moment with you is magic ✨',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'Just perfect ❤️',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'Always making my heart skip a beat 💓',
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'So full of life and joy 🌸',
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1507081323647-4d250478b8ae?auto=format&fit=crop&q=80&w=800', // Placeholder
    caption: 'Can’t stop looking at you 🥰',
  }
];

interface Props {
  onComplete: () => void;
}

export default function PhotoGallery({ onComplete }: Props) {
  const [selectedImage, setSelectedImage] = useState<typeof GALLERY_IMAGES[0] | null>(null);
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
          marginBottom: '40px',
          fontSize: 'clamp(16px, 2.5vw, 22px)',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        "Just a small collection of the most beautiful person I know..."
      </p>

      {/* Masonry-style Grid */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          paddingBottom: '40px',
        }}
      >
        {GALLERY_IMAGES.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => setSelectedImage(img)}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: idx % 2 === 0 ? '3/4' : '4/5',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              transform: 'translateY(20px)',
              animation: `fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.15}s forwards`,
              opacity: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(232, 192, 106, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(232, 192, 106, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: '1px solid transparent',
                borderRadius: '16px',
                transition: 'all 0.4s ease',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
            {/* Using standard img tag for simplicity since it's a dynamic path component */}
            <img
              src={img.url}
              alt={img.caption}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </div>
        ))}
      </div>

      {/* Continue Journey Button */}
      <button
        onClick={onComplete}
        style={{
          marginTop: '20px',
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

      {/* Lightbox / Fullscreen Image View */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.92)',
            backdropFilter: 'blur(15px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            animation: 'fadeIn 0.4s ease',
            cursor: 'zoom-out',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '80vh',
              animation: 'zoomInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(232,192,106,0.2)',
                objectFit: 'contain',
              }}
            />
          </div>
          
          <p
            style={{
              marginTop: '30px',
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(20px, 3vw, 28px)',
              color: '#F0F4FF',
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 0.6s ease 0.3s forwards',
              opacity: 0,
            }}
          >
            {selectedImage.caption}
          </p>

          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFF',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>
      )}

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
        @keyframes zoomInBounce {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
