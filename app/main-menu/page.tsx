'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {createLobby, getLobbies} from '@/lib/api/lobby';
import {buttonClassName, inputClassName} from '@/lib/styles';
import {getUsername, removeUsername} from '@/lib/username';
import type {Lobby} from '@/types/lobby';

export default function MainMenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );

  useEffect(() => {
    if (!username) {
      router.replace('/login');
    }
  }, [router, username]);

  useEffect(() => {
    if (!username) {
      return;
    }

    getLobbies()
      .then(setLobbies)
      .catch((fetchError) =>
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load lobbies'),
      );
  }, [username]);

  function handleSignOut() {
    removeUsername();
    router.push('/login');
  }

  // TODO: id is will be created in the backend, but for now we generate it on the client, i looked at the wrong page
  async function handleCreateGame() {
    if (!username) {
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const lobby = await createLobby({
        id: "new-game",
        name: "New Game",
        username,
      });
      router.push(`/lobby/${lobby.id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create game');
    } finally {
      setIsCreating(false);
    }
  }

  const filteredLobbies = lobbies.filter((lobby) =>
    lobby.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!username) {
    return null;
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-4xl p-6 pt-20">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Main Menu</h1>
      </header>
      <p className="absolute right-6 top-6">Logged in as: {username}</p>

      {error ? (
        <p className="mb-4 text-center" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        <section className="flex flex-col items-center gap-4">
          <button
            className={buttonClassName}
            disabled={isCreating}
            onClick={handleCreateGame}
            type="button"
          >
            {isCreating ? 'Creating...' : 'Create Game'}
          </button>

          <button className={buttonClassName} onClick={handleSignOut} type="button">
            Sign Out
          </button>
        </section>

        <section className="border-2 border-white p-4">
          <input
            aria-label="Search available games"
            className={inputClassName}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search available games"
            type="search"
            value={searchTerm}
          />
          <ul className="mt-3 h-48 space-y-2 overflow-y-scroll pr-2">
            {filteredLobbies.map((lobby) => (
              <li key={lobby.id}>
                <button
                  className={`${buttonClassName} w-full px-4 py-3 text-left`}
                  onClick={() => router.push(`/lobby/${lobby.id}`)}
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
