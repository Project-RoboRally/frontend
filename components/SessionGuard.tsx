'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasActiveSession } from '@/lib/api/login';
import { clearSession, getToken } from '@/lib/username';

/**
 * Keeps a backend User alive for every page except login.
 * Missing users are sent to login, which signs them in with the saved username.
 */
export default function SessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/login';
  const [allowed, setAllowed] = useState(isLogin);

  useEffect(() => {
    if (isLogin) {
      setAllowed(true);
      return;
    }

    if (!getToken()) {
      setAllowed(false);
      router.replace('/login');
      return;
    }

    let cancelled = false;

    async function confirmUser() {
      try {
        const active = await hasActiveSession();
        if (cancelled) {
          return;
        }
        if (!active) {
          clearSession();
          setAllowed(false);
          router.replace('/login');
          return;
        }
        setAllowed(true);
      } catch {
        if (!cancelled) {
          setAllowed(false);
          router.replace('/login');
        }
      }
    }

    void confirmUser();

    return () => {
      cancelled = true;
    };
  }, [isLogin, pathname, router]);

  if (!allowed) {
    return null;
  }

  return children;
}
