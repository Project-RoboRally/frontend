"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClassName, inputClassName } from "@/lib/styles";
import { saveUsername } from "@/lib/username";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Login</h1>
      <form
        className="w-full space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          saveUsername(username);
          router.push("/main-menu");
        }}
      >
        <div>
          <label className="mb-1 block" htmlFor="username">
            Username
          </label>
          <input
            className={inputClassName}
            id="username"
            onChange={(event) => setUsername(event.target.value)}
            required
            type="text"
            value={username}
          />
        </div>
        <div>
          <label className="mb-1 block" htmlFor="password">
            Password
          </label>
          <input
            className={inputClassName}
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </div>
        <button
          className={buttonClassName}
          type="submit"
        >
          Login
        </button>
      </form>
    </main>
  );
}