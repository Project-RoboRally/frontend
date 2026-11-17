import type { ReactNode } from 'react';
import type { GameState } from '@/types/gameState';
import type { Player } from '@/types/player';
import { useState } from 'react';
import { CardInfo } from '@/components/CardInfo';
import { GameInfo } from '@/components/GameInfo';
import { PlayerInfo } from '@/components/PlayerInfo';
import { REGISTER_COUNT } from '@/lib/programCards';
import { buttonClassName } from '@/lib/styles';
import { ROBOT_COLORS, ROBOT_BG_COLORS } from '@/types/robot';
import { ProgrammingTimer } from '@/components/ProgrammingTimer';

/**
 * CSS Tailwind code for the overall HUD of the gameboard scene
 *
 * @author Kerem, Matthias, Caroline, Katarina, Elias
 */

function OnlineDot({ online }: { online?: boolean }) {
  const isOnline = online ?? true;
  return (
    <span
      aria-label={isOnline ? 'Online' : 'Offline'}
      title={isOnline ? 'Online' : 'Offline'}
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      }`}
      role="img"
    />
  );
}

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
  onPlaceCard,
  drawPileSize,
  discardCount,
  activeRegisterIndex,
  extraPanel,
  offlineNotice,
  onKickVote,
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
  onPlaceCard: (index: number, cardId?: string) => void;
  drawPileSize: number;
  discardCount: number;
  activeRegisterIndex: number | null;
  extraPanel?: ReactNode;
  offlineNotice?: string | null;
  onKickVote?: (username: string) => void;
}) {
  // Keep deck + registers above the hand backdrop so cards can be placed.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const registerClick = (index: number) => {
    // Hand
    if (placingCard) {
      onPlaceCard(index);
      return;
    }

    // Register
    if (selectedIndex === null) {
      // If I haven't clicked on a register yet
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      // If I click on a register, that I already clicked on
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
    <section
      className={`flex h-full min-h-0 w-full flex-col rounded-xl border-2 border-cobber-dark bg-iron p-2 shadow-2xl shadow-black/50 sm:p-3 ${
        placingCard ? 'overflow-visible' : 'overflow-hidden'
      }`}
    >
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_240px] gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_270px]">
        {/* --- Left side (board + registers) --- */}
        <div className="flex min-h-0 min-w-0 flex-col gap-2">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center gap-1">
            {offlineNotice ? (
              <p
                className="w-full shrink-0 rounded-md border-2 border-red-500 bg-red-950/60 px-2 py-1 text-xs font-bold text-bone"
                role="alert"
              >
                {offlineNotice}
              </p>
            ) : null}

            {/* Other players' registers */}
            <div className="flex w-full shrink-0 flex-wrap justify-center gap-2">
              {gameState.players
                .filter((p) => p.username !== player.username)
                .map((p) => {
                  const otherRobotModel = p.robot?.robotModel || 'orangeRobot';
                  const otherColorHex = ROBOT_COLORS[otherRobotModel] || '#334155';

                  return (
                    <div
                      key={p.username}
                      className="flex items-center gap-2 rounded-lg border-2 px-2 py-1 shadow"
                      style={{
                        borderColor: otherColorHex,
                        backgroundColor: ROBOT_BG_COLORS[otherRobotModel],
                      }}
                    >
                      {p.online === false && onKickVote ? (
                        <button
                          type="button"
                          title={`Start a vote to kick ${p.username}`}
                          onClick={() => onKickVote(p.username)}
                          className="flex items-center gap-1 text-[10px] font-bold text-bone underline decoration-red-400 underline-offset-2 sm:text-xs"
                        >
                          <OnlineDot online={p.online} />
                          {p.username}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-bone sm:text-xs">
                          <OnlineDot online={p.online} />
                          {p.username}
                        </span>
                      )}

                      {p.programSubmitted ? (
                        <span className="text-[9px] font-bold uppercase text-verdigris">Ready</span>
                      ) : null}

                      <div className="flex gap-0.5">
                        {Array.from({ length: REGISTER_COUNT }).map((_, index) => {
                          const registerCard = p.register?.[index]?.registerCard ?? null;

                          return (
                            <div
                              key={index}
                              className={`flex h-6 w-5 items-center justify-center rounded border border-steel-dark bg-iron text-[7px] font-bold leading-tight text-bone ${
                                activeRegisterIndex === index ? 'ring-1 ring-verdigris' : ''
                              }`}
                            >
                              {registerCard ? <CardInfo card={registerCard} /> : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Board fills leftover height without forcing page scroll */}
            <div className="relative z-0 min-h-0 w-full flex-1">
              <div className="absolute inset-0 flex items-center justify-center">{children}</div>
            </div>
          </div>

          {/* Programming bar - above hand modal while placing so drag-drop hits */}
          <div
            className={`flex z-1 shrink-0 flex-col gap-1 rounded-md border-2 p-2 ${
              placingCard ? 'relative z-[60]' : ''
            }`}
            style={{ borderColor: playerColorHex, backgroundColor: backgroundColorHex }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                disabled={locked && !placingCard}
                onClick={onHandOpen}
                className="group shrink-0 rounded-md border-2 border-cobber-dark bg-charcoal px-2 py-1.5 text-center shadow-lg shadow-black/30 transition hover:border-cobber-light hover:bg-cobber-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-[9px] font-bold uppercase text-cobber-light">Deck</div>
                <div className="text-[9px] font-semibold text-bone/70">
                  {drawPileSize} - {discardCount}
                </div>
              </button>

              <div className="h-10 w-px shrink-0 bg-steel-dark" />

              <div className="relative flex items-center gap-1" aria-label="Registers">
                {player.register.map((register, index) => (
                  <button
                    type="button"
                    disabled={locked && !placingCard}
                    onClick={() => registerClick(index)}
                    onDragOver={(event) => {
                      if (locked && !placingCard) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => {
                      if (locked && !placingCard) return;
                      event.preventDefault();
                      const cardId =
                        event.dataTransfer.getData('text/card-id') ||
                        event.dataTransfer.getData('text/plain');
                      if (!cardId) return;
                      onPlaceCard(index, cardId);
                      setSelectedIndex(null);
                    }}
                    key={register.registerNumber}
                    className={`flex h-12 w-9 cursor-pointer items-center justify-center rounded-md border-2 text-xs font-bold text-bone shadow-md shadow-black/30 transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-10 ${
                      selectedIndex === index || activeRegisterIndex === index
                        ? 'border-verdigris bg-verdigris-dark/40 ring-2 ring-verdigris'
                        : 'border-steel-dark bg-charcoal hover:border-cobber-light'
                    }`}
                  >
                    {register.registerCard === null ? null : (
                      <CardInfo card={register.registerCard} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2">
              <div className="min-w-0">
                {error ? (
                  <p
                    className="truncate text-left text-[11px] font-semibold text-amber"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : waiting ? (
                  <p className="truncate text-left text-[11px] font-bold text-bone" role="status">
                    Waiting for other players.
                  </p>
                ) : null}
              </div>

              <ProgrammingTimer programmingEndsAt={gameState.programmingEndsAt} />
            </div>
          </div>
        </div>

        {/* --- Right side ---*/}
        <aside className="flex min-h-0 w-full flex-col gap-2 overflow-y-auto pr-0.5">
          <div className="shrink-0 rounded-md border-2 border-cobber-dark bg-charcoal p-2">
            <div className="mb-0.5 text-[10px] font-bold uppercase text-cobber-light">Player</div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-bone">
              <OnlineDot online={player.online} />
              <span className="truncate">{player.username}</span>
            </div>
          </div>

          <div className="shrink-0">
            <GameInfo gameState={gameState} />
          </div>
          <div className="shrink-0">
            <PlayerInfo player={player} />
          </div>

          <div className="min-h-0 flex-1">{extraPanel}</div>

          <button
            type="button"
            className={`${buttonClassName} w-full shrink-0 disabled:cursor-not-allowed disabled:opacity-50`}
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
