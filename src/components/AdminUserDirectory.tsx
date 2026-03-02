import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getAdminManagedUsers } from "@/lib/adminUsers";

function formatDate(value: string) {
  return value ? value.slice(0, 10) : "-";
}

export default async function AdminUserDirectory({ locale }: { locale: Locale }) {
  const users = await getAdminManagedUsers();

  return (
    <section className="section-block px-6 py-6">
      <div className="personal-section-head">
        <div>
          <p className="section-cover-kicker">{locale === "ko" ? "사용자" : "Users"}</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
            {locale === "ko" ? "등록된 학생 및 사용자" : "Registered Students and Users"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            {locale === "ko"
              ? "관리자는 여기서 가입된 사용자 목록을 보고, 각 사용자의 비공개 마이페이지나 공개 프로필로 바로 이동할 수 있습니다."
              : "Admins can review registered users here and jump directly to each private page or public profile."}
          </p>
        </div>
        <div className="personal-meta">
          <span>{users.length} {locale === "ko" ? "users" : "users"}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {users.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            {locale === "ko" ? "등록된 사용자가 아직 없습니다." : "No registered users yet."}
          </p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="personal-card-grid">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[var(--primary)]">{user.name}</p>
                    <span className="section-chip">{user.role}</span>
                    <span className="section-chip">{user.profileVisibility}</span>
                    {user.gradeLevel ? <span className="section-chip">{user.gradeLevel}</span> : null}
                    {user.graduationYear ? <span className="section-chip">{user.graduationYear}</span> : null}
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {user.username ? `@${user.username}` : "-"}
                    {user.email ? ` | ${user.email}` : ""}
                    {` | ${locale === "ko" ? "Updated" : "Updated"} ${formatDate(user.updatedAt)}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  {user.username ? (
                    <Link href={`/people/${user.username}`} className="text-[var(--accent)]">
                      {locale === "ko" ? "비공개 페이지 관리" : "Manage private page"}
                    </Link>
                  ) : null}
                  {user.username && user.profileVisibility === "DIRECTORY" ? (
                    <Link href={`/students/${user.username}`} className="text-[var(--accent)]">
                      {locale === "ko" ? "공개 프로필 보기" : "Open public profile"}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
