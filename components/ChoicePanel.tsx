'use client';

import type { FocusEvent, MouseEvent } from 'react';
import { FloatingTooltip } from '@/components/FloatingTooltip';
import { CHOICE_QUESTIONS, isUpgrade, optionLabel } from '@/lib/choices';
import { UPGRADE_INFO } from '@/lib/upgrades';
import type { PendingChoice } from '@/types/playerGameState';

/**
 * Popup for the decision activation is waiting on. Centered over the board so
 * register bars stay visible below. The player who has to decide gets one
 * button per option; everyone else sees who the game is waiting for.
 *
 * @author August, Elias
 */

export function ChoicePanel({
  choice,
  username,
  disabled,
  onChoose,
}: {
  choice: PendingChoice;
  username: string;
  disabled: boolean;
  onChoose: (option: string) => void;
}) {
  const isChooser = choice.username === username;

  return (
    <div
      className="pointer-events-none fixed inset-y-0 left-0 z-[70] flex items-center justify-center px-4 right-[min(270px,32vw)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="choice-panel-title"
    >
      <div className="pointer-events-auto w-[min(92vw,28rem)] rounded-xl border-2 border-steel-dark bg-black/92 p-5 shadow-2xl sm:p-6">
        <div
          id="choice-panel-title"
          className="mb-2 text-[10px] font-bold uppercase tracking-wide text-cobber-light"
        >
          Choice
        </div>

        <p className="mb-4 text-sm text-bone/85">
          {isChooser
            ? (CHOICE_QUESTIONS[choice.type] ?? 'Make a choice.')
            : `Waiting for ${choice.username} to choose.`}
        </p>

        {isChooser ? (
          <div className="flex flex-wrap justify-center gap-2">
            {choice.options.map((option) => {
              const upgrade = isUpgrade(option) ? UPGRADE_INFO[option] : null;
              const button = (tip?: {
                onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
                onMouseLeave: () => void;
                onFocus: (event: FocusEvent<HTMLElement>) => void;
                onBlur: () => void;
                'aria-describedby'?: string;
              }) => (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChoose(option)}
                  onMouseEnter={tip?.onMouseEnter}
                  onMouseLeave={tip?.onMouseLeave}
                  onFocus={tip?.onFocus}
                  onBlur={tip?.onBlur}
                  aria-describedby={tip?.['aria-describedby']}
                  className="min-w-24 rounded-md border-2 border-steel-dark bg-charcoal px-3 py-2.5 text-sm font-bold text-bone transition hover:border-cobber-light disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {optionLabel(choice.type, option)}
                </button>
              );

              if (!upgrade || disabled) {
                return <div key={option}>{button()}</div>;
              }

              return (
                <FloatingTooltip
                  key={option}
                  description={upgrade.description}
                  label={upgrade.label}
                >
                  {(tip) => button(tip)}
                </FloatingTooltip>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-xs font-semibold text-bone/50">Please wait…</p>
        )}
      </div>
    </div>
  );
}
