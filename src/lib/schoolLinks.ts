import type { Locale } from "@/lib/i18n";
import type { LocalizedText } from "@/lib/localized";
import { getLocalizedText, localized } from "@/lib/localized";

export interface SchoolLink {
  id: number;
  name: LocalizedText;
  type: "official" | "student-made" | "community";
  url: string;
  note: LocalizedText;
  owner: LocalizedText;
  updatedAt: string;
}

export const schoolLinks: SchoolLink[] = [
  {
    id: 1,
    name: localized("Fayston Official Website", "페이스튼 공식 웹사이트"),
    type: "official",
    url: "https://fayston.org",
    note: localized("Main school portal and announcements.", "학교 메인 포털과 공지 페이지입니다."),
    owner: localized("School Administration", "학교 행정실"),
    updatedAt: "2026-02-25",
  },
  {
    id: 2,
    name: localized("Fayston Archive API", "페이스튼 아카이브 API"),
    type: "official",
    url: "/api/archive",
    note: localized("Structured archive data endpoint.", "구조화된 아카이브 데이터 엔드포인트입니다."),
    owner: localized("Archive Team", "아카이브 팀"),
    updatedAt: "2026-02-26",
  },
  {
    id: 3,
    name: localized("SchoolBOJ", "SchoolBOJ"),
    type: "student-made",
    url: "https://faystonoj.vercel.app",
    note: localized("Student-made problem solving platform.", "학생이 만든 문제 풀이 플랫폼입니다."),
    owner: localized("Student Dev Team", "학생 개발팀"),
    updatedAt: "2026-02-20",
  },
  {
    id: 4,
    name: localized("Fayston GitHub Organization", "페이스튼 GitHub 조직"),
    type: "community",
    url: "https://github.com/fayston",
    note: localized("Open projects and collaboration repos.", "오픈 프로젝트와 협업 저장소 모음입니다."),
    owner: localized("Community Maintainers", "커뮤니티 운영진"),
    updatedAt: "2026-02-19",
  },
];

export function getSchoolLinkText(link: SchoolLink, locale: Locale) {
  return {
    name: getLocalizedText(link.name, locale),
    note: getLocalizedText(link.note, locale),
    owner: getLocalizedText(link.owner, locale),
  };
}
