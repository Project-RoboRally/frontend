'use client';

import { useEffect, useState } from 'react';

import { connectStomp } from './stomp';
import type { PlayerGameState } from '@/types/playerGameState';

/**
 * Subscribes to this player's private game-state topic using the session username.
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
      stomp.subscribe(`/game/lobby/${lobbyId}/player/${username}`, receive);
    });

    return () => connection.close();
  }, [lobbyId, username]);

  return state;
}
