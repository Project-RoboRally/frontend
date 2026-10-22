'use client';

import { useEffect, useState } from 'react';

import { connectStomp } from './stomp';
import type { PlayerGameState } from '@/types/playerGameState';

/**
 * Loads this player's game state over the websocket. The /app subscription
 * replies with the current state right away, so a reloaded page gets it too;
 * the /game topic delivers it when the game is started.
 *
 * @author Nicoleta
 */
export function usePlayerState(lobbyId: string | null, username: string | null) {
  const [state, setState] = useState<PlayerGameState | null>(null);

  useEffect(() => {
    if (!lobbyId || !username) {
      return;
    }

    const connection = connectStomp((stomp) => {
      const receive = (body: unknown) => setState(body as PlayerGameState);
      stomp.subscribe(`/app/lobby/${lobbyId}/player/${username}`, receive);
      stomp.subscribe(`/game/lobby/${lobbyId}/player/${username}`, receive);
    });

    return () => connection.close();
  }, [lobbyId, username]);

  return state;
}
