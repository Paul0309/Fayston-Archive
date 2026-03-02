import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import AdminIntakePanel from "@/components/AdminIntakePanel";
import AdminArchiveEditor from "@/components/AdminArchiveEditor";
import AdminUserDirectory from "@/components/AdminUserDirectory";
import { authOptions } from "@/lib/auth";
import type { ArchiveSection } from "@/lib/archiveData";
import { getDictionary } from "@/lib/i18n";
import { isArchiveSection } from "@/lib/archivePresentation";
import { isAdminRole } from "@/lib/roles";
import { getServerLocale } from "@/lib/serverLocale";

interface AdminPageProps {
  searchParams: Promise<{
    section?: string;
    sourceId?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdminRole(session.user.role)) {
    redirect("/me");
  }

  const initialSection = isArchiveSection(params.section ?? "")
    ? (params.section as ArchiveSection)
    : "projects";
  const parsedSourceId = Number(params.sourceId);
  const initialSourceId = Number.isFinite(parsedSourceId) ? parsedSourceId : null;

  return (
    <main className="px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">{dict.admin.kicker}</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{dict.admin.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {dict.admin.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/archive" className="text-[var(--accent)]">
              {dict.admin.openArchive}
            </Link>
            <Link href="/updates" className="text-[var(--accent)]">
              {dict.admin.openUpdates}
            </Link>
            <Link href="/links" className="text-[var(--accent)]">
              {dict.admin.reviewLinks}
            </Link>
            <Link href="/request-update" className="text-[var(--accent)]">
              {dict.admin.correctionIntake}
            </Link>
            <Link href="/me" className="text-[var(--accent)]">
              {dict.admin.myPrivatePage}
            </Link>
          </div>
        </header>

        <AdminUserDirectory locale={locale} />
        <AdminArchiveEditor initialSection={initialSection} initialSourceId={initialSourceId} />
        <AdminIntakePanel />
      </div>
    </main>
  );
}
