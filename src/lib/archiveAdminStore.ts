import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  archiveDataset,
  type ArchiveSection,
  type ArchiveProject,
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
import type { Locale } from "@/lib/i18n";
import { getLocalizedText, localized, type LocalizedText } from "@/lib/localized";

type ArchiveDataset = typeof archiveDataset;
type ArchiveRecord = ArchiveDataset[ArchiveSection][number];

type ArchiveOverrideRow = {
  id: string;
  section: string;
  sourceId: number;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export interface ArchiveEditorItem {
  id: number;
  title: string;
  isOverride: boolean;
  payload: ArchiveRecord;
}

function asLocalizedText(value: unknown, fallbackEn = "", fallbackKo = ""): LocalizedText {
  if (typeof value === "string") {
    return localized(value, value);
  }
  if (value && typeof value === "object") {
    const en = typeof (value as { en?: unknown }).en === "string" ? (value as { en: string }).en : fallbackEn;
    const ko = typeof (value as { ko?: unknown }).ko === "string" ? (value as { ko: string }).ko : fallbackKo || en;
    return localized(en, ko || en);
  }
  return localized(fallbackEn, fallbackKo || fallbackEn);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asLocalizedArray(value: unknown): LocalizedText[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asLocalizedText(item));
}

function normalizeArchiveRecord(section: ArchiveSection, sourceId: number, payload: unknown): ArchiveRecord {
  const record = (payload ?? {}) as Record<string, unknown>;

  switch (section) {
    case "projects":
      return {
        id: sourceId,
        title: asLocalizedText(record.title, "Untitled Project", "제목 없는 프로젝트"),
        description: asLocalizedText(record.description, "", ""),
        projectYear: asNumber(record.projectYear, new Date().getFullYear()),
        category: (["AWARD", "CAPSTONE", "RESEARCH", "PERSONAL"] as const).includes(record.category as never)
          ? (record.category as ArchiveProject["category"])
          : "PERSONAL",
        githubUrl: asString(record.githubUrl) || undefined,
        members: asStringArray(record.members),
        tags: asStringArray(record.tags),
        status: (["pending", "approved", "rejected"] as const).includes(record.status as never)
          ? (record.status as ArchiveProject["status"])
          : "approved",
      };
    case "awards":
      return {
        id: sourceId,
        title: asLocalizedText(record.title, "Untitled Award", "제목 없는 수상 기록"),
        awardDate: asString(record.awardDate, new Date().toISOString().slice(0, 10)),
        level: asLocalizedText(record.level, "Level", "등급"),
        category: asLocalizedText(record.category, "Category", "분류"),
        organizer: asLocalizedText(record.organizer, "Organizer", "주최"),
        recipients: asStringArray(record.recipients),
      };
    case "varsityTeams":
      return {
        id: sourceId,
        name: asLocalizedText(record.name, "Untitled Team", "이름 없는 팀"),
        sportType: asLocalizedText(record.sportType, "Team", "팀"),
        varsity: asBoolean(record.varsity, true),
        coach: asString(record.coach, ""),
        achievements: asLocalizedArray(record.achievements),
      };
    case "courseAnnouncements":
      return {
        id: sourceId,
        courseCode: asString(record.courseCode, "COURSE-000"),
        title: asLocalizedText(record.title, "Untitled Course", "제목 없는 과목"),
        department: asLocalizedText(record.department, "Department", "학과"),
        semester: asLocalizedText(record.semester, "Semester", "학기"),
        announcedAt: asString(record.announcedAt, new Date().toISOString().slice(0, 10)),
        summary: asLocalizedText(record.summary, "", ""),
      };
    case "clubReports":
      return {
        id: sourceId,
        organization: asLocalizedText(record.organization, "Organization", "조직"),
        period: asString(record.period, "2026 Q1"),
        leaders: asLocalizedArray(record.leaders),
        reportTitle: asLocalizedText(record.reportTitle, "Untitled Report", "제목 없는 보고서"),
        reportUrl: asString(record.reportUrl, "/files/report.pdf"),
      };
    case "schoolEvents":
      return {
        id: sourceId,
        title: asLocalizedText(record.title, "Untitled Event", "제목 없는 행사"),
        type: record.type === "past" ? "past" : "upcoming",
        eventDate: asString(record.eventDate, new Date().toISOString().slice(0, 10)),
        location: asLocalizedText(record.location, "Campus", "캠퍼스"),
        materials: asLocalizedArray(record.materials),
      };
    case "publications":
      return {
        id: sourceId,
        type: record.type === "weekly-letter" ? "weekly-letter" : "student-handbook",
        title: asLocalizedText(record.title, "Untitled Publication", "제목 없는 간행물"),
        issue: asString(record.issue, "v1.0"),
        publishDate: asString(record.publishDate, new Date().toISOString().slice(0, 10)),
        fileUrl: asString(record.fileUrl, "/files/document.pdf"),
      };
    case "schoolProfiles":
      return {
        id: sourceId,
        academicYear: asString(record.academicYear, "2026-2027"),
        title: asLocalizedText(record.title, "School Profile", "학교 프로필"),
        summary: asLocalizedText(record.summary, "", ""),
        fileUrl: asString(record.fileUrl, "/files/school-profile.pdf"),
      };
    case "buildingHistory":
      return {
        id: sourceId,
        buildingName: asLocalizedText(record.buildingName, "Building", "건물"),
        timelineYear: asNumber(record.timelineYear, new Date().getFullYear()),
        changeType: (["construction", "renovation", "repurpose"] as const).includes(record.changeType as never)
          ? (record.changeType as BuildingHistory["changeType"])
          : "construction",
        note: asLocalizedText(record.note, "", ""),
      };
    case "alumniProfiles":
      return {
        id: sourceId,
        name: asString(record.name, "Unnamed Alumni"),
        graduationYear: asNumber(record.graduationYear, new Date().getFullYear()),
        major: asLocalizedText(record.major, "Major", "전공"),
        currentRole: asLocalizedText(record.currentRole, "Current Role", "현재 역할"),
        linkedinUrl: asString(record.linkedinUrl) || undefined,
        snsUrl: asString(record.snsUrl) || undefined,
        consentToShare: asBoolean(record.consentToShare, true),
      };
    case "gradeTasks":
      return {
        id: sourceId,
        grade: asLocalizedText(record.grade, "Grade", "학년"),
        taskTitle: asLocalizedText(record.taskTitle, "Untitled Task", "제목 없는 과제"),
        dueDate: asString(record.dueDate, new Date().toISOString().slice(0, 10)),
        owner: asLocalizedText(record.owner, "Owner", "담당"),
        status: asLocalizedText(record.status, "todo", "할 일"),
      };
  }
}

async function ensureArchiveOverrideTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS archive_section_records (
      id TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      source_id INTEGER NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(section, source_id)
    )
  `);
}

export async function getArchiveOverrideRows(section?: ArchiveSection): Promise<ArchiveOverrideRow[]> {
  await ensureArchiveOverrideTable();
  if (section) {
    return prisma.$queryRawUnsafe<ArchiveOverrideRow[]>(
      `SELECT id, section, source_id AS "sourceId", payload, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM archive_section_records WHERE section = $1 ORDER BY source_id ASC`,
      section,
    );
  }
  return prisma.$queryRawUnsafe<ArchiveOverrideRow[]>(
    `SELECT id, section, source_id AS "sourceId", payload, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM archive_section_records ORDER BY section ASC, source_id ASC`,
  );
}

export async function getRuntimeArchiveDataset(): Promise<ArchiveDataset> {
  const merged = structuredClone(archiveDataset) as ArchiveDataset;
  const rows = await getArchiveOverrideRows();

  for (const row of rows) {
    if (!(row.section in merged)) continue;
    const section = row.section as ArchiveSection;
    const list = merged[section] as ArchiveRecord[];
    const normalized = normalizeArchiveRecord(section, row.sourceId, row.payload);
    const index = list.findIndex((item) => item.id === row.sourceId);
    if (index >= 0) {
      list[index] = normalized;
    } else {
      list.push(normalized);
      list.sort((a, b) => a.id - b.id);
    }
  }

  return merged;
}

export async function getRuntimeArchiveSectionItems(section: ArchiveSection): Promise<ArchiveRecord[]> {
  const dataset = await getRuntimeArchiveDataset();
  return dataset[section] as ArchiveRecord[];
}

export async function getRuntimeArchiveItemById(section: ArchiveSection, id: number): Promise<ArchiveRecord | undefined> {
  const items = await getRuntimeArchiveSectionItems(section);
  return items.find((item) => item.id === id);
}

export async function getRuntimeArchiveYears(): Promise<string[]> {
  const dataset = await getRuntimeArchiveDataset();
  const years = new Set<string>();
  for (const section of Object.keys(dataset) as ArchiveSection[]) {
    for (const item of dataset[section]) {
      const record = item as unknown as Record<string, unknown>;
      const candidates = [
        typeof record.projectYear === "number" ? String(record.projectYear) : null,
        typeof record.timelineYear === "number" ? String(record.timelineYear) : null,
        typeof record.graduationYear === "number" ? String(record.graduationYear) : null,
        typeof record.awardDate === "string" ? record.awardDate.slice(0, 4) : null,
        typeof record.announcedAt === "string" ? record.announcedAt.slice(0, 4) : null,
        typeof record.eventDate === "string" ? record.eventDate.slice(0, 4) : null,
        typeof record.publishDate === "string" ? record.publishDate.slice(0, 4) : null,
        typeof record.dueDate === "string" ? record.dueDate.slice(0, 4) : null,
        typeof record.academicYear === "string" ? record.academicYear.slice(0, 4) : null,
        typeof record.period === "string" ? record.period.slice(0, 4) : null,
      ];
      for (const candidate of candidates) {
        if (candidate) years.add(candidate);
      }
    }
  }
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

export async function listArchiveEditorItems(section: ArchiveSection, locale: Locale): Promise<ArchiveEditorItem[]> {
  const baseItems = await getRuntimeArchiveSectionItems(section);
  const overrides = await getArchiveOverrideRows(section);
  const overrideIds = new Set(overrides.map((row) => row.sourceId));

  return baseItems
    .map((item) => ({
      id: item.id,
      title: getEditorTitle(section, item, locale),
      isOverride: overrideIds.has(item.id),
      payload: item,
    }))
    .sort((a, b) => a.id - b.id);
}

function getEditorTitle(section: ArchiveSection, item: ArchiveRecord, locale: Locale): string {
  switch (section) {
    case "projects":
      return getLocalizedText((item as ArchiveProject).title, locale);
    case "awards":
      return getLocalizedText((item as Award).title, locale);
    case "varsityTeams":
      return getLocalizedText((item as VarsityTeam).name, locale);
    case "courseAnnouncements":
      return getLocalizedText((item as CourseAnnouncement).title, locale);
    case "clubReports":
      return getLocalizedText((item as ClubReport).reportTitle, locale);
    case "schoolEvents":
      return getLocalizedText((item as SchoolEvent).title, locale);
    case "publications":
      return getLocalizedText((item as Publication).title, locale);
    case "schoolProfiles":
      return getLocalizedText((item as SchoolProfile).title, locale);
    case "buildingHistory":
      return getLocalizedText((item as BuildingHistory).buildingName, locale);
    case "alumniProfiles":
      return (item as AlumniProfile).name;
    case "gradeTasks":
      return getLocalizedText((item as GradeTask).taskTitle, locale);
  }
}

export async function getNextArchiveSourceId(section: ArchiveSection): Promise<number> {
  const items = await getRuntimeArchiveSectionItems(section);
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function getEmptyArchiveRecord(section: ArchiveSection, sourceId: number): ArchiveRecord {
  return normalizeArchiveRecord(section, sourceId, { id: sourceId });
}

export async function saveArchiveOverride(section: ArchiveSection, sourceId: number, payload: unknown): Promise<ArchiveRecord> {
  await ensureArchiveOverrideTable();
  const normalized = normalizeArchiveRecord(section, sourceId, payload);
  await prisma.$executeRawUnsafe(
    `INSERT INTO archive_section_records (id, section, source_id, payload, created_at, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW())
     ON CONFLICT (section, source_id)
     DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    randomUUID(),
    section,
    sourceId,
    JSON.stringify(normalized),
  );
  return normalized;
}

export async function deleteArchiveOverride(section: ArchiveSection, sourceId: number) {
  await ensureArchiveOverrideTable();
  await prisma.$executeRawUnsafe(
    `DELETE FROM archive_section_records WHERE section = $1 AND source_id = $2`,
    section,
    sourceId,
  );
}
