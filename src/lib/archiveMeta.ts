import type { ArchiveSection } from "@/lib/archiveData";

export type VerificationStatus = "official" | "reviewing";

export interface SectionMeta {
  sourceDepartment: string;
  verification: VerificationStatus;
  lastUpdated: string;
}

export const archiveSectionMeta: Record<ArchiveSection, SectionMeta> = {
  projects: {
    sourceDepartment: "STEM Program Office",
    verification: "official",
    lastUpdated: "2026-02-24",
  },
  awards: {
    sourceDepartment: "Student Affairs",
    verification: "official",
    lastUpdated: "2026-02-20",
  },
  varsityTeams: {
    sourceDepartment: "Athletics Office",
    verification: "official",
    lastUpdated: "2026-02-18",
  },
  courseAnnouncements: {
    sourceDepartment: "Academic Affairs",
    verification: "official",
    lastUpdated: "2026-02-21",
  },
  clubReports: {
    sourceDepartment: "Student Council Administration",
    verification: "reviewing",
    lastUpdated: "2026-02-17",
  },
  schoolEvents: {
    sourceDepartment: "Campus Events Team",
    verification: "official",
    lastUpdated: "2026-02-22",
  },
  publications: {
    sourceDepartment: "Media Office",
    verification: "official",
    lastUpdated: "2026-02-23",
  },
  schoolProfiles: {
    sourceDepartment: "Counseling and Admissions Office",
    verification: "official",
    lastUpdated: "2026-02-26",
  },
  buildingHistory: {
    sourceDepartment: "Facilities Office",
    verification: "official",
    lastUpdated: "2026-02-10",
  },
  alumniProfiles: {
    sourceDepartment: "Alumni Relations",
    verification: "reviewing",
    lastUpdated: "2026-02-15",
  },
  gradeTasks: {
    sourceDepartment: "Grade Coordinators",
    verification: "official",
    lastUpdated: "2026-02-25",
  },
};

export const quickActions = [
  {
    label: "This Week Events",
    href: "/archive#schoolEvents",
  },
  {
    label: "Latest Course Announcements",
    href: "/archive#courseAnnouncements",
  },
  {
    label: "Grade Tasks",
    href: "/archive#gradeTasks",
  },
  {
    label: "Student Handbook",
    href: "/archive#publications",
  },
  {
    label: "School Profiles",
    href: "/archive#schoolProfiles",
  },
  {
    label: "School Links",
    href: "/links",
  },
];
