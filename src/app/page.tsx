import Link from "next/link";
import { getRuntimeArchiveDataset } from "@/lib/archiveAdminStore";
import { getArchiveSectionLabel } from "@/lib/archivePresentation";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import { getUpdatePostText, updatePosts } from "@/lib/updatesData";

export default async function HomePage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const archiveDataset = await getRuntimeArchiveDataset();
  const topicIndex = [
    { label: getArchiveSectionLabel("awards", locale), href: "/archive#awards" },
    { label: getArchiveSectionLabel("varsityTeams", locale), href: "/archive#varsityTeams" },
    { label: locale === "ko" ? "과목" : "Courses", href: "/archive#courseAnnouncements" },
    { label: getArchiveSectionLabel("projects", locale), href: "/archive#projects" },
    { label: locale === "ko" ? "보고서" : "Reports", href: "/archive#clubReports" },
    { label: locale === "ko" ? "행사" : "Events", href: "/archive#schoolEvents" },
    { label: getArchiveSectionLabel("publications", locale), href: "/archive#publications" },
    { label: getArchiveSectionLabel("schoolProfiles", locale), href: "/archive#schoolProfiles" },
    { label: locale === "ko" ? "건물" : "Buildings", href: "/archive#buildingHistory" },
    { label: locale === "ko" ? "동문" : "Alumni", href: "/archive#alumniProfiles" },
    { label: getArchiveSectionLabel("gradeTasks", locale), href: "/archive#gradeTasks" },
  ];
  const totalItems = Object.values(archiveDataset).reduce((sum, items) => sum + items.length, 0);

  return (
    <main className="px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="section-block border-l-4 border-l-[var(--accent)] p-8">
          <p className="text-sm font-semibold text-[var(--accent)]">{dict.home.kicker}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--primary)]">{dict.home.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{dict.home.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/archive" className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">{dict.home.openArchive}</Link>
            <Link href="/updates" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">{dict.home.readUpdates}</Link>
            <Link href="/projects" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">{dict.home.browseProjects}</Link>
            <Link href="/links" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">{dict.home.schoolLinks}</Link>
            <Link href="/admin" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">{dict.home.adminIntake}</Link>
          </div>

          <p className="mt-4 text-xs font-medium text-[var(--muted)]">
            {locale === "ko"
              ? `${totalItems}${dict.home.records}${Object.keys(archiveDataset).length}${dict.home.sections}`
              : `${totalItems} ${dict.home.records} ${Object.keys(archiveDataset).length} ${dict.home.sections}`}
          </p>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{dict.home.topicIndex}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {topicIndex.map((topic) => (
                <Link key={topic.label} href={topic.href} className="text-sm font-semibold text-[var(--accent)]">
                  {topic.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)] pt-6">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <p className="section-cover-kicker">{dict.home.latestUpdates}</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{dict.home.changedRecently}</h2>
            </div>
            <Link href="/updates" className="text-sm font-semibold text-[var(--accent)]">{dict.home.viewAllUpdates}</Link>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {updatePosts.slice(0, 3).map((post) => {
              const content = getUpdatePostText(post, locale);
              return (
                <article key={post.slug} className="section-cover section-cover-subtle px-5 py-5">
                  <p className="section-cover-kicker">{content.coverLabel}</p>
                  <h3 className="mt-2 text-xl font-black text-[var(--primary)]">
                    <Link href={`/updates/${post.slug}`}>{content.title}</Link>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{content.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
                    <span>{post.publishDate}</span>
                    <span>{content.author}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    <Link href={`/updates/${post.slug}`} className="text-[var(--accent)]">{dict.home.readPost}</Link>
                    {content.relatedLinks[0] ? (
                      <Link href={content.relatedLinks[0].href} className="text-[var(--accent)]">
                        {content.relatedLinks[0].label}
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-[var(--border)] pt-6">
          <div className="section-cover section-cover-subtle px-6 py-5">
            <p className="section-cover-kicker">{dict.home.newLayer}</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{dict.home.detailTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">{dict.home.detailDescription}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/archive/publications" className="text-[var(--accent)]">{dict.home.browsePublications}</Link>
              <Link href="/archive/schoolProfiles" className="text-[var(--accent)]">{dict.home.browseProfiles}</Link>
              <Link href="/archive/projects" className="text-[var(--accent)]">{dict.home.browseProjectRecords}</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
