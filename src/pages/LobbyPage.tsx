import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMockGame } from "@/lib/mock-games";
import { buttonClassName, inputClassName } from "@/lib/styles";
import { getUsername } from "@/lib/username";

export default function LobbyPage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [username] = useState<string | null>(() => getUsername());
  const game = getMockGame(gameId ?? "");
  const isCreatedByUser = gameId === "new-game";
  const [gameName, setGameName] = useState(
    game?.name ?? (isCreatedByUser ? "New Game" : "Game"),
  );
  const initialPlayers = game?.players ?? ["Ada", "Bjarne", "Clara"];
  const [players, setPlayers] = useState<string[]>(() =>
    initialPlayers.includes(username ?? "")
      ? initialPlayers
      : [...initialPlayers, username ?? ""],
  );

  useEffect(() => {
    if (!username) {
      navigate("/login", { replace: true });
    }
  }, [navigate, username]);

  function removePlayer(playerToRemove: string) {
    setPlayers((currentPlayers) =>
      currentPlayers.filter((player) => player !== playerToRemove),
    );
  }

  if (!username) {
    return null;
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-3xl p-6 pt-20">
      <header className="mb-10 text-center">
        <button
          className={`${buttonClassName} absolute left-6 top-6`}
          onClick={() => navigate("/main-menu")}
          type="button"
        >
          Exit
        </button>
        <h1 className="text-3xl font-bold">Lobby</h1>
        <p className="absolute right-6 top-6">Logged in as: {username}</p>
      </header>

      <section className="flex flex-col items-center text-center">
        {isCreatedByUser ? (
          <input
            aria-label="Game name"
            className={`${inputClassName} mb-4 max-w-md text-center text-2xl font-semibold`}
            onChange={(event) => setGameName(event.target.value)}
            type="text"
            value={gameName}
          />
        ) : (
          <h2 className="mb-4 text-2xl font-semibold">{gameName}</h2>
        )}
        <h3 className="mb-2 text-lg font-semibold">Players</h3>
        <ul className="mb-8 grid h-48 w-full max-w-xl grid-cols-2 grid-rows-3 gap-2 border-2 border-white p-2 text-left">
          {players.map((player) => (
            <li
              className="flex min-w-0 items-center justify-between rounded border px-3 py-2"
              key={player}
            >
              <span className="truncate">{player}</span>
              {isCreatedByUser && player !== username && (
                <button
                  aria-label={`Kick ${player}`}
                  className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded border hover:bg-gray-100"
                  onClick={() => removePlayer(player)}
                  type="button"
                >
                  x
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center">
        <button
          className={buttonClassName}
          onClick={() => navigate("/game")}
          type="button"
        >
          Start
        </button>
      </div>
    </main>
  );
}
