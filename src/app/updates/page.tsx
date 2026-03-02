import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import { getUpdatePostText, updatePosts } from "@/lib/updatesData";

export default async function UpdatesPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">{dict.updates.kicker}</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">{dict.updates.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">{dict.updates.description}</p>
        </header>

        <div className="mt-6 space-y-8">
          {updatePosts.map((post, index) => {
            const content = getUpdatePostText(post, locale);
            return (
              <article key={post.slug} className="border-b border-[var(--border)] pb-8">
                <div className="section-cover section-cover-subtle px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="section-cover-kicker">{content.coverLabel} / {post.category}</p>
                      <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                        <Link href={`/updates/${post.slug}`}>{content.title}</Link>
                      </h2>
                    </div>
                    <div className="text-right text-xs font-semibold text-[var(--muted)]">
                      <p>{post.publishDate}</p>
                      <p className="mt-1">{content.author}</p>
                      <p className="mt-1">#{String(index + 1).padStart(2, "0")}</p>
                    </div>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">{content.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                    <Link href={`/updates/${post.slug}`} className="text-[var(--accent)]">{dict.updates.readPost}</Link>
                    {content.relatedLinks.slice(0, 2).map((link) => (
                      <Link key={link.href} href={link.href} className="text-[var(--accent)]">{link.label}</Link>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
