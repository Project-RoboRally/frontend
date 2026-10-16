import { apiGet, apiPatch } from './client';
import type { Game } from '@/types/game';
import type { GameStatus } from '@/types/gameStatus';

/**
 * API functions for interacting with games.
 * @author Matthias
 */

export function getGame(id: string) {
  return apiGet<Game>(`/api/games/${id}`);
}

export function updateGameStatus(id: string, status: GameStatus) {
  return apiPatch<Game>(`/api/games/${id}/status`, { status });
}
