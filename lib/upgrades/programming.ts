/**
 * Upgrades that can be used during the PROGRAMMING phase via POST /upgrade/use.
 * @author Elias
 */

import type { UpgradeType } from '@/types/playerGameState';

export type ProgrammingUseKind =
  | 'instant' // no card picker
  | 'hand-cards' // pick any hand cards (Cache Memory)
  | 'damage-card' // pick one damage card (Defrag Gizmo)
  | 'memory-swap'; // use then put 3 back

export type ProgrammingUpgradeSpec = {
  type: UpgradeType;
  kind: ProgrammingUseKind;
  /** How many hand cards the client must send (min). */
  minCards: number;
  /** How many hand cards the client must send (max). null = no max. */
  maxCards: number | null;
};

export const PROGRAMMING_UPGRADES: ProgrammingUpgradeSpec[] = [
  { type: 'RECHARGE', kind: 'instant', minCards: 0, maxCards: 0 },
  { type: 'RECOMPILE', kind: 'instant', minCards: 0, maxCards: 0 },
  { type: 'SPAM_BLOCKER', kind: 'instant', minCards: 0, maxCards: 0 },
  { type: 'MEMORY_SWAP', kind: 'memory-swap', minCards: 0, maxCards: 0 },
  { type: 'CACHE_MEMORY', kind: 'hand-cards', minCards: 1, maxCards: null },
  { type: 'DEFRAG_GIZMO', kind: 'damage-card', minCards: 1, maxCards: 1 },
];

export const DAMAGE_INSTRUCTIONS = ['SPAM', 'TROJAN_HORSE', 'WORM', 'VIRUS'] as const;

export function isDamageInstruction(instruction: string): boolean {
  return (DAMAGE_INSTRUCTIONS as readonly string[]).includes(instruction);
}

export function isProgrammingUpgrade(type: UpgradeType): boolean {
  return PROGRAMMING_UPGRADES.some((spec) => spec.type === type);
}
