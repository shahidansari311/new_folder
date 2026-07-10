'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const TimePortal = dynamic(() => import('./TimePortal'), { ssr: false });
const ClassroomScene = dynamic(() => import('./ClassroomScene'), { ssr: false });
const FriendshipChapter = dynamic(() => import('./FriendshipChapter'), { ssr: false });
const MessengerScene = dynamic(() => import('./MessengerScene'), { ssr: false });
const FightChapter = dynamic(() => import('./FightChapter'), { ssr: false });
const RelationshipChapter = dynamic(() => import('./RelationshipChapter'), { ssr: false });
const MemoriesGallery = dynamic(() => import('./MemoriesGallery'), { ssr: false });
const PhotoGallery = dynamic(() => import('./PhotoGallery'), { ssr: false });
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
  | 'photogallery'
  | 'letter'
  | 'final';

export default function StoryEngine() {
  const [chapter, setChapter] = useState<StoryChapter>('portal');
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 200);
    const params = new URLSearchParams(window.location.search);
    const devChapter = params.get('chapter') as StoryChapter | null;
    if (devChapter) {
      setChapter(devChapter);
    }
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((next: StoryChapter, delay = 1200) => {
    setOpacity(0);
    setTimeout(() => {
      setChapter(next);
      setTimeout(() => setOpacity(1), 300);
    }, delay);
  }, []);

  const goToClassroom = useCallback(() => goTo('classroom'), [goTo]);
  const goToFriendship = useCallback(() => goTo('friendship'), [goTo]);
  const goToMessenger = useCallback(() => goTo('messenger'), [goTo]);
  const goToFight = useCallback(() => goTo('fight'), [goTo]);
  const goToRelationship = useCallback(() => goTo('relationship'), [goTo]);
  const goToMemories = useCallback(() => goTo('memories'), [goTo]);
  const goToPhotoGallery = useCallback(() => goTo('photogallery'), [goTo]);
  const goToLetter = useCallback(() => goTo('letter'), [goTo]);
  const goToFinal = useCallback(() => goTo('final'), [goTo]);

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
      {chapter === 'portal'      && <TimePortal      onComplete={goToClassroom} />}
      {chapter === 'classroom'   && <ClassroomScene   onComplete={goToFriendship} />}
      {chapter === 'friendship'  && <FriendshipChapter onComplete={goToMessenger} />}
      {chapter === 'messenger'   && <MessengerScene   onComplete={goToFight} />}
      {chapter === 'fight'       && <FightChapter     onComplete={goToRelationship} />}
      {chapter === 'relationship'&& <RelationshipChapter onComplete={goToMemories} />}
      {chapter === 'memories'    && <MemoriesGallery  onComplete={goToPhotoGallery} />}
      {chapter === 'photogallery'&& <PhotoGallery     onComplete={goToLetter} />}
      {chapter === 'letter'      && <BirthdayLetter   onComplete={goToFinal} />}
      {chapter === 'final'       && <FinalChapter />}
    </div>
  );
}
