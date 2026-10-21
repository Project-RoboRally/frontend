import type { ReactNode } from 'react';
import type { GameState } from '@/types/gameState';
import type { Player } from '@/types/player';
import { GameInfo } from '@/components/GameInfo';
import { PlayerInfo } from '@/components/PlayerInfo';
import { labelForInstruction, PROGRAM_CARDS, REGISTER_COUNT } from '@/lib/programCards';
import { buttonClassName } from '@/lib/styles';
import { ROBOTCOLORS } from '@/types/robot';

/**
 * CSS Tailwind code for the overall HUD of the gameboard scene
 *
 * @author Kerem, Matthias, Caroline, Katarina
 */

const squareClassName =
  'flex h-16 w-16 shrink-0 items-center justify-center rounded-md border-2 bg-charcoal px-1 text-center text-[10px] font-bold leading-tight text-bone transition-colors hover:border-cobber-light disabled:cursor-not-allowed disabled:opacity-50';

export default function HUD({
  gameState,
  player,
  children,
  registers,
  selectedInstruction,
  locked,
  canRun,
  waiting,
  error,
  onSelectCard,
  onRegisterClick,
  onRun,
}: {
  gameState: GameState;
  player: Player;
  children: ReactNode;
  registers: readonly (string | null)[];
  selectedInstruction: string | null;
  locked: boolean;
  canRun: boolean;
  waiting: boolean;
  error: string | null;
  onSelectCard: (instruction: string) => void;
  onRegisterClick: (index: number) => void;
  onRun: () => void;
}) {
  const slots = Array.from({ length: REGISTER_COUNT }, (_, index) => registers[index] ?? null);

  const robotModel = player.robot?.robotModel;
  const playerColorHex = robotModel ? ROBOTCOLORS[robotModel] : undefined;

  return (
    <section className="w-full rounded-xl border-2 border-cobber-dark bg-iron p-4 shadow-2xl shadow-black/50">
      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4">
        {/* --- Left side (top/bottom) --- */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* Top */}
          <div className="flex flex-1 items-center justify-center">{children}</div>

          {/* Bottom */}
          <div className="flex flex-col gap-2 rounded-md border-2 bg-charcoal/40 p-3"
          style={{borderColor: playerColorHex}}>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-1.5" aria-label="Programming cards">
                {PROGRAM_CARDS.map((card) => {
                  const selected = card.instruction === selectedInstruction;
                  return (
                    <button
                      key={card.instruction}
                      type="button"
                      aria-pressed={selected}
                      className={`${squareClassName} ${
                        selected ? 'border-cobber-light' : 'border-steel-dark'
                      }`}
                      disabled={locked}
                      onClick={() => onSelectCard(card.instruction)}
                    >
                      {card.label}
                    </button>
                  );
                })}
              </div>

              <div className="h-12 w-px shrink-0 bg-steel-dark" />

              <div className="flex items-center gap-1.5" aria-label="Registers">
                {slots.map((instruction, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={
                      instruction
                        ? `Register ${index + 1}: ${labelForInstruction(instruction)}`
                        : `Register ${index + 1}`
                    }
                    className={`${squareClassName} border-steel-dark`}
                    disabled={locked}
                    onClick={() => onRegisterClick(index)}
                  >
                    {instruction ? labelForInstruction(instruction) : index + 1}
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
