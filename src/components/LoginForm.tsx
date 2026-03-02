"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useI18n } from "@/components/LanguageProvider";
import { normalizePhoneNumber } from "@/lib/studentProfile";

export default function LoginForm() {
  const { t } = useI18n();
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
      callbackUrl: "/me",
    });

    if (result?.error) {
      setError(t("auth.loginFailed"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="auth-form mt-6">
      <label className="auth-field">
        <span>{t("auth.identifier")}</span>
        <input
          value={identifier}
          onChange={(event) => {
            const value = event.target.value;
            setIdentifier(/^(\+?\d[\d\s().-]*)$/.test(value) ? (normalizePhoneNumber(value) ?? "") : value);
          }}
          placeholder={t("auth.identifierPlaceholder")}
          className="archive-filter-input w-full"
        />
      </label>

      <label className="auth-field">
        <span>{t("auth.password")}</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          className="archive-filter-input w-full"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? t("auth.signingIn") : t("auth.signIn")}
      </button>

      {error ? <p className="auth-error">{error}</p> : null}
    </form>
  );
}
