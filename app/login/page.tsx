'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/login';
import { buttonClassName, inputClassName, panelClassName } from '@/lib/styles';
import { saveUsername } from '@/lib/username';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Login</h1>
      <div className={`${panelClassName} w-full`}>
        <form
          className="w-full space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setIsSubmitting(true);

          try {
            const result = await login({ username });
            saveUsername(result.username);
            router.push('/main-menu');
          } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : 'Login failed');
          } finally {
            setIsSubmitting(false);
          }
        }}
        >
          <div>
            <label className="mb-1 block" htmlFor="username">
              Username
            </label>
            <input
              className={inputClassName}
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </div>
          {error ? <p className="font-semibold text-amber">{error}</p> : null}
          <button className={buttonClassName} disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
