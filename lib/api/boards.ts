import { apiGet, apiPost } from './client';
import type { Board, BoardOption } from '@/types/board';
import type { Lobby, ChangeCustomBoardRequest } from '@/types/lobby';

/**
 * The boards a lobby can be played on, and each one's layout for the lobby
 * preview. The layout has the same shape as the in-game board, without robots.
 *
 * @author August
 */
export function getBoards() {
  return apiGet<BoardOption[]>('/api/boards');
}

export function getBoardLayout(id: string) {
  return apiGet<Board>(`/api/boards/${id}`);
}

export function changeCustomBoard(id: string, body: ChangeCustomBoardRequest) {
  return apiPost<Lobby>(`/api/lobbies/${id}/board/custom`, body);
}
