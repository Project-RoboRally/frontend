import type { Player } from "@/types/player";

export function PlayerInfo({ player }: { player: Player }) {
  return (
    <div className="rounded-md border-2 border-steel-dark bg-charcoal p-3">

      <div className="mb-3 text-[10px] font-bold uppercase text.cobber-light">
        Robot Status
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-bone/60">
            Checkpoints
          </span>

          <span className="font-bold text-bone">
            {player.robot.checkpointsCollected}
          </span>
        </div>

        <div className="h-px bg-steel-dark" />

        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-bone/60">
            Damage
          </span>

          <span className={player.robot.damageCount > 0 ? "font-bold text-amber" : "font-bold test-bone"}>
            {player.robot.damageCount}  
          </span> 
        </div>
      </div>
    </div>
  );
}