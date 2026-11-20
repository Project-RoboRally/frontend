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

/**
 * Floating button that opens display settings from anywhere in the application.
 *
 * @author Katarina, Caroline, Anton
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

export function AccessibilityMenu() {
  const settings = useSyncExternalStore(subscribe, getSettings, () => DEFAULT_SETTINGS);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape or a click outside the menu.
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="fixed right-2 top-2 z-[100] flex flex-col items-end gap-2">
      {open ? (
        <div
          role="dialog"
          aria-label="Display settings"
          className="w-64 rounded-md border-2 border-cobber-dark bg-charcoal p-4 text-left shadow-lg"
        >
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-cobber-light">
            Display Settings
          </h2>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-semibold text-bone">
              Font
              <select
                aria-label="Font"
                className="rounded border-2 border-steel-dark bg-charcoal px-2 py-1 text-sm text-bone focus:outline-none focus:ring-2 focus:ring-cobber"
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
            <label className="flex flex-col gap-1 text-sm font-semibold text-bone">
              Color scheme
              <select
                aria-label="Color scheme"
                className="rounded border-2 border-steel-dark bg-charcoal px-2 py-1 text-sm text-bone focus:outline-none focus:ring-2 focus:ring-cobber"
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
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Display settings"
        aria-expanded={open}
        title="Display settings"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cobber-dark bg-charcoal text-bone opacity-90 shadow-md transition hover:border-cobber-light hover:opacity-100"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      </button>
    </div>
  );
}
