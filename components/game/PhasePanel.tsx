'use client';

import { ProgrammingUpgradeBar } from '@/components/upgrades/ProgrammingUpgradeBar';
import { UpgradeShop } from '@/components/UpgradeShop';
import type { PlayerGameState, UpgradeType } from '@/types/playerGameState';

/**
 * Sidebar extras for the current phase: the upgrade shop, or programming
 * upgrades while filling registers.
 *
 * @author Caroline, Katarina, Kerem, Elias
 */
export function PhasePanel({
  phase,
  showingActivation,
  youSubmitted,
  hasPlayedCards,
  finished,
  isUpgrading,
  isSubmitting,
  energy,
  username,
  gameId,
  playerState,
  owned,
  onBuy,
  onSkip,
  onError,
}: {
  phase: string | undefined;
  showingActivation: boolean;
  youSubmitted: boolean;
  hasPlayedCards: boolean;
  finished: boolean;
  isUpgrading: boolean;
  isSubmitting: boolean;
  energy: number;
  username: string;
  gameId: string | null;
  playerState: PlayerGameState | null;
  owned: UpgradeType[];
  onBuy: (upgrade: UpgradeType, replace?: UpgradeType | null) => void;
  onSkip: () => void;
  onError: (message: string | null) => void;
}) {
  if (phase === 'UPGRADE' && !showingActivation) {
    return (
      <UpgradeShop
        currentBuyer={playerState?.currentBuyer ?? null}
        disabled={isUpgrading || finished}
        energy={energy}
        onBuy={onBuy}
        onSkip={onSkip}
        owned={owned}
        shop={playerState?.upgradeShop ?? []}
        username={username}
      />
    );
  }

  if (phase === 'PROGRAMMING' && !youSubmitted && !showingActivation && !hasPlayedCards && gameId) {
    return (
      <ProgrammingUpgradeBar
        cardsToPutBack={playerState?.playerMat?.cardsToPutBack ?? 0}
        disabled={finished || isSubmitting}
        gameId={gameId}
        hand={playerState?.playerMat?.hand ?? []}
        onError={onError}
        owned={owned}
        usedThisRound={playerState?.playerMat?.usedThisRound ?? []}
      />
    );
  }

  return null;
}
