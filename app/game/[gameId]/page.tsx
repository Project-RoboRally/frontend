'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import GameSession from '@/components/game/GameSession';
import { buttonClassName } from '@/lib/styles';
import { getUsername } from '@/lib/username';

export default function GamePage() {
  const router = useRouter();
  const { gameId } = useParams<{ gameId: string }>();

  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedUsername = getUsername();

    setUsername(storedUsername);
    setMounted(true);

    if (!storedUsername) {
      router.replace('/login');
    }
  }, [router]);

  if (!mounted || !username || !gameId) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center p-6 text-center">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Game Board</h1>
      </header>

      <GameSession gameId={gameId} username={username} />

      <button
        className={`${buttonClassName} mt-6`}
        onClick={() => router.push('/main-menu')}
        type="button"
      >
        Back to Main Menu
      </button>
    </main>
  );
}
