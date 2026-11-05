import type { AuthStatus } from '@/types/auth';

export type SessionGuardView =
  'checking' | 'public' | 'redirect-to-menu' | 'redirect-to-login' | 'session-error' | 'protected';

export function getSessionGuardView(pathname: string, status: AuthStatus): SessionGuardView {
  if (status === 'loading') {
    return 'checking';
  }
  if (status === 'error') {
    return 'session-error';
  }

  const isPublicRoute = pathname === '/login' || pathname === '/register';
  if (isPublicRoute) {
    return status === 'authenticated' ? 'redirect-to-menu' : 'public';
  }

  if (pathname === '/main-menu' && status === 'unauthenticated') {
    return 'public';
  }

  return status === 'authenticated' ? 'protected' : 'redirect-to-login';
}
