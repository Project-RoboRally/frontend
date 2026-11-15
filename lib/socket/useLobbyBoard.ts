'use client';

import { useEffect, useState } from 'react';

import { connectStomp } from './stomp';
import type { Board } from '@/types/board';

/**
 * Loads the board for a game over the websocket. The /app subscription
 * replies with the current board right away; the /game topic delivers every
 * later update.
 *
 * @author Elias
 */
export function useLobbyBoard(gameId: string | null) {
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    const connection = connectStomp((stomp) => {
      const receive = (body: unknown) => setBoard(body as Board);
      stomp.subscribe(`/app/game/${gameId}/board`, receive);
      stomp.subscribe(`/game/${gameId}/board`, receive);
    });

    return () => connection.close();
  }, [gameId]);

  return board;
}
