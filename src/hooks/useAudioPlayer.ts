'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { buildStreamUrl } from '@/lib/api';

// Every settings change / seek restarts the server-side ffmpeg encode at a
// new position, so the <audio> element's own currentTime always starts back
// at 0 for the new stream. offsetMsRef tracks what that "0" corresponds to
// in the track's real timeline, so position/seeking stay accurate.
const SETTINGS_APPLY_DEBOUNCE_MS = 500;

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offsetMsRef = useRef(0);
  const settingsKeyRef = useRef('');
  const hasSrcRef = useRef(false);

  const {
    currentTrack,
    playing,
    volume,
    muted,
    settings,
    setPosition,
    setPlaying,
    nextTrack,
  } = usePlayerStore();

  // Create audio element on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setPosition(offsetMsRef.current + audio.currentTime * 1000);
    });
    audio.addEventListener('ended', () => {
      setPlaying(false);
      nextTrack();
    });
    audio.addEventListener('waiting', () => setBuffering(true));
    audio.addEventListener('canplay', () => { setBuffering(false); setError(null); });
    audio.addEventListener('error', () => {
      // A freshly constructed <audio> with no src attribute resolves
      // `.src` to the page's own URL (not ""), so Chromium's "empty src"
      // error fires on mount before any track loads. Track real loads
      // via hasSrcRef instead of trusting `.src`.
      if (!hasSrcRef.current) return;
      setError('Playback error. Check that the API server is running.');
      setPlaying(false);
      setBuffering(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
    // setPosition/setPlaying/nextTrack are stable Zustand actions (never
    // change identity), so this still only runs once on mount.
  }, [setPosition, setPlaying, nextTrack]);

  // React to track changes — start fresh from the beginning
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) { audio.pause(); return; }

    // Duration is seeded from track metadata directly in the store's
    // playTrack/nextTrack/prevTrack actions — the stream is a live ffmpeg
    // pipe with no declared length, so the <audio> element itself never
    // reports a usable duration. Buffering/error state is driven by the
    // audio element's own 'waiting'/'canplay'/'error' events below.
    offsetMsRef.current = 0;
    settingsKeyRef.current = JSON.stringify(settings);

    const url = buildStreamUrl(currentTrack.id, settings);
    hasSrcRef.current = true;
    audio.src = url;
    audio.load();
    if (playing) {
      audio.play().catch((err) => {
        // Autoplay blocked — handled by user gesture
        console.warn('[audio] autoplay blocked:', err.message);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Re-apply amplifier settings to the currently playing track without
  // losing playback position — debounced so dragging a slider doesn't spawn
  // a new ffmpeg process on every tick.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const key = JSON.stringify(settings);
    if (key === settingsKeyRef.current) return;

    const timer = setTimeout(() => {
      settingsKeyRef.current = key;
      const resumeAtMs = offsetMsRef.current + audio.currentTime * 1000;
      const wasPlaying = playing && !audio.paused;
      offsetMsRef.current = resumeAtMs;
      setBuffering(true);
      audio.src = buildStreamUrl(currentTrack.id, settings, resumeAtMs / 1000);
      audio.load();
      if (wasPlaying) audio.play().catch(() => {});
    }, SETTINGS_APPLY_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(settings)]);

  // React to play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (playing) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    // Intentionally reacts only to `playing` — track changes are handled by
    // the effect above, which already starts playback itself when needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // React to volume/mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : Math.min(1, volume / 100);
  }, [volume, muted]);

  // Seeking means asking the server to re-encode starting at the requested
  // position (the piped stream has no seekable byte ranges of its own).
  const seek = useCallback((ms: number) => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const wasPlaying = playing && !audio.paused;
    offsetMsRef.current = ms;
    setPosition(ms);
    setBuffering(true);
    audio.src = buildStreamUrl(currentTrack.id, settings, ms / 1000);
    audio.load();
    if (wasPlaying) audio.play().catch(() => {});
  }, [currentTrack, settings, playing, setPosition]);

  return { audioRef, buffering, error, seek };
}
