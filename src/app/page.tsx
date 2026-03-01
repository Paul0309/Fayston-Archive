import Link from "next/link";
import { archiveDataset } from "@/lib/archiveData";
import { updatePosts } from "@/lib/updatesData";
import HomeCounselorShell from "@/components/HomeCounselorShell";

const topicIndex = [
  { label: "Awards", href: "/archive#awards" },
  { label: "Varsity Teams", href: "/archive#varsityTeams" },
  { label: "Courses", href: "/archive#courseAnnouncements" },
  { label: "Projects", href: "/archive#projects" },
  { label: "Reports", href: "/archive#clubReports" },
  { label: "Events", href: "/archive#schoolEvents" },
  { label: "Publications", href: "/archive#publications" },
  { label: "School Profiles", href: "/archive#schoolProfiles" },
  { label: "Buildings", href: "/archive#buildingHistory" },
  { label: "Alumni", href: "/archive#alumniProfiles" },
  { label: "Grade Tasks", href: "/archive#gradeTasks" },
];

export default function HomePage() {
  const totalItems = Object.values(archiveDataset).reduce(
    (sum, items) => sum + items.length,
    0,
  );

  return (
    <main className="px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="section-block border-l-4 border-l-[var(--accent)] p-8">
          <p className="text-sm font-semibold text-[var(--accent)]">Official Information Hub</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--primary)]">
            Find School Records Fast
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            This archive is organized for direct lookup of awards, varsity teams, courses,
            student projects, reports, event materials, publications, school profiles,
            building history, alumni links, and grade-based tasks.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/archive" className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
              Open Full Archive
            </Link>
            <Link href="/updates" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">
              Read Updates
            </Link>
            <Link href="/projects" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">
              Browse Projects
            </Link>
            <Link href="/links" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">
              School Links
            </Link>
            <Link href="/admin" className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]">
              Admin Intake
            </Link>
          </div>

          <p className="mt-4 text-xs font-medium text-[var(--muted)]">
            {totalItems} records across {Object.keys(archiveDataset).length} archive sections.
          </p>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Topic Index
            </p>
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
              <p className="section-cover-kicker">Latest Updates</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">What Changed Recently</h2>
            </div>
            <Link href="/updates" className="text-sm font-semibold text-[var(--accent)]">
              View all updates
            </Link>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {updatePosts.slice(0, 3).map((post) => (
              <article key={post.slug} className="section-cover section-cover-subtle px-5 py-5">
                <p className="section-cover-kicker">{post.coverLabel}</p>
                <h3 className="mt-2 text-xl font-black text-[var(--primary)]">
                  <Link href={`/updates/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{post.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
                  <span>{post.publishDate}</span>
                  <span>{post.author}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                  <Link href={`/updates/${post.slug}`} className="text-[var(--accent)]">
                    Read post
                  </Link>
                  {post.relatedLinks[0] ? (
                    <Link href={post.relatedLinks[0].href} className="text-[var(--accent)]">
                      {post.relatedLinks[0].label}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border)] pt-6">
          <HomeCounselorShell />
        </section>

        <section className="border-t border-[var(--border)] pt-6">
          <div className="section-cover section-cover-subtle px-6 py-5">
            <p className="section-cover-kicker">New Layer</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
              Detail Pages + Download Flow
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Publications, school profiles, club reports, and project records now have
              dedicated detail pages with metadata download actions and section-level browsing.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/archive/publications" className="text-[var(--accent)]">
                Browse publications
              </Link>
              <Link href="/archive/schoolProfiles" className="text-[var(--accent)]">
                Browse school profiles
              </Link>
              <Link href="/archive/projects" className="text-[var(--accent)]">
                Browse project records
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
