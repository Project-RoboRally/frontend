'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import {
  DEFAULT_SETTINGS,
  getSettings,
  isColorScheme,
  isFontPreference,
  setSettings,
  subscribe,
  type ColorScheme,
  type FontPreference,
} from '@/lib/settings';
import { buttonClassName } from '@/lib/styles';
import { useBackgroundMusic } from './BackgroundMusicProvider';

/**
 * Shared settings dialog; display controls build on Caroline and Katarina's accessibility menu.
 *
 * @author Anton
 */

const FONTS: { value: FontPreference; label: string }[] = [
  { value: 'geist-sans', label: 'Geist Sans' },
  { value: 'geist-mono', label: 'Geist Mono' },
  { value: 'open-dyslexic', label: 'Open Dyslexic' },
];

const COLOR_SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: 'industrial', label: 'Industrial' },
  { value: 'high-contrast', label: 'High Contrast' },
  { value: 'blueprint', label: 'Blueprint' },
];

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const settings = useSyncExternalStore(subscribe, getSettings, () => DEFAULT_SETTINGS);
  const { playbackStatus, requestPlayback } = useBackgroundMusic();

  function toggleMusic() {
    if (settings.musicMuted) {
      void requestPlayback();
    }
    setSettings({ musicMuted: !settings.musicMuted });
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="settings-dialog"
      aria-labelledby="settings-title"
      aria-modal="true"
      className="settings-dialog fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-md border-2 border-cobber-dark bg-charcoal p-0 text-bone shadow-2xl"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-steel-dark bg-charcoal px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cobber-light">
            System Configuration
          </p>
          <h2 id="settings-title" className="mt-1 text-2xl font-bold">
            Settings
          </h2>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close settings"
          onClick={onClose}
          className={`${buttonClassName} px-3 py-1.5`}
        >
          Close
        </button>
      </header>

      <div className="grid gap-5 p-5 sm:p-6">
        <section
          aria-labelledby="settings-display-title"
          className="rounded border border-steel-dark p-4"
        >
          <h3 id="settings-display-title" className="mb-4 text-lg font-bold text-cobber-light">
            Display
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Font
              <select
                aria-label="Font"
                className="rounded border-2 border-steel-dark bg-charcoal px-3 py-2 text-bone focus:outline-none focus:ring-2 focus:ring-cobber"
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (isFontPreference(value)) {
                    setSettings({ font: value });
                  }
                }}
                value={settings.font}
              >
                {FONTS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Color scheme
              <select
                aria-label="Color scheme"
                className="rounded border-2 border-steel-dark bg-charcoal px-3 py-2 text-bone focus:outline-none focus:ring-2 focus:ring-cobber"
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (isColorScheme(value)) {
                    setSettings({ colorScheme: value });
                  }
                }}
                value={settings.colorScheme}
              >
                {COLOR_SCHEMES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section
          aria-labelledby="settings-sound-title"
          className="rounded border border-steel-dark p-4"
        >
          <h3 id="settings-sound-title" className="mb-2 text-lg font-bold text-cobber-light">
            Sound
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-bone/80">Background music</p>
              <button
                type="button"
                aria-label={
                  settings.musicMuted ? 'Unmute background music' : 'Mute background music'
                }
                aria-pressed={!settings.musicMuted}
                onClick={toggleMusic}
                className={buttonClassName}
              >
                {settings.musicMuted ? 'Unmute music' : 'Mute music'}
              </button>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              <span className="flex justify-between">
                <span>Music volume</span>
                <output>{Math.round(settings.musicVolume * 100)}%</output>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                aria-label="Music volume"
                aria-valuetext={`${Math.round(settings.musicVolume * 100)}%`}
                className="w-full accent-cobber"
                value={Math.round(settings.musicVolume * 100)}
                onChange={(event) =>
                  setSettings({ musicVolume: Number(event.currentTarget.value) / 100 })
                }
              />
            </label>
          </div>
          {playbackStatus === 'blocked' && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p role="status" className="text-sm text-bone/80">
                Your browser blocked automatic playback.
              </p>
              <button
                type="button"
                onClick={() => void requestPlayback()}
                className={`${buttonClassName} px-3 py-1.5 text-sm`}
              >
                Start music
              </button>
            </div>
          )}
          {playbackStatus === 'error' && (
            <p role="alert" className="mt-4 text-sm text-bone/80">
              Background music could not be played. Try again after checking the audio file.
            </p>
          )}
        </section>

        <section
          aria-labelledby="settings-help-title"
          className="rounded border border-steel-dark p-4"
        >
          <h3 id="settings-help-title" className="mb-3 text-lg font-bold text-cobber-light">
            Help
          </h3>
          <button
            type="button"
            aria-expanded={helpOpen}
            aria-controls="settings-how-to-play"
            onClick={() => setHelpOpen((isOpen) => !isOpen)}
            className={`${buttonClassName} w-full text-left`}
          >
            How to Play
          </button>
          {helpOpen && (
            <div
              id="settings-how-to-play"
              role="region"
              aria-labelledby="settings-help-title"
              className="mt-3 rounded border border-steel-dark bg-black/20 p-4 text-left text-sm"
            >
              <p>Program your robot’s turn by placing cards into its five registers.</p>
              <ol className="mt-3 list-inside list-decimal space-y-2">
                <li>During Programming, choose cards and arrange them in register order.</li>
                <li>
                  Submit your program. When players are ready, the registers resolve in order.
                </li>
                <li>
                  Follow prompts for choices or upgrades, and race your robot to the checkpoints.
                </li>
              </ol>
            </div>
          )}
        </section>
      </div>
    </dialog>
  );
}
