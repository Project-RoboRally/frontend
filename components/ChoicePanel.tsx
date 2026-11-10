import { CHOICE_QUESTIONS, isUpgrade, optionLabel } from '@/lib/choices';
import { UPGRADE_INFO } from '@/lib/upgrades';
import type { PendingChoice } from '@/types/playerGameState';

/**
 * Shows the decision activation is waiting on, in the same side panel as the
 * upgrade shop. The player who has to decide gets one button per option, and
 * everyone else sees who the game is waiting for. The backend only sends valid
 * options and checks the answer, so this panel needs no game rules.
 *
 * @author August
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
    <div className="rounded-md border-2 border-steel-dark bg-charcoal p-3 text-left">
      <div className="mb-2 text-[10px] font-bold uppercase text-cobber-light">Choice</div>

      <p className="mb-3 text-xs text-bone/80">
        {isChooser
          ? (CHOICE_QUESTIONS[choice.type] ?? 'Make a choice.')
          : `Waiting for ${choice.username} to choose.`}
      </p>

      {isChooser ? (
        <div className="flex flex-wrap gap-2">
          {choice.options.map((option) => (
            <div key={option} className="group relative">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChoose(option)}
                className="min-w-20 rounded-md border-2 border-steel-dark bg-iron px-2 py-2 text-xs font-bold text-bone transition hover:border-cobber-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                {optionLabel(choice.type, option)}
              </button>

              {/* Upgrade options show what the upgrade does, like in the shop */}
              {!disabled && isUpgrade(option) && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-md border border-cobber-light bg-charcoal p-3 text-xs font-normal text-bone shadow-xl group-hover:block group-focus-within:block">
                  <p>{UPGRADE_INFO[option].description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
