import type { Client, StompSubscription } from '@stomp/stompjs';
import type { GameStatus } from '@/types/gameStatus';

/**
 * @author Matthias
 */

/**
 * Payload received when the status of a game changes.
 */
export type GameStatusMessage = {
  gameId: string;
  status: GameStatus;
};

/**
 * Subscribes to status changes for a specific game.
 *
 * @param client Connected STOMP client.
 * @param gameId ID of the game to subscribe to.
 * @param onStatusChange Called whenever the backend publishes a new status.
 */
export function subscribeToGameStatus(
  client: Client,
  gameId: string,
  onStatusChange: (message: GameStatusMessage) => void,
): StompSubscription {
  return client.subscribe(`/topic/game/${gameId}/status`, (message) => {
    const statusMessage = JSON.parse(message.body) as GameStatusMessage;

    onStatusChange(statusMessage);
  });
}
