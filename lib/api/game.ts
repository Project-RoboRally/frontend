import { apiPost } from './client';
import type {
  BuyUpgradeRequest,
  MakeChoiceRequest,
  ProgramRequest,
  ProgramResponse,
  PutBackCardsRequest,
  UseUpgradeRequest,
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

export function postUseUpgrade(gameId: string, body: UseUpgradeRequest) {
  return apiPost<void>(`/api/games/${gameId}/upgrade/use`, body);
}

export function putBackCards(gameId: string, body: PutBackCardsRequest) {
  return apiPost<void>(`/api/games/${gameId}/hand/put-back`, body);
}

export function makeChoice(gameId: string, body: MakeChoiceRequest) {
  return apiPost<void>(`/api/games/${gameId}/choice`, body);
}

export function startKickVote(gameId: string, username: string) {
  return apiPost<void>(`/api/games/${gameId}/kick-vote`, { username });
}

export function voteOnKick(gameId: string, yes: boolean) {
  return apiPost<void>(`/api/games/${gameId}/kick-vote/ballot`, { yes });
}
