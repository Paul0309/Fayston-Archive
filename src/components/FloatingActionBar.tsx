"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { archiveDataset, type ArchiveSection } from "@/lib/archiveData";

const archiveSections = Object.keys(archiveDataset) as ArchiveSection[];

export default function FloatingActionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isArchive = pathname === "/archive";
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [hideNearFooter, setHideNearFooter] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [activeSection, setActiveSection] = useState<ArchiveSection | null>(null);

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
      <div className={`floating-search ${searchOpen ? "floating-search-open" : ""}`}>
        <form className="floating-search-form" onSubmit={onSubmitSearch}>
          <input
            ref={searchInputRef}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search archive..."
            className="floating-search-input"
          />
          <button type="submit" className="floating-search-btn floating-search-btn-primary">
            Go
          </button>
          <button
            type="button"
            className="floating-search-btn"
            onClick={() => setSearchOpen(false)}
          >
            Cancel
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
              Back
            </button>
            <button
              type="button"
              className="floating-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Top
            </button>
            <button
              type="button"
              className="floating-btn floating-btn-primary"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              Search
            </button>
          </div>

          <div className="floating-group floating-group-center">
            <button
              type="button"
              className="floating-btn floating-toggle floating-toggle-inline"
              onClick={() => {
                setSearchOpen(false);
                setCollapsed(true);
              }}
              aria-label="Collapse quick actions"
              title="Collapse quick actions"
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
              Links
            </button>
            <button
              type="button"
              className="floating-btn"
              onClick={() => moveSection(-1)}
              disabled={disablePrev}
            >
              Prev
            </button>
            <button
              type="button"
              className="floating-btn"
              onClick={() => moveSection(1)}
              disabled={disableNext}
            >
              Next
            </button>
          </div>
        </div>

        {collapsed ? (
          <button
            type="button"
            className="floating-btn floating-toggle"
            onClick={() => setCollapsed(false)}
            aria-label="Expand quick actions"
            title="Expand quick actions"
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
