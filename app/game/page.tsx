"use client";

import { useRouter } from "next/navigation";
import { buttonClassName } from "@/lib/styles";

export default function GamePage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-3 text-3xl font-bold">Game</h1>
      <p className="mb-6">Actual game to be added here.</p>
      <button
        className={buttonClassName}
        onClick={() => router.push("/main-menu")}
        type="button"
      >
        Back to Main Menu
      </button>
    </main>
  );
}