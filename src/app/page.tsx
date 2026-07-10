'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MagicCursor from '@/components/ui/MagicCursor';

// Dynamic imports for performance
const UniverseCanvas = dynamic(() => import('@/components/background/UniverseCanvas'), { ssr: false });
const CountdownPage = dynamic(() => import('@/components/countdown/CountdownPage'), { ssr: false });
const MidnightSequence = dynamic(() => import('@/components/midnight/MidnightSequence'), { ssr: false });
const GiftExperience = dynamic(() => import('@/components/gift/GiftExperience'), { ssr: false });
const ForestWalk = dynamic(() => import('@/components/door/ForestWalk'), { ssr: false });
const StoryEngine = dynamic(() => import('@/components/story/StoryEngine'), { ssr: false });
const FadeOverlay = dynamic(() => import('@/components/ui/FadeOverlay'), { ssr: false });
const ILoveYouBubbles = dynamic(() => import('@/components/ui/ILoveYouBubbles'), { ssr: false });
const HappyBirthdayTag = dynamic(() => import('@/components/ui/HappyBirthdayTag'), { ssr: false });

// Experience phases
export type Phase =
  | 'countdown'
  | 'midnight'
  | 'gift'
  | 'forest-walk'
  | 'door'
  | 'story';

export default function UniversePage() {
  const now = new Date();
  // 12 September 2026 00:00:00 local time
  const BIRTHDAY = new Date('2026-09-12T00:00:00');
  const BIRTHDAY_END = new Date('2026-09-13T00:00:00');
  const isBirthday = now >= BIRTHDAY && now <= BIRTHDAY_END;

  const [phase, setPhase] = useState<Phase>(isBirthday ? 'midnight' : 'countdown');
  const [fadeOpacity, setFadeOpacity] = useState(0);

  // For dev/testing: allow URL param to skip to phase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const devPhase = params.get('phase') as Phase | null;
    if (devPhase) setPhase(devPhase);
  }, []);

  function transitionTo(nextPhase: Phase, delay = 0) {
    setFadeOpacity(1);
    setTimeout(() => {
      setPhase(nextPhase);
      setTimeout(() => setFadeOpacity(0), 400);
    }, 700 + delay);
  }

  return (
    <main
      id="universe-root"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#020617' }}
    >
      {/* Living background universe - always rendered */}
      <UniverseCanvas phase={phase} />

      {/* Global interactive love bubbles floating in background */}
      {phase !== 'countdown' && <ILoveYouBubbles />}

      {/* Happy Birthday tag centered at top after countdown ends */}
      {phase !== 'countdown' && <HappyBirthdayTag />}

      {/* Experience layers */}
      {phase === 'countdown' && (
        <CountdownPage
          targetDate={BIRTHDAY}
          onComplete={() => transitionTo('midnight')}
        />
      )}

      {phase === 'midnight' && (
        <MidnightSequence
          onComplete={() => transitionTo('gift', 800)}
        />
      )}

      {phase === 'gift' && (
        <GiftExperience
          onComplete={() => transitionTo('forest-walk', 500)}
        />
      )}

      {(phase === 'forest-walk' || phase === 'door') && (
        <ForestWalk
          phase={phase}
          onDoorReached={() => setPhase('door')}
          onUnlocked={() => transitionTo('story', 1200)}
        />
      )}

      {phase === 'story' && <StoryEngine />}

      {/* Global fade overlay for transitions */}
      <FadeOverlay opacity={fadeOpacity} />

      {/* Premium custom cursor */}
      <MagicCursor />
    </main>
  );
}
