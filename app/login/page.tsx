'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/api/client';
import { login } from '@/lib/api/login';
import { DyslexicFontToggle } from '@/components/Dyslexic';

import { buttonClassName, inputClassName, panelClassName } from '@/lib/styles';
import { passwordError, saveToken, saveUsername, usernameError } from '@/lib/username';

/**
 * @author Anton, Kerem, Katarina, Caroline
 */

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn() {
    setError(null);
    setIsSubmitting(true);

    const validationError = usernameError(username) ?? passwordError(password);
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login({ username, password });
      saveUsername(result.username);
      saveToken(result.token);
      router.push('/main-menu');
    } catch (loginError) {
      setError(getErrorMessage(loginError, 'Login failed'));
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Login</h1>

      <div className={`${panelClassName} w-full`}>
        <form
          className="w-full space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void signIn();
          }}
        >
          <div>
            <label className="mb-1 block" htmlFor="username">
              Username
            </label>

            <input
              className={inputClassName}
              id="username"
              maxLength={16}
              minLength={3}
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </div>

          <div>
            <label className="mb-1 block" htmlFor="password">
              Password
            </label>

            <input
              className={inputClassName}
              id="password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <p className="font-semibold text-amber" role="alert">
              {error}
            </p>
          ) : null}

          <button className={buttonClassName} disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      <div className="mb-6 top-0 flex w-full justify-center p-6">
        <DyslexicFontToggle />
      </div>
    </main>
  );
}
