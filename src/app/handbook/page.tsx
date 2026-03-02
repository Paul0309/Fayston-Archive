import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import {
  formatHandbookCitation,
  getHandbookCorpus,
  getHandbookExcerpt,
  searchHandbook,
} from "@/lib/handbook";
import { getServerLocale } from "@/lib/serverLocale";

interface HandbookPageProps {
  searchParams: Promise<{ focus?: string }>;
}

export default async function HandbookPage({ searchParams }: HandbookPageProps) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const { focus = "" } = await searchParams;
  const trimmedFocus = focus.trim();

  const results = trimmedFocus ? await searchHandbook(trimmedFocus, 8) : [];
  const corpus = await getHandbookCorpus();
  const fallback = corpus.chunks.slice(0, 10).map((chunk) => ({ chunk, score: 0 }));
  const visible = results.length > 0 ? results : fallback;

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="border-b border-[var(--border)] pb-5">
          <p className="section-cover-kicker">{locale === "ko" ? "핸드북 뷰어" : "Handbook Viewer"}</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">
            {locale === "ko" ? "학생 핸드북" : "Student Handbook"}
          </h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            {trimmedFocus
              ? locale === "ko"
                ? `"${trimmedFocus}" 기준으로 관련 조항을 찾았습니다.`
                : `Showing handbook clauses related to "${trimmedFocus}".`
              : locale === "ko"
                ? "질문에서 연결된 조항을 집중해서 읽을 수 있는 뷰입니다."
                : "A focused view for reading clauses referenced by the assistant."}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/api/handbook/source" className="text-[var(--accent)]" target="_blank">
              {dict.counselor.openSource}
            </Link>
            <Link href="/" className="text-[var(--accent)]">
              {dict.nav.home}
            </Link>
          </div>
        </header>

        <section className="mt-6 space-y-4">
          {visible.map(({ chunk }) => (
            <article key={chunk.id} className="border border-[var(--border)] px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                {chunk.clause ? <span className="ai-reference-badge">{chunk.clause}</span> : null}
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {chunk.section}
                </p>
              </div>
              <h2 className="mt-3 text-xl font-black text-[var(--primary)]">{formatHandbookCitation(chunk)}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{getHandbookExcerpt(chunk, 2000)}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
