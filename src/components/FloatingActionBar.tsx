"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AICounselorInner } from "@/components/AICounselor";
import { useI18n } from "@/components/LanguageProvider";
import { archiveDataset, type ArchiveSection } from "@/lib/archiveData";

const archiveSections = Object.keys(archiveDataset) as ArchiveSection[];

export default function FloatingActionBar() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const isArchive = pathname === "/archive";
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [hideNearFooter, setHideNearFooter] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [activeSection, setActiveSection] = useState<ArchiveSection | null>(null);
  const archiveSectionFromPath = useMemo(() => {
    if (!pathname.startsWith("/archive/")) return null;
    const section = pathname.split("/")[2];
    if (!section) return null;
    return archiveSections.includes(section as ArchiveSection) ? (section as ArchiveSection) : null;
  }, [pathname]);

  const assistantConfig = useMemo(() => {
    if (pathname === "/archive") {
      return {
        enabled: true,
        context: "archive" as const,
        title: t("floating.aiArchiveTitle"),
        description: t("floating.aiArchiveDescription"),
        presetPrompts: [
          t("floating.aiArchivePrompt1"),
          t("floating.aiArchivePrompt2"),
          t("floating.aiArchivePrompt3"),
        ],
      };
    }

    if (pathname === "/links") {
      return {
        enabled: true,
        context: "links" as const,
        title: t("floating.aiLinksTitle"),
        description: t("floating.aiLinksDescription"),
        presetPrompts: [
          t("floating.aiLinksPrompt1"),
          t("floating.aiLinksPrompt2"),
          t("floating.aiLinksPrompt3"),
        ],
      };
    }

    if (pathname === "/projects") {
      return {
        enabled: true,
        context: "projects" as const,
        title: t("floating.aiProjectsTitle"),
        description: t("floating.aiProjectsDescription"),
        presetPrompts: [
          t("floating.aiProjectsPrompt1"),
          t("floating.aiProjectsPrompt2"),
          t("floating.aiProjectsPrompt3"),
        ],
      };
    }

    if (pathname === "/" || pathname === "/updates" || pathname.startsWith("/updates/")) {
      return {
        enabled: true,
        context: "handbook" as const,
        title: t("floating.aiHandbookTitle"),
        description: t("floating.aiHandbookDescription"),
        presetPrompts: [
          t("floating.aiHandbookPrompt1"),
          t("floating.aiHandbookPrompt2"),
          t("floating.aiHandbookPrompt3"),
        ],
      };
    }

    if (pathname === "/me" || pathname.startsWith("/people/")) {
      return {
        enabled: false,
        context: "handbook" as const,
        title: "",
        description: "",
        presetPrompts: [],
      };
    }

    return {
      enabled: true,
      context: "handbook" as const,
      title: t("floating.aiHandbookTitle"),
      description: t("floating.aiHandbookDescription"),
      presetPrompts: [
        t("floating.aiHandbookPrompt1"),
        t("floating.aiHandbookPrompt2"),
        t("floating.aiHandbookPrompt3"),
      ],
    };
  }, [pathname, t]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!isArchive) return;

    const onScroll = () => {
      let current: ArchiveSection | null = null;
      archiveSections.forEach((section) => {
        const el = document.getElementById(section);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top <= 140) current = section;
      });
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isArchive]);

  useEffect(() => {
    const updateVisibility = () => {
      const footer = document.getElementById("site-footer");
      if (!footer) return;
      const footerTop = footer.getBoundingClientRect().top;
      const shouldHide = footerTop <= window.innerHeight - 8;
      setHideNearFooter(shouldHide);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  const currentIndex = useMemo(() => {
    if (!activeSection) return -1;
    return archiveSections.indexOf(activeSection);
  }, [activeSection]);

  const disablePrev = !isArchive || currentIndex <= 0;
  const disableNext =
    !isArchive || currentIndex < 0 || currentIndex >= archiveSections.length - 1;

  const moveSection = (direction: -1 | 1) => {
    if (!isArchive) return;
    const baseIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex = Math.max(0, Math.min(archiveSections.length - 1, baseIndex + direction));
    const target = document.getElementById(archiveSections[nextIndex]);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const runSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/archive?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  };

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(searchText);
  };

  return (
    <div className={`floating-wrap ${hideNearFooter ? "floating-wrap-hidden" : ""}`}>
      <div className={`floating-assistant ${assistantConfig.enabled && assistantOpen ? "floating-assistant-open" : ""}`}>
        <div className="floating-assistant-head">
          <div>
            <p className="section-cover-kicker">{t("floating.ai")}</p>
            <h2 className="mt-2 text-xl font-black text-[var(--primary)]">{assistantConfig.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{assistantConfig.description}</p>
          </div>
          <button
            type="button"
            className="floating-btn"
            onClick={() => setAssistantOpen(false)}
          >
            {t("floating.closeAi")}
          </button>
        </div>
        <AICounselorInner
          variant="panel"
          context={assistantConfig.context}
          archiveSection={isArchive ? activeSection : archiveSectionFromPath}
          presetPrompts={assistantConfig.presetPrompts}
        />
      </div>

      <div className={`floating-search ${searchOpen ? "floating-search-open" : ""}`}>
        <form className="floating-search-form" onSubmit={onSubmitSearch}>
          <input
            ref={searchInputRef}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={t("floating.searchPlaceholder")}
            className="floating-search-input"
          />
          <button type="submit" className="floating-search-btn floating-search-btn-primary">
            {t("floating.go")}
          </button>
          <button
            type="button"
            className="floating-search-btn"
            onClick={() => setSearchOpen(false)}
          >
            {t("floating.cancel")}
          </button>
        </form>
      </div>

      <div
        className={`floating-bar ${collapsed ? "floating-bar-collapsed" : ""}`}
        role="navigation"
        aria-label="Quick actions"
      >
        <div className={`floating-main ${collapsed ? "floating-main-hidden" : ""}`}>
          <div className="floating-group floating-group-left">
            <button type="button" className="floating-btn" onClick={() => window.history.back()}>
              {t("floating.back")}
            </button>
            <button
              type="button"
              className="floating-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {t("floating.top")}
            </button>
            <button
              type="button"
              className="floating-btn floating-btn-primary"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              {t("floating.search")}
            </button>
          </div>

          <div className="floating-group floating-group-center">
            {assistantConfig.enabled ? (
              <button
                type="button"
                className="floating-btn floating-btn-ai"
                onClick={() => {
                  setSearchOpen(false);
                  setAssistantOpen((prev) => !prev);
                }}
              >
                {t("floating.ai")}
              </button>
            ) : null}
            <button
              type="button"
              className="floating-btn floating-toggle floating-toggle-inline"
              onClick={() => {
                setSearchOpen(false);
                setAssistantOpen(false);
                setCollapsed(true);
              }}
              aria-label={t("floating.collapse")}
              title={t("floating.collapse")}
            >
              <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="floating-group floating-group-right">
            <button type="button" className="floating-btn" onClick={() => router.push("/links")}>
              {t("floating.links")}
            </button>
            <button
              type="button"
              className="floating-btn"
              onClick={() => moveSection(-1)}
              disabled={disablePrev}
            >
              {t("floating.prev")}
            </button>
            <button
              type="button"
              className="floating-btn"
              onClick={() => moveSection(1)}
              disabled={disableNext}
            >
              {t("floating.next")}
            </button>
          </div>
        </div>

        {collapsed ? (
          <button
            type="button"
            className="floating-btn floating-toggle"
            onClick={() => setCollapsed(false)}
            aria-label={t("floating.expand")}
            title={t("floating.expand")}
          >
            <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
              <path
                d="M5 12.5L10 7.5L15 12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
