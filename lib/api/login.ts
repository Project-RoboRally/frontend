import { apiGet, apiPost, ApiError } from './client';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export function login(body: LoginRequest) {
  return apiPost<LoginResponse>('/api/login', body);
}

export async function hasActiveSession() {
  try {
    await apiGet<LoginResponse>(`/api/session`);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return false;
    }
    throw error;
  }
}

export function logout() {
  return apiPost<void>('/api/logout', {});
}
