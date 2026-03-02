import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import { getSchoolLinkText, schoolLinks } from "@/lib/schoolLinks";

export default async function LinksPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">{dict.links.kicker}</p>
          <h1 className="text-3xl font-black text-[var(--primary)]">{dict.links.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{dict.links.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="section-chip">{dict.links.official}</span>
            <span className="section-chip">{dict.links.studentMade}</span>
            <span className="section-chip">{dict.links.community}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/request-update" className="text-[var(--accent)]">{dict.links.submitMissing}</Link>
            <Link href="/admin" className="text-[var(--accent)]">{dict.links.openAdmin}</Link>
          </div>
        </header>

        <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {schoolLinks.map((linkItem) => {
            const content = getSchoolLinkText(linkItem, locale);
            return (
              <li key={linkItem.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-[var(--primary)]">{content.name}</h2>
                  <span className="text-xs font-semibold uppercase text-[var(--muted)]">{linkItem.type}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{content.note}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{dict.links.owner}: {content.owner} | {dict.links.updated}: {linkItem.updatedAt}</p>
                <Link href={linkItem.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]">{dict.links.openLink}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
