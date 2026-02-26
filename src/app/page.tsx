import Link from "next/link";
import AICounselor from "@/components/AICounselor";
import { archiveDataset } from "@/lib/archiveData";

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
            <Link
              href="/archive"
              className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Open Full Archive
            </Link>
            <Link
              href="/projects"
              className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]"
            >
              Browse Projects
            </Link>
            <Link
              href="/links"
              className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]"
            >
              School Links
            </Link>
            <Link
              href="/api/archive/search?q=school+profile"
              className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]"
            >
              Search Profiles
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
                <Link
                  key={topic.label}
                  href={topic.href}
                  className="text-sm font-semibold text-[var(--accent)]"
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)] pt-6">
          <AICounselor />
        </section>
      </div>
    </main>
  );
}
