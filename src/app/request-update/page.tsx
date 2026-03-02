import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";

export default async function RequestUpdatePage() {
  const dict = getDictionary(await getServerLocale());

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="border-b border-[var(--border)] pb-5">
          <h1 className="text-3xl font-black text-[var(--primary)]">{dict.request.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {dict.request.description}
          </p>
        </header>

        <section className="py-5 text-sm text-[var(--muted)]">
          <p>{dict.request.sendFormat}</p>
          <ul className="mt-3 list-disc pl-6">
            <li>{dict.request.sectionName}</li>
            <li>{dict.request.currentValue}</li>
            <li>{dict.request.requestedCorrection}</li>
            <li>{dict.request.evidence}</li>
          </ul>
          <p className="mt-4">
            {dict.request.afterReview}
          </p>
          <Link href="/policy" className="mt-4 inline-block font-semibold text-[var(--accent)]">
            {dict.request.readPolicy}
          </Link>
        </section>
      </div>
    </main>
  );
}
