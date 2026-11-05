'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getErrorMessage } from '@/lib/api/client';
import { buttonClassName, inputClassName, panelClassName } from '@/lib/styles';
import { passwordError, usernameError } from '@/lib/username';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalidUsername = usernameError(username);
    if (invalidUsername) {
      setError(invalidUsername);
      return;
    }

    if (isRegister) {
      const invalidPassword = passwordError(password);
      if (invalidPassword) {
        setError(invalidPassword);
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const credentials = { username, password };
      if (isRegister) {
        await signUp(credentials);
      } else {
        await signIn(credentials);
      }
      router.replace('/main-menu');
    } catch (submitError) {
      setError(getErrorMessage(submitError, isRegister ? 'Registration failed.' : 'Login failed.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">
        {isRegister ? 'Create Account' : 'Login'}
      </h1>
      <div className={`${panelClassName} w-full`}>
        <form className="w-full space-y-4" onSubmit={(event) => void submit(event)}>
          <div>
            <label className="mb-1 block" htmlFor="username">
              Username
            </label>
            <input
              autoComplete="username"
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
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className={inputClassName}
              id="password"
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
            {isSubmitting
              ? isRegister
                ? 'Creating account...'
                : 'Logging in...'
              : isRegister
                ? 'Register'
                : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <Link className="underline" href={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Login' : 'Register'}
          </Link>
        </p>
      </div>
    </main>
  );
}
