import type { ReactNode } from "react";
import type { GameState } from "@/types/gameState";
import type { Player } from "@/types/player";
import { useState } from "react";
import { CardInfo } from "@/components/CardInfo";
import { GameInfo } from "@/components/GameInfo";
import { PlayerInfo } from "@/components/PlayerInfo";
import { labelForInstruction, REGISTER_COUNT } from "@/lib/programCards";
import { buttonClassName } from "@/lib/styles";
import { ROBOT_COLORS, ROBOT_BG_COLORS } from "@/types/robot";

/**
 * CSS Tailwind code for the overall HUD of the gameboard scene
 *
 * @author Kerem, Matthias, Caroline, Katarina
 */

export default function HUD({
                              gameState,
                              player,
                              children,
                              locked,
                              canRun,
                              waiting,
                              error,
                              onRun,
                              onSwapRegisters,
                              onHandOpen,
                              placingCard,
                              onPlaceCard
                            }: {
  gameState: GameState;
  player: Player;
  children: ReactNode;
  locked: boolean;
  canRun: boolean;
  waiting: boolean;
  error: string | null;
  onRun: () => void;
  onSwapRegisters: (indexA: number, indexB: number) => void;
  onHandOpen: () => void;
  placingCard: boolean; //true when the hand is opened
  onPlaceCard: (index: number) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const registerClick = (index: number) => {
    // Hand
    if(placingCard) {
      onPlaceCard(index);
      return
    }
    
    // Register
    if (selectedIndex === null) { // If I haven't clicked on a register yet
      setSelectedIndex(index);
    } else if (selectedIndex === index) { // If I click on a register, that I already clicked on
      setSelectedIndex(null);
    } else {
      onSwapRegisters(selectedIndex, index); 
      setSelectedIndex(null);
    }
  };

  const robotModel = player.robot?.robotModel;
  const playerColorHex = robotModel ? ROBOT_COLORS[robotModel] : undefined;
  const backgroundColorHex = robotModel ? ROBOT_BG_COLORS[robotModel] : undefined;
  return (
    <section className="min-h-0 flex-1 w-full rounded-xl border-2 border-cobber-dark bg-iron p-4 shadow-2xl shadow-black/50">
      <div className="h-full min-h-0 grid grid-cols-[minmax(0,1fr)_220px] gap-4">

        {/* --- Left side (top/bottom) --- */}
        <div className="flex min-w-0 min-h-0 flex-col gap-4">

          {/* Top */}
          <div className="flex flex-1 min-h-0 flex-col gap-2 items-center justify-center w-full mb-2">
            
            {/* Simple row of boxes for other players' cards */}
            <div className="flex flex-wrap gap-4 justify-center w-full">
              {gameState.players
                .filter((p) => p.username !== player.username)
                .map((p) => {
                  const robotModel = p.robot?.robotModel || "orangeRobot";
                  const playerColorHex = ROBOT_COLORS[robotModel] || "#334155";

                  return (
                    <div
                      key={p.username}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border-2 shadow"
                      style={{
                        borderColor: playerColorHex,
                        backgroundColor: ROBOT_BG_COLORS[robotModel],
                      }}
                    >
                      {/* Player Name */}
                      <span className="text-xs font-bold text-bone">{p.username}</span>

                      {/* 5 Card Boxes */}
                      <div className="flex gap-1">
                        {Array.from({ length: REGISTER_COUNT }).map((_, index) => {
                          const registerCard = p.register?.[index];

                          // Extract the instruction string whether Register is an object or string
                          const instruction =
                            typeof registerCard === "string"
                              ? registerCard
                              : ((registerCard as any)?.instruction ??
                                (registerCard as any)?.card ??
                                null);

                          return (
                            <div
                              key={index}
                              className="w-6 h-8 bg-iron border border-steel-dark rounded flex items-center justify-center text-[10px] text-bone font-bold"
                            >
                              {instruction ? labelForInstruction(instruction) : ""}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* The Game Board */}
            <div className="flex flex-1 min-h-0 items-center justify-center w-full">{children}</div>
          </div>

          {/* Bottom */}
          <div
            className="flex flex-col gap-2 rounded-md border-2 bg-charcoal/40 p-3"
            style={{ borderColor: playerColorHex, backgroundColor: backgroundColorHex }}
          >
            <div className="flex items-center gap-8">
              {/* Programming deck */}
              <button
                type="button"
                disabled={locked}
                onClick={onHandOpen}
                className="group shrink-0 rounded-md border-2 border-cobber-dark bg-charcoal p-3 text-center shadow-lg shadow-black/30 transition hover:border-cobber-light hover:bg-cobber-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-[10px] font-bold uppercase text-cobber-light">
                  Programming
                </div>

                <div className="mt-1 font-bold uppercase tracking-wider text-bone">Deck</div>
              </button>

              {/* Deck and register space */}
              <div className="h-12 w-px shrink-0 bg-steel-dark" />

              {/* Register */}
              <div className="relative z-50 flex items-center gap-1.5" aria-label="Registers">
                {player.register.map((register, index) => (
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => registerClick(index)}
                    key={register.registerNumber}
                    className={`flex h-16 w-12 cursor-pointer items-center justify-center rounded-md border-2 bg-charcoal text-sm font-bold text-bone shadow-md shadow-black/30 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selectedIndex === index
                        ? "border-verdigris bg-verdigris-dark/40 ring-2 ring-verdigris"
                        : "border-steel-dark bg-charcoal hover:border-cobber-light"
                    }`}
                  >
                    {register.registerCard === null ? null : (
                      <CardInfo card={register.registerCard} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <p className="text-left text-xs font-semibold text-amber" role="alert">
                {error}
              </p>
            ) : waiting ? (
              <p className="text-left text-xs font-bold text-bone" role="status">
                Waiting for other players.
              </p>
            ) : null}
          </div>
        </div>

              
        {/* --- Right side ---*/}
        <aside className="flex flex-col gap-3">
          {/* Player */}
          <div className="rounded-md border-2 border-cobber-dark bg-charcoal p-3">
            <div className="mb-1 text-[10px] font-bold uppercase text-cobber-light">Player</div>

            <div className="truncate font-bold text-bone">{player.username}</div>
          </div>

          {/* Game and player information */}
          <GameInfo gameState={gameState} />
          <PlayerInfo player={player} />

          {/* Run */}
          <button
            type="button"
            className={`${buttonClassName} w-full disabled:cursor-not-allowed disabled:opacity-50`}
            disabled={!canRun}
            onClick={onRun}
          >
            Run
          </button>
        </aside>
      </div>
    </section>
  );
}
