import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import { filterStudents, getPublicStudentProfiles, groupStudentsByGrade } from "@/lib/students";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; grade?: string }>;
}) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const params = (await searchParams) ?? {};
  const query = params.q ?? "";
  const grade = params.grade ?? "All";
  const students = await getPublicStudentProfiles();
  const filteredStudents = filterStudents(students, query, grade);
  const groups = groupStudentsByGrade(filteredStudents);
  const gradeOrder = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Graduate", "Unspecified"];
  const orderedGrades = Object.keys(groups).sort((a, b) => {
    const left = gradeOrder.indexOf(a);
    const right = gradeOrder.indexOf(b);
    if (left === -1 && right === -1) return a.localeCompare(b);
    if (left === -1) return 1;
    if (right === -1) return -1;
    return left - right;
  });

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <section className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">{dict.students.kicker}</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{dict.students.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {dict.students.description}
          </p>
          <p className="mt-4 text-xs font-semibold text-[var(--muted)]">
            {locale === "ko"
              ? `${filteredStudents.length} / ${students.length}${dict.students.publicProfiles}`
              : `${filteredStudents.length} of ${students.length} ${dict.students.publicProfiles}`}
          </p>
        </section>

        <section className="section-block px-6 py-5">
          <form className="archive-filters-grid" method="GET">
            <input
              type="search"
              name="q"
              defaultValue={query}
              className="archive-filter-input"
              placeholder={dict.students.searchPlaceholder}
            />
            <select name="grade" defaultValue={grade} className="archive-filter-input">
              <option value="All">{dict.students.allGrades}</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
              <option value="Graduate">Graduate</option>
              <option value="Unspecified">Unspecified</option>
            </select>
            <button type="submit" className="archive-search-button">{dict.students.filter}</button>
            <Link href="/students" className="archive-reset-button">
              {dict.students.reset}
            </Link>
          </form>
        </section>

        <div className="mt-6 grid gap-6">
          {orderedGrades.length === 0 ? (
            <section className="section-block px-6 py-6">
              <p className="text-sm text-[var(--muted)]">
                {students.length === 0 ? dict.students.noProfiles : dict.students.noMatches}
              </p>
            </section>
          ) : (
            orderedGrades.map((grade) => (
              <section key={grade} className="section-block px-6 py-6">
                <div className="personal-section-head">
                  <div>
                    <p className="section-cover-kicker">{dict.students.gradeGroup}</p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{grade}</h2>
                  </div>
                  <p className="text-sm font-semibold text-[var(--muted)]">{groups[grade].length} {dict.students.students}</p>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {groups[grade].map((student) => (
                    <article key={student.username} className="student-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-[var(--primary)]">
                            <Link href={`/students/${student.username}`}>{student.name}</Link>
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                            @{student.username}
                          </p>
                        </div>
                        {student.graduationYear ? (
                          <span className="section-chip">{dict.students.classOf} {student.graduationYear}</span>
                        ) : null}
                      </div>

                      {student.headline ? (
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{student.headline}</p>
                      ) : null}

                      {student.targetMajors.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {student.targetMajors.map((major) => (
                            <span key={major} className="section-chip">{major}</span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 text-sm font-semibold">
                        <Link href={`/students/${student.username}`} className="text-[var(--accent)]">
                          {dict.students.openPublicProfile}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
