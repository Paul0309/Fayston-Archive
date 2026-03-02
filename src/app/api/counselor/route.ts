import { NextResponse } from "next/server";
import type { ArchiveSection } from "@/lib/archiveData";
import { archiveDataset } from "@/lib/archiveData";
import {
  formatHandbookCitation,
  getHandbookExcerpt,
  getHandbookViewHref,
  searchHandbook,
} from "@/lib/handbook";
import { getLocalizedText } from "@/lib/localized";
import { mockProjects } from "@/lib/mockData";
import { schoolLinks } from "@/lib/schoolLinks";
import { updatePosts } from "@/lib/updatesData";

type CounselorContext = "handbook" | "archive" | "links" | "projects";

interface CounselorReference {
  label: string;
  title: string;
  excerpt: string;
  href?: string;
  badge?: string;
}

function normalize(input: string) {
  return input.toLowerCase();
}

function detectLanguage(text: string): "ko" | "en" {
  return /[가-힣]/.test(text) ? "ko" : "en";
}

function containsAny(input: string, words: string[]) {
  return words.some((word) => input.includes(word));
}

function tokenize(input: string) {
  return Array.from(new Set(normalize(input).match(/[a-z0-9가-힣.+/-]+/g) ?? []));
}

async function runOpenAIText(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_COUNSELOR_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a precise school handbook and archive assistant. Answer in the same language as the user. Use only the supplied evidence. Explicitly cite clause numbers or source labels when available. If evidence is partial, say so plainly.",
        },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function getArchiveSectionFriendly(section: ArchiveSection, locale: "ko" | "en") {
  const labels: Record<ArchiveSection, { ko: string; en: string }> = {
    projects: { ko: "학생 프로젝트", en: "Student Projects" },
    awards: { ko: "수상 기록", en: "Awards" },
    varsityTeams: { ko: "바시티 팀", en: "Varsity Teams" },
    courseAnnouncements: { ko: "강의 공지", en: "Course Announcements" },
    clubReports: { ko: "동아리 및 학생회 보고서", en: "Club / Council Reports" },
    schoolEvents: { ko: "학교 행사", en: "School Events" },
    publications: { ko: "간행물", en: "Publications" },
    schoolProfiles: { ko: "학교 프로필", en: "School Profiles" },
    buildingHistory: { ko: "건물 변천사", en: "Building History" },
    alumniProfiles: { ko: "동문 프로필", en: "Alumni Profiles" },
    gradeTasks: { ko: "학년별 과제", en: "Grade Tasks" },
  };
  return labels[section][locale];
}

function searchPolicyReferences(question: string, locale: "ko" | "en"): CounselorReference[] {
  const q = normalize(question);
  const refs: CounselorReference[] = [];

  if (containsAny(q, ["privacy", "consent", "개인정보", "동의"])) {
    refs.push({
      label: locale === "ko" ? "정책" : "Policy",
      badge: locale === "ko" ? "정책" : "Policy",
      title: locale === "ko" ? "개인정보 및 동의" : "Privacy and Consent",
      excerpt:
        locale === "ko"
          ? "개인 프로필 정보는 명시적 동의가 있을 때만 공개되며 삭제 요청은 아카이브 관리자 팀이 처리합니다."
          : "Personal profile details are published only with explicit consent, and removal requests are processed by the archive admin team.",
      href: "/policy",
    });
  }

  if (containsAny(q, ["copyright", "저작권", "remove", "삭제", "correction", "정정"])) {
    refs.push({
      label: locale === "ko" ? "정책" : "Policy",
      badge: locale === "ko" ? "정책" : "Policy",
      title: locale === "ko" ? "저작권 및 정정" : "Copyright and Corrections",
      excerpt:
        locale === "ko"
          ? "학생 작업물은 원저작자에게 귀속되며, 오래되었거나 잘못된 정보는 수정 요청 페이지에서 정정할 수 있습니다."
          : "Student work remains owned by original creators, and outdated or incorrect information can be corrected through the request page.",
      href: "/policy",
    });
  }

  return refs;
}

function searchUpdateReferences(question: string, locale: "ko" | "en"): CounselorReference[] {
  const tokens = tokenize(question);

  return updatePosts
    .map((post) => {
      const haystack = normalize(
        `${post.title.en} ${post.title.ko} ${post.excerpt.en} ${post.excerpt.ko} ${post.body.map((item) => `${item.en} ${item.ko}`).join(" ")}`,
      );
      let score = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) score += token.length > 3 ? 2 : 1;
      }
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ post }) => ({
      label: locale === "ko" ? "업데이트" : "Update",
      badge: locale === "ko" ? "업데이트" : "Update",
      title: getLocalizedText(post.title, locale),
      excerpt: getLocalizedText(post.excerpt, locale),
      href: `/updates/${post.slug}`,
    }));
}

function searchArchiveRecordReferences(question: string, locale: "ko" | "en"): CounselorReference[] {
  const tokens = tokenize(question);
  if (tokens.length === 0) return [];

  const refs: Array<{ score: number; ref: CounselorReference }> = [];

  (Object.entries(archiveDataset) as unknown as Array<[ArchiveSection, unknown[]]>).forEach(
    ([section, items]) => {
      items.forEach((item, index) => {
        const text = normalize(JSON.stringify(item));
        let score = 0;
        for (const token of tokens) {
          if (text.includes(token)) score += token.length > 3 ? 2 : 1;
        }
        if (score > 0) {
          refs.push({
            score,
            ref: {
              label: locale === "ko" ? "아카이브 기록" : "Archive Record",
              badge: getArchiveSectionFriendly(section, locale),
              title: `${getArchiveSectionFriendly(section, locale)} #${index + 1}`,
              excerpt:
                locale === "ko"
                  ? `${getArchiveSectionFriendly(section, locale)} 섹션의 관련 기록입니다.`
                  : `Relevant record in the ${getArchiveSectionFriendly(section, locale)} section.`,
              href: `/archive/${section}`,
            },
          });
        }
      });
    },
  );

  return refs
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.ref);
}

function answerForLinks(question: string, locale: "ko" | "en") {
  const q = normalize(question);

  if (containsAny(q, ["official", "공식", "website", "웹사이트", "school site"])) {
    const official = schoolLinks.find((link) => link.type === "official");
    if (official) {
      return {
        answer:
          locale === "ko"
            ? `대표 공식 링크는 ${getLocalizedText(official.name, "ko")} (${official.url}) 입니다.`
            : `The main official link is ${getLocalizedText(official.name, "en")} (${official.url}).`,
        references: [
          {
            label: locale === "ko" ? "학교 링크" : "School Link",
            badge: locale === "ko" ? "공식" : "Official",
            title: getLocalizedText(official.name, locale),
            excerpt: getLocalizedText(official.note, locale),
            href: official.url,
          },
        ],
      };
    }
  }

  if (containsAny(q, ["schoolboj", "boj", "student-made", "학생"])) {
    const studentMade = schoolLinks.filter((link) => link.type === "student-made");
    if (studentMade.length > 0) {
      return {
        answer:
          locale === "ko"
            ? `학생 제작 링크로는 ${studentMade.map((link) => `${getLocalizedText(link.name, locale)} (${link.url})`).join(", ")} 등이 있습니다.`
            : `Student-made links include ${studentMade.map((link) => `${getLocalizedText(link.name, locale)} (${link.url})`).join(", ")}.`,
        references: studentMade.map((link) => ({
          label: locale === "ko" ? "학생 제작 링크" : "Student-made Link",
          badge: locale === "ko" ? "학생 제작" : "Student-made",
          title: getLocalizedText(link.name, locale),
          excerpt: getLocalizedText(link.note, locale),
          href: link.url,
        })),
      };
    }
  }

  return {
    answer:
      locale === "ko"
        ? `우선 확인할 링크는 ${schoolLinks.slice(0, 3).map((link) => `${getLocalizedText(link.name, locale)} (${link.url})`).join(", ")} 입니다.`
        : `Start with these school links: ${schoolLinks.slice(0, 3).map((link) => `${getLocalizedText(link.name, locale)} (${link.url})`).join(", ")}.`,
    references: schoolLinks.slice(0, 3).map((link) => ({
      label: locale === "ko" ? "학교 링크" : "School Link",
      badge:
        link.type === "official" ? (locale === "ko" ? "공식" : "Official") : locale === "ko" ? "링크" : "Link",
      title: getLocalizedText(link.name, locale),
      excerpt: getLocalizedText(link.note, locale),
      href: link.url,
    })),
  };
}

function answerForProjects(question: string, locale: "ko" | "en") {
  const csProjects = mockProjects.filter((project) =>
    containsAny(`${project.title.en} ${project.description.en} ${project.tags.join(" ")}`.toLowerCase(), [
      "computer",
      "ai",
      "data",
      "graph",
      "programming",
      "capstone",
    ]),
  );

  const projectRefs = (projects: typeof mockProjects) =>
    projects.map((project) => ({
      label: locale === "ko" ? "프로젝트 기록" : "Project Record",
      badge: project.projectYear.toString(),
      title: project.title[locale],
      excerpt: project.description[locale],
      href: "/projects",
    }));

  const q = normalize(question);
  if (containsAny(q, ["recent", "latest", "최근"])) {
    const recent = [...mockProjects].sort((a, b) => b.projectYear - a.projectYear).slice(0, 3);
    return {
      answer:
        locale === "ko"
          ? `최근 프로젝트 기록으로는 ${recent.map((project) => `${project.title[locale]} (${project.projectYear})`).join(", ")} 등이 있습니다.`
          : `Recent project records include ${recent.map((project) => `${project.title[locale]} (${project.projectYear})`).join(", ")}.`,
      references: projectRefs(recent),
    };
  }

  if (containsAny(q, ["cs", "computer", "ai", "컴퓨터"])) {
    const subset = csProjects.slice(0, 3);
    return {
      answer:
        locale === "ko"
          ? `컴퓨터사이언스 관련 프로젝트로는 ${subset.map((project) => `${project.title[locale]} (${project.projectYear})`).join(", ")} 등이 있습니다.`
          : `Computer-science-related project records include ${subset.map((project) => `${project.title[locale]} (${project.projectYear})`).join(", ")}.`,
      references: projectRefs(subset),
    };
  }

  return {
    answer:
      locale === "ko"
        ? "/projects 에서는 프로젝트 목록을, /archive 의 Projects 섹션에서는 기록형 메타데이터를 볼 수 있습니다."
        : "Use /projects for the project list view, or open the Projects section inside /archive for record metadata.",
    references: [],
  };
}

function answerForArchive(question: string, locale: "ko" | "en", archiveSection?: ArchiveSection | null) {
  const q = normalize(question);
  const references: CounselorReference[] = [];

  if (archiveSection) {
    references.push({
      label: locale === "ko" ? "현재 섹션" : "Current Section",
      badge: locale === "ko" ? "현재" : "Now",
      title: getArchiveSectionFriendly(archiveSection, locale),
      excerpt:
        locale === "ko"
          ? `현재 ${getArchiveSectionFriendly(archiveSection, locale)} 섹션을 보고 있습니다.`
          : `You are currently viewing the ${getArchiveSectionFriendly(archiveSection, locale)} section.`,
      href: `/archive/${archiveSection}`,
    });
  }

  if (containsAny(q, ["robotics", "로보틱스"])) {
    return {
      answer:
        locale === "ko"
          ? "로보틱스 관련 기록은 Awards, Varsity Teams, Student Projects부터 보면 됩니다. 수상, 팀 이력, 프로젝트 기록이 각각 나뉘어 있습니다."
          : "Start in Awards, Varsity Teams, and Student Projects. Those sections contain robotics awards, varsity team history, and project records.",
      references,
    };
  }

  if (containsAny(q, ["profile", "publication", "간행물", "school profile", "handbook"])) {
    return {
      answer:
        locale === "ko"
          ? "핸드북과 위클리 레터는 Publications, 학사년도별 학교 프로필 문서는 School Profiles 섹션을 쓰면 됩니다."
          : "Use Publications for handbooks and weekly letters, and School Profiles for academic-year school profile documents.",
      references,
    };
  }

  if (containsAny(q, ["task", "grade", "course", "announcement", "과제", "공지"])) {
    return {
      answer:
        locale === "ko"
          ? "학년별 할 일은 Grade Tasks, 개설 과목 공지는 Course Announcements 섹션에서 보면 됩니다."
          : "Use Grade Tasks for grade-based to-dos and Course Announcements for new class notices.",
      references,
    };
  }

  return {
    answer:
      archiveSection && locale === "ko"
        ? `현재 보고 있는 ${getArchiveSectionFriendly(archiveSection, locale)} 섹션 기준으로 질문하면 더 정확히 안내할 수 있습니다.`
        : archiveSection
          ? `Ask in the context of the current ${getArchiveSectionFriendly(archiveSection, locale)} section for a more precise answer.`
          : locale === "ko"
            ? "/archive 에서 먼저 섹션을 고르고 들어가면 답변이 더 정확해집니다."
            : "Choose a section from /archive first for a more precise answer.",
    references,
  };
}

async function answerForHandbook(question: string, locale: "ko" | "en") {
  const handbookResults = await searchHandbook(question, 4);
  const policyRefs = searchPolicyReferences(question, locale);
  const updateRefs = searchUpdateReferences(question, locale);
  const archiveRefs = searchArchiveRecordReferences(question, locale);

  if (handbookResults.length === 0) {
    return {
      answer:
        locale === "ko"
          ? "현재 핸드북에서 직접 근거를 찾지 못했습니다. 대신 관련 정책, 업데이트, 아카이브 기록을 함께 확인해보세요."
          : "I could not locate a direct handbook clause for that question. Check the related policy, updates, or archive references instead.",
      references: [...policyRefs, ...updateRefs, ...archiveRefs].slice(0, 4),
    };
  }

  const handbookRefs: CounselorReference[] = handbookResults.map(({ chunk }) => ({
    label: locale === "ko" ? "핸드북 조항" : "Handbook Clause",
    badge: chunk.clause ?? (locale === "ko" ? "조항" : "Clause"),
    title: formatHandbookCitation(chunk),
    excerpt: getHandbookExcerpt(chunk, 320),
    href: getHandbookViewHref(chunk),
  }));

  const excerptBlock = handbookResults
    .map(({ chunk }, index) => {
      const citation = formatHandbookCitation(chunk);
      return `[Source ${index + 1}]
Citation: ${citation}
Section: ${chunk.section}
Excerpt: ${getHandbookExcerpt(chunk, 700)}`;
    })
    .join("\n\n");

  const prompt = `User question (${locale}): ${question}

Relevant handbook excerpts:
${excerptBlock}

Instructions:
- Answer in ${locale === "ko" ? "Korean" : "English"}.
- Explain the rule, not just the raw text.
- Explicitly cite the most relevant clause number(s) or heading(s).
- If the question is about EOP, interpret it as English Only Policy unless the user clearly means something else.
- Keep the answer concise and practical.`;

  const aiAnswer = await runOpenAIText(prompt);

  return {
    answer:
      aiAnswer ||
      (locale === "ko"
        ? `가장 관련 있는 조항은 ${handbookRefs.map((ref) => ref.title).join(", ")} 입니다.`
        : `The most relevant clauses are ${handbookRefs.map((ref) => ref.title).join(", ")}.`),
    references: [...handbookRefs, ...policyRefs, ...updateRefs, ...archiveRefs].slice(0, 6),
  };
}

async function getContextualAnswer(
  question: string,
  context: CounselorContext,
  archiveSection?: ArchiveSection | null,
) {
  const locale = detectLanguage(question);

  if (context === "links") return answerForLinks(question, locale);
  if (context === "projects") return answerForProjects(question, locale);
  if (context === "archive") return answerForArchive(question, locale, archiveSection ?? null);
  return answerForHandbook(question, locale);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      question?: string;
      context?: CounselorContext;
      archiveSection?: ArchiveSection | null;
    };
    const question = body.question?.trim();
    const context = body.context ?? "handbook";

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const result = await getContextualAnswer(question, context, body.archiveSection ?? null);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
