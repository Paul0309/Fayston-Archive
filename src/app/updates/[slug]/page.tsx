import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import { getUpdatePost, getUpdatePostText } from "@/lib/updatesData";

interface UpdateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UpdateDetailPage({ params }: UpdateDetailPageProps) {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const { slug } = await params;
  const post = getUpdatePost(slug);

  if (!post) notFound();

  const content = getUpdatePostText(post, locale);

  return (
    <main className="px-4 py-8">
      <article className="mx-auto w-full max-w-3xl">
        <nav className="text-sm font-semibold text-[var(--accent)]">
          <Link href="/updates">{dict.updates.title}</Link>
        </nav>

        <header className="section-cover mt-4 border border-[var(--border)] px-6 py-7">
          <p className="section-cover-kicker">{content.coverLabel} / {post.category}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--primary)]">{content.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[var(--muted)]">
            <span>{post.publishDate}</span>
            <span>{content.author}</span>
          </div>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">{content.excerpt}</p>
        </header>

        <div className="mt-8 space-y-5">
          {content.body.map((paragraph, index) => (
            <p key={index} className="text-[15px] leading-8 text-[var(--primary)]">{paragraph}</p>
          ))}
        </div>

        <section className="mt-8 border-t border-[var(--border)] pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{dict.updates.related}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
            {content.relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-[var(--accent)]">{link.label}</Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
