import { apiPost } from './client';
import type {
  BuyUpgradeRequest,
  MakeChoiceRequest,
  ProgramRequest,
  ProgramResponse,
} from '@/types/lobby';

/**
 * Sends a player's decisions during a running game to the game API.
 *
 * @author Elias
 */

export function submitProgram(gameId: string, body: ProgramRequest) {
  return apiPost<ProgramResponse>(`/api/games/${gameId}/program`, body);
}

export function buyUpgrade(gameId: string, body: BuyUpgradeRequest) {
  return apiPost<void>(`/api/games/${gameId}/upgrade/buy`, body);
}

export function skipUpgrade(gameId: string) {
  return apiPost<void>(`/api/games/${gameId}/upgrade/skip`, {});
}

export function makeChoice(gameId: string, body: MakeChoiceRequest) {
  return apiPost<void>(`/api/games/${gameId}/choice`, body);
}
