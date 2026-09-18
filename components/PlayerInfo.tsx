import { Player } from '@/types/state';

export function PlayerInfo({player}: {player: Player}) {
  return (
    <div>
      <p>Checkpoints: {player.robot.checkpointsCollected} </p>
      <p>Energy cubes: {player.robot.energycubesCollected} </p>
      <p>SPAM cards: {player.robot.damageCount} </p>
    </div>
  )
}