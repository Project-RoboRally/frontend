import { apiPost } from './client';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export function login(body: LoginRequest) {
  return apiPost<LoginResponse>('/api/login', body);
}
