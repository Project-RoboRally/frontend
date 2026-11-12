import { apiGet, apiPatch, apiPost } from './client';
import type {
  BuyUpgradeRequest,
  CreateLobbyRequest,
  KickFromLobbyRequest,
  Lobby,
  MakeChoiceRequest,
  ProgramRequest,
  ProgramResponse,
  RenameLobbyRequest,
  SetColorRequest,
  SetReadyRequest,
} from '@/types/lobby';

export function getLobbies() {
  return apiGet<Lobby[]>('/api/lobbies');
}

export function getLobby(id: string) {
  return apiGet<Lobby>(`/api/lobbies/${id}`);
}

export function createLobby(body: CreateLobbyRequest) {
  return apiPost<Lobby>('/api/lobbies', body);
}

export function renameLobby(id: string, body: RenameLobbyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/rename`, body);
}

export function joinLobby(id: string) {
  return apiPost<Lobby>(`/api/lobbies/${id}/join`, {});
}

export function leaveLobby(id: string) {
  return apiPost<Lobby>(`/api/lobbies/${id}/leave`, {});
}

export function kickPlayer(id: string, body: KickFromLobbyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/kick`, body);
}

export function unkickPlayer(id: string, body: KickFromLobbyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/unkick`, body);
}

export function setReady(id: string, body: SetReadyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/ready`, body);
}

export function setColor(id: string, body: SetColorRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/color`, body);
}

export function startGame(id: string) {
  return apiPost<Lobby>(`/api/lobbies/${id}/start`, {});
}

export function submitProgram(id: string, body: ProgramRequest) {
  return apiPost<ProgramResponse>(`/api/lobbies/${id}/program`, body);
}

export function buyUpgrade(id: string, body: BuyUpgradeRequest) {
  return apiPost<void>(`/api/lobbies/${id}/upgrade/buy`, body);
}

export function skipUpgrade(id: string) {
  return apiPost<void>(`/api/lobbies/${id}/upgrade/skip`, {});
}

export function makeChoice(id: string, body: MakeChoiceRequest) {
  return apiPost<void>(`/api/lobbies/${id}/choice`, body);
}
