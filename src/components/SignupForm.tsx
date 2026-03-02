"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useI18n } from "@/components/LanguageProvider";
import {
  getGraduationYearOptions,
  normalizePhoneNumber,
} from "@/lib/studentProfile";

export default function SignupForm() {
  const { t } = useI18n();
  const graduationYears = getGraduationYearOptions(new Date(), 10);
  const [form, setForm] = useState({
    koreanName: "",
    englishName: "",
    username: "",
    email: "",
    phone: "",
    graduationYear: graduationYears[0] ?? "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      setLoading(false);
      return;
    }

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
      callbackUrl: "/me",
    });
  }

  return (
    <form onSubmit={onSubmit} className="auth-form mt-6">
      <div className="personal-form-grid">
        <label className="auth-field">
          <span>{t("auth.koreanName")}</span>
          <input
            value={form.koreanName}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                koreanName: event.target.value,
              }))
            }
            type="text"
            placeholder={t("auth.koreanNamePlaceholder")}
            className="archive-filter-input w-full"
          />
        </label>

        <label className="auth-field">
          <span>{t("auth.englishName")}</span>
          <input
            value={form.englishName}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                englishName: event.target.value,
              }))
            }
            type="text"
            placeholder={t("auth.englishNamePlaceholder")}
            className="archive-filter-input w-full"
          />
        </label>

        <label className="auth-field">
          <span>{t("auth.username")}</span>
          <input
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                username: event.target.value,
              }))
            }
            type="text"
            placeholder="username"
            className="archive-filter-input w-full"
          />
        </label>

        <label className="auth-field">
          <span>{t("auth.email")}</span>
          <input
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            type="email"
            placeholder="email@example.com"
            className="archive-filter-input w-full"
          />
        </label>

        <label className="auth-field">
          <span>{t("auth.phone")}</span>
          <input
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                phone: normalizePhoneNumber(event.target.value) ?? "",
              }))
            }
            type="tel"
            placeholder="+821012345678"
            className="archive-filter-input w-full"
          />
        </label>

        <label className="auth-field">
          <span>{t("auth.graduatingYear")}</span>
          <select
            value={form.graduationYear}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                graduationYear: event.target.value,
              }))
            }
            className="archive-filter-input w-full"
          >
            {graduationYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-field">
          <span>{t("auth.password")}</span>
          <input
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            className="archive-filter-input w-full"
          />
        </label>

        <label className="auth-field">
          <span>{t("auth.confirmPassword")}</span>
          <input
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            type="password"
            placeholder={t("auth.confirmPasswordPlaceholder")}
            className="archive-filter-input w-full"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? t("auth.creating") : t("auth.createAccount")}
      </button>

      {error ? <p className="auth-error">{error}</p> : null}
    </form>
  );
}
