import { notFound } from "next/navigation";
import { getPublicStudentProfile } from "@/lib/students";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const student = await getPublicStudentProfile(username);

  if (!student) {
    notFound();
  }

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <section className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">Public Student Profile</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{student.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="section-chip">{student.gradeLevel}</span>
            {student.graduationYear ? <span className="section-chip">Class of {student.graduationYear}</span> : null}
            <span className="section-chip">@{student.username}</span>
          </div>
          {student.headline ? (
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{student.headline}</p>
          ) : null}
        </section>

        <div className="mt-6 grid gap-6">
          <section className="section-block px-6 py-6">
            <p className="section-cover-kicker">Bio</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {student.bio || "No public bio added yet."}
            </p>
          </section>

          <section className="section-block px-6 py-6">
            <p className="section-cover-kicker">Target Majors</p>
            {student.targetMajors.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {student.targetMajors.map((major) => (
                  <span key={major} className="section-chip">{major}</span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">No public majors listed.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
