'use client';

import { useEffect, useState } from 'react';

import GameBoard from '@/components/game/GameBoard';
import GameHUD from '@/components/game/GameHUD';

import { createStompClient } from '@/lib/websocket/client';
import { subscribeToGameStatus } from '@/lib/websocket/gameSocket';

import type { Game } from '@/types/game';
import type { Player } from '@/types/player';

type GameSessionProps = {
  gameId: string;
  username: string;
};

/**
 * Holds the current game and player state for the gameboard scene.
 *
 * @author Matthias
 */
export default function GameSession({ gameId, username }: GameSessionProps) {
  const player: Player = {
    username,
    robot: {
      robotModel: 'twonky',
      position: {
        row: 0,
        column: 0,
        direction: 'north',
      },
      checkpointsCollected: 0,
      energycubesCollected: 0,
      outOfGame: false,
      damageCount: 0,
    },
    register: [],
    priorityOrder: false,
  };

  const [game, setGame] = useState<Game>({
    id: gameId,
    name: 'Test Game',
    players: [player],
    status: 'IN_PROGRESS',
    currentRound: {
      currentPhase: 'PROGRAMMING',
      currentRegisterNumber: 1,
      programmingTimer: {
        durationSeconds: 30,
        startedAt: new Date().toISOString(),
      },
    },
  });

  useEffect(() => {
    const client = createStompClient();

    client.onConnect = () => {
      subscribeToGameStatus(client, gameId, (message) => {
        setGame((currentGame) => ({
          ...currentGame,
          status: message.status,
        }));
      });
    };

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [gameId]);

  return (
    <GameHUD game={game} player={player}>
      <GameBoard />
    </GameHUD>
  );
}
