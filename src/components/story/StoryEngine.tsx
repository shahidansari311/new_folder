'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const TimePortal = dynamic(() => import('./TimePortal'), { ssr: false });
const ClassroomScene = dynamic(() => import('./ClassroomScene'), { ssr: false });
const FriendshipChapter = dynamic(() => import('./FriendshipChapter'), { ssr: false });
const MessengerScene = dynamic(() => import('./MessengerScene'), { ssr: false });
const FightChapter = dynamic(() => import('./FightChapter'), { ssr: false });
const RelationshipChapter = dynamic(() => import('./RelationshipChapter'), { ssr: false });
const MemoriesGallery = dynamic(() => import('./MemoriesGallery'), { ssr: false });
const BirthdayLetter = dynamic(() => import('./BirthdayLetter'), { ssr: false });
const FinalChapter = dynamic(() => import('./FinalChapter'), { ssr: false });

export type StoryChapter =
  | 'portal'
  | 'classroom'
  | 'friendship'
  | 'messenger'
  | 'fight'
  | 'relationship'
  | 'memories'
  | 'letter'
  | 'final';

export default function StoryEngine() {
  const [chapter, setChapter] = useState<StoryChapter>('portal');
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 200);
    const params = new URLSearchParams(window.location.search);
    const devChapter = params.get('chapter') as StoryChapter | null;
    if (devChapter) {
      setChapter(devChapter);
    }
  }, []);

  function goTo(next: StoryChapter, delay = 1200) {
    setOpacity(0);
    setTimeout(() => {
      setChapter(next);
      setTimeout(() => setOpacity(1), 300);
    }, delay);
  }

  return (
    <div
      id="story-engine"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        opacity,
        transition: 'opacity 1.2s ease',
      }}
    >
      {chapter === 'portal'      && <TimePortal      onComplete={() => goTo('classroom')} />}
      {chapter === 'classroom'   && <ClassroomScene   onComplete={() => goTo('friendship')} />}
      {chapter === 'friendship'  && <FriendshipChapter onComplete={() => goTo('messenger')} />}
      {chapter === 'messenger'   && <MessengerScene   onComplete={() => goTo('fight')} />}
      {chapter === 'fight'       && <FightChapter     onComplete={() => goTo('relationship')} />}
      {chapter === 'relationship'&& <RelationshipChapter onComplete={() => goTo('memories')} />}
      {chapter === 'memories'    && <MemoriesGallery  onComplete={() => goTo('letter')} />}
      {chapter === 'letter'      && <BirthdayLetter   onComplete={() => goTo('final')} />}
      {chapter === 'final'       && <FinalChapter />}
    </div>
  );
}
