'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { login, logout, register, restoreSession } from '@/lib/api/login';
import type { AuthSession, AuthStatus, Credentials } from '@/types/auth';

type AuthContextValue = {
  username: string | null;
  status: AuthStatus;
  error: string | null;
  refreshSession: () => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const setAuthenticated = useCallback((session: AuthSession) => {
    setUsername(session.username);
    setStatus('authenticated');
    setError(null);
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const session = await restoreSession();
      if (!session) {
        setUsername(null);
        setStatus('unauthenticated');
        return;
      }
      setAuthenticated(session);
    } catch (sessionError) {
      setUsername(null);
      setStatus('error');
      setError(getErrorMessage(sessionError, 'Could not check your session.'));
    }
  }, [setAuthenticated]);

  const refreshSession = useCallback(async () => {
    setStatus('loading');
    setError(null);
    await loadSession();
  }, [loadSession]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadSession(), 0);

    function handleUnauthorized() {
      setUsername(null);
      setStatus('unauthenticated');
      setError(null);
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [loadSession]);

  const signIn = useCallback(
    async (credentials: Credentials) => setAuthenticated(await login(credentials)),
    [setAuthenticated],
  );

  const signUp = useCallback(
    async (credentials: Credentials) => setAuthenticated(await register(credentials)),
    [setAuthenticated],
  );

  const signOut = useCallback(async () => {
    await logout();
    setUsername(null);
    setStatus('unauthenticated');
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ username, status, error, refreshSession, signIn, signUp, signOut }),
    [username, status, error, refreshSession, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
