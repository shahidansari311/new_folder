'use client';

export default function HappyBirthdayTag() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'linear-gradient(135deg, rgba(232, 192, 106, 0.15), rgba(212, 165, 116, 0.08))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(232, 192, 106, 0.4)',
        padding: '8px 24px',
        borderRadius: '9999px',
        boxShadow: '0 8px 32px rgba(232, 192, 106, 0.15), 0 0 20px rgba(232, 192, 106, 0.2)',
        color: '#E8C06A',
        fontFamily: "'Cinzel', serif",
        fontSize: 'clamp(10px, 1.8vw, 13px)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        animation: 'slideDownFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) both, tagBreathe 3s ease-in-out infinite',
      }}
    >
      <span style={{ filter: 'drop-shadow(0 0 4px rgba(232,192,106,0.6))' }}>🎂</span>
      <span>Happy Birthday Akanksha</span>
      <span style={{ color: '#F43F5E', filter: 'drop-shadow(0 0 4px rgba(244,63,94,0.6))' }}>❤️</span>
      <style>{`
        @keyframes slideDownFade {
          0% {
            transform: translate(-50%, -40px);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes tagBreathe {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(232, 192, 106, 0.15), 0 0 20px rgba(232, 192, 106, 0.2);
            border-color: rgba(232, 192, 106, 0.4);
          }
          50% {
            box-shadow: 0 8px 32px rgba(232, 192, 106, 0.25), 0 0 35px rgba(232, 192, 106, 0.45);
            border-color: rgba(232, 192, 106, 0.85);
          }
        }
      `}</style>
    </div>
  );
}
