'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AccountBar } from '@/components/AccountBar';
import { useAuth } from '@/components/AuthProvider';
import { getSessionGuardView } from '@/lib/auth/sessionGuard';
import { buttonClassName } from '@/lib/styles';

export default function SessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, error, refreshSession } = useAuth();
  const view = getSessionGuardView(pathname, status);

  useEffect(() => {
    if (view === 'redirect-to-menu') {
      router.replace('/main-menu');
    } else if (view === 'redirect-to-login') {
      router.replace('/login');
    }
  }, [router, view]);

  if (view === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center" role="status">
        Checking your session...
      </main>
    );
  }

  if (view === 'session-error') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert">{error}</p>
        <button className={buttonClassName} onClick={() => void refreshSession()} type="button">
          Retry
        </button>
      </main>
    );
  }

  if (view === 'redirect-to-menu' || view === 'redirect-to-login') {
    return null;
  }

  if (view === 'public') {
    return children;
  }

  return (
    <>
      <AccountBar />
      {children}
    </>
  );
}
