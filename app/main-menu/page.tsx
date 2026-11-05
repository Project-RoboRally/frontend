'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getErrorMessage } from '@/lib/api/client';
import { createLobby, getLobbies, getLobby, joinLobby } from '@/lib/api/lobby';
import { buttonClassName, inputClassName } from '@/lib/styles';
import type { Lobby } from '@/types/lobby';

/**
 * @author Anton, Kerem
 */

export default function MainMenuPage() {
  const router = useRouter();
  const { username } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [lobbyName, setLobbyName] = useState('My Lobby');
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLobbies() {
      try {
        const nextLobbies = await getLobbies();
        if (cancelled) {
          return;
        }

        const currentLobby = username
          ? nextLobbies.find((lobby) => (lobby.users ?? []).includes(username))
          : undefined;
        if (currentLobby?.started) {
          router.replace(`/game?lobby=${currentLobby.id}`);
          return;
        }
        if (currentLobby) {
          router.replace(`/lobby/${currentLobby.id}`);
          return;
        }

        setLobbies(nextLobbies);
        setError(null);
      } catch (fetchError) {
        if (!cancelled) {
          setError(getErrorMessage(fetchError, 'Failed to load lobbies'));
        }
      }
    }

    void loadLobbies();
    const interval = window.setInterval(() => {
      void loadLobbies();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [router, username]);

  async function handleCreateLobby() {
    if (!username) {
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const lobby = await createLobby({
        name: lobbyName.trim() || 'My Lobby',
        username,
      });
      router.push(`/lobby/${lobby.id}`);
    } catch (createError) {
      setError(getErrorMessage(createError, 'Failed to create lobby'));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleOpenLobby(id: string) {
    if (!username) {
      setError('Log in to join a lobby.');
      return;
    }

    setError(null);
    setJoiningId(id);

    try {
      const lobby = await getLobby(id);
      if (!(lobby.users ?? []).includes(username)) {
        await joinLobby(id, { username });
      }
      router.push(`/lobby/${id}`);
    } catch (joinError) {
      setError(getErrorMessage(joinError, 'Failed to join lobby'));
    } finally {
      setJoiningId(null);
    }
  }

  const filteredLobbies = lobbies.filter((lobby) =>
    lobby.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-4xl p-6 pt-20">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Main Menu</h1>
        {!username ? (
          <p className="mt-2">
            <Link className="underline" href="/login">
              Log in
            </Link>{' '}
            or{' '}
            <Link className="underline" href="/register">
              create an account
            </Link>{' '}
            to play.
          </p>
        ) : null}
      </header>
      {error ? (
        <p className="mb-4 text-center" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        <section className="flex flex-col items-center gap-4">
          <input
            aria-label="Lobby name"
            className={inputClassName}
            onChange={(event) => setLobbyName(event.target.value)}
            placeholder="Lobby name"
            type="text"
            value={lobbyName}
          />
          <button
            className={buttonClassName}
            disabled={!username || isCreating}
            onClick={handleCreateLobby}
            type="button"
          >
            {isCreating ? 'Creating...' : 'Create Lobby'}
          </button>
        </section>

        <section className="border-2 border-white p-4">
          <input
            aria-label="Search available lobbies"
            className={inputClassName}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search available lobbies"
            type="search"
            value={searchTerm}
          />
          <ul className="mt-3 h-48 space-y-2 overflow-y-auto pr-2">
            {filteredLobbies.map((lobby) => (
              <li key={lobby.id}>
                <button
                  className={`${buttonClassName} w-full px-4 py-3 text-left`}
                  disabled={!username || joiningId === lobby.id}
                  onClick={() => handleOpenLobby(lobby.id)}
                  type="button"
                >
                  {lobby.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
