import type { Locale } from "@/lib/i18n";
import type { LocalizedText } from "@/lib/localized";
import { getLocalizedText, localized } from "@/lib/localized";

export interface UpdatePost {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  publishDate: string;
  category: "announcement" | "highlight" | "editorial";
  author: LocalizedText;
  coverLabel: LocalizedText;
  body: LocalizedText[];
  relatedLinks: { label: LocalizedText; href: string }[];
}

export const updatePosts: UpdatePost[] = [
  {
    slug: "spring-archive-refresh",
    title: localized(
      "Spring Archive Refresh: Profiles, Publications, and New Detail Views",
      "봄 아카이브 개편: 프로필, 간행물, 상세 뷰 추가",
    ),
    excerpt: localized(
      "School profiles, publications, and student project records now open into dedicated detail pages with cleaner download flows.",
      "학교 프로필, 간행물, 학생 프로젝트 기록에 전용 상세 페이지와 더 정돈된 다운로드 흐름을 붙였습니다.",
    ),
    publishDate: "2026-03-01",
    category: "announcement",
    author: localized("Archive Team", "아카이브 팀"),
    coverLabel: localized("Archive Refresh", "아카이브 개편"),
    body: [
      localized(
        "The archive now separates reference data from reading surfaces more clearly. Publications, school profiles, and project records no longer stop at a single list row.",
        "이제 아카이브는 참고용 기록과 읽기용 화면을 더 명확히 분리합니다. 간행물, 학교 프로필, 프로젝트 기록은 더 이상 한 줄 리스트에서 끝나지 않습니다.",
      ),
      localized(
        "Each record now has a dedicated detail page with source context, metadata fields, and a download action for structured reuse.",
        "각 기록마다 출처 맥락, 메타데이터 필드, 다운로드 액션이 포함된 전용 상세 페이지를 제공합니다.",
      ),
      localized(
        "This change is aimed at making the archive usable both for quick lookup and for longer-form browsing when families, students, or staff want to understand context around a document.",
        "이 변화는 빠른 조회뿐 아니라 학생, 학부모, 교직원이 문서의 맥락을 읽고 이해할 때도 아카이브가 잘 작동하도록 하기 위한 것입니다.",
      ),
    ],
    relatedLinks: [
      { label: localized("Open archive", "아카이브 열기"), href: "/archive" },
      { label: localized("Browse publications", "간행물 보기"), href: "/archive/publications" },
      { label: localized("Browse school profiles", "학교 프로필 보기"), href: "/archive/schoolProfiles" },
    ],
  },
  {
    slug: "schoolboj-and-community-links",
    title: localized(
      "SchoolBOJ and Community Tools Are Now Listed Alongside Official Links",
      "SchoolBOJ와 커뮤니티 도구를 공식 링크와 함께 정리했습니다",
    ),
    excerpt: localized(
      "The new links directory brings official services and student-made tools into one place without mixing them into the archive record flow.",
      "새 링크 디렉토리는 공식 서비스와 학생 제작 도구를 한곳에 모으되, 아카이브 기록 흐름과는 섞지 않도록 정리했습니다.",
    ),
    publishDate: "2026-02-28",
    category: "highlight",
    author: localized("Community Maintainers", "커뮤니티 운영진"),
    coverLabel: localized("Community Layer", "커뮤니티 레이어"),
    body: [
      localized(
        "School-related links are now grouped into a dedicated directory instead of being scattered across archive sections.",
        "학교 관련 링크는 이제 여러 아카이브 섹션에 흩어지지 않고 전용 디렉토리로 모였습니다.",
      ),
      localized(
        "Official resources, student-made services such as SchoolBOJ, and community-maintained destinations are labeled separately so the difference is visible at a glance.",
        "공식 자료, SchoolBOJ 같은 학생 제작 서비스, 커뮤니티 운영 링크를 구분해 한눈에 차이가 보이도록 했습니다.",
      ),
      localized(
        "This keeps the archive itself focused on records while still giving useful navigation shortcuts for everyday use.",
        "아카이브는 기록 중심으로 유지하면서도 일상적으로 유용한 탐색 바로가기는 제공하려는 의도입니다.",
      ),
    ],
    relatedLinks: [
      { label: localized("Open school links", "학교 링크 열기"), href: "/links" },
      { label: localized("Open admin intake", "관리 입력 열기"), href: "/admin" },
    ],
  },
  {
    slug: "why-archive-needs-editorial-layer",
    title: localized(
      "Why the Archive Needed an Editorial Layer",
      "왜 아카이브에 에디토리얼 레이어가 필요했는가",
    ),
    excerpt: localized(
      "A pure archive is searchable but dry. A pure blog is readable but weak as a reference system. The new updates layer keeps both roles separate.",
      "순수 아카이브는 검색은 강하지만 건조하고, 순수 블로그는 읽기 좋지만 참고 시스템으로는 약합니다. 새 업데이트 레이어는 두 역할을 분리합니다.",
    ),
    publishDate: "2026-02-27",
    category: "editorial",
    author: localized("Archive Team", "아카이브 팀"),
    coverLabel: localized("Editorial Note", "에디토리얼 노트"),
    body: [
      localized(
        "This project is no longer trying to force every school artifact into one flat screen. Some content needs indexing. Some content needs explanation.",
        "이 프로젝트는 더 이상 모든 학교 자료를 하나의 평면 화면에 밀어 넣으려 하지 않습니다. 어떤 콘텐츠는 인덱싱이 필요하고, 어떤 콘텐츠는 설명이 필요합니다.",
      ),
      localized(
        "The archive remains the durable reference layer, while updates now act as the story layer that explains what changed, what matters, and where to go next.",
        "아카이브는 여전히 오래 남는 참고 레이어이고, 업데이트는 무엇이 바뀌었고 무엇이 중요한지, 어디로 가야 하는지를 설명하는 스토리 레이어 역할을 합니다.",
      ),
      localized(
        "That split should make the site feel more intentional without weakening the search and documentation side.",
        "이 분리는 검색성과 문서성을 약화시키지 않으면서도 사이트 전체를 더 의도적으로 느끼게 할 것입니다.",
      ),
    ],
    relatedLinks: [
      { label: localized("Open full archive", "전체 아카이브 열기"), href: "/archive" },
      { label: localized("Browse projects", "프로젝트 보기"), href: "/projects" },
    ],
  },
];

export function getUpdatePost(slug: string): UpdatePost | undefined {
  return updatePosts.find((post) => post.slug === slug);
}

export function getUpdatePostText(post: UpdatePost, locale: Locale) {
  return {
    title: getLocalizedText(post.title, locale),
    excerpt: getLocalizedText(post.excerpt, locale),
    author: getLocalizedText(post.author, locale),
    coverLabel: getLocalizedText(post.coverLabel, locale),
    body: post.body.map((paragraph) => getLocalizedText(paragraph, locale)),
    relatedLinks: post.relatedLinks.map((link) => ({
      href: link.href,
      label: getLocalizedText(link.label, locale),
    })),
  };
}
