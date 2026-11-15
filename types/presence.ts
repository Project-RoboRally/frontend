/**
 * Which players in a game are still sending health pings. `blocking` is true
 * when the player is offline and the game is waiting for them.
 *
 * @author Elias
 */
export type PlayerPresence = {
  username: string;
  online: boolean;
  blocking: boolean;
};

export type Presence = {
  players: PlayerPresence[];
};
