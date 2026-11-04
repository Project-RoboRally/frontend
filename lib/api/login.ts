import { apiGet, apiPost, ApiError } from './client';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export function login(body: LoginRequest) {
  return apiPost<LoginResponse>('/api/login', body);
}

export async function hasActiveUser(username: string) {
  try {
    await apiGet<LoginResponse>(`/api/session?username=${encodeURIComponent(username)}`);
    return true;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return false;
    }
    throw error;
  }
}
