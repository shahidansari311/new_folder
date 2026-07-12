'use client';

import { useEffect, useRef, useCallback } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SONG CONFIGURATION — Replace these paths with actual audio files
   
   Place your audio files in:  /public/audio/
   Supported formats: .mp3, .ogg, .wav, .m4a, .mpeg
   
   Example:
     COUNTDOWN_SONG = '/audio/countdown-song.mp3'
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export const SONGS = {
  /** Plays during the countdown phase — something anticipatory & dreamy */
  countdown: '/audio/countdown-song.mpeg',
  /** Plays during the birthday wish / midnight sequence — something magical & celebratory */
  birthday: '/audio/birthday-song.mpeg',
  /** Plays after the birthday wish throughout the rest of the experience */
  ambient: '/audio/ambient-song.mpeg',
} as const;

export type SongKey = keyof typeof SONGS;

interface AudioManagerProps {
  /** Which song to play */
  songKey: SongKey;
  /** Whether to play or pause */
  playing?: boolean;
  /** Volume 0–1 */
  volume?: number;
  /** Fade in/out duration in ms */
  fadeDuration?: number;
  /** Loop the track */
  loop?: boolean;
  /** Called when the song ends (only if loop=false) */
  onEnded?: () => void;
}

/**
 * Invisible component that manages a single audio track with smooth fade-in/out.
 * Tries to autoplay immediately. If browser blocks it, retries on first user interaction.
 */
export default function AudioManager({
  songKey,
  playing = true,
  volume = 0.5,
  fadeDuration = 2000,
  loop = true,
  onEnded,
}: AudioManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number>(0);
  const playingRef = useRef(playing);
  const volumeRef = useRef(volume);
  const fadeDurationRef = useRef(fadeDuration);

  // Keep refs in sync
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { fadeDurationRef.current = fadeDuration; }, [fadeDuration]);

  // Smooth fade helper
  const fadeTo = useCallback((target: number, duration: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelAnimationFrame(fadeRef.current);
    const startVol = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for natural feel
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.min(1, Math.max(0, startVol + (target - startVol) * eased));

      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(step);
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  // Try to start playback — called both immediately and on user interaction
  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !playingRef.current) return;

    audio.play().then(() => {
      fadeTo(volumeRef.current, fadeDurationRef.current);
    }).catch(() => {
      // Autoplay still blocked — will retry on next interaction
    });
  }, [fadeTo]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(SONGS[songKey]);
    audio.loop = loop;
    audio.volume = 0;
    audio.preload = 'auto';
    if (onEnded) audio.addEventListener('ended', onEnded);
    audioRef.current = audio;

    // Try playing immediately (works if browser allows autoplay)
    if (playing) {
      tryPlay();
    }

    // Also listen for user interaction to unlock audio if autoplay was blocked
    const unlock = () => {
      tryPlay();
      // Keep listeners alive — they're cheap and handle edge cases
    };
    const handlePauseRequest = () => {
      audio.pause();
    };
    const handleResumeRequest = () => {
      if (playingRef.current) tryPlay();
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('pause-bg-music', handlePauseRequest);
    window.addEventListener('resume-bg-music', handleResumeRequest);

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('pause-bg-music', handlePauseRequest);
      window.removeEventListener('resume-bg-music', handleResumeRequest);
      if (onEnded) audio.removeEventListener('ended', onEnded);
      cancelAnimationFrame(fadeRef.current);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [songKey, loop, onEnded, playing, tryPlay]);

  // React to playing/volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.play().then(() => {
        fadeTo(volume, fadeDuration);
      }).catch(() => {
        // Will retry on user interaction via the unlock listeners
      });
    } else {
      fadeTo(0, Math.min(fadeDuration, 800));
      const t = setTimeout(() => {
        audio.pause();
      }, Math.min(fadeDuration, 800));
      return () => clearTimeout(t);
    }
  }, [playing, volume, fadeDuration, fadeTo]);

  return null; // invisible — audio only
}
