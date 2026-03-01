"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: true,
      callbackUrl: "/admin",
    });

    if (result?.error) {
      setError("Login failed.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form mt-6">
      <label className="auth-field">
        <span>Identifier</span>
        <input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="email / phone / username"
          className="archive-filter-input w-full"
        />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="Password"
          className="archive-filter-input w-full"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {error ? <p className="auth-error">{error}</p> : null}
    </form>
  );
}
