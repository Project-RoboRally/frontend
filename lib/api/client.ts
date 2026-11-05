const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

let csrfToken: string | null = null;
let csrfTokenRequest: Promise<string> | null = null;

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function friendlyMessage(raw: string, status: number, method: string, path: string) {
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (status === 409) {
    return 'That username is already in use. Pick another.';
  }

  if (status === 401 && (path === '/api/login' || path === '/api/register')) {
    return 'Invalid username or password.';
  }

  if (status === 401) {
    return 'Your session has expired. Log in again to continue.';
  }

  if (status === 403) {
    return 'This action was rejected because of a permission or CSRF issue. Refresh the page and try again. You are still signed in.';
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed')
  ) {
    return `Could not reach the backend at ${API_URL}. Is it running?`;
  }

  if (lower.includes('could not create lobby') && lower.includes('was found')) {
    return 'Could not create the lobby because this username is not on the server. Log in first, then try again.';
  }

  if (text === 'Player not found.' || lower.includes('player not found')) {
    return 'That player was not found. Log in again so the server has your username.';
  }

  if (lower.includes('already in a lobby')) {
    return 'You are already in a lobby. Leave it before joining or creating another.';
  }

  if (lower.includes('is not in a lobby')) {
    return 'That player is not in this lobby.';
  }

  if (text.startsWith('Lobby not found') || (status === 404 && path.includes('/api/lobbies'))) {
    return 'This lobby was not found. It may have been closed.';
  }

  if (text.startsWith('Invalid name for lobby')) {
    return 'Lobby name must be 3-16 characters.';
  }

  if (lower.includes('not authorized')) {
    return 'You are not allowed to do that.';
  }

  if (text === 'Username is null' || text === 'Username may not be empty') {
    return 'Enter a username.';
  }

  if (text === 'Username may not contain spaces') {
    return 'Username cannot contain spaces.';
  }

  if (text === 'Username should be between 3 and 16 characters') {
    return 'Username must be 3-16 characters.';
  }

  if (text && text !== 'Internal Server Error' && !/^Request failed: \d+$/.test(text)) {
    return text;
  }

  if (status === 400) {
    return 'The server rejected this request. Check the name and try again.';
  }

  if (status === 404) {
    return 'Nothing was found for this request.';
  }

  if (status === 500) {
    if (method === 'POST' && /\/api\/lobbies$/.test(path)) {
      return 'Could not create the lobby. Log in first so the server has your username.';
    }
    if (path.includes('/join')) {
      return 'Could not join. You may already be in a lobby, or you need to log in again.';
    }
    if (path.includes('/rename')) {
      return 'Could not rename the lobby. Use 3-16 characters.';
    }
    if (path.includes('/kick')) {
      return 'Could not kick that player.';
    }
    if (path.includes('/leave')) {
      return 'Could not leave the lobby.';
    }
    return 'The server had an error. If it was restarted, log in again.';
  }

  return `Request failed (${status}).`;
}

export function clearCsrfToken() {
  csrfToken = null;
  csrfTokenRequest = null;
}

async function readErrorBody(response: Response) {
  try {
    const body: unknown = await response.json();
    if (typeof body !== 'object' || body === null) {
      return '';
    }

    const record = body as Record<string, unknown>;
    if (
      typeof record.message === 'string' &&
      record.message &&
      record.message !== 'No message available'
    ) {
      return record.message;
    }
    if (typeof record.error === 'string') {
      return record.error;
    }
  } catch {
    // Response was not JSON.
  }

  return '';
}

async function getCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }
  if (csrfTokenRequest) {
    return csrfTokenRequest;
  }

  csrfTokenRequest = (async () => {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/csrf`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : 'Failed to fetch';
      throw new ApiError(friendlyMessage(raw, 0, 'GET', '/api/csrf'), 0, '/api/csrf');
    }

    if (!response.ok) {
      const raw = await readErrorBody(response);
      throw new ApiError(
        friendlyMessage(raw, response.status, 'GET', '/api/csrf'),
        response.status,
        '/api/csrf',
      );
    }

    const body: unknown = await response.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('token' in body) ||
      typeof body.token !== 'string' ||
      body.token.length === 0
    ) {
      throw new ApiError('The backend did not return a valid CSRF token.', 0, '/api/csrf');
    }

    csrfToken = body.token;
    return csrfToken;
  })();

  try {
    return await csrfTokenRequest;
  } finally {
    csrfTokenRequest = null;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('Accept', 'application/json');
  if (options?.body != null) {
    headers.set('Content-Type', 'application/json');
  }

  const method = (options?.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    headers.set('X-XSRF-TOKEN', await getCsrfToken());
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store',
    });
  } catch (cause) {
    const raw = cause instanceof Error ? cause.message : 'Failed to fetch';
    throw new ApiError(friendlyMessage(raw, 0, method, path), 0, path);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearCsrfToken();
    }
    if (
      response.status === 401 &&
      method !== 'GET' &&
      path !== '/api/login' &&
      path !== '/api/register' &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const raw = await readErrorBody(response);
    throw new ApiError(friendlyMessage(raw, response.status, method, path), response.status, path);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function apiGet<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body: unknown) {
  const isAuthenticationRequest =
    path === '/api/login' || path === '/api/register' || path === '/api/logout';
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  }).finally(() => {
    if (isAuthenticationRequest) {
      clearCsrfToken();
    }
  });
}

export function apiPatch<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
  });
}

export function getApiUrl() {
  return API_URL;
}
