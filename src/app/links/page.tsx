import Link from "next/link";
import { schoolLinks } from "@/lib/schoolLinks";

export default function LinksPage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="border-b border-[var(--border)] pb-5">
          <h1 className="text-3xl font-black text-[var(--primary)]">School Links</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Official and community links related to school services.
          </p>
        </header>

        <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {schoolLinks.map((linkItem) => (
            <li key={linkItem.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-[var(--primary)]">{linkItem.name}</h2>
                <span className="text-xs font-semibold uppercase text-[var(--muted)]">{linkItem.type}</span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{linkItem.note}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Owner: {linkItem.owner} | Updated: {linkItem.updatedAt}</p>
              <Link href={linkItem.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]">
                Open link
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
