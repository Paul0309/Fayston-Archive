import Link from "next/link";

export default function RequestUpdatePage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="border-b border-[var(--border)] pb-5">
          <h1 className="text-3xl font-black text-[var(--primary)]">Request Update</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Report missing, outdated, or incorrect archive information.
          </p>
        </header>

        <section className="py-5 text-sm text-[var(--muted)]">
          <p>Send update requests with the following format to archive-admin@fayston.org:</p>
          <ul className="mt-3 list-disc pl-6">
            <li>Section name (example: Awards, Publications)</li>
            <li>Current value</li>
            <li>Requested correction</li>
            <li>Evidence link or source document</li>
          </ul>
          <p className="mt-4">
            After review, approved updates are reflected in the next archive sync cycle.
          </p>
          <Link href="/policy" className="mt-4 inline-block font-semibold text-[var(--accent)]">
            Read policy
          </Link>
        </section>
      </div>
    </main>
  );
}
