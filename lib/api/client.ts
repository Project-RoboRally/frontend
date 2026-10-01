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

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function friendlyMessage(raw: string, status: number, method: string, path: string) {
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load failed')) {
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

  if (text === 'Player already exists' || (status === 500 && path.includes('/api/login'))) {
    return 'That username is already in use. Pick another.';
  }

  if (lower.includes('request body is required')) {
    return 'Login needs a username in JSON, for example {"username":"alice"}.';
  }

  if (text && text !== 'Internal Server Error' && !/^Request failed: \d+$/.test(text)) {
    return text;
  }

  if (status === 400) {
    return 'The server rejected this request. Check the name and try again.';
  }

  if (status === 403) {
    return 'You are not allowed to do that.';
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

async function readErrorBody(response: Response) {
  try {
    const body: unknown = await response.json();
    if (typeof body !== 'object' || body === null) {
      return '';
    }

    const record = body as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message && record.message !== 'No message available') {
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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('Accept', 'application/json');
  if (options?.body != null) {
    headers.set('Content-Type', 'application/json');
  }

  const method = (options?.method ?? 'GET').toUpperCase();
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch (cause) {
    const raw = cause instanceof Error ? cause.message : 'Failed to fetch';
    throw new ApiError(friendlyMessage(raw, 0, method, path), 0, path);
  }

  if (!response.ok) {
    const raw = await readErrorBody(response);
    throw new ApiError(
      friendlyMessage(raw, response.status, method, path),
      response.status,
      path,
    );
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
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
