import Link from "next/link";
import type { ArchiveProject } from "@/lib/mockData";
import type { Locale } from "@/lib/i18n";
import { getLocalizedText } from "@/lib/localized";

interface ProjectCardProps {
  project: ArchiveProject;
  locale?: Locale;
}

export default function ProjectCard({ project, locale = "en" }: ProjectCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
          {project.category}
        </span>
        <span className="text-sm text-zinc-500">{project.projectYear}</span>
      </div>

      <h3 className="mb-2 text-lg font-bold text-zinc-900">{getLocalizedText(project.title, locale)}</h3>
      <p className="mb-4 text-sm leading-6 text-zinc-700">{getLocalizedText(project.description, locale)}</p>

      <p className="mb-3 text-sm text-zinc-600">
        {locale === "ko" ? "참여 인원" : "Members"}: {project.members.join(", ")}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
          >
            #{tag}
          </span>
        ))}
      </div>

      {project.githubUrl ? (
        <Link
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          {locale === "ko" ? "GitHub 보기" : "View GitHub"}
        </Link>
      ) : null}
    </article>
  );
}
