import type { ReactNode } from "react";
import type { GameState } from "@/types/gameState";
import type { Player } from "@/types/player";

export default function HUD({
                              gameState,
                              player,
                              children,
                            }: {
  gameState: GameState;
  player: Player;
  children: ReactNode;
}) {
  return (
    <section className="grid grid-cols-[120px_auto_140px] gap-4 rounded-lg bg-sky-100 p-4">

      {/* Left HUD */}
      <aside className="flex flex-col justify-between">
        <div>
          <p className="font-bold">Robo Rally</p>
        </div>

        <div className="rounded border bg-green-100 p-3">
          Deck
        </div>
      </aside>

      {/* Center */}
      <div className="flex flex-col items-center gap-4">

        {/* Board */}
        {children}

        {/* Registers */}
        <div className="flex gap-2">
          {player.register.map((register) => (
            <div
              key={register.registerNumber}
              className="h-16 w-12 rounded border-2 border-slate-700 bg-green-100"
            >
              {register.registerRevealed
                ? register.registerNumber
                : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Right HUD */}
      <aside className="flex flex-col gap-2 text-left">
        <div className="rounded border bg-pink-100 p-2">
          <strong>{player.username}</strong>
        </div>

        <div className="rounded border bg-purple-100 p-2">
          Round: {gameState.round}
        </div>

        <div className="rounded border bg-purple-100 p-2">
          Phase: {gameState.phase}
        </div>

        <div className="mt-4">
          <p>Checkpoints: {player.robot.checkpointsCollected}</p>
          <p>Energy: {player.robot.energycubesCollected}</p>
          <p>Damage: {player.robot.damageCount}</p>
        </div>
      </aside>
    </section>
  );
}