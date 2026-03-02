import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getRuntimeArchiveItemById } from "@/lib/archiveAdminStore";
import { authOptions } from "@/lib/auth";
import { archiveSectionMeta } from "@/lib/archiveMeta";
import { getDictionary } from "@/lib/i18n";
import {
  formatArchiveDate,
  getArchiveItemEyebrow,
  getArchiveItemFields,
  getArchiveItemKeywords,
  getArchiveItemSummary,
  getArchiveItemTitle,
  getArchiveSectionLabel,
  getArchiveSourceUrl,
  isArchiveSection,
} from "@/lib/archivePresentation";
import { isAdminRole } from "@/lib/roles";
import { getServerLocale } from "@/lib/serverLocale";

interface ArchiveItemDetailPageProps {
  params: Promise<{ section: string; id: string }>;
}

export default async function ArchiveItemDetailPage({ params }: ArchiveItemDetailPageProps) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const session = await getServerSession(authOptions);
  const canManage = isAdminRole(session?.user?.role);
  const { section: rawSection, id: rawId } = await params;
  if (!isArchiveSection(rawSection)) notFound();

  const id = Number(rawId);
  if (Number.isNaN(id)) notFound();

  const section = rawSection;
  const item = await getRuntimeArchiveItemById(section, id);
  if (!item) notFound();

  const meta = archiveSectionMeta[section];
  const title = getArchiveItemTitle(section, item, locale);
  const eyebrow = getArchiveItemEyebrow(section, item, locale);
  const summary = getArchiveItemSummary(section, item, locale);
  const fields = getArchiveItemFields(section, item, locale);
  const keywords = getArchiveItemKeywords(section, item, locale);
  const sourceUrl = getArchiveSourceUrl(section, item);

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <nav className="text-sm font-semibold text-[var(--accent)]">
          <Link href="/archive">{dict.archiveDetail.archive}</Link>
          <span className="mx-2 text-[var(--muted)]">/</span>
          <Link href={`/archive/${section}`}>{getArchiveSectionLabel(section, locale)}</Link>
        </nav>

        <header className="section-cover mt-4 border border-[var(--border)] px-6 py-6">
          {eyebrow ? <p className="section-cover-kicker">{eyebrow}</p> : null}
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{summary}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <span className="font-semibold text-[var(--primary)]">{dict.archiveDetail.source}: <span className="font-normal">{meta.sourceDepartment}</span></span>
            <span className="font-semibold text-[var(--primary)]">{dict.archiveDetail.verification}: <span className="font-normal">{meta.verification === "official" ? dict.archiveDetail.official : dict.archiveDetail.reviewing}</span></span>
            <span className="font-semibold text-[var(--primary)]">{dict.archiveDetail.lastUpdated}: <span className="font-normal">{formatArchiveDate(meta.lastUpdated)}</span></span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            {sourceUrl ? <Link href={sourceUrl} className="text-[var(--accent)]">{dict.archiveDetail.openSourceFile}</Link> : null}
            <Link href={`/archive/${section}/${id}/download`} className="text-[var(--accent)]">{dict.archiveDetail.downloadMetadata}</Link>
            <Link href={`/archive/${section}`} className="text-[var(--accent)]">{dict.archiveDetail.viewFullSection}</Link>
            {canManage ? (
              <Link href={`/admin?section=${section}&sourceId=${id}`} className="text-[var(--accent)]">
                {locale === "ko" ? "이 레코드 수정" : "Edit this record"}
              </Link>
            ) : null}
          </div>
        </header>

        <section className="mt-6 border-t border-[var(--border)]">
          <div className="grid gap-0 md:grid-cols-[180px_1fr]">
            {fields.map((field) => (
              <div key={field.label} className="contents">
                <div className="border-b border-[var(--border)] py-3 text-sm font-semibold text-[var(--muted)]">{field.label}</div>
                <div className="border-b border-[var(--border)] py-3 text-sm leading-7 text-[var(--primary)]">{field.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{dict.archiveDetail.keywords}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span key={keyword} className="section-chip">{keyword}</span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}