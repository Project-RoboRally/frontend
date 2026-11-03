import type { BoardRegister } from '@/types/board';

/**
 * Which register is playing for this animation frame. Cards with no frames
 * (energy) still count when their firstStep matches the current frame.
 */
export function activePlayedRegister(
  registers: BoardRegister[] | undefined,
  stepIndex: number | null,
): number | null {
  if (registers == null || stepIndex == null) {
    return null;
  }

  const occupying = registers.find((register) =>
    register.cards.some(
      (card) =>
        card.stepCount > 0 &&
        card.firstStep <= stepIndex &&
        stepIndex < card.firstStep + card.stepCount,
    ),
  );
  if (occupying) {
    return occupying.register;
  }

  const energyOnly = registers.find((register) =>
    register.cards.some((card) => card.stepCount === 0 && card.firstStep === stepIndex),
  );
  return energyOnly?.register ?? null;
}
