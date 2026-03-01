export interface UpdatePost {
  slug: string;
  title: string;
  excerpt: string;
  publishDate: string;
  category: "announcement" | "highlight" | "editorial";
  author: string;
  coverLabel: string;
  body: string[];
  relatedLinks: { label: string; href: string }[];
}

export const updatePosts: UpdatePost[] = [
  {
    slug: "spring-archive-refresh",
    title: "Spring Archive Refresh: Profiles, Publications, and New Detail Views",
    excerpt:
      "School profiles, publications, and student project records now open into dedicated detail pages with cleaner download flows.",
    publishDate: "2026-03-01",
    category: "announcement",
    author: "Archive Team",
    coverLabel: "Archive Refresh",
    body: [
      "The archive now separates reference data from reading surfaces more clearly. Publications, school profiles, and project records no longer stop at a single list row.",
      "Each record now has a dedicated detail page with source context, metadata fields, and a download action for structured reuse.",
      "This change is aimed at making the archive usable both for quick lookup and for longer-form browsing when families, students, or staff want to understand context around a document.",
    ],
    relatedLinks: [
      { label: "Open archive", href: "/archive" },
      { label: "Browse publications", href: "/archive/publications" },
      { label: "Browse school profiles", href: "/archive/schoolProfiles" },
    ],
  },
  {
    slug: "schoolboj-and-community-links",
    title: "SchoolBOJ and Community Tools Are Now Listed Alongside Official Links",
    excerpt:
      "The new links directory brings official services and student-made tools into one place without mixing them into the archive record flow.",
    publishDate: "2026-02-28",
    category: "highlight",
    author: "Community Maintainers",
    coverLabel: "Community Layer",
    body: [
      "School-related links are now grouped into a dedicated directory instead of being scattered across archive sections.",
      "Official resources, student-made services such as SchoolBOJ, and community-maintained destinations are labeled separately so the difference is visible at a glance.",
      "This keeps the archive itself focused on records while still giving useful navigation shortcuts for everyday use.",
    ],
    relatedLinks: [
      { label: "Open school links", href: "/links" },
      { label: "Open admin intake", href: "/admin" },
    ],
  },
  {
    slug: "why-archive-needs-editorial-layer",
    title: "Why the Archive Needed an Editorial Layer",
    excerpt:
      "A pure archive is searchable but dry. A pure blog is readable but weak as a reference system. The new updates layer keeps both roles separate.",
    publishDate: "2026-02-27",
    category: "editorial",
    author: "Archive Team",
    coverLabel: "Editorial Note",
    body: [
      "This project is no longer trying to force every school artifact into one flat screen. Some content needs indexing. Some content needs explanation.",
      "The archive remains the durable reference layer, while updates now act as the story layer that explains what changed, what matters, and where to go next.",
      "That split should make the site feel more intentional without weakening the search and documentation side.",
    ],
    relatedLinks: [
      { label: "Open full archive", href: "/archive" },
      { label: "Browse projects", href: "/projects" },
    ],
  },
];

export function getUpdatePost(slug: string): UpdatePost | undefined {
  return updatePosts.find((post) => post.slug === slug);
}
