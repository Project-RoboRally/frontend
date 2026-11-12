import React, { useState, useEffect } from 'react';

/**
 * A countdown timer that displays the remaining time for the programming phase
 *
 * @author Caroline
 */

export function ProgrammingTimer({ programmingEndsAt }: { programmingEndsAt: number | null }) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!programmingEndsAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((programmingEndsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };

    if (calculateTimeLeft() <= 0) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [programmingEndsAt]);

  if (timeLeft === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-bone">
      <span className="uppercase tracking-wider text-bone">Time left:</span>
      <span className="rounded bg-charcoal px-2 py-0.5 text-bone">{timeLeft}s</span>
    </div>
  );
}
