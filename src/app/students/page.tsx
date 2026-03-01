import Link from "next/link";
import { getPublicStudentProfiles, groupStudentsByGrade } from "@/lib/students";

export default async function StudentsPage() {
  const students = await getPublicStudentProfiles();
  const groups = groupStudentsByGrade(students);
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
          <p className="section-cover-kicker">Student Directory</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">Students</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Public student profiles grouped by grade. Only members who explicitly switched their profile
            visibility to directory listing appear here.
          </p>
          <p className="mt-4 text-xs font-semibold text-[var(--muted)]">
            {students.length} public profiles
          </p>
        </section>

        <div className="mt-6 grid gap-6">
          {orderedGrades.length === 0 ? (
            <section className="section-block px-6 py-6">
              <p className="text-sm text-[var(--muted)]">No public student profiles yet.</p>
            </section>
          ) : (
            orderedGrades.map((grade) => (
              <section key={grade} className="section-block px-6 py-6">
                <div className="personal-section-head">
                  <div>
                    <p className="section-cover-kicker">Grade Group</p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{grade}</h2>
                  </div>
                  <p className="text-sm font-semibold text-[var(--muted)]">{groups[grade].length} students</p>
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
                          <span className="section-chip">Class of {student.graduationYear}</span>
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
                          Open public profile
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
