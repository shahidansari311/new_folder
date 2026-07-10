'use client';

interface Props {
  opacity: number;
}

export default function FadeOverlay({ opacity }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020617',
        opacity,
        pointerEvents: opacity > 0.5 ? 'all' : 'none',
        transition: 'opacity 0.7s ease',
        zIndex: 1000,
      }}
    />
  );
}
