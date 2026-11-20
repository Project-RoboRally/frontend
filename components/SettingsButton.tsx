'use client';

import { buttonClassName } from '@/lib/styles';

import { useSettingsMenu } from './SettingsProvider';

/**
 * Shared settings launcher, using the icon from Caroline and Katarina's accessibility menu.
 *
 * @author Anton
 */

interface SettingsButtonProps {
  iconOnly?: boolean;
  className?: string;
}

export function SettingsButton({ iconOnly = false, className }: SettingsButtonProps) {
  const { isOpen, openSettings } = useSettingsMenu();

  return (
    <button
      type="button"
      aria-label={iconOnly ? 'Open settings' : undefined}
      aria-haspopup="dialog"
      aria-controls="settings-dialog"
      aria-expanded={isOpen}
      title={iconOnly ? 'Settings' : undefined}
      onClick={openSettings}
      className={
        className ??
        (iconOnly
          ? 'flex h-9 w-9 items-center justify-center rounded-full border-2 border-cobber-dark bg-charcoal text-bone opacity-90 shadow-md transition hover:border-cobber-light hover:opacity-100'
          : buttonClassName)
      }
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
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8v-.1a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l.1.1a1.7 1.7 0 0 0 .3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </svg>
      {!iconOnly && <span className="ml-2">Settings</span>}
    </button>
  );
}
