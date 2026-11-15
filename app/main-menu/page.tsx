'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/api/client';
import { createLobby, getLobbies, getLobby, joinLobby, leaveLobby } from '@/lib/api/lobby';
import { logout } from '@/lib/api/login';
import { buttonClassName, inputClassName } from '@/lib/styles';
import { clearSession, getUsername } from '@/lib/username';
import type { Lobby } from '@/types/lobby';

/**
 * Shows the player's ongoing games, waiting lobby, and available lobbies.
 * Players can return to an existing match or leave a waiting lobby after
 * confirming their choice.
 *
 * @author Anton, Kerem, Matthias, Elias
 */
export default function MainMenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [lobbyName, setLobbyName] = useState('My Lobby');
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );

  useEffect(() => {
    if (!username) {
      router.replace('/login');
    }
  }, [router, username]);

  useEffect(() => {
    if (!username || leavingId !== null) {
      return;
    }

    let cancelled = false;

    async function loadLobbies() {
      try {
        const nextLobbies = await getLobbies();
        if (!cancelled) {
          setLobbies(nextLobbies);
          setLoadError(null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setLoadError(getErrorMessage(fetchError, 'Failed to load lobbies'));
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
  }, [username, leavingId]);

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      // Clear the local session even if the backend is unreachable.
    }
    clearSession();
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
      });
      router.push(`/lobby/${lobby.id}`);
    } catch (createError) {
      setError(getErrorMessage(createError, 'Failed to create lobby'));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleOpenLobby(id: string) {
    const storedUsername = getUsername();
    if (!storedUsername) {
      router.replace('/login');
      return;
    }

    setError(null);
    setJoiningId(id);

    try {
      const lobby = await getLobby(id);
      const isMember = (lobby.users ?? []).includes(storedUsername);

      if (lobby.started && lobby.gameId) {
        if (!isMember) {
          setError('This game has already started.');
          return;
        }

        router.push(`/game?game=${lobby.gameId}`);
        return;
      }

      if (!isMember) {
        await joinLobby(id);
      }

      router.push(`/lobby/${lobby.id}`);
    } catch (openError) {
      setError(getErrorMessage(openError, 'Failed to open lobby'));
    } finally {
      setJoiningId(null);
    }
  }

  async function handleLeaveLobby(id: string) {
    if (confirmLeaveId !== id || leavingId !== null) {
      return;
    }

    setError(null);
    setLeavingId(id);

    try {
      const lobby = await getLobby(id);

      if (lobby.started) {
        setLobbies((current) => current.map((item) => (item.id === id ? lobby : item)));
        setError('This game has already started. You can return to it from My Games.');
        return;
      }

      const updatedLobby = await leaveLobby(id);

      setLobbies((current) =>
        current.flatMap((item) => {
          if (item.id !== id) {
            return [item];
          }

          return lobby.createdBy === username ? [] : [updatedLobby];
        }),
      );
    } catch (leaveError) {
      setError(getErrorMessage(leaveError, 'Failed to leave lobby'));
    } finally {
      setConfirmLeaveId(null);
      setLeavingId(null);
    }
  }

  if (!username) {
    return null;
  }

  const myLobbies = lobbies.filter((lobby) => (lobby.users ?? []).includes(username));
  const search = searchTerm.trim().toLowerCase();
  const availableLobbies = lobbies.filter(
    (lobby) =>
      !lobby.started &&
      !(lobby.users ?? []).includes(username) &&
      lobby.name.toLowerCase().includes(search),
  );
  const visibleError = error ?? loadError;
  const busy = isCreating || joiningId !== null || leavingId !== null;

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-4xl p-6 pt-20">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Main Menu</h1>
      </header>
      <p className="absolute right-6 top-6">Logged in as: {username}</p>

      {visibleError && (
        <p className="mb-4 text-center" role="alert">
          {visibleError}
        </p>
      )}

      <section className="mb-8 border-2 border-white p-4">
        <h2 className="mb-3 text-xl font-bold">My Games</h2>

        {myLobbies.length === 0 ? (
          <p>No games or lobbies to return to.</p>
        ) : (
          <ul className="space-y-3">
            {myLobbies.map((lobby) => (
              <li key={lobby.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className={`${buttonClassName} grow px-4 py-3 text-left`}
                    disabled={busy}
                    onClick={() => void handleOpenLobby(lobby.id)}
                    type="button"
                  >
                    {lobby.name} ({lobby.started ? 'Return to game' : 'Return to lobby'})
                  </button>

                  {!lobby.started && confirmLeaveId !== lobby.id && (
                    <button
                      className={buttonClassName}
                      disabled={busy}
                      onClick={() => setConfirmLeaveId(lobby.id)}
                      type="button"
                    >
                      Leave lobby
                    </button>
                  )}
                </div>

                {!lobby.started && confirmLeaveId === lobby.id && (
                  <div className="mt-2 border border-steel-dark p-3">
                    <p>
                      {lobby.createdBy === username
                        ? 'Are you sure? Leaving will close this lobby for everyone.'
                        : 'Are you sure you want to leave this lobby?'}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        className={buttonClassName}
                        disabled={busy}
                        onClick={() => void handleLeaveLobby(lobby.id)}
                        type="button"
                      >
                        {leavingId === lobby.id ? 'Leaving…' : 'Leave lobby'}
                      </button>
                      <button
                        className={buttonClassName}
                        disabled={busy}
                        onClick={() => setConfirmLeaveId(null)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

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
            disabled={busy}
            onClick={() => void handleCreateLobby()}
            type="button"
          >
            {isCreating ? 'Creating...' : 'Create Lobby'}
          </button>

          <button
            className={buttonClassName}
            disabled={busy}
            onClick={() => void handleSignOut()}
            type="button"
          >
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

          {availableLobbies.length === 0 ? (
            <p className="mt-3">No matching lobbies.</p>
          ) : (
            <ul className="mt-3 h-48 space-y-2 overflow-y-auto pr-2">
              {availableLobbies.map((lobby) => (
                <li key={lobby.id}>
                  <button
                    className={`${buttonClassName} w-full px-4 py-3 text-left`}
                    disabled={busy}
                    onClick={() => void handleOpenLobby(lobby.id)}
                    type="button"
                  >
                    {lobby.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
