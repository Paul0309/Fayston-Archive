import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveSectionMeta } from "@/lib/archiveMeta";
import {
  archiveSectionLabels,
  formatArchiveDate,
  getArchiveItemById,
  getArchiveItemEyebrow,
  getArchiveItemFields,
  getArchiveItemSummary,
  getArchiveItemTitle,
  getArchiveItemKeywords,
  getArchiveSourceUrl,
  isArchiveSection,
} from "@/lib/archivePresentation";

interface ArchiveItemDetailPageProps {
  params: Promise<{ section: string; id: string }>;
}

export default async function ArchiveItemDetailPage({
  params,
}: ArchiveItemDetailPageProps) {
  const { section: rawSection, id: rawId } = await params;
  if (!isArchiveSection(rawSection)) notFound();

  const id = Number(rawId);
  if (Number.isNaN(id)) notFound();

  const section = rawSection;
  const item = getArchiveItemById(section, id);
  if (!item) notFound();

  const meta = archiveSectionMeta[section];
  const title = getArchiveItemTitle(section, item);
  const eyebrow = getArchiveItemEyebrow(section, item);
  const summary = getArchiveItemSummary(section, item);
  const fields = getArchiveItemFields(section, item);
  const keywords = getArchiveItemKeywords(section, item);
  const sourceUrl = getArchiveSourceUrl(section, item);

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <nav className="text-sm font-semibold text-[var(--accent)]">
          <Link href="/archive">Archive</Link>
          <span className="mx-2 text-[var(--muted)]">/</span>
          <Link href={`/archive/${section}`}>{archiveSectionLabels[section]}</Link>
        </nav>

        <header className="section-cover mt-4 border border-[var(--border)] px-6 py-6">
          {eyebrow ? (
            <p className="section-cover-kicker">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{summary}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
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

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            {sourceUrl ? (
              <Link href={sourceUrl} className="text-[var(--accent)]">
                Open source file
              </Link>
            ) : null}
            <Link href={`/archive/${section}/${id}/download`} className="text-[var(--accent)]">
              Download metadata
            </Link>
            <Link href={`/archive/${section}`} className="text-[var(--accent)]">
              View full section
            </Link>
          </div>
        </header>

        <section className="mt-6 border-t border-[var(--border)]">
          <div className="grid gap-0 md:grid-cols-[180px_1fr]">
            {fields.map((field) => (
              <div key={field.label} className="contents">
                <div className="border-b border-[var(--border)] py-3 text-sm font-semibold text-[var(--muted)]">
                  {field.label}
                </div>
                <div className="border-b border-[var(--border)] py-3 text-sm leading-7 text-[var(--primary)]">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Keywords
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span key={keyword} className="section-chip">
                {keyword}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
