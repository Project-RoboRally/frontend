'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { SettingsModal } from './SettingsModal';

/**
 * Keeps one settings dialog available to triggers throughout the application.
 *
 * @author Anton
 */

interface SettingsMenuContextValue {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsMenuContext = createContext<SettingsMenuContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openSettings = useCallback(() => setIsOpen(true), []);
  const closeSettings = useCallback(() => setIsOpen(false), []);
  const value = useMemo(
    () => ({ isOpen, openSettings, closeSettings }),
    [isOpen, openSettings, closeSettings],
  );

  return (
    <SettingsMenuContext.Provider value={value}>
      {children}
      <SettingsModal open={isOpen} onClose={closeSettings} />
    </SettingsMenuContext.Provider>
  );
}

export function useSettingsMenu() {
  const context = useContext(SettingsMenuContext);
  if (!context) {
    throw new Error('useSettingsMenu must be used within a SettingsProvider');
  }
  return context;
}
