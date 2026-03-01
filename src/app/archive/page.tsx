import Link from "next/link";
import ArchiveSidebar from "@/components/ArchiveSidebar";
import { archiveSectionMeta, quickActions } from "@/lib/archiveMeta";
import { searchArchive } from "@/lib/archiveSearch";
import {
  archiveSectionDescriptions,
  archiveSectionKeywords,
  archiveSectionLabels,
  formatArchiveDate,
  getArchiveListItem,
  getArchiveSectionItems,
  getArchiveYears,
} from "@/lib/archivePresentation";
import { archiveDataset, type ArchiveSection } from "@/lib/archiveData";

interface ArchivePageProps {
  searchParams: Promise<{
    q?: string;
    section?: string;
    year?: string;
    verification?: "official" | "reviewing";
  }>;
}

function getRankingLabel(section: ArchiveSection, index: number): string {
  const prefix = index + 1;
  if (section === "schoolEvents") return `Recent #${prefix}`;
  if (section === "projects") return `Featured #${prefix}`;
  if (section === "awards") return `Notable #${prefix}`;
  return `Highlight #${prefix}`;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const sectionFilter =
    params.section && params.section in archiveDataset
      ? (params.section as ArchiveSection)
      : undefined;
  const yearFilter = (params.year ?? "").trim() || undefined;
  const verificationFilter =
    params.verification === "official" || params.verification === "reviewing"
      ? params.verification
      : undefined;

  const results =
    query || sectionFilter || yearFilter || verificationFilter
      ? searchArchive(query, {
          section: sectionFilter,
          year: yearFilter,
          verification: verificationFilter,
        })
      : [];

  const sections = Object.keys(archiveDataset) as ArchiveSection[];
  const years = getArchiveYears();

  const sidebarSections = sections.map((section) => ({
    id: section,
    label: archiveSectionLabels[section],
    count: archiveDataset[section].length,
  }));

  return (
    <main className="px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[230px_1fr]">
        <ArchiveSidebar sections={sidebarSections} quickActions={quickActions} />

        <div>
          <header className="section-cover border border-[var(--border)] px-6 py-6">
            <p className="section-cover-kicker">Archive Index</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[var(--primary)]">Archive</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                  One continuous index of official school information.
                </p>
              </div>
              <div className="text-right text-xs font-semibold text-[var(--muted)]">
                <p>{sections.length} sections</p>
                <p className="mt-1">
                  {Object.values(archiveDataset).reduce((sum, items) => sum + items.length, 0)} total
                  records
                </p>
              </div>
            </div>

            <div className="mt-4 border-l-2 border-[var(--accent)] pl-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                How To Use
              </p>
              <p className="mt-1 text-sm text-[var(--primary)]">
                1) Jump from the left nav. 2) Filter by section, year, or verification when the exact
                record is unknown. 3) Open detail pages for download actions and source links.
              </p>
            </div>
          </header>

          <form
            className="archive-filter-grid mt-5 border-b border-[var(--border)] pb-5"
            action="/archive"
            method="get"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search: robotics, handbook, Grade 11"
              className="archive-filter-input archive-filter-wide"
            />

            <select
              name="section"
              defaultValue={sectionFilter ?? ""}
              className="archive-filter-input"
            >
              <option value="">All sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {archiveSectionLabels[section]}
                </option>
              ))}
            </select>

            <select name="year" defaultValue={yearFilter ?? ""} className="archive-filter-input">
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              name="verification"
              defaultValue={verificationFilter ?? ""}
              className="archive-filter-input"
            >
              <option value="">All statuses</option>
              <option value="official">Official</option>
              <option value="reviewing">Reviewing</option>
            </select>

            <button
              type="submit"
              className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Search
            </button>

            <Link
              href="/archive"
              className="border border-[var(--border)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary)]"
            >
              Reset
            </Link>
          </form>

          {query || sectionFilter || yearFilter || verificationFilter ? (
            <section className="mt-5 border-b border-[var(--border)] pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--primary)]">
                    Search Results ({results.length})
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Query: {query || "none"} · Section:{" "}
                    {sectionFilter ? archiveSectionLabels[sectionFilter] : "all"} · Year:{" "}
                    {yearFilter ?? "all"} · Status: {verificationFilter ?? "all"}
                  </p>
                </div>
              </div>

              <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {results.map((item) => (
                  <li key={`${item.section}-${item.id}`} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          {item.sectionLabel}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                          <Link href={item.href}>{item.title}</Link>
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.snippet}</p>
                      </div>
                      <div className="text-right text-xs font-semibold text-[var(--muted)]">
                        <p>{item.year ?? "-"}</p>
                        <p className="mt-1">{item.verification}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-2">
            {sections.map((section) => {
              const items = getArchiveSectionItems(section).map((item) => getArchiveListItem(section, item));
              const meta = archiveSectionMeta[section];
              const topItems = items.slice(0, 3);

              return (
                <section id={section} key={section} className="scroll-mt-24 border-b border-[var(--border)] py-6">
                  <div className="section-cover section-cover-subtle px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="section-cover-kicker">{archiveSectionLabels[section]}</p>
                        <h2 className="mt-2 text-xl font-bold text-[var(--primary)]">
                          <Link href={`/archive/${section}`}>{archiveSectionLabels[section]}</Link>
                        </h2>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {archiveSectionDescriptions[section]}
                        </p>
                      </div>
                      <div className="text-right text-xs font-semibold text-[var(--muted)]">
                        <p>{items.length} items</p>
                        <p className="mt-1">Updated {formatArchiveDate(meta.lastUpdated)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {archiveSectionKeywords[section].map((keyword) => (
                        <span key={`${section}-${keyword}`} className="section-chip">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="font-semibold text-[var(--primary)]">
                      Source: <span className="font-normal">{meta.sourceDepartment}</span>
                    </span>
                    <span className="font-semibold text-[var(--primary)]">
                      Verification:{" "}
                      <span className="font-normal">
                        {meta.verification === "official" ? "Official" : "Reviewing"}
                      </span>
                    </span>
                    <span className="font-semibold text-[var(--primary)]">
                      Last Updated: <span className="font-normal">{formatArchiveDate(meta.lastUpdated)}</span>
                    </span>
                  </div>

                  {items.length > 0 ? (
                    <>
                      <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                        {items.slice(0, 6).map((item) => (
                          <li key={`${section}-${item.id}`} className="py-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                {item.eyebrow ? (
                                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                    {item.eyebrow}
                                  </p>
                                ) : null}
                                <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                                  <Link href={item.href}>{item.title}</Link>
                                </p>
                                <p className="mt-1 text-sm text-[var(--muted)]">{item.summary}</p>
                              </div>
                              <div className="text-right text-xs font-semibold text-[var(--muted)]">
                                <p>{item.year ?? "-"}</p>
                                <p className="mt-1">
                                  <Link href={item.href}>Open</Link>
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
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
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Highlights
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {topItems.map((item, index) => (
                            <Link
                              key={`${section}-highlight-${item.id}`}
                              href={item.href}
                              className="section-chip"
                            >
                              {getRankingLabel(section, index)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--muted)]">
                      No records available yet. This section is scheduled for data import.
                      <Link href="/request-update" className="ml-2 font-semibold text-[var(--accent)]">
                        Request update
                      </Link>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link href={`/archive/${section}`} className="text-sm font-semibold text-[var(--accent)]">
                      Open section page
                    </Link>
                    <Link href={`/api/archive/${section}`} className="text-sm font-semibold text-[var(--accent)]">
                      Open section API
                    </Link>
                    <Link href="/request-update" className="text-sm font-semibold text-[var(--accent)]">
                      Report issue
                    </Link>
                  </div>
                </section>
              );
            })}
          </div>

          <footer className="border-t border-[var(--border)] py-5 text-xs text-[var(--muted)]">
            <p>
              Archive policy: privacy, consent, and copyright are enforced.
              <Link href="/policy" className="ml-2 font-semibold text-[var(--accent)]">
                Read policy
              </Link>
              <Link href="/request-update" className="ml-3 font-semibold text-[var(--accent)]">
                Request correction
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
