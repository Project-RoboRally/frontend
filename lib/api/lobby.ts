import {apiGet, apiPatch, apiPost} from './client';
import type {
  CreateLobbyRequest,
  JoinLeaveLobbyRequest,
  KickFromLobbyRequest,
  Lobby,
  RenameLobbyRequest
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
  return apiPatch<Lobby>(`/api/lobbies/${id}`, body);
}

export function joinLobby(id: string, body: JoinLeaveLobbyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/join`, body);
}

export function leaveLobby(id: string, body: JoinLeaveLobbyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/leave`, body);
}

export function kickPlayer(id: string, body: KickFromLobbyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/kick`, body);
}