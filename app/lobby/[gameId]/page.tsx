'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Game from '@/components/Game';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import {
  changeBoard,
  changeCustomBoard,
  getLobby,
  getBoards,
  getLobbyBoard,
  kickPlayer,
  leaveLobby,
  renameLobby,
  setColor,
  setReady,
  startGame,
  unkickPlayer,
} from '@/lib/api/lobby';
import { colorLabel, PLAYER_COLORS, robotSprite } from '@/lib/playerColors';
import { buttonClassName, inputClassName, secondaryButtonClassName } from '@/lib/styles';
import { getUsername } from '@/lib/username';
import type { Board, BoardOption } from '@/types/board';
import type { Lobby, PlayerColor } from '@/types/lobby';

export default function LobbyPage() {
  const router = useRouter();
  const { gameId } = useParams<{ gameId: string }>();
  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isTogglingReady, setIsTogglingReady] = useState(false);
  const [isChangingColor, setIsChangingColor] = useState(false);
  const [boards, setBoards] = useState<BoardOption[]>([]);
  // board is null when the preview could not be loaded.
  const [preview, setPreview] = useState<{ id: string; board: Board | null } | null>(null);
  const [isChangingBoard, setIsChangingBoard] = useState(false);
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
        if (nextLobby.started && nextLobby.gameId) {
          router.replace(`/game?game=${nextLobby.gameId}`);
          return;
        }
        setLobby((current) => {
          if (isRenamingRef.current && current) {
            return { ...nextLobby, name: current.name };
          }
          return nextLobby;
        });
        setNameDraft((current) => (isRenamingRef.current ? current : nextLobby.name));
        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        const message = getErrorMessage(loadError, '').toLowerCase();
        if (
          (loadError instanceof ApiError && loadError.status === 404) ||
          message.includes('lobby was not found') ||
          message.includes('lobby not found')
        ) {
          router.replace('/main-menu');
          return;
        }
        setError(getErrorMessage(loadError, 'Could not load lobby'));
      }
    }

    async function start() {
      await loadLobby();
      if (cancelled) {
        return;
      }
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

  useEffect(() => {
    let cancelled = false;
    getBoards()
      .then((options) => {
        if (!cancelled) {
          setBoards(options);
        }
      })
      .catch(() => {
        // Without the list the owner cannot switch, but the preview still works.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const boardId = lobby?.boardId;
  useEffect(() => {
    if (!boardId) {
      return;
    }
    let cancelled = false;
    getLobbyBoard(gameId)
      .then((board) => {
        if (!cancelled) {
          setPreview({ id: boardId, board });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreview({ id: boardId, board: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, boardId]);

  const players = lobby?.users ?? [];
  const isOwner = lobby?.createdBy === username;
  const kickedPlayers = lobby?.kickedUsers ?? [];
  // Without member data (older backend) readiness is unknown, so don't gate Start on it.
  const readyKnown = lobby?.members !== undefined;

  function isPlayerReady(player: string) {
    return (lobby?.members ?? []).some((member) => member.username === player && member.ready);
  }

  function colorOf(player: string) {
    return lobby?.members?.find((member) => member.username === player)?.color;
  }

  function takenBy(color: PlayerColor) {
    return lobby?.members?.find((member) => member.color === color && member.username !== username)
      ?.username;
  }

  const myColor = username ? colorOf(username) : undefined;

  const otherPlayers = players.filter((player) => player !== lobby?.createdBy);
  const readyCount = otherPlayers.filter(isPlayerReady).length;
  const hasEnoughPlayers = players.length >= 2;
  const canStart = hasEnoughPlayers && (!readyKnown || readyCount === otherPlayers.length);

  async function handleRename(name: string) {
    if (!lobby || name === lobby.name) {
      return;
    }

    try {
      const updated = await renameLobby(lobby.id, { name });
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
        await leaveLobby(lobby.id);
      }
    } catch {
      // Owner leave can delete the lobby; still return to the menu.
    }

    router.push('/main-menu');
  }

  async function handleStart() {
    if (!lobby || !username) {
      return;
    }

    setError(null);
    setIsStarting(true);

    try {
      const updated = await startGame(lobby.id);
      setLobby(updated);
      if (updated.started && updated.gameId) {
        router.push(`/game?game=${updated.gameId}`);
      }
    } catch (startError) {
      setError(getErrorMessage(startError, 'Failed to start game'));
    } finally {
      setIsStarting(false);
    }
  }

  /** Runs a lobby request, shows the returned lobby, and reports a failure as the page error. */
  async function updateLobby(
    request: () => Promise<Lobby>,
    fallbackMessage: string,
    setBusy?: (busy: boolean) => void,
  ) {
    setError(null);
    setBusy?.(true);

    try {
      setLobby(await request());
    } catch (updateError) {
      setError(getErrorMessage(updateError, fallbackMessage));
    } finally {
      setBusy?.(false);
    }
  }

  async function handleToggleReady() {
    if (!lobby || !username) {
      return;
    }

    await updateLobby(
      () => setReady(lobby.id, { ready: !isPlayerReady(username) }),
      'Failed to change ready state',
      setIsTogglingReady,
    );
  }

  async function handleChangeColor(color: PlayerColor) {
    if (!lobby || !username || color === myColor) {
      return;
    }

    await updateLobby(
      () => setColor(lobby.id, { color }),
      'Failed to change color',
      setIsChangingColor,
    );
  }

  async function handleChangeBoard(nextBoardId: string) {
    if (!lobby || !username || nextBoardId === lobby.boardId) {
      return;
    }

    setError(null);
    setIsChangingBoard(true);

    try {
      const updated = await changeBoard(lobby.id, { boardId: nextBoardId });
      setLobby(updated);
    } catch (boardError) {
      setError(getErrorMessage(boardError, 'Failed to change board'));
    } finally {
      setIsChangingBoard(false);
    }
  }

  async function handleCustomBoard(file: File) {
    if (!lobby || !isOwner) return;

    setError(null);
    setIsChangingBoard(true);

    try {
      const text = await file.text();

      let level: unknown;

      try {
        level = JSON.parse(text);
      } catch {
        throw new Error('The selected file is not valid JSON.');
      }

      const updated = await changeCustomBoard(lobby.id, level);
      setLobby(updated);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to load custom board'));
    } finally {
      setIsChangingBoard(false);
    }
  }

  async function handleKick(playerKicked: string) {
    if (!lobby || !username) {
      return;
    }

    await updateLobby(
      () => kickPlayer(lobby.id, { userKicked: playerKicked }),
      'Failed to kick player',
    );
  }

  async function handleUnkick(player: string) {
    if (!lobby || !username) {
      return;
    }

    await updateLobby(
      () => unkickPlayer(lobby.id, { userKicked: player }),
      'Failed to allow player back',
    );
  }

  if (!username) {
    return null;
  }

  return (
    <main className="relative mx-auto h-dvh w-full max-w-6xl overflow-y-auto p-6 pt-20">
      <header className="mb-10 text-center">
        <button
          className={`${buttonClassName} absolute left-6 top-6`}
          onClick={() => void handleExit()}
          type="button"
        >
          Exit
        </button>
        <h1 className="text-3xl font-bold">Lobby</h1>
        <p className="absolute right-16 top-6">Logged in as: {username}</p>
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

          <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2">
            <div className="mx-auto w-full min-w-0 max-w-xl">
              <h3 className="mb-2 text-lg font-semibold">Players</h3>
              <ul className="mb-8 grid h-48 w-full max-w-xl grid-cols-2 grid-rows-3 gap-2 border-2 border-white p-2 text-left">
                {players.map((player) => {
                  const color = colorOf(player);
                  return (
                    <li
                      className="flex min-w-0 items-center justify-between rounded border px-3 py-2"
                      key={player}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {player === lobby.createdBy ? (
                          <span className="shrink-0 rounded bg-cobber px-1.5 text-xs font-bold text-bone">
                            Owner
                          </span>
                        ) : readyKnown ? (
                          isPlayerReady(player) ? (
                            <span
                              aria-label="Ready"
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-verdigris font-bold text-bone"
                              role="img"
                              title="Ready"
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              aria-label="Not ready"
                              className="h-6 w-6 shrink-0 rounded-full border-2 border-bone/30"
                              role="img"
                              title="Not ready"
                            />
                          )
                        ) : null}
                        {color ? (
                          <Image
                            alt={`${colorLabel(color)} robot`}
                            className="shrink-0 object-contain"
                            height={28}
                            src={robotSprite(color)}
                            title={`${colorLabel(color)} robot`}
                            width={28}
                          />
                        ) : null}
                        <span className="truncate">{player}</span>
                      </span>
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
                  );
                })}
              </ul>
              {isOwner && kickedPlayers.length > 0 ? (
                <>
                  <h3 className="mb-2 text-lg font-semibold">Kicked players</h3>
                  <ul className="mb-8 flex w-full max-w-xl flex-col gap-2 text-left">
                    {kickedPlayers.map((player) => (
                      <li
                        className="flex min-w-0 items-center justify-between rounded border px-3 py-2"
                        key={player}
                      >
                        <span className="truncate">{player}</span>
                        <button
                          className={`${secondaryButtonClassName} ml-2 shrink-0`}
                          onClick={() => void handleUnkick(player)}
                          type="button"
                        >
                          Allow back
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {myColor ? (
                <>
                  <h3 className="mb-2 text-lg font-semibold">Your robot</h3>
                  <div
                    aria-label="Robot color"
                    className="mb-8 flex flex-wrap justify-center gap-3"
                    role="radiogroup"
                  >
                    {PLAYER_COLORS.map((color) => {
                      const selected = color === myColor;
                      const owner = takenBy(color);
                      return (
                        <button
                          aria-checked={selected}
                          aria-label={colorLabel(color)}
                          className={`flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                            selected
                              ? 'border-cobber bg-iron ring-2 ring-cobber'
                              : 'border-iron hover:border-cobber-light'
                          }`}
                          disabled={owner !== undefined || isChangingColor}
                          key={color}
                          onClick={() => void handleChangeColor(color)}
                          role="radio"
                          title={
                            owner ? `${colorLabel(color)}: taken by ${owner}` : colorLabel(color)
                          }
                          type="button"
                        >
                          <Image
                            alt=""
                            className="object-contain"
                            height={48}
                            src={robotSprite(color)}
                            width={48}
                          />
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            <div className="mx-auto w-full min-w-0 max-w-xl">
              {lobby.boardId ? (
                <>
                  <h3 className="mb-2 text-lg font-semibold">Board</h3>

                  {isOwner && boards.length > 0 ? (
                    <>
                      <select
                        aria-label="Board"
                        className="mb-2 w-full rounded-md border-2 border-steel-dark bg-charcoal p-3 text-bone"
                        value={lobby.boardId}
                        disabled={isChangingBoard}
                        onChange={(event) => void handleChangeBoard(event.target.value)}
                      >
                        {boards.map((board) => (
                          <option key={board.id} value={board.id}>
                            {board.name}
                          </option>
                        ))}
                        {/* upload board */}
                        {!boards.some((board) => board.id === lobby.boardId) && (
                          <option value={lobby.boardId} disabled>
                            {lobby.boardName} (uploaded)
                          </option>
                        )}
                      </select>
                      <p className="mb-4 text-sm text-bone/70">
                        Changing the board asks everyone to press Ready again.
                      </p>
                    </>
                  ) : (
                    <p className="mb-4 font-semibold">{lobby.boardName}</p>
                  )}

                  {isOwner && (
                    <label className="mt-3 block">
                      <span className="mb-2 block">Upload custom board</span>

                      <input
                        type="file"
                        accept=".json,application/json"
                        disabled={isChangingBoard}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];

                          // Allow choosing the same file again after editing it.
                          event.currentTarget.value = '';

                          if (file) {
                            void handleCustomBoard(file);
                          }
                        }}
                      />
                    </label>
                  )}

                  <div
                    aria-label={`Preview of ${lobby.boardName ?? 'the board'}`}
                    className="mb-8 h-72 w-full max-w-xl"
                  >
                    {preview?.id === lobby.boardId ? (
                      preview.board ? (
                        <Game board={preview.board} />
                      ) : (
                        <p className="text-sm text-bone/70">Preview unavailable.</p>
                      )
                    ) : (
                      <p className="text-sm text-bone/70">Loading preview...</p>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {lobby ? (
        <div className="flex flex-col items-center gap-2">
          {isOwner ? (
            <>
              <button
                className={`${buttonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isStarting || !canStart}
                onClick={() => void handleStart()}
                type="button"
              >
                {isStarting ? 'Starting...' : 'Start'}
              </button>
              {!hasEnoughPlayers ? (
                <p className="text-sm text-bone/70">Waiting for at least one more player.</p>
              ) : !canStart ? (
                <p className="text-sm text-bone/70">
                  Waiting for players to be ready ({readyCount}/{otherPlayers.length}).
                </p>
              ) : null}
            </>
          ) : readyKnown ? (
            <>
              <button
                aria-pressed={isPlayerReady(username)}
                className={`${
                  isPlayerReady(username) ? secondaryButtonClassName : buttonClassName
                } disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isTogglingReady}
                onClick={() => void handleToggleReady()}
                type="button"
              >
                {isPlayerReady(username) ? 'Not ready' : 'Ready'}
              </button>
              <p className="text-sm text-bone/70">
                {isPlayerReady(username)
                  ? 'Waiting for the owner to start the game.'
                  : 'Press Ready when you are set to play.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-bone/70">Waiting for the owner to start the game.</p>
          )}
        </div>
      ) : null}
    </main>
  );
}
