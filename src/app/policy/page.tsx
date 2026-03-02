import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";

export default async function PolicyPage() {
  const dict = getDictionary(await getServerLocale());

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="border-b border-[var(--border)] pb-5">
          <h1 className="text-3xl font-black text-[var(--primary)]">{dict.policy.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {dict.policy.description}
          </p>
        </header>

        <section className="border-b border-[var(--border)] py-5">
          <h2 className="text-lg font-bold text-[var(--primary)]">{dict.policy.privacy}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {dict.policy.privacyBody}
          </p>
        </section>

        <section className="border-b border-[var(--border)] py-5">
          <h2 className="text-lg font-bold text-[var(--primary)]">{dict.policy.copyright}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {dict.policy.copyrightBody}
          </p>
        </section>

        <section className="py-5">
          <h2 className="text-lg font-bold text-[var(--primary)]">{dict.policy.corrections}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {dict.policy.correctionsBody}
          </p>
        </section>
      </div>
    </main>
  );
}
