'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type SyntheticEvent,
} from 'react';

import { DEFAULT_SETTINGS, getSettings, subscribe } from '@/lib/settings';

type MusicPlaybackStatus = 'starting' | 'playing' | 'blocked' | 'error';

interface BackgroundMusicContextValue {
  playbackStatus: MusicPlaybackStatus;
  requestPlayback: () => Promise<void>;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(null);

/**
 * Keeps one background track running across client-side navigation.
 *
 * @author Anton
 */
export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSettings, () => DEFAULT_SETTINGS);
  const [playbackStatus, setPlaybackStatus] = useState<MusicPlaybackStatus>('starting');
  const audioRef = useRef<HTMLAudioElement>(null);

  const requestPlayback = useCallback(async () => {
    const audioElement = audioRef.current;
    if (!audioElement) {
      return;
    }

    try {
      await audioElement.play();
      setPlaybackStatus('playing');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setPlaybackStatus('blocked');
        return;
      }

      console.error('Background music could not be played.', error);
      setPlaybackStatus('error');
    }
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) {
      return;
    }

    audioElement.volume = settings.musicVolume;
    audioElement.muted = settings.musicMuted;
  }, [settings.musicMuted, settings.musicVolume]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) {
      return;
    }

    let active = true;
    void audioElement.play().then(
      () => {
        if (active) {
          setPlaybackStatus('playing');
        }
      },
      (error: unknown) => {
        if (!active) {
          return;
        }
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          setPlaybackStatus('blocked');
          return;
        }

        console.error('Background music could not be played.', error);
        setPlaybackStatus('error');
      },
    );

    return () => {
      active = false;
    };
  }, []);

  function handleAudioError(event: SyntheticEvent<HTMLAudioElement>) {
    const error = event.currentTarget.error;
    console.error('Background music failed to load.', error);
    setPlaybackStatus('error');
  }

  const value = { playbackStatus, requestPlayback };

  return (
    <BackgroundMusicContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src="/sound/bg_music.mp3"
        loop
        preload="auto"
        muted={settings.musicMuted}
        onError={handleAudioError}
        onPlaying={() => setPlaybackStatus('playing')}
      />
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error('useBackgroundMusic must be used within a BackgroundMusicProvider');
  }
  return context;
}
