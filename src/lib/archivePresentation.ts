import {
  archiveDataset,
  type ArchiveProject,
  type ArchiveSection,
  type Award,
  type VarsityTeam,
  type CourseAnnouncement,
  type ClubReport,
  type SchoolEvent,
  type Publication,
  type SchoolProfile,
  type BuildingHistory,
  type AlumniProfile,
  type GradeTask,
} from "@/lib/archiveData";
import { archiveSectionMeta } from "@/lib/archiveMeta";
import type { Locale } from "@/lib/i18n";
import { getLocalizedList, getLocalizedText } from "@/lib/localized";

type ArchiveRecord =
  | ArchiveProject
  | Award
  | VarsityTeam
  | CourseAnnouncement
  | ClubReport
  | SchoolEvent
  | Publication
  | SchoolProfile
  | BuildingHistory
  | AlumniProfile
  | GradeTask;

export interface DetailField {
  label: string;
  value: string;
}

export interface ArchiveListItem {
  id: number;
  title: string;
  summary: string;
  eyebrow?: string;
  year?: string;
  keywords: string[];
  href: string;
  sourceUrl?: string;
}

const sectionLabelsByLocale: Record<Locale, Record<ArchiveSection, string>> = {
  en: {
    projects: "Student Projects",
    awards: "Awards",
    varsityTeams: "Varsity Teams",
    courseAnnouncements: "Course Announcements",
    clubReports: "Club / Council Reports",
    schoolEvents: "School Events",
    publications: "Publications",
    schoolProfiles: "School Profiles",
    buildingHistory: "Building History",
    alumniProfiles: "Alumni Profiles",
    gradeTasks: "Grade Tasks",
  },
  ko: {
    projects: "학생 프로젝트",
    awards: "수상 기록",
    varsityTeams: "대표팀",
    courseAnnouncements: "강의 공지",
    clubReports: "동아리 / 학생회 보고서",
    schoolEvents: "학교 행사",
    publications: "간행물",
    schoolProfiles: "학교 프로필",
    buildingHistory: "건물 이력",
    alumniProfiles: "동문 프로필",
    gradeTasks: "학년별 과제",
  },
};

const sectionDescriptionsByLocale: Record<Locale, Record<ArchiveSection, string>> = {
  en: {
    projects: "Personal and official student project records.",
    awards: "Historical award outcomes and recipients.",
    varsityTeams: "Team list with varsity achievements.",
    courseAnnouncements: "Newly opened classes and notices.",
    clubReports: "Activity reports and member leadership snapshots.",
    schoolEvents: "Upcoming and past events with materials.",
    publications: "Student handbook and weekly letters.",
    schoolProfiles: "Academic-year-based school profile documents.",
    buildingHistory: "Campus building timeline and changes.",
    alumniProfiles: "Graduate profile and social links.",
    gradeTasks: "Per-grade assignments and deadlines.",
  },
  ko: {
    projects: "학생 개인 및 공식 프로젝트 기록입니다.",
    awards: "역대 수상 결과와 수상자 기록입니다.",
    varsityTeams: "대표팀 목록과 주요 성과입니다.",
    courseAnnouncements: "신규 개설 강의와 공지입니다.",
    clubReports: "동아리 활동 보고와 리더십 스냅샷입니다.",
    schoolEvents: "예정 및 종료된 행사와 관련 자료입니다.",
    publications: "학생 핸드북과 위클리 레터입니다.",
    schoolProfiles: "학사년도별 학교 프로필 문서입니다.",
    buildingHistory: "캠퍼스 건물 변화 이력입니다.",
    alumniProfiles: "동문 프로필과 외부 링크입니다.",
    gradeTasks: "학년별 과제와 마감 일정입니다.",
  },
};

const sectionKeywordsByLocale: Record<Locale, Record<ArchiveSection, string[]>> = {
  en: {
    projects: ["capstone", "research", "github"],
    awards: ["competition", "recipient", "level"],
    varsityTeams: ["team", "coach", "achievement"],
    courseAnnouncements: ["semester", "department", "announcement"],
    clubReports: ["report", "leadership", "activity"],
    schoolEvents: ["calendar", "materials", "location"],
    publications: ["handbook", "weekly letter", "pdf"],
    schoolProfiles: ["academic year", "admissions", "metrics"],
    buildingHistory: ["timeline", "campus", "facility"],
    alumniProfiles: ["career", "linkedin", "major"],
    gradeTasks: ["deadline", "grade", "owner"],
  },
  ko: {
    projects: ["캡스톤", "리서치", "깃허브"],
    awards: ["대회", "수상자", "등급"],
    varsityTeams: ["팀", "코치", "성과"],
    courseAnnouncements: ["학기", "학과", "공지"],
    clubReports: ["보고서", "리더십", "활동"],
    schoolEvents: ["일정", "자료", "장소"],
    publications: ["핸드북", "위클리 레터", "pdf"],
    schoolProfiles: ["학사년도", "입학", "지표"],
    buildingHistory: ["연표", "캠퍼스", "시설"],
    alumniProfiles: ["진로", "링크드인", "전공"],
    gradeTasks: ["마감", "학년", "담당"],
  },
};

export const archiveSectionLabels = sectionLabelsByLocale.en;
export const archiveSectionDescriptions = sectionDescriptionsByLocale.en;
export const archiveSectionKeywords = sectionKeywordsByLocale.en;

export function getArchiveSectionLabel(section: ArchiveSection, locale: Locale = "en"): string {
  return sectionLabelsByLocale[locale][section];
}

export function getArchiveSectionDescription(section: ArchiveSection, locale: Locale = "en"): string {
  return sectionDescriptionsByLocale[locale][section];
}

export function getArchiveSectionKeywords(section: ArchiveSection, locale: Locale = "en"): string[] {
  return sectionKeywordsByLocale[locale][section];
}

export function isArchiveSection(value: string): value is ArchiveSection {
  return value in archiveDataset;
}

export function formatArchiveDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getArchiveSectionItems(section: ArchiveSection): ArchiveRecord[] {
  return archiveDataset[section] as ArchiveRecord[];
}

export function getArchiveItemById(section: ArchiveSection, id: number): ArchiveRecord | undefined {
  return getArchiveSectionItems(section).find((item) => item.id === id);
}

export function getArchiveItemHref(section: ArchiveSection, id: number): string {
  return `/archive/${section}/${id}`;
}

export function getArchiveSourceUrl(section: ArchiveSection, item: ArchiveRecord): string | undefined {
  switch (section) {
    case "projects":
      return (item as ArchiveProject).githubUrl;
    case "clubReports":
      return (item as ClubReport).reportUrl;
    case "publications":
      return (item as Publication).fileUrl;
    case "schoolProfiles":
      return (item as SchoolProfile).fileUrl;
    case "alumniProfiles": {
      const profile = item as AlumniProfile;
      return profile.linkedinUrl ?? profile.snsUrl;
    }
    default:
      return undefined;
  }
}

export function getArchiveItemTitle(
  section: ArchiveSection,
  item: ArchiveRecord,
  locale: Locale = "en",
): string {
  return getLocalizedArchiveItemTitle(section, item, locale);
}

function getLocalizedArchiveItemTitle(section: ArchiveSection, item: ArchiveRecord, locale: Locale): string {
  switch (section) {
    case "projects":
      return getLocalizedText((item as ArchiveProject).title, locale);
    case "awards":
      return getLocalizedText((item as Award).title, locale);
    case "courseAnnouncements":
      return getLocalizedText((item as CourseAnnouncement).title, locale);
    case "schoolEvents":
      return getLocalizedText((item as SchoolEvent).title, locale);
    case "publications":
      return getLocalizedText((item as Publication).title, locale);
    case "schoolProfiles":
      return getLocalizedText((item as SchoolProfile).title, locale);
    case "varsityTeams":
      return getLocalizedText((item as VarsityTeam).name, locale);
    case "clubReports":
      return getLocalizedText((item as ClubReport).reportTitle, locale);
    case "buildingHistory":
      return `${getLocalizedText((item as BuildingHistory).buildingName, locale)} ${(item as BuildingHistory).timelineYear}`;
    case "alumniProfiles":
      return (item as AlumniProfile).name;
    case "gradeTasks":
      return getLocalizedText((item as GradeTask).taskTitle, locale);
  }
}

export function getArchiveItemEyebrow(
  section: ArchiveSection,
  item: ArchiveRecord,
  locale: Locale = "en",
): string | undefined {
  switch (section) {
    case "projects":
      return `${(item as ArchiveProject).category} | ${(item as ArchiveProject).projectYear}`;
    case "awards":
      return `${formatArchiveDate((item as Award).awardDate)} | ${getLocalizedText((item as Award).level, locale)}`;
    case "varsityTeams":
      return locale === "ko"
        ? `${getLocalizedText((item as VarsityTeam).sportType, locale)} | 코치 ${(item as VarsityTeam).coach}`
        : `${getLocalizedText((item as VarsityTeam).sportType, locale)} | Coach ${(item as VarsityTeam).coach}`;
    case "courseAnnouncements":
      return `${(item as CourseAnnouncement).courseCode} | ${getLocalizedText((item as CourseAnnouncement).department, locale)}`;
    case "clubReports":
      return `${getLocalizedText((item as ClubReport).organization, locale)} | ${(item as ClubReport).period}`;
    case "schoolEvents":
      return `${
        (item as SchoolEvent).type === "upcoming"
          ? locale === "ko"
            ? "예정"
            : "Upcoming"
          : locale === "ko"
            ? "종료"
            : "Past"
      } | ${formatArchiveDate((item as SchoolEvent).eventDate)}`;
    case "publications":
      return `${
        (item as Publication).type === "student-handbook"
          ? locale === "ko"
            ? "학생 핸드북"
            : "Student Handbook"
          : locale === "ko"
            ? "위클리 레터"
            : "Weekly Letter"
      } | ${(item as Publication).issue}`;
    case "schoolProfiles":
      return (item as SchoolProfile).academicYear;
    case "buildingHistory":
      return `${(item as BuildingHistory).changeType} | ${(item as BuildingHistory).timelineYear}`;
    case "alumniProfiles":
      return `${(item as AlumniProfile).graduationYear} | ${getLocalizedText((item as AlumniProfile).major, locale)}`;
    case "gradeTasks":
      return `${getLocalizedText((item as GradeTask).grade, locale)} | ${formatArchiveDate((item as GradeTask).dueDate)}`;
  }
}

export function getArchiveItemSummary(
  section: ArchiveSection,
  item: ArchiveRecord,
  locale: Locale = "en",
): string {
  switch (section) {
    case "projects":
      return getLocalizedText((item as ArchiveProject).description, locale);
    case "awards":
      return locale === "ko"
        ? `${getLocalizedText((item as Award).organizer, locale)} 주관 ${getLocalizedText((item as Award).category, locale)} 수상 기록입니다. 수상자: ${(item as Award).recipients.join(", ")}.`
        : `${getLocalizedText((item as Award).category, locale)} award organized by ${getLocalizedText((item as Award).organizer, locale)}. Recipients: ${(item as Award).recipients.join(", ")}.`;
    case "varsityTeams":
      return getLocalizedList((item as VarsityTeam).achievements, locale).join(" | ");
    case "courseAnnouncements":
      return getLocalizedText((item as CourseAnnouncement).summary, locale);
    case "clubReports":
      return locale === "ko"
        ? `리더십: ${getLocalizedList((item as ClubReport).leaders, locale).join(", ")}.`
        : `Leadership: ${getLocalizedList((item as ClubReport).leaders, locale).join(", ")}.`;
    case "schoolEvents":
      return locale === "ko"
        ? `${getLocalizedText((item as SchoolEvent).location, locale)}. 자료: ${getLocalizedList((item as SchoolEvent).materials, locale).join(", ")}.`
        : `${getLocalizedText((item as SchoolEvent).location, locale)}. Materials: ${getLocalizedList((item as SchoolEvent).materials, locale).join(", ")}.`;
    case "publications":
      return locale === "ko"
        ? `${formatArchiveDate((item as Publication).publishDate)} 발행. 원본 파일: ${(item as Publication).fileUrl}.`
        : `Published ${formatArchiveDate((item as Publication).publishDate)}. Source file: ${(item as Publication).fileUrl}.`;
    case "schoolProfiles":
      return getLocalizedText((item as SchoolProfile).summary, locale);
    case "buildingHistory":
      return getLocalizedText((item as BuildingHistory).note, locale);
    case "alumniProfiles":
      return getLocalizedText((item as AlumniProfile).currentRole, locale);
    case "gradeTasks":
      return `${getLocalizedText((item as GradeTask).owner, locale)} | ${getLocalizedText((item as GradeTask).status, locale)}`;
  }
}

export function getArchiveItemKeywords(
  section: ArchiveSection,
  item: ArchiveRecord,
  locale: Locale = "en",
): string[] {
  switch (section) {
    case "projects":
      return [(item as ArchiveProject).category, (item as ArchiveProject).status, ...(item as ArchiveProject).tags].slice(0, 4);
    case "awards":
      return [
        getLocalizedText((item as Award).level, locale),
        getLocalizedText((item as Award).category, locale),
        getLocalizedText((item as Award).organizer, locale),
      ].slice(0, 4);
    case "varsityTeams":
      return [
        getLocalizedText((item as VarsityTeam).sportType, locale),
        (item as VarsityTeam).coach,
        ...getLocalizedList((item as VarsityTeam).achievements.slice(0, 2), locale),
      ];
    case "courseAnnouncements":
      return [
        getLocalizedText((item as CourseAnnouncement).semester, locale),
        getLocalizedText((item as CourseAnnouncement).department, locale),
        (item as CourseAnnouncement).courseCode,
      ];
    case "clubReports":
      return [
        getLocalizedText((item as ClubReport).organization, locale),
        (item as ClubReport).period,
        ...getLocalizedList((item as ClubReport).leaders.slice(0, 2), locale),
      ];
    case "schoolEvents":
      return [
        (item as SchoolEvent).type === "upcoming" ? (locale === "ko" ? "예정" : "upcoming") : locale === "ko" ? "종료" : "past",
        getLocalizedText((item as SchoolEvent).location, locale),
        ...getLocalizedList((item as SchoolEvent).materials.slice(0, 2), locale),
      ];
    case "publications":
      return [
        (item as Publication).type === "student-handbook"
          ? locale === "ko"
            ? "핸드북"
            : "student-handbook"
          : locale === "ko"
            ? "위클리 레터"
            : "weekly-letter",
        (item as Publication).issue,
        formatArchiveDate((item as Publication).publishDate),
      ];
    case "schoolProfiles":
      return locale === "ko"
        ? [(item as SchoolProfile).academicYear, "학교 프로필", "입학"]
        : [(item as SchoolProfile).academicYear, "school profile", "admissions"];
    case "buildingHistory":
      return [
        getLocalizedText((item as BuildingHistory).buildingName, locale),
        (item as BuildingHistory).changeType,
        String((item as BuildingHistory).timelineYear),
      ];
    case "alumniProfiles":
      return [
        String((item as AlumniProfile).graduationYear),
        getLocalizedText((item as AlumniProfile).major, locale),
        getLocalizedText((item as AlumniProfile).currentRole, locale),
      ];
    case "gradeTasks":
      return [
        getLocalizedText((item as GradeTask).grade, locale),
        getLocalizedText((item as GradeTask).status, locale),
        getLocalizedText((item as GradeTask).owner, locale),
      ];
  }
}

export function getArchiveItemYear(section: ArchiveSection, item: ArchiveRecord): string | undefined {
  switch (section) {
    case "projects":
      return String((item as ArchiveProject).projectYear);
    case "awards":
      return formatArchiveDate((item as Award).awardDate).slice(0, 4);
    case "courseAnnouncements":
      return formatArchiveDate((item as CourseAnnouncement).announcedAt).slice(0, 4);
    case "clubReports":
      return (item as ClubReport).period.slice(0, 4);
    case "schoolEvents":
      return formatArchiveDate((item as SchoolEvent).eventDate).slice(0, 4);
    case "publications":
      return formatArchiveDate((item as Publication).publishDate).slice(0, 4);
    case "schoolProfiles":
      return (item as SchoolProfile).academicYear.slice(0, 4);
    case "buildingHistory":
      return String((item as BuildingHistory).timelineYear);
    case "alumniProfiles":
      return String((item as AlumniProfile).graduationYear);
    case "gradeTasks":
      return formatArchiveDate((item as GradeTask).dueDate).slice(0, 4);
    default:
      return archiveSectionMeta[section].lastUpdated.slice(0, 4);
  }
}

export function getArchiveItemFields(
  section: ArchiveSection,
  item: ArchiveRecord,
  locale: Locale = "en",
): DetailField[] {
  const yes = locale === "ko" ? "예" : "Yes";
  const no = locale === "ko" ? "아니오" : "No";

  switch (section) {
    case "projects":
      return [
        { label: locale === "ko" ? "프로젝트 연도" : "Project Year", value: String((item as ArchiveProject).projectYear) },
        { label: locale === "ko" ? "카테고리" : "Category", value: (item as ArchiveProject).category },
        { label: locale === "ko" ? "구성원" : "Members", value: (item as ArchiveProject).members.join(", ") },
        { label: locale === "ko" ? "태그" : "Tags", value: (item as ArchiveProject).tags.join(", ") },
        { label: locale === "ko" ? "상태" : "Status", value: (item as ArchiveProject).status },
      ];
    case "awards":
      return [
        { label: locale === "ko" ? "수상일" : "Award Date", value: formatArchiveDate((item as Award).awardDate) },
        { label: locale === "ko" ? "등급" : "Level", value: getLocalizedText((item as Award).level, locale) },
        { label: locale === "ko" ? "분류" : "Category", value: getLocalizedText((item as Award).category, locale) },
        { label: locale === "ko" ? "주최" : "Organizer", value: getLocalizedText((item as Award).organizer, locale) },
        { label: locale === "ko" ? "수상자" : "Recipients", value: (item as Award).recipients.join(", ") },
      ];
    case "varsityTeams":
      return [
        { label: locale === "ko" ? "종목" : "Type", value: getLocalizedText((item as VarsityTeam).sportType, locale) },
        { label: locale === "ko" ? "코치" : "Coach", value: (item as VarsityTeam).coach },
        { label: locale === "ko" ? "대표팀 여부" : "Varsity", value: (item as VarsityTeam).varsity ? yes : no },
        { label: locale === "ko" ? "성과" : "Achievements", value: getLocalizedList((item as VarsityTeam).achievements, locale).join(" | ") },
      ];
    case "courseAnnouncements":
      return [
        { label: locale === "ko" ? "과목 코드" : "Course Code", value: (item as CourseAnnouncement).courseCode },
        { label: locale === "ko" ? "학과" : "Department", value: getLocalizedText((item as CourseAnnouncement).department, locale) },
        { label: locale === "ko" ? "학기" : "Semester", value: getLocalizedText((item as CourseAnnouncement).semester, locale) },
        { label: locale === "ko" ? "공지일" : "Announced", value: formatArchiveDate((item as CourseAnnouncement).announcedAt) },
      ];
    case "clubReports":
      return [
        { label: locale === "ko" ? "조직" : "Organization", value: getLocalizedText((item as ClubReport).organization, locale) },
        { label: locale === "ko" ? "기간" : "Period", value: (item as ClubReport).period },
        { label: locale === "ko" ? "리더" : "Leaders", value: getLocalizedList((item as ClubReport).leaders, locale).join(", ") },
        { label: locale === "ko" ? "원본 파일" : "Source File", value: (item as ClubReport).reportUrl },
      ];
    case "schoolEvents":
      return [
        { label: locale === "ko" ? "유형" : "Type", value: (item as SchoolEvent).type === "upcoming" ? (locale === "ko" ? "예정" : "upcoming") : locale === "ko" ? "종료" : "past" },
        { label: locale === "ko" ? "행사일" : "Event Date", value: formatArchiveDate((item as SchoolEvent).eventDate) },
        { label: locale === "ko" ? "장소" : "Location", value: getLocalizedText((item as SchoolEvent).location, locale) },
        { label: locale === "ko" ? "자료" : "Materials", value: getLocalizedList((item as SchoolEvent).materials, locale).join(", ") },
      ];
    case "publications":
      return [
        { label: locale === "ko" ? "유형" : "Type", value: (item as Publication).type === "student-handbook" ? (locale === "ko" ? "학생 핸드북" : "student-handbook") : locale === "ko" ? "위클리 레터" : "weekly-letter" },
        { label: locale === "ko" ? "이슈" : "Issue", value: (item as Publication).issue },
        { label: locale === "ko" ? "발행일" : "Published", value: formatArchiveDate((item as Publication).publishDate) },
        { label: locale === "ko" ? "원본 파일" : "Source File", value: (item as Publication).fileUrl },
      ];
    case "schoolProfiles":
      return [
        { label: locale === "ko" ? "학사년도" : "Academic Year", value: (item as SchoolProfile).academicYear },
        { label: locale === "ko" ? "요약" : "Summary", value: getLocalizedText((item as SchoolProfile).summary, locale) },
        { label: locale === "ko" ? "원본 파일" : "Source File", value: (item as SchoolProfile).fileUrl },
      ];
    case "buildingHistory":
      return [
        { label: locale === "ko" ? "건물" : "Building", value: getLocalizedText((item as BuildingHistory).buildingName, locale) },
        { label: locale === "ko" ? "연도" : "Timeline Year", value: String((item as BuildingHistory).timelineYear) },
        { label: locale === "ko" ? "변경 유형" : "Change Type", value: (item as BuildingHistory).changeType },
        { label: locale === "ko" ? "메모" : "Note", value: getLocalizedText((item as BuildingHistory).note, locale) },
      ];
    case "alumniProfiles":
      return [
        { label: locale === "ko" ? "졸업연도" : "Graduation Year", value: String((item as AlumniProfile).graduationYear) },
        { label: locale === "ko" ? "전공" : "Major", value: getLocalizedText((item as AlumniProfile).major, locale) },
        { label: locale === "ko" ? "현재 역할" : "Current Role", value: getLocalizedText((item as AlumniProfile).currentRole, locale) },
        { label: locale === "ko" ? "공개 동의" : "Consent To Share", value: (item as AlumniProfile).consentToShare ? yes : no },
      ];
    case "gradeTasks":
      return [
        { label: locale === "ko" ? "학년" : "Grade", value: getLocalizedText((item as GradeTask).grade, locale) },
        { label: locale === "ko" ? "마감일" : "Due Date", value: formatArchiveDate((item as GradeTask).dueDate) },
        { label: locale === "ko" ? "담당" : "Owner", value: getLocalizedText((item as GradeTask).owner, locale) },
        { label: locale === "ko" ? "상태" : "Status", value: getLocalizedText((item as GradeTask).status, locale) },
      ];
  }
}

export function getArchiveListItem(
  section: ArchiveSection,
  item: ArchiveRecord,
  locale: Locale = "en",
): ArchiveListItem {
  return {
    id: item.id,
    title: getLocalizedArchiveItemTitle(section, item, locale),
    summary: getArchiveItemSummary(section, item, locale),
    eyebrow: getArchiveItemEyebrow(section, item, locale),
    year: getArchiveItemYear(section, item),
    keywords: getArchiveItemKeywords(section, item, locale),
    href: getArchiveItemHref(section, item.id),
    sourceUrl: getArchiveSourceUrl(section, item),
  };
}

export function getArchiveYears(): string[] {
  const years = new Set<string>();
  (Object.keys(archiveDataset) as ArchiveSection[]).forEach((section) => {
    getArchiveSectionItems(section).forEach((item) => {
      const year = getArchiveItemYear(section, item);
      if (year) years.add(year);
    });
  });
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}
