import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getRuntimeArchiveSectionItems } from "@/lib/archiveAdminStore";
import { authOptions } from "@/lib/auth";
import type { ArchiveSection } from "@/lib/archiveData";
import { archiveSectionMeta } from "@/lib/archiveMeta";
import { getDictionary } from "@/lib/i18n";
import {
  formatArchiveDate,
  getArchiveListItem,
  getArchiveSectionDescription,
  getArchiveSectionKeywords,
  getArchiveSectionLabel,
  isArchiveSection,
} from "@/lib/archivePresentation";
import { isAdminRole } from "@/lib/roles";
import { getServerLocale } from "@/lib/serverLocale";

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

function getSectionLayout(section: ArchiveSection): "timeline" | "documents" | "profiles" | "list" {
  if (section === "awards" || section === "buildingHistory" || section === "schoolEvents") {
    return "timeline";
  }
  if (section === "publications" || section === "schoolProfiles" || section === "clubReports") {
    return "documents";
  }
  if (section === "alumniProfiles" || section === "varsityTeams") {
    return "profiles";
  }
  return "list";
}

export default async function ArchiveSectionPage({ params }: SectionPageProps) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const session = await getServerSession(authOptions);
  const canManage = isAdminRole(session?.user?.role);
  const { section: rawSection } = await params;
  if (!isArchiveSection(rawSection)) notFound();

  const section = rawSection;
  const meta = archiveSectionMeta[section];
  const items = (await getRuntimeArchiveSectionItems(section)).map((item) => getArchiveListItem(section, item, locale));
  const layout = getSectionLayout(section);

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">{dict.archiveDetail.sectionOverview}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[var(--primary)]">{getArchiveSectionLabel(section, locale)}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">{getArchiveSectionDescription(section, locale)}</p>
            </div>
            <div className="text-right text-xs font-semibold text-[var(--muted)]">
              <p>{items.length} {dict.archiveDetail.items}</p>
              <p className="mt-1">{dict.archiveDetail.lastUpdated} {formatArchiveDate(meta.lastUpdated)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {getArchiveSectionKeywords(section, locale).map((keyword) => (
              <span key={keyword} className="section-chip">{keyword}</span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/archive" className="text-[var(--accent)]">{dict.archiveDetail.backToArchiveIndex}</Link>
            <Link href={`/api/archive/${section}`} className="text-[var(--accent)]">{dict.archiveDetail.openSectionApi}</Link>
            {canManage ? (
              <Link href={`/admin?section=${section}`} className="text-[var(--accent)]">
                {locale === "ko" ? "이 섹션 관리" : "Manage this section"}
              </Link>
            ) : null}
          </div>
        </header>

        {layout === "timeline" ? (
          <section className="timeline-list mt-6">
            {items.map((item) => (
              <article key={item.id} className="timeline-item">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <p className="timeline-date">{item.eyebrow ?? item.year ?? ""}</p>
                  <h2 className="timeline-title"><Link href={item.href}>{item.title}</Link></h2>
                  <p className="timeline-summary">{item.summary}</p>
                  <div className="timeline-actions">
                    <Link href={item.href}>{dict.archiveDetail.openDetail}</Link>
                    {item.sourceUrl ? <Link href={item.sourceUrl}>{dict.archiveDetail.openSource}</Link> : null}
                    <Link href={`${item.href}/download`}>{dict.archiveDetail.downloadRecord}</Link>
                    {canManage ? (
                      <Link href={`/admin?section=${section}&sourceId=${item.id}`} className="text-[var(--accent)]">
                        {locale === "ko" ? "수정" : "Edit"}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {layout === "documents" ? (
          <section className="document-shelf mt-6">
            {items.map((item) => (
              <article key={item.id} className="document-card">
                <p className="document-kicker">{item.eyebrow ?? item.year ?? ""}</p>
                <h2 className="document-title"><Link href={item.href}>{item.title}</Link></h2>
                <p className="document-summary">{item.summary}</p>
                <div className="document-actions">
                  {item.sourceUrl ? <Link href={item.sourceUrl}>{dict.archiveDetail.openFile}</Link> : null}
                  <Link href={item.href}>{dict.archiveDetail.viewMetadata}</Link>
                  <Link href={`${item.href}/download`}>{dict.archiveDetail.downloadRecord}</Link>
                  {canManage ? (
                    <Link href={`/admin?section=${section}&sourceId=${item.id}`} className="text-[var(--accent)]">
                      {locale === "ko" ? "수정" : "Edit"}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {layout === "profiles" ? (
          <section className="profile-directory mt-6">
            {items.map((item) => (
              <article key={item.id} className="profile-card">
                <p className="profile-kicker">{item.eyebrow ?? ""}</p>
                <h2 className="profile-title"><Link href={item.href}>{item.title}</Link></h2>
                <p className="profile-summary">{item.summary}</p>
                <div className="profile-tags">
                  {item.keywords.slice(0, 3).map((keyword) => (
                    <span key={`${item.id}-${keyword}`} className="section-chip">{keyword}</span>
                  ))}
                </div>
                <div className="profile-actions">
                  <Link href={item.href}>{dict.archiveDetail.openDetail}</Link>
                  {item.sourceUrl ? <Link href={item.sourceUrl}>{dict.archiveDetail.openSource}</Link> : null}
                  {canManage ? (
                    <Link href={`/admin?section=${section}&sourceId=${item.id}`} className="text-[var(--accent)]">
                      {locale === "ko" ? "수정" : "Edit"}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {layout === "list" ? (
          <section className="mt-6 border-t border-[var(--border)]">
            {items.map((item, index) => (
              <article key={item.id} className="border-b border-[var(--border)] py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {item.eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{item.eyebrow}</p> : null}
                    <h2 className="mt-1 text-lg font-bold text-[var(--primary)]"><Link href={item.href}>{item.title}</Link></h2>
                  </div>
                  <p className="text-xs font-semibold text-[var(--muted)]">#{String(index + 1).padStart(2, "0")}</p>
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">{item.summary}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.keywords.map((keyword) => (
                    <span key={`${item.id}-${keyword}`} className="section-chip">{keyword}</span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                  <Link href={item.href} className="text-[var(--accent)]">{dict.archiveDetail.openDetail}</Link>
                  {item.sourceUrl ? <Link href={item.sourceUrl} className="text-[var(--accent)]">{dict.archiveDetail.openSource}</Link> : null}
                  <Link href={`${item.href}/download`} className="text-[var(--accent)]">{dict.archiveDetail.downloadRecord}</Link>
                  {canManage ? (
                    <Link href={`/admin?section=${section}&sourceId=${item.id}`} className="text-[var(--accent)]">
                      {locale === "ko" ? "수정" : "Edit"}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}