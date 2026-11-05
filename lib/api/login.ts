import { apiGet, apiPost, ApiError } from './client';
import type { AuthSession, Credentials } from '@/types/auth';

export function getSession() {
  return apiGet<AuthSession>('/api/session');
}

export async function restoreSession() {
  try {
    return await getSession();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function login(credentials: Credentials) {
  return apiPost<AuthSession>('/api/login', credentials);
}

export function register(credentials: Credentials) {
  return apiPost<AuthSession>('/api/register', credentials);
}

export function logout() {
  return apiPost<void>('/api/logout', {});
}
