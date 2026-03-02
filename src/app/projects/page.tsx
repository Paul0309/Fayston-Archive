import Link from "next/link";
import { getServerSession } from "next-auth";
import { getRuntimeArchiveSectionItems } from "@/lib/archiveAdminStore";
import { authOptions } from "@/lib/auth";
import type { ArchiveProject } from "@/lib/archiveData";
import { getArchiveItemHref } from "@/lib/archivePresentation";
import { getDictionary } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/localized";
import { isAdminRole } from "@/lib/roles";
import { getServerLocale } from "@/lib/serverLocale";

export default async function ProjectsPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const session = await getServerSession(authOptions);
  const canManage = isAdminRole(session?.user?.role);
  const projects = (await getRuntimeArchiveSectionItems("projects")) as ArchiveProject[];

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <h1 className="text-3xl font-black text-[var(--primary)]">{dict.projects.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{dict.projects.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/archive#projects" className="text-[var(--accent)]">{dict.projects.goToArchive}</Link>
            {canManage ? (
              <Link href="/admin?section=projects" className="text-[var(--accent)]">
                {locale === "ko" ? "관리자 수정" : "Admin edit"}
              </Link>
            ) : null}
          </div>
        </header>

        <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {projects.map((project) => (
            <li key={project.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[var(--primary)]">{getLocalizedText(project.title, locale)}</h2>
                <div className="text-xs font-semibold text-[var(--muted)]">{project.category} | {project.projectYear}</div>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{getLocalizedText(project.description, locale)}</p>
              <p className="mt-2 text-sm text-[var(--primary)]">{dict.projects.members}: {project.members.join(", ")}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{dict.projects.tags}: {project.tags.join(", ")}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href={getArchiveItemHref("projects", project.id)} className="text-[var(--accent)]">{dict.projects.openDetail}</Link>
                <Link href={`${getArchiveItemHref("projects", project.id)}/download`} className="text-[var(--accent)]">{dict.projects.downloadRecord}</Link>
                {project.githubUrl ? <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">GitHub</Link> : null}
                {canManage ? (
                  <Link href={`/admin?section=projects&sourceId=${project.id}`} className="text-[var(--accent)]">
                    {locale === "ko" ? "수정" : "Edit"}
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