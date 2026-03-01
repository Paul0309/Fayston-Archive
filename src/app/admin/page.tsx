import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import AdminIntakePanel from "@/components/AdminIntakePanel";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdminRole(session.user.role)) {
    redirect("/me");
  }

  return (
    <main className="px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">Internal Tools</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">Archive Admin</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Lightweight intake surface for both structured archive records and update posts.
            This page remains intentionally simple until real auth and review queues are added.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/archive" className="text-[var(--accent)]">
              Open archive
            </Link>
            <Link href="/updates" className="text-[var(--accent)]">
              Open updates
            </Link>
            <Link href="/links" className="text-[var(--accent)]">
              Review school links
            </Link>
            <Link href="/request-update" className="text-[var(--accent)]">
              View correction intake
            </Link>
            <Link href="/me" className="text-[var(--accent)]">
              Open my private page
            </Link>
          </div>
        </header>

        <AdminIntakePanel />
      </div>
    </main>
  );
}
