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

export const archiveSectionLabels: Record<ArchiveSection, string> = {
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
};

export const archiveSectionDescriptions: Record<ArchiveSection, string> = {
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
};

export const archiveSectionKeywords: Record<ArchiveSection, string[]> = {
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
};

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

export function getArchiveItemTitle(section: ArchiveSection, item: ArchiveRecord): string {
  switch (section) {
    case "projects":
      return (item as ArchiveProject).title;
    case "awards":
      return (item as Award).title;
    case "courseAnnouncements":
      return (item as CourseAnnouncement).title;
    case "schoolEvents":
      return (item as SchoolEvent).title;
    case "publications":
      return (item as Publication).title;
    case "schoolProfiles":
      return (item as SchoolProfile).title;
    case "varsityTeams":
      return (item as VarsityTeam).name;
    case "clubReports":
      return (item as ClubReport).reportTitle;
    case "buildingHistory":
      return `${(item as BuildingHistory).buildingName} ${(item as BuildingHistory).timelineYear}`;
    case "alumniProfiles":
      return (item as AlumniProfile).name;
    case "gradeTasks":
      return (item as GradeTask).taskTitle;
  }
}

export function getArchiveItemEyebrow(section: ArchiveSection, item: ArchiveRecord): string | undefined {
  switch (section) {
    case "projects":
      return `${(item as ArchiveProject).category} · ${(item as ArchiveProject).projectYear}`;
    case "awards":
      return `${formatArchiveDate((item as Award).awardDate)} · ${(item as Award).level}`;
    case "varsityTeams":
      return `${(item as VarsityTeam).sportType} · Coach ${(item as VarsityTeam).coach}`;
    case "courseAnnouncements":
      return `${(item as CourseAnnouncement).courseCode} · ${(item as CourseAnnouncement).department}`;
    case "clubReports":
      return `${(item as ClubReport).organization} · ${(item as ClubReport).period}`;
    case "schoolEvents":
      return `${(item as SchoolEvent).type === "upcoming" ? "Upcoming" : "Past"} · ${formatArchiveDate((item as SchoolEvent).eventDate)}`;
    case "publications":
      return `${(item as Publication).type === "student-handbook" ? "Student Handbook" : "Weekly Letter"} · ${(item as Publication).issue}`;
    case "schoolProfiles":
      return (item as SchoolProfile).academicYear;
    case "buildingHistory":
      return `${(item as BuildingHistory).changeType} · ${(item as BuildingHistory).timelineYear}`;
    case "alumniProfiles":
      return `${(item as AlumniProfile).graduationYear} · ${(item as AlumniProfile).major}`;
    case "gradeTasks":
      return `${(item as GradeTask).grade} · ${formatArchiveDate((item as GradeTask).dueDate)}`;
  }
}

export function getArchiveItemSummary(section: ArchiveSection, item: ArchiveRecord): string {
  switch (section) {
    case "projects":
      return (item as ArchiveProject).description;
    case "awards":
      return `${(item as Award).category} award organized by ${(item as Award).organizer}. Recipients: ${(item as Award).recipients.join(", ")}.`;
    case "varsityTeams":
      return (item as VarsityTeam).achievements.join(" | ");
    case "courseAnnouncements":
      return (item as CourseAnnouncement).summary;
    case "clubReports":
      return `Leadership: ${(item as ClubReport).leaders.join(", ")}.`;
    case "schoolEvents":
      return `${(item as SchoolEvent).location}. Materials: ${(item as SchoolEvent).materials.join(", ")}.`;
    case "publications":
      return `Published ${formatArchiveDate((item as Publication).publishDate)}. Source file: ${(item as Publication).fileUrl}.`;
    case "schoolProfiles":
      return (item as SchoolProfile).summary;
    case "buildingHistory":
      return (item as BuildingHistory).note;
    case "alumniProfiles":
      return (item as AlumniProfile).currentRole;
    case "gradeTasks":
      return `${(item as GradeTask).owner} · ${(item as GradeTask).status}`;
  }
}

export function getArchiveItemKeywords(section: ArchiveSection, item: ArchiveRecord): string[] {
  switch (section) {
    case "projects":
      return [(item as ArchiveProject).category, (item as ArchiveProject).status, ...(item as ArchiveProject).tags].slice(0, 4);
    case "awards":
      return [(item as Award).level, (item as Award).category, (item as Award).organizer].slice(0, 4);
    case "varsityTeams":
      return [(item as VarsityTeam).sportType, (item as VarsityTeam).coach, ...((item as VarsityTeam).achievements.slice(0, 2))];
    case "courseAnnouncements":
      return [(item as CourseAnnouncement).semester, (item as CourseAnnouncement).department, (item as CourseAnnouncement).courseCode];
    case "clubReports":
      return [(item as ClubReport).organization, (item as ClubReport).period, ...(item as ClubReport).leaders.slice(0, 2)];
    case "schoolEvents":
      return [(item as SchoolEvent).type, (item as SchoolEvent).location, ...(item as SchoolEvent).materials.slice(0, 2)];
    case "publications":
      return [(item as Publication).type, (item as Publication).issue, formatArchiveDate((item as Publication).publishDate)];
    case "schoolProfiles":
      return [(item as SchoolProfile).academicYear, "school profile", "admissions"];
    case "buildingHistory":
      return [(item as BuildingHistory).buildingName, (item as BuildingHistory).changeType, String((item as BuildingHistory).timelineYear)];
    case "alumniProfiles":
      return [String((item as AlumniProfile).graduationYear), (item as AlumniProfile).major, (item as AlumniProfile).currentRole];
    case "gradeTasks":
      return [(item as GradeTask).grade, (item as GradeTask).status, (item as GradeTask).owner];
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

export function getArchiveItemFields(section: ArchiveSection, item: ArchiveRecord): DetailField[] {
  switch (section) {
    case "projects":
      return [
        { label: "Project Year", value: String((item as ArchiveProject).projectYear) },
        { label: "Category", value: (item as ArchiveProject).category },
        { label: "Members", value: (item as ArchiveProject).members.join(", ") },
        { label: "Tags", value: (item as ArchiveProject).tags.join(", ") },
        { label: "Status", value: (item as ArchiveProject).status },
      ];
    case "awards":
      return [
        { label: "Award Date", value: formatArchiveDate((item as Award).awardDate) },
        { label: "Level", value: (item as Award).level },
        { label: "Category", value: (item as Award).category },
        { label: "Organizer", value: (item as Award).organizer },
        { label: "Recipients", value: (item as Award).recipients.join(", ") },
      ];
    case "varsityTeams":
      return [
        { label: "Type", value: (item as VarsityTeam).sportType },
        { label: "Coach", value: (item as VarsityTeam).coach },
        { label: "Varsity", value: (item as VarsityTeam).varsity ? "Yes" : "No" },
        { label: "Achievements", value: (item as VarsityTeam).achievements.join(" | ") },
      ];
    case "courseAnnouncements":
      return [
        { label: "Course Code", value: (item as CourseAnnouncement).courseCode },
        { label: "Department", value: (item as CourseAnnouncement).department },
        { label: "Semester", value: (item as CourseAnnouncement).semester },
        { label: "Announced", value: formatArchiveDate((item as CourseAnnouncement).announcedAt) },
      ];
    case "clubReports":
      return [
        { label: "Organization", value: (item as ClubReport).organization },
        { label: "Period", value: (item as ClubReport).period },
        { label: "Leaders", value: (item as ClubReport).leaders.join(", ") },
        { label: "Source File", value: (item as ClubReport).reportUrl },
      ];
    case "schoolEvents":
      return [
        { label: "Type", value: (item as SchoolEvent).type },
        { label: "Event Date", value: formatArchiveDate((item as SchoolEvent).eventDate) },
        { label: "Location", value: (item as SchoolEvent).location },
        { label: "Materials", value: (item as SchoolEvent).materials.join(", ") },
      ];
    case "publications":
      return [
        { label: "Type", value: (item as Publication).type },
        { label: "Issue", value: (item as Publication).issue },
        { label: "Published", value: formatArchiveDate((item as Publication).publishDate) },
        { label: "Source File", value: (item as Publication).fileUrl },
      ];
    case "schoolProfiles":
      return [
        { label: "Academic Year", value: (item as SchoolProfile).academicYear },
        { label: "Summary", value: (item as SchoolProfile).summary },
        { label: "Source File", value: (item as SchoolProfile).fileUrl },
      ];
    case "buildingHistory":
      return [
        { label: "Building", value: (item as BuildingHistory).buildingName },
        { label: "Timeline Year", value: String((item as BuildingHistory).timelineYear) },
        { label: "Change Type", value: (item as BuildingHistory).changeType },
        { label: "Note", value: (item as BuildingHistory).note },
      ];
    case "alumniProfiles":
      return [
        { label: "Graduation Year", value: String((item as AlumniProfile).graduationYear) },
        { label: "Major", value: (item as AlumniProfile).major },
        { label: "Current Role", value: (item as AlumniProfile).currentRole },
        { label: "Consent To Share", value: (item as AlumniProfile).consentToShare ? "Yes" : "No" },
      ];
    case "gradeTasks":
      return [
        { label: "Grade", value: (item as GradeTask).grade },
        { label: "Due Date", value: formatArchiveDate((item as GradeTask).dueDate) },
        { label: "Owner", value: (item as GradeTask).owner },
        { label: "Status", value: (item as GradeTask).status },
      ];
  }
}

export function getArchiveListItem(section: ArchiveSection, item: ArchiveRecord): ArchiveListItem {
  return {
    id: item.id,
    title: getArchiveItemTitle(section, item),
    summary: getArchiveItemSummary(section, item),
    eyebrow: getArchiveItemEyebrow(section, item),
    year: getArchiveItemYear(section, item),
    keywords: getArchiveItemKeywords(section, item),
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
