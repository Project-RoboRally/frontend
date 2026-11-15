'use client';

import { useEffect, useState } from 'react';

import { connectStomp } from './stomp';
import type { PlayerPresence, Presence } from '@/types/presence';

// Must match PresenceService.TICK_MILLIS on the backend.
const HEALTH_INTERVAL_MS = 10_000;

/**
 * Sends a health ping for this player every 10 seconds and returns who in the
 * game is online, keyed by username.
 *
 * @author Elias
 */
export function usePresence(gameId: string | null, username: string | null) {
  const [presence, setPresence] = useState<Record<string, PlayerPresence>>({});

  useEffect(() => {
    if (!gameId || !username) {
      return;
    }

    const destination = `/app/health/${gameId}`;
    const connection = connectStomp((stomp) => {
      const receive = (body: unknown) => {
        const players = (body as Presence | null)?.players ?? [];
        setPresence(Object.fromEntries(players.map((player) => [player.username, player])));
      };
      stomp.subscribe(`/app/game/${gameId}/presence`, receive);
      stomp.subscribe(`/game/${gameId}/presence`, receive);
      stomp.send(destination);
    });
    const timer = setInterval(() => connection.send(destination), HEALTH_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      connection.close();
    };
  }, [gameId, username]);

  return presence;
}
