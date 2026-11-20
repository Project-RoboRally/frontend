/**
 * Application-wide display preferences. Values are stored independently of the signed-in user
 * and mirrored onto <html> so the application can style itself without component-level themes.
 * Different browser logins and devices can have different preferences, but the same browser will share them across
 */

export type FontPreference = 'geist-sans' | 'geist-mono' | 'open-dyslexic';
export type ColorScheme = 'industrial' | 'high-contrast' | 'blueprint';

export type DisplaySettings = {
  font: FontPreference;
  colorScheme: ColorScheme;
};

export const SETTINGS_STORAGE_KEY = 'roborally.settings';

const LEGACY_FONT_KEY = 'dyslexic-font';
const LEGACY_COLOR_SCHEME_KEY = 'colorblind-mode';

export const DEFAULT_SETTINGS: DisplaySettings = {
  font: 'geist-sans',
  colorScheme: 'industrial',
};

export function isFontPreference(value: string): value is FontPreference {
  return value === 'geist-sans' || value === 'geist-mono' || value === 'open-dyslexic';
}

export function isColorScheme(value: string): value is ColorScheme {
  return value === 'industrial' || value === 'high-contrast' || value === 'blueprint';
}

/** Use the previous accessibility preferences only when the shared key is missing. */
export function parseStoredSettings(
  raw: string | null,
  legacy: { dyslexicFont?: string | null; colorblindMode?: string | null } = {},
): DisplaySettings {
  if (raw === null) {
    return {
      font: legacy.dyslexicFont === 'true' ? 'open-dyslexic' : DEFAULT_SETTINGS.font,
      colorScheme:
        legacy.colorblindMode === 'true' ? 'high-contrast' : DEFAULT_SETTINGS.colorScheme,
    };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  const saved = value as Record<string, unknown>;
  return {
    font:
      typeof saved.font === 'string' && isFontPreference(saved.font)
        ? saved.font
        : DEFAULT_SETTINGS.font,
    colorScheme:
      typeof saved.colorScheme === 'string' && isColorScheme(saved.colorScheme)
        ? saved.colorScheme
        : DEFAULT_SETTINGS.colorScheme,
  };
}

function readSavedSettings(): DisplaySettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw !== null) {
      return parseStoredSettings(raw);
    }

    const dyslexicFont = window.localStorage.getItem(LEGACY_FONT_KEY);
    const colorblindMode = window.localStorage.getItem(LEGACY_COLOR_SCHEME_KEY);
    const settings = parseStoredSettings(null, { dyslexicFont, colorblindMode });

    if (dyslexicFont !== null || colorblindMode !== null) {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }

    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function applyToDocument(settings: DisplaySettings) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.dataset.fontFamily = settings.font;
  root.dataset.colorScheme = settings.colorScheme;
  root.classList.toggle('dyslexic-mode', settings.font === 'open-dyslexic');
  root.classList.toggle('colorblind-mode', settings.colorScheme === 'high-contrast');
}

/** Apply saved preferences before first paint, falling back to the previous accessibility keys. */
export const SETTINGS_BOOT_SCRIPT = `try{var r=document.documentElement,s=localStorage.getItem(${JSON.stringify(
  SETTINGS_STORAGE_KEY,
)}),v=s===null?null:JSON.parse(s),f=v&&['geist-sans','geist-mono','open-dyslexic'].includes(v.font)?v.font:(s===null&&localStorage.getItem(${JSON.stringify(
  LEGACY_FONT_KEY,
)} )==='true'?'open-dyslexic':'geist-sans'),c=v&&['industrial','high-contrast','blueprint'].includes(v.colorScheme)?v.colorScheme:(s===null&&localStorage.getItem(${JSON.stringify(
  LEGACY_COLOR_SCHEME_KEY,
)} )==='true'?'high-contrast':'industrial');r.dataset.fontFamily=f;r.dataset.colorScheme=c;r.classList.toggle('dyslexic-mode',f==='open-dyslexic');r.classList.toggle('colorblind-mode',c==='high-contrast')}catch(e){}`;

const listeners = new Set<() => void>();
let current: DisplaySettings | null = null;

export function getSettings(): DisplaySettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  current ??= readSavedSettings();
  return current;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window === 'undefined') {
    return () => {
      listeners.delete(listener);
    };
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== SETTINGS_STORAGE_KEY && event.key !== null) {
      return;
    }

    current = readSavedSettings();
    applyToDocument(current);
    listeners.forEach((notify) => notify());
  };

  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function setSettings(patch: Partial<DisplaySettings>) {
  const next = { ...getSettings(), ...patch };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Preferences still apply for the current visit when storage is unavailable.
    }
  }

  current = next;
  applyToDocument(next);
  listeners.forEach((listener) => listener());
}
