'use client';

import { CardInfo } from '@/components/CardInfo';
import { ChoicePanel } from '@/components/ChoicePanel';
import { KickVotePanel } from '@/components/KickVotePanel';
import type { ProgrammingCard } from '@/types/cards';
import type { PendingChoice } from '@/types/playerGameState';
import type { KickVote } from '@/types/presence';

/**
 * Hand, kick vote and activation choice, layered over the board.
 *
 * @author Caroline, Katarina, Kerem, Elias
 */
export function GameOverlays({
  handOpen,
  availableHand,
  selectedCardId,
  drawPileSize,
  discardCount,
  onCloseHand,
  onSelectCard,
  vote,
  kickConfirm,
  username,
  finished,
  isVoting,
  onKickBallot,
  onKickCancel,
  onKickConfirm,
  choice,
  showingActivation,
  isChoosing,
  onChoose,
}: {
  handOpen: boolean;
  availableHand: ProgrammingCard[];
  selectedCardId: string | null;
  drawPileSize: number;
  discardCount: number;
  onCloseHand: () => void;
  onSelectCard: (cardId: string | null) => void;
  vote: KickVote | null;
  kickConfirm: string | null;
  username: string;
  finished: boolean;
  isVoting: boolean;
  onKickBallot: (yes: boolean) => void;
  onKickCancel: () => void;
  onKickConfirm: () => void;
  choice: PendingChoice | null;
  showingActivation: boolean;
  isChoosing: boolean;
  onChoose: (option: string) => void;
}) {
  return (
    <>
      {handOpen && (
        <>
          <div className="pointer-events-none fixed inset-0 z-40 bg-black/40" />
          <div className="pointer-events-auto fixed left-1/2 top-[40%] z-50 max-h-[min(48dvh,26rem)] w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border-2 border-steel-dark bg-black/90 p-4 shadow-2xl sm:p-6">
            <button
              type="button"
              aria-label="Close hand"
              onClick={onCloseHand}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border border-steel-dark bg-charcoal text-lg font-bold leading-none text-bone transition hover:border-cobber-light hover:text-cobber-light"
            >
              ×
            </button>
            <div className="mb-2 pr-10 text-xs font-semibold text-bone/70">
              Draw {drawPileSize} - Discard {discardCount}
              {selectedCardId ? (
                <span className="mt-1 block text-verdigris-light">
                  Card selected - click or drop on a register below.
                </span>
              ) : (
                <span className="mt-1 block">
                  Drag a card onto a register, or click then click a slot.
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {availableHand.map((card) => (
                <button
                  key={card.cardId}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', card.cardId);
                    event.dataTransfer.setData('text/card-id', card.cardId);
                    event.dataTransfer.effectAllowed = 'move';
                    onSelectCard(card.cardId);
                  }}
                  onClick={() => onSelectCard(selectedCardId === card.cardId ? null : card.cardId)}
                  className={`flex h-24 w-16 cursor-grab items-center justify-center rounded-md border-2 text-sm font-bold text-bone transition active:cursor-grabbing ${
                    selectedCardId === card.cardId
                      ? 'border-verdigris bg-verdigris-dark/40 ring-2 ring-verdigris'
                      : 'border-steel-dark bg-charcoal hover:border-cobber-light'
                  }`}
                >
                  <CardInfo card={card} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {vote || kickConfirm ? (
        <KickVotePanel
          disabled={isVoting || finished}
          onBallot={onKickBallot}
          onCancel={onKickCancel}
          onConfirm={onKickConfirm}
          target={vote?.target ?? kickConfirm ?? ''}
          username={username}
          vote={vote}
        />
      ) : null}

      {choice && !showingActivation ? (
        <ChoicePanel
          choice={choice}
          disabled={isChoosing || finished}
          onChoose={onChoose}
          username={username}
        />
      ) : null}
    </>
  );
}
