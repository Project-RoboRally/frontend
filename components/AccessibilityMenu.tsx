'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  applyToDocument,
  DEFAULT_SETTINGS,
  getSettings,
  setSetting,
  subscribe,
  type AccessibilitySetting,
} from '@/lib/accessibility';

/**
 * Floating button on every page that opens the accessibility settings, so the dyslexic font
 * and colorblind mode can be changed from anywhere (login, menus, lobby and game).
 *
 * @author Katarina, Caroline
 */

const TOGGLES: { setting: AccessibilitySetting; label: string }[] = [
  { setting: 'dyslexicFont', label: 'Dyslexic Font' },
  { setting: 'colorblindMode', label: 'Colorblind High-Contrast' },
];

function Toggle({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-bone">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          enabled ? 'bg-verdigris' : 'bg-steel-dark'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-bone transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function AccessibilityMenu() {
  const settings = useSyncExternalStore(subscribe, getSettings, () => DEFAULT_SETTINGS);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keeps <html> in line with the settings (the boot script only covers the first paint).
  useEffect(() => {
    applyToDocument(settings);
  }, [settings]);

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
    <div
      ref={containerRef}
      className="fixed bottom-1 left-1 z-[100] flex flex-col items-start gap-2"
    >
      {open ? (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          className="w-64 rounded-md border-2 border-cobber-dark bg-charcoal p-4 text-left shadow-lg"
        >
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-cobber-light">
            Accessibility Settings
          </h2>
          <div className="flex flex-col gap-3">
            {TOGGLES.map(({ setting, label }) => (
              <Toggle
                key={setting}
                label={label}
                enabled={settings[setting]}
                onChange={(enabled) => setSetting(setting, enabled)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Accessibility settings"
        aria-expanded={open}
        title="Accessibility settings"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-cobber-dark bg-charcoal text-sm font-bold text-bone opacity-80 shadow-md transition hover:border-cobber-light hover:opacity-100"
      >
        <span aria-hidden="true">Aa</span>
      </button>
    </div>
  );
}
