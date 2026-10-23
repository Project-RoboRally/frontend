'use client';

import { useEffect, useState } from 'react';

import { connectStomp } from './stomp';
import type { Board } from '@/types/board';

/**
 * Loads the board for a lobby over the websocket. The /app subscription
 * replies with the current board right away; the /game topic delivers it again
 * when the game is started.
 *
 * @author Elias
 */
export function useLobbyBoard(lobbyId: string | null) {
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (!lobbyId) {
      return;
    }

    const connection = connectStomp((stomp) => {
      const receive = (body: unknown) => setBoard(body as Board);
      stomp.subscribe(`/app/lobby/${lobbyId}/board`, receive);
      stomp.subscribe(`/game/lobby/${lobbyId}/board`, receive);
    });

    return () => connection.close();
  }, [lobbyId]);

  return board;
}
