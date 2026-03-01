import Link from "next/link";
import { getArchiveItemHref } from "@/lib/archivePresentation";
import type { ArchiveProject } from "@/lib/mockData";

async function getProjects(): Promise<ArchiveProject[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/projects`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  return (await res.json()) as ArchiveProject[];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <h1 className="text-3xl font-black text-[var(--primary)]">Projects</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Student and team project archive with direct links into the full record system.
          </p>
          <div className="mt-3">
            <Link href="/archive#projects" className="text-sm font-semibold text-[var(--accent)]">
              Go to Projects section in full archive
            </Link>
          </div>
        </header>

        <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {projects.map((project) => (
            <li key={project.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[var(--primary)]">{project.title}</h2>
                <div className="text-xs font-semibold text-[var(--muted)]">
                  {project.category} | {project.projectYear}
                </div>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{project.description}</p>
              <p className="mt-2 text-sm text-[var(--primary)]">Members: {project.members.join(", ")}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Tags: {project.tags.join(", ")}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href={getArchiveItemHref("projects", project.id)} className="text-[var(--accent)]">
                  Open detail
                </Link>
                <Link
                  href={`${getArchiveItemHref("projects", project.id)}/download`}
                  className="text-[var(--accent)]"
                >
                  Download record
                </Link>
                {project.githubUrl ? (
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)]"
                  >
                    GitHub
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
