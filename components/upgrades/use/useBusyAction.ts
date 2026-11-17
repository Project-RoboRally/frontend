import { useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';

/**
 * Tracks whether an upgrade request is in flight and reports failures through onError.
 *
 * @author Elias
 */
export function useBusyAction(onError: (message: string) => void) {
  const [busy, setBusy] = useState(false);

  async function run(task: () => Promise<void>, fallbackMessage: string) {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      onError(getErrorMessage(error, fallbackMessage));
    } finally {
      setBusy(false);
    }
  }

  return { busy, run };
}
