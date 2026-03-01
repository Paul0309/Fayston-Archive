import Link from "next/link";
import { updatePosts } from "@/lib/updatesData";

export default function UpdatesPage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="section-cover border border-[var(--border)] px-6 py-6">
          <p className="section-cover-kicker">Editorial Layer</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">Updates</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Reading-first posts for new releases, notable archive changes, and highlighted school
            material. This layer explains what changed. The archive keeps the records.
          </p>
        </header>

        <div className="mt-6 space-y-8">
          {updatePosts.map((post, index) => (
            <article
              key={post.slug}
              className="border-b border-[var(--border)] pb-8"
            >
              <div className="section-cover section-cover-subtle px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="section-cover-kicker">
                      {post.coverLabel} · {post.category}
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                      <Link href={`/updates/${post.slug}`}>{post.title}</Link>
                    </h2>
                  </div>
                  <div className="text-right text-xs font-semibold text-[var(--muted)]">
                    <p>{post.publishDate}</p>
                    <p className="mt-1">{post.author}</p>
                    <p className="mt-1">#{String(index + 1).padStart(2, "0")}</p>
                  </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                  <Link href={`/updates/${post.slug}`} className="text-[var(--accent)]">
                    Read post
                  </Link>
                  {post.relatedLinks.slice(0, 2).map((link) => (
                    <Link key={link.href} href={link.href} className="text-[var(--accent)]">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
