'use client';

import { useState, useEffect } from 'react';

/**
 *  Button to toggle the dyslexic font on and off.
 *
 * @author Katarina, Caroline
 */

export function DyslexicFontToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dyslexic-font') === 'true';
    setEnabled(saved);
    if (saved) {
      document.documentElement.classList.add('dyslexic-mode');
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('dyslexic-font', String(next));
    if (next) {
      document.documentElement.classList.add('dyslexic-mode');
    } else {
      document.documentElement.classList.remove('dyslexic-mode');
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md border-2 border-cobber-dark bg-panel p-8 shadow-xl shadow-black/40 py-1.5 text-s font-dyslexic text-bone transition hover:border-cobber-light"
    >
      {enabled ? 'Disable Dyslexic Font' : 'Enable Dyslexic Font'}
    </button>
  );
}
