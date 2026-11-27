'use client';

/**
 * Plays a board snapshot one frame at a time and reports progress to the HUD.
 * Cancels scheduled frames when the snapshot changes or the board unmounts.
 *
 * @Author Matthias
 */
import { useEffect, useRef, useState } from 'react';
import type { LaserBeat } from '@/lib/lasers';
import { registerPlayback, type PlaybackFrame } from '@/lib/registerPlayback';
import type { Board, BoardRobot } from '@/types/board';

export function useRegisterPlayback(
  board: Board | null,
  lasers: LaserBeat[],
  onComplete?: (board: Board) => void,
  onStep?: (index: number | null, register?: number | null) => void,
) {
  const [robots, setRobots] = useState<BoardRobot[]>(board?.robots ?? []);
  const [frame, setFrame] = useState<PlaybackFrame | null>(null);
  const [index, setIndex] = useState(0);
  const lastPose = useRef(robots);

  const completed = useRef<Board | null>(null);

  useEffect(() => {
    if (!board) {
      const reset = window.requestAnimationFrame(() => {
        completed.current = null;
        setFrame(null);
        setRobots([]);
        lastPose.current = [];
        onStep?.(null);
      });
      return () => window.cancelAnimationFrame(reset);
    }
    if (board === completed.current) return;
    const snapshot = board;
    const frames = registerPlayback(board, lasers);
    const start = lastPose.current;
    let timer: number;
    function play(index: number) {
      const frame = frames[index] ?? null;
      setFrame(frame);
      setIndex(index);
      if (!frame) {
        completed.current = snapshot;
        lastPose.current = snapshot.robots;
        setRobots(lastPose.current);
        onStep?.(null);
        onComplete?.(snapshot);
        return;
      }
      const robots = snapshot.steps?.[frame.pose] ?? start;
      setRobots(robots);
      onStep?.(Math.max(0, frame.pose), frame.register);
      timer = window.setTimeout(() => play(index + 1), frame.duration);
    }
    const startFrame = window.requestAnimationFrame(() => play(0));
    return () => {
      window.cancelAnimationFrame(startFrame);
      window.clearTimeout(timer);
    };
  }, [board, lasers, onComplete, onStep]);

  return { robots, frame, index };
}
