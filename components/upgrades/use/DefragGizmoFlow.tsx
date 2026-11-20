'use client';

import { useMemo, useState } from 'react';
import { postUseUpgrade } from '@/lib/api/game';
import { isDamageInstruction } from '@/lib/upgrades/programming';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';
import { HandCardPicker, withIndices } from '@/components/upgrades/use/HandCardPicker';
import { useBusyAction } from '@/components/upgrades/use/useBusyAction';

/**
 * Defrag Gizmo: permanently discard one damage card from hand, draw 1.
 * Once per round - pick exactly one of SPAM / TROJAN_HORSE / WORM / VIRUS.
 * @author Elias, Sebastian
 */

export function DefragGizmoFlow({
  gameId,
  upgrade,
  hand,
  disabled,
  onDone,
  onError,
}: ProgrammingFlowProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { busy, run } = useBusyAction(onError);

  const damageCards = useMemo(
    () => withIndices(hand).filter(({ card }) => isDamageInstruction(card.instruction)),
    [hand],
  );

  function reset() {
    setOpen(false);
    setSelectedIndex(null);
  }

  async function handleConfirm() {
    const instruction = selectedIndex === null ? undefined : hand[selectedIndex]?.instruction;
    if (instruction === undefined || !isDamageInstruction(instruction)) {
      onError('Pick one damage card to discard.');
      return;
    }
    await run(async () => {
      await postUseUpgrade(gameId, { upgrade, cards: [instruction] });
      reset();
      onDone();
    }, 'Could not use Defrag Gizmo.');
  }

  if (!open) {
    return (
      <button
        type="button"
        className={`${secondaryButtonClassName} w-full text-xs`}
        disabled={disabled || damageCards.length === 0}
        onClick={() => setOpen(true)}
      >
        Use Defrag Gizmo
      </button>
    );
  }

  return (
    <div className="rounded border border-steel-dark bg-iron/40 p-2">
      <p className="mb-2 text-[10px] text-bone/80">
        Permanently discard one damage card from your hand (draw a replacement).
      </p>
      <HandCardPicker
        cards={damageCards}
        selected={selectedIndex === null ? [] : [selectedIndex]}
        disabled={disabled || busy}
        onToggle={(index) => setSelectedIndex((current) => (current === index ? null : index))}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className={`${secondaryButtonClassName} flex-1 text-xs`}
          disabled={disabled || busy || selectedIndex === null}
          onClick={() => void handleConfirm()}
        >
          Confirm
        </button>
        <button
          type="button"
          className={`${secondaryButtonClassName} flex-1 text-xs`}
          disabled={busy}
          onClick={reset}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
