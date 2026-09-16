'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockGames } from '@/lib/mock-games';
import { buttonClassName, inputClassName } from '@/lib/styles';
import { getUsername, removeUsername } from '@/lib/username';

export default function MainMenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [username] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getUsername(),
  );

  useEffect(() => {
    if (!username) {
      router.replace('/login');
    }
  }, [router, username]);

  function handleSignOut() {
    removeUsername();
    router.push('/login');
  }

  const filteredGames = mockGames.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!username) {
    return null;
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-4xl p-6 pt-20">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Main Menu</h1>
      </header>
      <p className="absolute right-6 top-6">Logged in as: {username}</p>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="flex flex-col items-center gap-4">
          <button
            className={buttonClassName}
            onClick={() => router.push('/lobby/new-game')}
            type="button"
          >
            Create Game
          </button>

          <button className={buttonClassName} onClick={handleSignOut} type="button">
            Sign Out
          </button>
        </section>

        <section className="border-2 border-white p-4">
          <input
            aria-label="Search available games"
            className={inputClassName}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search available games"
            type="search"
            value={searchTerm}
          />
          <ul className="mt-3 h-48 space-y-2 overflow-y-scroll pr-2">
            {filteredGames.map((game) => (
              <li key={game.id}>
                <button
                  className={`${buttonClassName} w-full px-4 py-3 text-left`}
                  onClick={() => router.push(`/lobby/${game.id}`)}
                  type="button"
                >
                  {game.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
