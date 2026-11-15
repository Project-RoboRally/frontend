import type { ReactNode } from 'react';
import type { Card, UpgradeType } from '@/types/playerGameState';

/**
 * Contract each per-upgrade frontend flow file must export.
 * Agents own one file under flows/ and must not edit shared shells.
 * @author Elias
 */

export type ProgrammingFlowProps = {
  gameId: string;
  upgrade: UpgradeType;
  hand: Card[];
  disabled: boolean;
  onDone: () => void;
  onError: (message: string) => void;
};

export type UpgradeFlowModule = {
  type: UpgradeType;
  /** Shown in the programming upgrade bar when the player owns this upgrade. */
  ProgrammingButton?: (props: ProgrammingFlowProps) => ReactNode;
};
