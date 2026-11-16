'use client';

import { buttonClassName, secondaryButtonClassName } from '@/lib/styles';
import type { KickVote } from '@/types/presence';

/**
 * Confirm starting a kick, then show who has voted yes and who is still
 * needed. The same panel stays up for every online player until the vote ends.
 *
 * @author Elias
 */
export function KickVotePanel({
  target,
  vote,
  username,
  disabled,
  onConfirm,
  onCancel,
  onBallot,
}: {
  target: string;
  vote: KickVote | null;
  username: string;
  disabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onBallot: (yes: boolean) => void;
}) {
  const open = vote != null;
  const stillNeeded = open ? vote.needed.filter((name) => !vote.yes.includes(name)) : [];
  const canVote = open && vote.needed.includes(username) && !vote.yes.includes(username);

  return (
    <div
      className="pointer-events-none fixed inset-y-0 left-0 z-[70] flex items-center justify-center px-4 right-[min(270px,32vw)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kick-vote-title"
    >
      <div className="pointer-events-auto w-[min(92vw,28rem)] rounded-xl border-2 border-red-500 bg-black/92 p-5 shadow-2xl sm:p-6">
        <div
          id="kick-vote-title"
          className="mb-2 text-[10px] font-bold uppercase tracking-wide text-cobber-light"
        >
          Kick vote
        </div>

        {open ? (
          <>
            <p className="mb-3 text-sm text-bone/85">
              Kick {vote.target} out of the game? Every online player has to vote yes.
            </p>

            <VoterList heading="Voted yes" names={vote.yes} empty="No votes yet." />
            <VoterList
              heading="Still needed"
              names={stillNeeded}
              empty="Everyone who is online has voted yes."
            />

            {canVote ? (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  className={buttonClassName}
                  disabled={disabled}
                  onClick={() => onBallot(true)}
                >
                  Yes, kick
                </button>
                <button
                  type="button"
                  className={secondaryButtonClassName}
                  disabled={disabled}
                  onClick={() => onBallot(false)}
                >
                  No
                </button>
              </div>
            ) : (
              <p className="mt-3 text-center text-xs font-semibold text-bone/70">
                Waiting for the others to vote.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-bone/85">
              Start a vote to kick {target}? Their robot leaves the game if every online player
              votes yes.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                className={buttonClassName}
                disabled={disabled}
                onClick={onConfirm}
              >
                Start vote
              </button>
              <button
                type="button"
                className={secondaryButtonClassName}
                disabled={disabled}
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VoterList({ heading, names, empty }: { heading: string; names: string[]; empty: string }) {
  return (
    <div className="mb-2 rounded-md border border-steel-dark bg-charcoal/80 px-3 py-2 text-left">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-cobber-light">
        {heading}
      </div>
      {names.length === 0 ? (
        <p className="text-xs text-bone/60">{empty}</p>
      ) : (
        <ul className="text-sm font-semibold text-bone">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
