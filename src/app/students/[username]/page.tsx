import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import { getPublicStudentProfile } from "@/lib/students";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const dict = getDictionary(await getServerLocale());
  const { username } = await params;
  const student = await getPublicStudentProfile(username);

  if (!student) {
    notFound();
  }

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <section className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">{dict.students.publicProfile}</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{student.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="section-chip">{student.gradeLevel}</span>
            {student.graduationYear ? <span className="section-chip">{dict.students.classOf} {student.graduationYear}</span> : null}
            <span className="section-chip">@{student.username}</span>
          </div>
          {student.headline ? (
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{student.headline}</p>
          ) : null}
        </section>

        <div className="mt-6 grid gap-6">
          <section className="section-block px-6 py-6">
            <p className="section-cover-kicker">{dict.students.bio}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {student.bio || dict.students.noBio}
            </p>
          </section>

          <section className="section-block px-6 py-6">
            <p className="section-cover-kicker">{dict.students.targetMajors}</p>
            {student.targetMajors.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {student.targetMajors.map((major) => (
                  <span key={major} className="section-chip">{major}</span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">{dict.students.noMajors}</p>
            )}
          </section>

          <section className="section-block px-6 py-6">
            <p className="section-cover-kicker">{dict.students.publicProjects}</p>
            {student.publicProjects.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {student.publicProjects.map((project) => (
                  <article key={project.id} className="student-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-[var(--primary)]">{project.title}</h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {[project.year, project.status].filter(Boolean).join(" | ") || dict.students.project}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{project.summary}</p>
                    {project.link ? (
                      <div className="mt-4 text-sm font-semibold">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--accent)]"
                        >
                          {dict.students.openProjectLink}
                        </a>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">{dict.students.noPublicProjects}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
