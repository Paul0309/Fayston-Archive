"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useI18n } from "@/components/LanguageProvider";

export default function AuthStatus() {
  const { data: session, status } = useSession();
  const { t } = useI18n();

  if (status === "loading") {
    return <div className="auth-nav"><span className="auth-nav-user">{t("nav.loading")}</span></div>;
  }

  if (!session?.user) {
    return (
      <div className="auth-nav">
        <Link href="/login" className="nav-link">{t("nav.login")}</Link>
        <Link href="/signup" className="nav-link">{t("nav.signup")}</Link>
      </div>
    );
  }

  return (
    <div className="auth-nav">
      <Link href="/me" className="nav-link">{t("nav.myPage")}</Link>
      <span className="auth-nav-user">
        {session.user.name ?? session.user.username ?? session.user.email}
      </span>
      <button
        type="button"
        className="auth-nav-button"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        {t("nav.logout")}
      </button>
    </div>
  );
}
