import Link from "next/link";
import AdminIntakePanel from "@/components/AdminIntakePanel";

export default function AdminPage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">Internal Tools</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">Archive Admin</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Lightweight intake surface for data cleanup and mock submission formatting.
            This page is intentionally simple until real auth and persistence are added.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/archive" className="text-[var(--accent)]">
              Open archive
            </Link>
            <Link href="/links" className="text-[var(--accent)]">
              Review school links
            </Link>
            <Link href="/request-update" className="text-[var(--accent)]">
              View correction intake
            </Link>
          </div>
        </header>

        <AdminIntakePanel />
      </div>
    </main>
  );
}
