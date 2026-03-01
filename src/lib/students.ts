import { prisma } from "@/lib/prisma";

export interface PublicStudentProfile {
  username: string;
  name: string;
  gradeLevel: string;
  graduationYear: string;
  headline: string;
  bio: string;
  targetMajors: string[];
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

function mapStudent(row: StudentRow | null | undefined): PublicStudentProfile | null {
  if (!row?.username) {
    return null;
  }

  return {
    username: row.username,
    name: row.name || row.username || "Student",
    gradeLevel: row.gradeLevel || "Unspecified",
    graduationYear: row.graduationYear || "",
    headline: row.headline || "",
    bio: row.bio || "",
    targetMajors: row.targetMajors || [],
  };
}

export async function getPublicStudentProfiles() {
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

  return mapStudent(rows[0] ?? null);
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
