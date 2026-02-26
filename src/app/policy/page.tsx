export default function PolicyPage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="border-b border-[var(--border)] pb-5">
          <h1 className="text-3xl font-black text-[var(--primary)]">Archive Policy</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Privacy, copyright, and correction policy for archive data.
          </p>
        </header>

        <section className="border-b border-[var(--border)] py-5">
          <h2 className="text-lg font-bold text-[var(--primary)]">Privacy and Consent</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Personal profile details are published only with explicit consent.
            Requests for removal are processed by the archive admin team.
          </p>
        </section>

        <section className="border-b border-[var(--border)] py-5">
          <h2 className="text-lg font-bold text-[var(--primary)]">Copyright</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Student work remains owned by the original creators unless otherwise agreed.
            Publication in archive requires permission confirmation.
          </p>
        </section>

        <section className="py-5">
          <h2 className="text-lg font-bold text-[var(--primary)]">Corrections</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            If information is outdated or incorrect, submit a correction request from the request page.
          </p>
        </section>
      </div>
    </main>
  );
}
