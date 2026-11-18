/**
 * Accessibility settings (dyslexic font, colorblind mode). They are saved in localStorage,
 * mirrored as classes on <html> so the CSS in globals.css can react to them, and exposed as
 * an external store so any component can read or change them.
 *
 * @author Katarina, Caroline
 */

export type AccessibilitySettings = {
  dyslexicFont: boolean;
  colorblindMode: boolean;
};

export type AccessibilitySetting = keyof AccessibilitySettings;

// The storage keys are the ones the first version used, so saved choices carry over.
const STORAGE_KEYS: Record<AccessibilitySetting, string> = {
  dyslexicFont: 'dyslexic-font',
  colorblindMode: 'colorblind-mode',
};

const HTML_CLASSES: Record<AccessibilitySetting, string> = {
  dyslexicFont: 'dyslexic-mode',
  colorblindMode: 'colorblind-mode',
};

const SETTINGS = Object.keys(STORAGE_KEYS) as AccessibilitySetting[];

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  dyslexicFont: false,
  colorblindMode: false,
};

/**
 * Runs in <head> before the first paint, so the saved settings are applied without a flash of
 * the default look.
 */
export const ACCESSIBILITY_BOOT_SCRIPT = `try{${SETTINGS.map(
  (setting) =>
    `if(localStorage.getItem(${JSON.stringify(STORAGE_KEYS[setting])})==='true')document.documentElement.classList.add(${JSON.stringify(HTML_CLASSES[setting])});`,
).join('')}}catch(e){}`;

const listeners = new Set<() => void>();
// useSyncExternalStore needs the same object back until something changes.
let current: AccessibilitySettings | null = null;

function readSaved(): AccessibilitySettings {
  const settings = { ...DEFAULT_SETTINGS };
  try {
    for (const setting of SETTINGS) {
      settings[setting] = window.localStorage.getItem(STORAGE_KEYS[setting]) === 'true';
    }
  } catch {
    // Storage can be blocked; fall back to the defaults.
  }
  return settings;
}

export function applyToDocument(settings: AccessibilitySettings) {
  for (const setting of SETTINGS) {
    document.documentElement.classList.toggle(HTML_CLASSES[setting], settings[setting]);
  }
}

function update(next: AccessibilitySettings) {
  current = next;
  applyToDocument(next);
  listeners.forEach((listener) => listener());
}

export function getSettings(): AccessibilitySettings {
  current ??= readSaved();
  return current;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps other open tabs in sync.
  const onStorage = () => update(readSaved());
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function setSetting(setting: AccessibilitySetting, enabled: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEYS[setting], String(enabled));
  } catch {
    // The setting still applies for this visit even when it cannot be saved.
  }
  update({ ...getSettings(), [setting]: enabled });
}
