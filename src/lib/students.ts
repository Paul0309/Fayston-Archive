import { ensurePersonalPageProjectExtensions } from "@/lib/personalPage";
import { prisma } from "@/lib/prisma";
import { deriveGradeLevelFromGraduationYear } from "@/lib/studentProfile";

export interface PublicStudentProfile {
  username: string;
  name: string;
  gradeLevel: string;
  graduationYear: string;
  headline: string;
  bio: string;
  targetMajors: string[];
  publicProjects: {
    id: string;
    title: string;
    year: string;
    summary: string;
    link: string;
    status: string;
  }[];
}

interface StudentRow {
  username: string | null;
  name: string | null;
  gradeLevel: string | null;
  graduationYear: string | null;
  headline: string | null;
  bio: string | null;
  targetMajors: string[] | null;
}

interface StudentProjectRow {
  id: string;
  username: string | null;
  title: string;
  year: string | null;
  summary: string;
  link: string | null;
  status: string | null;
}

function mapStudent(row: StudentRow | null | undefined): PublicStudentProfile | null {
  if (!row?.username) {
    return null;
  }

  return {
    username: row.username,
    name: row.name || row.username || "Student",
    gradeLevel: deriveGradeLevelFromGraduationYear(row.graduationYear) || row.gradeLevel || "Unspecified",
    graduationYear: row.graduationYear || "",
    headline: row.headline || "",
    bio: row.bio || "",
    targetMajors: row.targetMajors || [],
    publicProjects: [],
  };
}

export async function getPublicStudentProfiles() {
  await ensurePersonalPageProjectExtensions();

  const rows = await prisma.$queryRaw<StudentRow[]>`
    SELECT
      u."username" AS "username",
      u."name" AS "name",
      p."gradeLevel" AS "gradeLevel",
      p."graduationYear" AS "graduationYear",
      p."headline" AS "headline",
      p."bio" AS "bio",
      p."targetMajors" AS "targetMajors"
    FROM "User" u
    INNER JOIN "PersonalPage" p
      ON p."userId" = u."id"
    WHERE p."profileVisibility" = 'DIRECTORY'
    ORDER BY p."gradeLevel" ASC, u."name" ASC NULLS LAST, u."username" ASC
  `;

  return rows
    .map(mapStudent)
    .filter((student): student is PublicStudentProfile => student !== null);
}

export async function getPublicStudentProfile(username: string) {
  await ensurePersonalPageProjectExtensions();

  const rows = await prisma.$queryRaw<StudentRow[]>`
    SELECT
      u."username" AS "username",
      u."name" AS "name",
      p."gradeLevel" AS "gradeLevel",
      p."graduationYear" AS "graduationYear",
      p."headline" AS "headline",
      p."bio" AS "bio",
      p."targetMajors" AS "targetMajors"
    FROM "User" u
    INNER JOIN "PersonalPage" p
      ON p."userId" = u."id"
    WHERE u."username" = ${username}
      AND p."profileVisibility" = 'DIRECTORY'
    LIMIT 1
  `;

  const student = mapStudent(rows[0] ?? null);
  if (!student) {
    return null;
  }

  const projects = await prisma.$queryRaw<StudentProjectRow[]>`
    SELECT
      pr."id" AS "id",
      u."username" AS "username",
      pr."title" AS "title",
      pr."year" AS "year",
      pr."summary" AS "summary",
      pr."link" AS "link",
      pr."status" AS "status"
    FROM "PrivateProject" pr
    INNER JOIN "PersonalPage" p
      ON p."id" = pr."pageId"
    INNER JOIN "User" u
      ON u."id" = p."userId"
    WHERE u."username" = ${username}
      AND p."profileVisibility" = 'DIRECTORY'
      AND pr."isPublic" = true
    ORDER BY pr."sortOrder" ASC, pr."createdAt" ASC
  `;

  student.publicProjects = projects.map((item) => ({
    id: item.id,
    title: item.title,
    year: item.year ?? "",
    summary: item.summary,
    link: item.link ?? "",
    status: item.status ?? "",
  }));

  return student;
}

export function groupStudentsByGrade(students: PublicStudentProfile[]) {
  return students.reduce<Record<string, PublicStudentProfile[]>>((acc, student) => {
    const key = student.gradeLevel || "Unspecified";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(student);
    return acc;
  }, {});
}

export function filterStudents(
  students: PublicStudentProfile[],
  query: string,
  grade: string,
) {
  const q = query.trim().toLowerCase();

  return students.filter((student) => {
    const matchesGrade = !grade || grade === "All" || student.gradeLevel === grade;
    if (!matchesGrade) {
      return false;
    }

    if (!q) {
      return true;
    }

    const haystack = [
      student.name,
      student.username,
      student.gradeLevel,
      student.headline,
      student.bio,
      ...student.targetMajors,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
