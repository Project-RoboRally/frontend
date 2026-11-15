'use client';

import { useMemo, useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { useUpgrade } from '@/lib/api/game';
import { DAMAGE_INSTRUCTIONS } from '@/lib/upgrades/programming';
import { labelForInstruction } from '@/lib/programCards';
import { secondaryButtonClassName } from '@/lib/styles';
import type { ProgrammingFlowProps } from '@/components/upgrades/flows/types';

/**
 * Defrag Gizmo: permanently discard one damage card from hand, draw 1.
 * Once per round - pick exactly one of SPAM / TROJAN_HORSE / WORM / VIRUS.
 * @author Elias
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
  const [busy, setBusy] = useState(false);

  const damageCards = useMemo(
    () =>
      hand
        .map((card, index) => ({ card, index }))
        .filter(({ card }) =>
          (DAMAGE_INSTRUCTIONS as readonly string[]).includes(card.instruction),
        ),
    [hand],
  );

  function reset() {
    setOpen(false);
    setSelectedIndex(null);
  }

  async function handleConfirm() {
    if (selectedIndex === null) {
      onError('Pick one damage card to discard.');
      return;
    }
    const instruction = hand[selectedIndex]?.instruction;
    if (instruction == null || !(DAMAGE_INSTRUCTIONS as readonly string[]).includes(instruction)) {
      onError('Pick one damage card to discard.');
      return;
    }
    setBusy(true);
    try {
      await useUpgrade(gameId, { upgrade, cards: [instruction] });
      reset();
      onDone();
    } catch (error) {
      onError(getErrorMessage(error, 'Could not use Defrag Gizmo.'));
    } finally {
      setBusy(false);
    }
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
      <div className="mb-2 flex flex-wrap gap-1">
        {damageCards.map(({ card, index }) => {
          const active = selectedIndex === index;
          return (
            <button
              key={`${card.instruction}-${index}`}
              type="button"
              disabled={disabled || busy}
              onClick={() => setSelectedIndex((current) => (current === index ? null : index))}
              className={`rounded border px-2 py-1 text-[10px] font-bold ${
                active
                  ? 'border-verdigris bg-verdigris-dark/40 text-bone'
                  : 'border-steel-dark bg-charcoal text-bone/80'
              }`}
            >
              {labelForInstruction(card.instruction)}
            </button>
          );
        })}
      </div>
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
