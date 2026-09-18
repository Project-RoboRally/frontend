import {apiGet, apiPost} from './client';
import type {CreateLobbyRequest, JoinLobbyRequest, Lobby} from '@/types/lobby';

export function getLobbies() {
  return apiGet<Lobby[]>('/api/lobbies');
}

export function getLobby(id: string) {
  return apiGet<Lobby>(`/api/lobbies/${id}`);
}

export function createLobby(body: CreateLobbyRequest) {
  return apiPost<Lobby>('/api/lobbies', body);
}

export function joinLobby(id: string, body: JoinLobbyRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/join`, body);
}
