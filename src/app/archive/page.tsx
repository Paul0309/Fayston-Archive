import Link from "next/link";
import ArchiveSidebar from "@/components/ArchiveSidebar";
import { archiveSectionMeta, quickActions } from "@/lib/archiveMeta";
import { searchArchive } from "@/lib/archiveSearch";
import {
  archiveSectionDescriptions,
  archiveSectionLabels,
  formatArchiveDate,
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
  const totalRecords = Object.values(archiveDataset).reduce((sum, items) => sum + items.length, 0);

  const sidebarSections = sections.map((section) => ({
    id: section,
    label: archiveSectionLabels[section],
    count: archiveDataset[section].length,
  }));

  return (
    <main className="px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[220px_1fr]">
        <ArchiveSidebar sections={sidebarSections} quickActions={quickActions} />

        <div>
          <header className="archive-header border-b border-[var(--border)] pb-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-cover-kicker archive-header-kicker">Archive Directory</p>
                <h1 className="mt-1 text-3xl font-black text-[var(--primary)]">Archive</h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                  This page only helps you choose a section. Full browsing happens inside each section page.
                </p>
              </div>

              <div className="archive-header-stats text-xs font-semibold text-[var(--muted)]">
                <span>{sections.length} sections</span>
                <span>{totalRecords} records</span>
              </div>
            </div>
          </header>

          <form
            className="archive-filter-grid mt-4 border-b border-[var(--border)] pb-4"
            action="/archive"
            method="get"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search the full archive from here"
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
              className="border border-[var(--border)] px-4 py-2 text-center text-sm font-semibold text-[var(--muted)]"
            >
              Reset
            </Link>
          </form>

          {query || sectionFilter || yearFilter || verificationFilter ? (
            <section className="mt-4 border-b border-[var(--border)] pb-4">
              <div className="archive-summary-row">
                <h2 className="text-base font-bold text-[var(--primary)]">
                  Search Results ({results.length})
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  {query || "No text query"} / {sectionFilter ? archiveSectionLabels[sectionFilter] : "All sections"} /{" "}
                  {yearFilter ?? "All years"} / {verificationFilter ?? "All statuses"}
                </p>
              </div>

              <ul className="mt-3 divide-y divide-[var(--border)]">
                {results.map((item) => (
                  <li key={`${item.section}-${item.id}`} className="archive-record-row py-3">
                    <div className="archive-record-main">
                      <p className="archive-record-eyebrow">{item.sectionLabel}</p>
                      <p className="archive-record-title">
                        <Link href={item.href}>{item.title}</Link>
                      </p>
                      <p className="archive-record-summary">{item.snippet}</p>
                      <div className="archive-record-actions">
                        <Link href={item.href}>Open detail</Link>
                        <Link href={`/archive/${item.section}`}>Open section</Link>
                      </div>
                    </div>
                    <div className="archive-record-side">
                      <span>{item.year ?? "-"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-4 grid gap-4 md:grid-cols-2">
            {sections.map((section) => {
              const meta = archiveSectionMeta[section];
              const count = archiveDataset[section].length;

              return (
                <article
                  id={section}
                  key={section}
                  className="section-cover section-cover-subtle scroll-mt-24 px-5 py-5"
                >
                  <p className="archive-section-label">{archiveSectionLabels[section]}</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                    <Link href={`/archive/${section}`}>{archiveSectionLabels[section]}</Link>
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {archiveSectionDescriptions[section]}
                  </p>

                  <div className="archive-section-meta mt-4">
                    <span>{count} items</span>
                    <span>{meta.sourceDepartment}</span>
                    <span>{meta.verification === "official" ? "Official" : "Reviewing"}</span>
                    <span>{formatArchiveDate(meta.lastUpdated)}</span>
                  </div>

                  <div className="archive-section-footer mt-5">
                    <Link href={`/archive/${section}`}>Open full section</Link>
                    <Link href={`/api/archive/${section}`}>API</Link>
                    <Link href="/request-update">Report issue</Link>
                  </div>
                </article>
              );
            })}
          </section>

          <footer className="border-t border-[var(--border)] py-5 text-xs text-[var(--muted)] mt-6">
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
