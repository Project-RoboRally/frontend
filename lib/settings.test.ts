import { afterEach, describe, expect, it, vi } from 'vitest';

function installBrowser(storage: Record<string, string> = {}) {
  const values = new Map(Object.entries(storage));
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
  const root = {
    dataset: {} as Record<string, string>,
    classList: { toggle: vi.fn() },
  };

  vi.stubGlobal('window', {
    localStorage,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  vi.stubGlobal('document', { documentElement: root });

  return { values, root };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('display settings', () => {
  it('uses defaults for absent, malformed, and unsupported stored data', async () => {
    vi.resetModules();
    const { DEFAULT_SETTINGS, parseStoredSettings } = await import('./settings');

    expect(parseStoredSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings('{invalid')).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings('{"font":"comic-sans","colorScheme":"neon"}')).toEqual(
      DEFAULT_SETTINGS,
    );
    expect(parseStoredSettings('{"font":"geist-mono","colorScheme":"neon"}')).toEqual({
      font: 'geist-mono',
      colorScheme: 'industrial',
    });
  });

  it('migrates existing accessibility choices and persists later changes globally', async () => {
    const browser = installBrowser({
      'dyslexic-font': 'true',
      'colorblind-mode': 'true',
    });
    vi.resetModules();
    const { getSettings, setSettings, SETTINGS_STORAGE_KEY } = await import('./settings');

    expect(getSettings()).toEqual({
      font: 'open-dyslexic',
      colorScheme: 'high-contrast',
    });
    expect(JSON.parse(browser.values.get(SETTINGS_STORAGE_KEY)!)).toEqual(getSettings());

    setSettings({ font: 'geist-mono', colorScheme: 'blueprint' });

    expect(getSettings()).toEqual({
      font: 'geist-mono',
      colorScheme: 'blueprint',
    });
    expect(JSON.parse(browser.values.get(SETTINGS_STORAGE_KEY)!)).toEqual(getSettings());
    expect(browser.root.dataset).toEqual({
      fontFamily: 'geist-mono',
      colorScheme: 'blueprint',
    });
  });

  it('prefers the new settings key over legacy values and applies saved values immediately', async () => {
    const browser = installBrowser({
      'roborally.settings': '{"font":"geist-mono","colorScheme":"blueprint"}',
      'dyslexic-font': 'true',
      'colorblind-mode': 'true',
    });
    vi.resetModules();
    const { getSettings, applyToDocument } = await import('./settings');

    const settings = getSettings();
    applyToDocument(settings);

    expect(settings).toEqual({ font: 'geist-mono', colorScheme: 'blueprint' });
    expect(browser.root.dataset).toEqual({
      fontFamily: 'geist-mono',
      colorScheme: 'blueprint',
    });
  });
});
