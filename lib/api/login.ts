import { apiPost, ApiError, getErrorMessage } from './client';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export function login(body: LoginRequest) {
  return apiPost<LoginResponse>('/api/login', body);
}

/** Re-register this username with the in-memory backend. Already-registered is OK. */
export async function pingLogin(username: string) {
  try {
    await login({ username });
    return true;
  } catch (error) {
    const message = getErrorMessage(error, '').toLowerCase();
    if (
      message.includes('already in use') ||
      message.includes('already exists') ||
      (error instanceof ApiError && error.status === 409)
    ) {
      return true;
    }
    return false;
  }
}
