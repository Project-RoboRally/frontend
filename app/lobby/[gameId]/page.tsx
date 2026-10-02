'use client';

import {useEffect, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {ApiError, getErrorMessage} from '@/lib/api/client';
import {getLobby, kickPlayer, leaveLobby, renameLobby} from '@/lib/api/lobby';
import {pingLogin} from '@/lib/api/login';
import {buttonClassName, inputClassName} from '@/lib/styles';
import {getUsername} from '@/lib/username';
import type {Lobby} from '@/types/lobby';

export default function LobbyPage() {
  const router = useRouter();
  const {gameId} = useParams<{gameId: string}>();
  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const isRenamingRef = useRef(false);

  useEffect(() => {
    if (!username) {
      router.replace('/login');
      return;
    }
    if (!gameId) {
      return;
    }

    const currentUsername = username;
    let cancelled = false;
    let interval = 0;

    async function loadLobby() {
      try {
        const nextLobby = await getLobby(gameId);
        if (cancelled) {
          return;
        }
        if (!(nextLobby.users ?? []).includes(currentUsername)) {
          router.replace('/main-menu');
          return;
        }
        setLobby((current) => {
          if (isRenamingRef.current && current) {
            return {...nextLobby, name: current.name};
          }
          return nextLobby;
        });
        setNameDraft((current) =>
          isRenamingRef.current ? current : nextLobby.name,
        );
        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        const status =
          loadError instanceof ApiError
            ? loadError.status
            : typeof loadError === 'object' &&
                loadError !== null &&
                'status' in loadError &&
                typeof loadError.status === 'number'
              ? loadError.status
              : 0;
        const message = getErrorMessage(loadError, '');
        if (
          status === 404 ||
          message.toLowerCase().includes('lobby was not found') ||
          message.toLowerCase().includes('lobby not found')
        ) {
          router.replace('/main-menu');
          return;
        }
        setError(getErrorMessage(loadError, 'Could not load lobby'));
      }
    }

    async function start() {
      const loggedIn = await pingLogin(currentUsername);
      if (cancelled) {
        return;
      }
      if (!loggedIn) {
        router.replace('/main-menu');
        return;
      }

      await loadLobby();
      interval = window.setInterval(() => {
        if (!isRenamingRef.current) {
          void loadLobby();
        }
      }, 2000);
    }

    void start();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [gameId, router, username]);

  async function handleRename(name: string) {
    if (!lobby || name === lobby.name) {
      return;
    }

    try {
      const updated = await renameLobby(lobby.id, {name});
      setLobby(updated);
      if (!isRenamingRef.current) {
        setNameDraft(updated.name);
      }
    } catch (renameError) {
      setError(getErrorMessage(renameError, 'Failed to rename lobby'));
    }
  }

  async function handleExit() {
    if (!username) {
      return;
    }

    try {
      if (lobby) {
        await leaveLobby(lobby.id, {username});
      }
    } catch {
      // Owner leave can delete the lobby; still return to the menu.
    }

    router.push('/main-menu');
  }

  async function handleKick(playerKicked: string) {
    if (!lobby || !username) {
      return;
    }

    try {
      const updated = await kickPlayer(lobby.id, {
        kickedBy: username,
        userKicked: playerKicked,
      });
      setLobby(updated);
    } catch (kickError) {
      setError(getErrorMessage(kickError, 'Failed to kick player'));
    }
  }

  if (!username) {
    return null;
  }

  const isOwner = lobby?.createdBy === username;

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-3xl p-6 pt-20">
      <header className="mb-10 text-center">
        <button
          className={`${buttonClassName} absolute left-6 top-6`}
          onClick={() => void handleExit()}
          type="button"
        >
          Exit
        </button>
        <h1 className="text-3xl font-bold">Lobby</h1>
        <p className="absolute right-6 top-6">Logged in as: {username}</p>
      </header>

      {error ? (
        <p className="mb-4 text-center" role="alert">
          {error}
        </p>
      ) : null}

      {lobby ? (
        <section className="flex flex-col items-center text-center">
          {isOwner ? (
            <input
              aria-label="Lobby name"
              className={`${inputClassName} mb-4 max-w-md text-center text-2xl font-semibold`}
              onBlur={() => {
                isRenamingRef.current = false;
              }}
              onChange={(event) => {
                isRenamingRef.current = true;
                const name = event.target.value;
                setNameDraft(name);
                void handleRename(name);
              }}
              onFocus={() => {
                isRenamingRef.current = true;
              }}
              type="text"
              value={nameDraft}
            />
          ) : (
            <h2 className="mb-4 text-2xl font-semibold">{lobby.name}</h2>
          )}
          <h3 className="mb-2 text-lg font-semibold">Players</h3>
          <ul className="mb-8 grid h-48 w-full max-w-xl grid-cols-2 grid-rows-3 gap-2 border-2 border-white p-2 text-left">
            {(lobby.users ?? []).map((player) => (
              <li
                className="flex min-w-0 items-center justify-between rounded border px-3 py-2"
                key={player}
              >
                <span className="truncate">{player}</span>
                {isOwner && player !== username ? (
                  <button
                    aria-label={`Kick ${player}`}
                    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded border hover:bg-gray-100"
                    onClick={() => void handleKick(player)}
                    type="button"
                  >
                    x
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex justify-center">
        <button className={buttonClassName} onClick={() => router.push('/game')} type="button">
          Start
        </button>
      </div>
    </main>
  );
}
