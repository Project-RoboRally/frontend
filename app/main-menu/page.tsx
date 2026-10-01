'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {createLobby, getLobbies, getLobby, joinLobby} from '@/lib/api/lobby';
import {buttonClassName, inputClassName} from '@/lib/styles';
import {getUsername, removeUsername} from '@/lib/username';
import type {Lobby} from '@/types/lobby';

export default function MainMenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [lobbyName, setLobbyName] = useState('My Lobby');
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
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
      setError(createError instanceof Error ? createError.message : 'Failed to create lobby');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleOpenLobby(id: string) {
    if (!username) {
      return;
    }

    setError(null);
    setJoiningId(id);

    try {
      const lobby = await getLobby(id);
      if (!lobby.players.includes(username)) {
        await joinLobby(id, {username});
      }
      router.push(`/lobby/${id}`);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Failed to join lobby');
    } finally {
      setJoiningId(null);
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
            disabled={isCreating}
            onClick={handleCreateLobby}
            type="button"
          >
            {isCreating ? 'Creating...' : 'Create Lobby'}
          </button>

          <button className={buttonClassName} onClick={handleSignOut} type="button">
            Sign Out
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
          <ul className="mt-3 h-48 space-y-2 overflow-y-scroll pr-2">
            {filteredLobbies.map((lobby) => (
              <li key={lobby.id}>
                <button
                  className={`${buttonClassName} w-full px-4 py-3 text-left`}
                  disabled={joiningId === lobby.id}
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
