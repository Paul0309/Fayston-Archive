"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface SectionItem {
  id: string;
  label: string;
  count: number;
}

interface QuickActionItem {
  label: string;
  href: string;
}

interface ArchiveSidebarProps {
  sections: SectionItem[];
  quickActions: QuickActionItem[];
}

export default function ArchiveSidebar({
  sections,
  quickActions,
}: ArchiveSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      let current = sections[0]?.id ?? "";
      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        if (el.getBoundingClientRect().top <= 150) current = section.id;
      });
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const activeLabel = useMemo(() => {
    const found = sections.find((section) => section.id === activeId);
    return found?.label ?? "Archive";
  }, [activeId, sections]);

  return (
    <aside className="archive-sidebar sticky top-24 h-fit border-r border-[var(--border)] pr-4 self-start">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Sections
      </p>
      <p className="archive-sidebar-now mt-2 text-xs font-semibold">
        Now: {activeLabel}
      </p>

      <nav className="mt-3 flex flex-col gap-1" aria-label="Section navigation">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`archive-link text-sm font-semibold ${
                isActive ? "archive-link-active" : ""
              }`}
            >
              <span>{section.label}</span>
              <span className="archive-link-count">({section.count})</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Quick Actions
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="archive-quick-link text-sm font-semibold"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
