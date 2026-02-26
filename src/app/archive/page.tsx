import Link from "next/link";
import ArchiveSidebar from "@/components/ArchiveSidebar";
import { archiveDataset, type ArchiveSection } from "@/lib/archiveData";
import { archiveSectionMeta, quickActions } from "@/lib/archiveMeta";
import { searchArchive } from "@/lib/archiveSearch";

const sectionLabels: Record<ArchiveSection, string> = {
  projects: "Student Projects",
  awards: "Awards",
  varsityTeams: "Varsity Teams",
  courseAnnouncements: "Course Announcements",
  clubReports: "Club / Council Reports",
  schoolEvents: "School Events",
  publications: "Publications",
  schoolProfiles: "School Profiles",
  buildingHistory: "Building History",
  alumniProfiles: "Alumni Profiles",
  gradeTasks: "Grade Tasks",
};

const sectionDescriptions: Record<ArchiveSection, string> = {
  projects: "Personal and official student project records.",
  awards: "Historical award outcomes and recipients.",
  varsityTeams: "Team list with varsity achievements.",
  courseAnnouncements: "Newly opened classes and notices.",
  clubReports: "Activity reports and member leadership snapshots.",
  schoolEvents: "Upcoming and past events with materials.",
  publications: "Student handbook and weekly letters.",
  schoolProfiles: "Academic-year-based school profile documents.",
  buildingHistory: "Campus building timeline and changes.",
  alumniProfiles: "Graduate profile and social links.",
  gradeTasks: "Per-grade assignments and deadlines.",
};

interface ArchivePageProps {
  searchParams: Promise<{ q?: string }>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function previewText(item: unknown): string {
  if (!item || typeof item !== "object") return "";
  const values = Object.values(item as Record<string, unknown>);
  return values
    .map((v) => (typeof v === "string" || typeof v === "number" ? String(v) : ""))
    .filter(Boolean)
    .slice(0, 4)
    .join(" | ");
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
  const results = query ? searchArchive(query) : [];
  const sections = Object.keys(archiveDataset) as ArchiveSection[];

  const sidebarSections = sections.map((section) => ({
    id: section,
    label: sectionLabels[section],
    count: archiveDataset[section].length,
  }));

  return (
    <main className="px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[230px_1fr]">
        <ArchiveSidebar sections={sidebarSections} quickActions={quickActions} />

        <div>
          <header className="border-b border-[var(--border)] pb-5">
            <h1 className="text-3xl font-black text-[var(--primary)]">Archive</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              One continuous index of official school information.
            </p>

            <div className="mt-4 border-l-2 border-[var(--accent)] pl-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                How To Use
              </p>
              <p className="mt-1 text-sm text-[var(--primary)]">
                1) Jump to a section from the left nav. 2) Use global search for unknown info.
                3) If data is missing, submit a correction request.
              </p>
            </div>
          </header>

          <form className="mt-5 flex gap-2 border-b border-[var(--border)] pb-5" action="/archive" method="get">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search: robotics, handbook, Grade 11"
              className="w-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button type="submit" className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          {query ? (
            <section className="mt-5 border-b border-[var(--border)] pb-5">
              <h2 className="text-base font-bold text-[var(--primary)]">Search Results ({results.length})</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Query: {query}</p>
              <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {results.map((item) => (
                  <li key={`${item.section}-${item.id}`} className="py-2">
                    <p className="text-xs font-semibold text-[var(--accent)]">{sectionLabels[item.section]}</p>
                    <p className="text-sm font-semibold text-[var(--primary)]">{item.title}</p>
                    <p className="text-xs text-[var(--muted)]">{item.snippet}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-2">
            {sections.map((section) => {
              const items = archiveDataset[section];
              const meta = archiveSectionMeta[section];
              const topItems = items.slice(0, 3);
              return (
                <section id={section} key={section} className="scroll-mt-24 border-b border-[var(--border)] py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-xl font-bold text-[var(--primary)]">{sectionLabels[section]}</h2>
                    <span className="text-xs font-semibold text-[var(--muted)]">{items.length} items</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{sectionDescriptions[section]}</p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="font-semibold text-[var(--primary)]">
                      Source: <span className="font-normal">{meta.sourceDepartment}</span>
                    </span>
                    <span className="font-semibold text-[var(--primary)]">
                      Verification: <span className="font-normal">{meta.verification === "official" ? "Official" : "Reviewing"}</span>
                    </span>
                    <span className="font-semibold text-[var(--primary)]">
                      Last Updated: <span className="font-normal">{formatDate(meta.lastUpdated)}</span>
                    </span>
                  </div>

                  {topItems.length > 0 ? (
                    <>
                      <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                        {items.slice(0, 6).map((item) => (
                          <li key={`${section}-${String((item as { id: number }).id)}`} className="py-2 text-sm text-[var(--primary)]">
                            {previewText(item)}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Highlights</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {topItems.map((item, index) => (
                            <span
                              key={`${section}-highlight-${String((item as { id: number }).id)}`}
                              className="border border-[var(--border)] px-2 py-1 text-xs text-[var(--primary)]"
                            >
                              {getRankingLabel(section, index)}
                            </span>
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
              <Link href="/policy" className="ml-2 font-semibold text-[var(--accent)]">Read policy</Link>
              <Link href="/request-update" className="ml-3 font-semibold text-[var(--accent)]">Request correction</Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
