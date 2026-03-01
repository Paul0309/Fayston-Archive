import Link from "next/link";
import { notFound } from "next/navigation";
import { getUpdatePost } from "@/lib/updatesData";

interface UpdateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UpdateDetailPage({ params }: UpdateDetailPageProps) {
  const { slug } = await params;
  const post = getUpdatePost(slug);

  if (!post) notFound();

  return (
    <main className="px-4 py-8">
      <article className="mx-auto w-full max-w-3xl">
        <nav className="text-sm font-semibold text-[var(--accent)]">
          <Link href="/updates">Updates</Link>
        </nav>

        <header className="section-cover mt-4 border border-[var(--border)] px-6 py-7">
          <p className="section-cover-kicker">
            {post.coverLabel} · {post.category}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--primary)]">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[var(--muted)]">
            <span>{post.publishDate}</span>
            <span>{post.author}</span>
          </div>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">{post.excerpt}</p>
        </header>

        <div className="mt-8 space-y-5">
          {post.body.map((paragraph, index) => (
            <p key={index} className="text-[15px] leading-8 text-[var(--primary)]">
              {paragraph}
            </p>
          ))}
        </div>

        <section className="mt-8 border-t border-[var(--border)] pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Related
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
            {post.relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-[var(--accent)]">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
