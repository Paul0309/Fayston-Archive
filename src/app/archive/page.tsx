import Link from "next/link";
import { getServerSession } from "next-auth";
import ArchiveSidebar from "@/components/ArchiveSidebar";
import { getRuntimeArchiveDataset, getRuntimeArchiveYears } from "@/lib/archiveAdminStore";
import { authOptions } from "@/lib/auth";
import { archiveSectionMeta, quickActions } from "@/lib/archiveMeta";
import { searchArchive } from "@/lib/archiveSearch";
import { type ArchiveSection } from "@/lib/archiveData";
import { getDictionary } from "@/lib/i18n";
import {
  formatArchiveDate,
  getArchiveSectionDescription,
  getArchiveSectionLabel,
} from "@/lib/archivePresentation";
import { isAdminRole } from "@/lib/roles";
import { getServerLocale } from "@/lib/serverLocale";

interface ArchivePageProps {
  searchParams: Promise<{
    q?: string;
    section?: string;
    year?: string;
    verification?: "official" | "reviewing";
  }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const session = await getServerSession(authOptions);
  const canManage = isAdminRole(session?.user?.role);
  const archiveDataset = await getRuntimeArchiveDataset();
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
      ? searchArchive(
          query,
          {
            section: sectionFilter,
            year: yearFilter,
            verification: verificationFilter,
          },
          locale,
          archiveDataset,
        )
      : [];

  const sections = Object.keys(archiveDataset) as ArchiveSection[];
  const years = await getRuntimeArchiveYears();
  const totalRecords = Object.values(archiveDataset).reduce((sum, items) => sum + items.length, 0);

  const sidebarSections = sections.map((section) => ({
    id: section,
    label: getArchiveSectionLabel(section, locale),
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
                <p className="section-cover-kicker archive-header-kicker">{dict.archive.kicker}</p>
                <h1 className="mt-1 text-3xl font-black text-[var(--primary)]">{dict.archive.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{dict.archive.description}</p>
              </div>

              <div className="archive-header-stats text-xs font-semibold text-[var(--muted)]">
                <span>{sections.length} {dict.archive.sections}</span>
                <span>{totalRecords} {dict.archive.records}</span>
              </div>
            </div>
          </header>

          <form className="archive-filter-grid mt-4 border-b border-[var(--border)] pb-4" action="/archive" method="get">
            <input type="text" name="q" defaultValue={query} placeholder={dict.archive.searchPlaceholder} className="archive-filter-input archive-filter-wide" />

            <select name="section" defaultValue={sectionFilter ?? ""} className="archive-filter-input">
              <option value="">{dict.archive.allSections}</option>
              {sections.map((section) => (
                <option key={section} value={section}>{getArchiveSectionLabel(section, locale)}</option>
              ))}
            </select>

            <select name="year" defaultValue={yearFilter ?? ""} className="archive-filter-input">
              <option value="">{dict.archive.allYears}</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select name="verification" defaultValue={verificationFilter ?? ""} className="archive-filter-input">
              <option value="">{dict.archive.allStatuses}</option>
              <option value="official">{dict.archive.official}</option>
              <option value="reviewing">{dict.archive.reviewing}</option>
            </select>

            <button type="submit" className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">{dict.archive.search}</button>

            <Link href="/archive" className="border border-[var(--border)] px-4 py-2 text-center text-sm font-semibold text-[var(--muted)]">{dict.archive.reset}</Link>
          </form>

          {query || sectionFilter || yearFilter || verificationFilter ? (
            <section className="mt-4 border-b border-[var(--border)] pb-4">
              <div className="archive-summary-row">
                <h2 className="text-base font-bold text-[var(--primary)]">{dict.archive.searchResults} ({results.length})</h2>
                <p className="text-xs text-[var(--muted)]">
                  {query || dict.archive.noTextQuery} / {sectionFilter ? getArchiveSectionLabel(sectionFilter, locale) : dict.archive.allSections} / {" "}
                  {yearFilter ?? dict.archive.allYears} / {verificationFilter ?? dict.archive.allStatuses}
                </p>
              </div>

              <ul className="mt-3 divide-y divide-[var(--border)]">
                {results.map((item) => (
                  <li key={`${item.section}-${item.id}`} className="archive-record-row py-3">
                    <div className="archive-record-main">
                      <p className="archive-record-eyebrow">{item.sectionLabel}</p>
                      <p className="archive-record-title"><Link href={item.href}>{item.title}</Link></p>
                      <p className="archive-record-summary">{item.snippet}</p>
                      <div className="archive-record-actions">
                        <Link href={item.href}>{dict.archive.openDetail}</Link>
                        <Link href={`/archive/${item.section}`}>{dict.archive.openSection}</Link>
                        {canManage ? (
                          <Link href={`/admin?section=${item.section}&sourceId=${item.id}`} className="text-[var(--accent)]">
                            {locale === "ko" ? "관리자 수정" : "Admin edit"}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                    <div className="archive-record-side"><span>{item.year ?? "-"}</span></div>
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
                <article id={section} key={section} className="section-cover section-cover-subtle scroll-mt-24 px-5 py-5">
                  <p className="archive-section-label">{getArchiveSectionLabel(section, locale)}</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--primary)]"><Link href={`/archive/${section}`}>{getArchiveSectionLabel(section, locale)}</Link></h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{getArchiveSectionDescription(section, locale)}</p>

                  <div className="archive-section-meta mt-4">
                    <span>{count} {dict.archive.items}</span>
                    <span>{meta.sourceDepartment}</span>
                    <span>{meta.verification === "official" ? dict.archive.official : dict.archive.reviewing}</span>
                    <span>{formatArchiveDate(meta.lastUpdated)}</span>
                  </div>

                  <div className="archive-section-footer mt-5">
                    <Link href={`/archive/${section}`}>{dict.archive.openFullSection}</Link>
                    <Link href={`/api/archive/${section}`}>API</Link>
                    <Link href="/request-update">{dict.archive.reportIssue}</Link>
                    {canManage ? (
                      <Link href={`/admin?section=${section}`} className="text-[var(--accent)]">
                        {locale === "ko" ? "관리자 수정" : "Admin edit"}
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>

          <footer className="mt-6 border-t border-[var(--border)] py-5 text-xs text-[var(--muted)]">
            <p>
              {dict.archive.policy}
              <Link href="/policy" className="ml-2 font-semibold text-[var(--accent)]">{dict.archive.readPolicy}</Link>
              <Link href="/request-update" className="ml-3 font-semibold text-[var(--accent)]">{dict.archive.requestCorrection}</Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}