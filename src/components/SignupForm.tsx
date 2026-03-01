"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function SignupForm() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Sign up failed" }))) as {
        error?: string;
      };
      setError(data.error ?? "Sign up failed");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      identifier: form.email,
      password: form.password,
      redirect: true,
      callbackUrl: "/admin",
    });
  }

  return (
    <form onSubmit={onSubmit} className="auth-form mt-6">
      {[
        ["name", "Name", "Your full name", "text"],
        ["username", "Username", "username", "text"],
        ["email", "Email", "email@example.com", "email"],
        ["phone", "Phone", "+82...", "tel"],
        ["password", "Password", "At least 8 characters", "password"],
      ].map(([key, label, placeholder, type]) => (
        <label key={key} className="auth-field">
          <span>{label}</span>
          <input
            value={form[key as keyof typeof form]}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                [key]: event.target.value,
              }))
            }
            type={type}
            placeholder={placeholder}
            className="archive-filter-input w-full"
          />
        </label>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      {error ? <p className="auth-error">{error}</p> : null}
    </form>
  );
}
