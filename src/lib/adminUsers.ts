import { prisma } from "@/lib/prisma";

export interface AdminManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  gradeLevel: string;
  graduationYear: string;
  profileVisibility: string;
  updatedAt: string;
}

export async function getAdminManagedUsers() {
  const rows = await prisma.$queryRaw<
    {
      id: string;
      name: string | null;
      username: string | null;
      email: string | null;
      role: string;
      gradeLevel: string | null;
      graduationYear: string | null;
      profileVisibility: string | null;
      updatedAt: Date | null;
    }[]
  >`
    SELECT
      u."id" AS "id",
      u."name" AS "name",
      u."username" AS "username",
      u."email" AS "email",
      u."role" AS "role",
      p."gradeLevel" AS "gradeLevel",
      p."graduationYear" AS "graduationYear",
      p."profileVisibility" AS "profileVisibility",
      p."updatedAt" AS "updatedAt"
    FROM "User" u
    LEFT JOIN "PersonalPage" p
      ON p."userId" = u."id"
    ORDER BY
      CASE WHEN u."role" = 'ADMIN' THEN 0 ELSE 1 END,
      p."graduationYear" ASC NULLS LAST,
      u."name" ASC NULLS LAST,
      u."username" ASC NULLS LAST,
      u."email" ASC NULLS LAST
  `;

  return rows.map<AdminManagedUser>((row) => ({
    id: row.id,
    name: row.name || row.username || row.email || "Unnamed user",
    username: row.username || "",
    email: row.email || "",
    role: row.role,
    gradeLevel: row.gradeLevel || "",
    graduationYear: row.graduationYear || "",
    profileVisibility: row.profileVisibility || "PRIVATE",
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : "",
  }));
}
