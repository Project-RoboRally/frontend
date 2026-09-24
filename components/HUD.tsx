import type { ReactNode } from "react";
import type { GameState } from "@/types/gameState";
import type { Player } from "@/types/player";
import { GameInfo } from "@/components/GameInfo";
import { PlayerInfo } from "@/components/PlayerInfo";
import { buttonClassName } from "@/lib/styles";

export default function HUD({
                              gameState,
                              player,
                              children,
                              onRun,
                            }: {
  gameState: GameState;
  player: Player;
  children: ReactNode;
  onRun?: () => void; // Does nothing rn. Delete 'q' when implemented
}) {
  return (
    <section className="w-full rounded-xl border-2 border-cobber-dark bg-iron p-4 shadow-2xl shadow-black/50">
      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4">

        {/* --- Left side (top/bottom) --- */}
        <div className="flex min-w-0 flex-col gap-4">

          {/* Top */}
          <div className="flex flex-1 items-center justify-center">
            {children}
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-8 rounded-md border-2 border-steel-dark bg-charcoal/40 p-3">

            {/* Programming deck */}
            <button type="button" className="group shrink-0 rounded-md border-2 border-cobber-dark bg-charcoal p-3 text-center shadow-lg shadow-black/30 transition hover:border-cobber-light hover:bg-cobber-dark">
              <div className="text-[10px] font-bold uppercase text-cobber-light">
                Programming
              </div>

              <div className="mt-1 font-bold uppercase tracking-wider text-bone">
                Deck
              </div>
            </button>

            {/* Deck and register space */}
            <div className="h-12 w-px shrink-0 bg-steel-dark" />

            {/* Register */}
            <div className="flex items-center gap-1.5">
              {player.register.map((register) => (
                <div key={register.registerNumber} 
                className="flex h-16 w-12 items-center justify-center rounded-md border-2 border-steel-dark bg-charcoal text-sm font-bold text-bone shadow-md shadow-black/30">
                  {register.registerRevealed ? register.registerNumber : "?"}</div>))}
            </div>
          </div>
        </div>

              
        {/* --- Right side ---*/}
        <aside className="flex flex-col gap-3">
        {/* Player */}
          <div className="rounded-md border-2 border-cobber-dark bg-charcoal p-3">
            <div className="mb-1 text-[10px] font-bold uppercase text-cobber-light">
              Player
            </div>

            <div className="truncate font-bold text-bone">
              {player.username}
            </div>
          </div>

          {/* Game and player information */}
          <GameInfo gameState={gameState} />
          <PlayerInfo player={player} />
          
          {/* Run */}
          <button type="button" className={`${buttonClassName} w-full`} onClick={onRun}>
            Run
          </button>
        </aside>
      </div>
    </section>
  );
}