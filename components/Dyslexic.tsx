'use client';

import { useState, useEffect } from 'react';

/**
 *  Buttons to toggle the dyslexic font and colorblind mode on and off.
 *
 * @author Katarina, Caroline
 */

export function AccessibilitySettings() {
  const [dyslexicEnabled, setDyslexicEnabled] = useState(false);
  const [colorblindEnabled, setColorblindEnabled] = useState(false);

  useEffect(() => {
    const savedDyslexic = localStorage.getItem('dyslexic-font') === 'true';
    const savedColorblind = localStorage.getItem('colorblind-mode') === 'true';

    setDyslexicEnabled(savedDyslexic);
    setColorblindEnabled(savedColorblind);

    if (savedDyslexic) {
      document.documentElement.classList.add('dyslexic-mode');
    }
    if (savedColorblind) {
      document.documentElement.classList.add('colorblind-mode');
    }
  }, []);

  const toggleDyslexic = () => {
    const next = !dyslexicEnabled;
    setDyslexicEnabled(next);
    localStorage.setItem('dyslexic-font', String(next));
    if (next) {
      document.documentElement.classList.add('dyslexic-mode');
    } else {
      document.documentElement.classList.remove('dyslexic-mode');
    }
  };

  const toggleColorblind = () => {
    const next = !colorblindEnabled;
    setColorblindEnabled(next);
    localStorage.setItem('colorblind-mode', String(next));
    if (next) {
      document.documentElement.classList.add('colorblind-mode');
    } else {
      document.documentElement.classList.remove('colorblind-mode');
    }
  };

  return (
    <div className="rounded-md border-2 border-cobber-dark bg-panel p-4 shadow-lg text-left w-full">
      <h3 className="mb-3 text-s font-bold uppercase tracking-wider text-cobber-light">
        Accessibility Settings
      </h3>
      <div className="flex flex-col gap-3">
        {/* OpenDyslexic Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-s font-semibold text-bone">Dyslexic Font</span>
          <button
            type="button"
            onClick={toggleDyslexic}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              dyslexicEnabled ? 'bg-verdigris' : 'bg-steel-dark'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-bone transition-transform ${
                dyslexicEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Colorblind Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-s font-semibold text-bone">Colorblind High-Contrast</span>
          <button
            type="button"
            onClick={toggleColorblind}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              colorblindEnabled ? 'bg-verdigris' : 'bg-steel-dark'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-bone transition-transform ${
                colorblindEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
