import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiPost, clearCsrfToken } from './client';
import { login, logout, register, restoreSession } from './login';

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  clearCsrfToken();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('account API', () => {
  it('restores the authenticated username using the session cookie', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ username: 'server-user' }));

    await expect(restoreSession()).resolves.toEqual({ username: 'server-user' });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:8080/api/session');
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe('include');
  });

  it('treats a 401 session response as logged out', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(restoreSession()).resolves.toBeNull();
  });

  it('sends credentials and the JSON CSRF token for login', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-login' }))
      .mockResolvedValueOnce(jsonResponse({ username: 'alice' }));

    await expect(login({ username: 'alice', password: 'secret' })).resolves.toEqual({
      username: 'alice',
    });

    const [csrfUrl, csrfOptions] = fetchMock.mock.calls[0] ?? [];
    const [loginUrl, loginOptions] = fetchMock.mock.calls[1] ?? [];
    expect(csrfUrl).toBe('http://localhost:8080/api/csrf');
    expect(csrfOptions?.credentials).toBe('include');
    expect(loginUrl).toBe('http://localhost:8080/api/login');
    expect(loginOptions?.credentials).toBe('include');
    expect(new Headers(loginOptions?.headers).get('X-XSRF-TOKEN')).toBe('csrf-login');
    expect(JSON.parse(String(loginOptions?.body))).toEqual({
      username: 'alice',
      password: 'secret',
    });
  });

  it('accepts 201 registration and refreshes CSRF before subsequent auth changes', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-register' }))
      .mockResolvedValueOnce(jsonResponse({ username: 'alice' }, 201))
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-logout' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(register({ username: 'alice', password: 'secret123' })).resolves.toEqual({
      username: 'alice',
    });
    await expect(logout()).resolves.toBeUndefined();

    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('X-XSRF-TOKEN')).toBe(
      'csrf-register',
    );
    expect(new Headers(fetchMock.mock.calls[3]?.[1]?.headers).get('X-XSRF-TOKEN')).toBe(
      'csrf-logout',
    );
    expect(fetchMock.mock.calls[3]?.[1]?.credentials).toBe('include');
  });

  it('sends the same CSRF and credential headers for lobby mutations', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-action' }))
      .mockResolvedValueOnce(jsonResponse({ updated: true }));

    await expect(
      apiPost('/api/lobbies/123/ready', { username: 'alice', ready: true }),
    ).resolves.toEqual({ updated: true });

    const [, options] = fetchMock.mock.calls[1] ?? [];
    expect(options?.credentials).toBe('include');
    expect(new Headers(options?.headers).get('X-XSRF-TOKEN')).toBe('csrf-action');
  });

  it('shows clear conflict, invalid-credential, and backend validation errors', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-conflict' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Conflict' }, 409));
    await expect(register({ username: 'taken', password: 'secret123' })).rejects.toMatchObject({
      status: 409,
      message: 'That username is already in use. Pick another.',
    } satisfies Partial<ApiError>);

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-login-error' }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(login({ username: 'alice', password: 'wrong-password' })).rejects.toMatchObject({
      status: 401,
      message: 'Invalid username or password.',
    });

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-validation' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Password is invalid.' }, 400));
    await expect(register({ username: 'alice', password: 'invalid' })).rejects.toMatchObject({
      status: 400,
      message: 'Password is invalid.',
    });
  });

  it('does not retry a 403 action and explains that it may be a CSRF issue', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ token: 'csrf-denied' }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));

    await expect(apiPost('/api/lobbies/123/start', {})).rejects.toMatchObject({
      status: 403,
      message: expect.stringContaining('CSRF issue'),
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
