"use client";

import { useI18n } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="lang-switcher" aria-label="Language switcher">
      <button
        type="button"
        onClick={() => void setLocale("ko")}
        className={locale === "ko" ? "lang-switcher-btn lang-switcher-btn-active" : "lang-switcher-btn"}
      >
        한
      </button>
      <button
        type="button"
        onClick={() => void setLocale("en")}
        className={locale === "en" ? "lang-switcher-btn lang-switcher-btn-active" : "lang-switcher-btn"}
      >
        EN
      </button>
    </div>
  );
}
