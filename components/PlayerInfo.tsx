import type { Player } from "@/types/player";

export function PlayerInfo({ player }: { player: Player }) {
  return (
    <div>
      <p>Player: {player.username}</p>
      <p>Checkpoints: {player.robot.checkpointsCollected}</p>
      <p>Energy cubes: {player.robot.energycubesCollected}</p>
      <p>SPAM cards: {player.robot.damageCount}</p>
    </div>
  );
}