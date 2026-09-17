'use client';

import { useRouter } from 'next/navigation';
import { buttonClassName } from '@/lib/styles';
import { getUsername } from '@/lib/username';
import { useEffect, useState } from 'react';
import { Robot, RobotPosition, ROBOTCOLORS } from '@/types/state';

const BOARD_SIZE = 12; // Boardsize 12x12

export default function GamePage() {
  const router = useRouter();
  const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );

  const [robots, setRobots] = useState<Robot[]>([]);

  useEffect(() => {
    if (!username) {
      router.replace('/login');
    }
  }, [router, username]);

  if (!username) {
    return null;
  }

  const handleTileClick = (index: number) => {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center p-6 text-center">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>
      <p className="absolute right-6 top-6">Logged in as: {username}</p>
      <button className={buttonClassName} onClick={() => router.push('/main-menu')} type="button">
        Back to Main Menu
      </button>

      {/* Gameboard Grid */}
      <section className="mt-6 border-2 border-slate-700 bg-slate-900 p-2 rounded-lg shadow-xl">
        <div
          className="grid bg-slate-800 p-1"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {board.map((cell, index) => (
            <Tile
              key={index}
              index={index}
              value={cell}
              onClick={() => handleTileClick(index)}
              robots={robots}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function Tile({ index, value, onClick, robots }: { index: number; value: any; onClick: () => void; robots: Robot[] }) {
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;

  const robotExist = robots.find((robot) => (row === robot.position.row) && (col === robot.position.column));

  return (
    <button
      onClick={onClick}
      className="h-10 w-10 sm:h-12 sm:w-12 border border-slate-700 bg-slate-950 hover:bg-pink-800 transition-colors flex items-center justify-center text-xs font-mono text-slate-400"
    ></button>
  );
}
