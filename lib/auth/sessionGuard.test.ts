import { describe, expect, it } from 'vitest';
import { getSessionGuardView } from './sessionGuard';

describe('session guard', () => {
  it('shows loading while the server session is checked', () => {
    expect(getSessionGuardView('/main-menu', 'loading')).toBe('checking');
  });

  it('allows login and registration after a logged-out session check', () => {
    expect(getSessionGuardView('/login', 'unauthenticated')).toBe('public');
    expect(getSessionGuardView('/register', 'unauthenticated')).toBe('public');
  });

  it('keeps public lobby browsing available while logged out', () => {
    expect(getSessionGuardView('/main-menu', 'unauthenticated')).toBe('public');
  });

  it('redirects signed-out users from protected pages to login', () => {
    expect(getSessionGuardView('/game', 'unauthenticated')).toBe('redirect-to-login');
  });

  it('allows authenticated routes and redirects away from login/register', () => {
    expect(getSessionGuardView('/main-menu', 'authenticated')).toBe('protected');
    expect(getSessionGuardView('/register', 'authenticated')).toBe('redirect-to-menu');
  });

  it('surfaces session-check failures rather than silently treating them as logged out', () => {
    expect(getSessionGuardView('/main-menu', 'error')).toBe('session-error');
  });
});
