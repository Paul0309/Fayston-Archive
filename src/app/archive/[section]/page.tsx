import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveSectionMeta } from "@/lib/archiveMeta";
import {
  archiveSectionDescriptions,
  archiveSectionKeywords,
  archiveSectionLabels,
  formatArchiveDate,
  getArchiveListItem,
  getArchiveSectionItems,
  isArchiveSection,
} from "@/lib/archivePresentation";

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function ArchiveSectionPage({ params }: SectionPageProps) {
  const { section: rawSection } = await params;
  if (!isArchiveSection(rawSection)) notFound();

  const section = rawSection;
  const meta = archiveSectionMeta[section];
  const items = getArchiveSectionItems(section).map((item) => getArchiveListItem(section, item));

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">Section Overview</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[var(--primary)]">
                {archiveSectionLabels[section]}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                {archiveSectionDescriptions[section]}
              </p>
            </div>
            <div className="text-right text-xs font-semibold text-[var(--muted)]">
              <p>{items.length} items</p>
              <p className="mt-1">Last updated {formatArchiveDate(meta.lastUpdated)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {archiveSectionKeywords[section].map((keyword) => (
              <span key={keyword} className="section-chip">
                {keyword}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/archive" className="text-[var(--accent)]">
              Back to archive index
            </Link>
            <Link href={`/api/archive/${section}`} className="text-[var(--accent)]">
              Open section API
            </Link>
          </div>
        </header>

        <section className="mt-6 border-t border-[var(--border)]">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="border-b border-[var(--border)] py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {item.eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {item.eyebrow}
                    </p>
                  ) : null}
                  <h2 className="mt-1 text-lg font-bold text-[var(--primary)]">
                    <Link href={item.href}>{item.title}</Link>
                  </h2>
                </div>
                <p className="text-xs font-semibold text-[var(--muted)]">
                  #{String(index + 1).padStart(2, "0")}
                </p>
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                {item.summary}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.keywords.map((keyword) => (
                  <span key={`${item.id}-${keyword}`} className="section-chip">
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href={item.href} className="text-[var(--accent)]">
                  Open detail
                </Link>
                {item.sourceUrl ? (
                  <Link href={item.sourceUrl} className="text-[var(--accent)]">
                    Open source
                  </Link>
                ) : null}
                <Link href={`${item.href}/download`} className="text-[var(--accent)]">
                  Download record
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
