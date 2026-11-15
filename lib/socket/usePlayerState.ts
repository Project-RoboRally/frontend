'use client';

import { useEffect, useState } from 'react';

import { connectStomp } from './stomp';
import type { PlayerGameState } from '@/types/playerGameState';

/**
 * Loads this player's game state over the websocket. The /app subscription
 * replies with the current state right away, so a reloaded page gets it too;
 * the /game topic delivers every later update.
 *
 * @author Nicoleta, Elias
 */
export function usePlayerState(gameId: string | null, username: string | null) {
  const [state, setState] = useState<PlayerGameState | null>(null);

  useEffect(() => {
    if (!gameId || !username) {
      return;
    }

    const connection = connectStomp((stomp) => {
      const receive = (body: unknown) => setState(body as PlayerGameState);
      stomp.subscribe(`/app/game/${gameId}/player/${username}`, receive);
      stomp.subscribe(`/game/${gameId}/player/${username}`, receive);
    });

    return () => connection.close();
  }, [gameId, username]);

  return state;
}
