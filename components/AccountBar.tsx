'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getErrorMessage } from '@/lib/api/client';
import { buttonClassName } from '@/lib/styles';

export function AccountBar() {
  const router = useRouter();
  const { username, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);
    try {
      await signOut();
      router.replace('/login');
    } catch (signOutError) {
      setError(getErrorMessage(signOutError, 'Could not sign out.'));
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <aside className="fixed right-4 top-4 z-50 flex items-center gap-3">
      {error ? (
        <span className="rounded bg-charcoal px-2 py-1 text-sm" role="alert">
          {error}
        </span>
      ) : null}
      <span>Logged in as: {username}</span>
      <button
        className={buttonClassName}
        disabled={isSigningOut}
        onClick={() => void handleSignOut()}
        type="button"
      >
        {isSigningOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </aside>
  );
}
