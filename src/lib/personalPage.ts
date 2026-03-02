import { prisma } from "@/lib/prisma";
import { deriveGradeLevelFromGraduationYear } from "@/lib/studentProfile";

export async function ensurePersonalPageProjectExtensions() {
  await prisma.$executeRaw`
    ALTER TABLE "PrivateProject"
    ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false
  `;
}

export async function ensurePersonalPageRecordExtensions() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "StandardizedTestRecord" (
      "id" TEXT PRIMARY KEY,
      "pageId" TEXT NOT NULL REFERENCES "PersonalPage"("id") ON DELETE CASCADE,
      "testType" TEXT NOT NULL,
      "testDate" TEXT,
      "score" TEXT NOT NULL,
      "notes" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ClubRecord" (
      "id" TEXT PRIMARY KEY,
      "pageId" TEXT NOT NULL REFERENCES "PersonalPage"("id") ON DELETE CASCADE,
      "name" TEXT NOT NULL,
      "roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "gradeLevel" TEXT,
      "academicYear" TEXT,
      "notes" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "HonorRecord" (
      "id" TEXT PRIMARY KEY,
      "pageId" TEXT NOT NULL REFERENCES "PersonalPage"("id") ON DELETE CASCADE,
      "title" TEXT NOT NULL,
      "issuer" TEXT,
      "awardDate" TEXT,
      "notes" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CompetitionRecord" (
      "id" TEXT PRIMARY KEY,
      "pageId" TEXT NOT NULL REFERENCES "PersonalPage"("id") ON DELETE CASCADE,
      "title" TEXT NOT NULL,
      "organizer" TEXT,
      "result" TEXT,
      "competitionDate" TEXT,
      "notes" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function ensureTranscriptDocumentExtensions() {
  await prisma.$executeRaw`
    ALTER TABLE "TranscriptDocument"
    ADD COLUMN IF NOT EXISTS "academicYear" TEXT
  `;
  await prisma.$executeRaw`
    ALTER TABLE "TranscriptDocument"
    ADD COLUMN IF NOT EXISTS "quarter" TEXT
  `;
  await prisma.$executeRaw`
    ALTER TABLE "TranscriptDocument"
    ADD COLUMN IF NOT EXISTS "gradeLevelLabel" TEXT
  `;
  await prisma.$executeRaw`
    ALTER TABLE "TranscriptDocument"
    ADD COLUMN IF NOT EXISTS "notes" TEXT
  `;
  await prisma.$executeRaw`
    ALTER TABLE "TranscriptDocument"
    ADD COLUMN IF NOT EXISTS "extractedText" TEXT
  `;
}

export interface PersonalPagePayload {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    role: string;
  };
  page: {
    gradeLevel: string;
    profileVisibility: string;
    headline: string;
    bio: string;
    graduationYear: string;
    targetMajors: string[];
    targetColleges: string[];
    transcriptNote: string;
    transcriptDocs: {
      id: string;
      title: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      academicYear: string;
      quarter: string;
      gradeLevel: string;
      notes: string;
      createdAt: string;
    }[];
    transcripts: {
      id: string;
      term: string;
      course: string;
      grade: string;
      notes: string;
      sortOrder: number;
    }[];
    projects: {
      id: string;
      title: string;
      year: string;
      summary: string;
      link: string;
      status: string;
      isPublic: boolean;
      sortOrder: number;
    }[];
    standardizedTests: {
      id: string;
      testType: string;
      testDate: string;
      score: string;
      notes: string;
      sortOrder: number;
    }[];
    clubs: {
      id: string;
      name: string;
      roles: string[];
      gradeLevel: string;
      academicYear: string;
      notes: string;
      sortOrder: number;
    }[];
    honors: {
      id: string;
      title: string;
      issuer: string;
      awardDate: string;
      notes: string;
      sortOrder: number;
    }[];
    competitions: {
      id: string;
      title: string;
      organizer: string;
      result: string;
      competitionDate: string;
      notes: string;
      sortOrder: number;
    }[];
  };
}

export async function getOrCreatePersonalPageByUserId(userId: string) {
  await ensurePersonalPageProjectExtensions();
  await ensureTranscriptDocumentExtensions();
  await ensurePersonalPageRecordExtensions();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalPage: {
        include: {
          transcripts: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          transcriptDocs: {
            orderBy: [{ createdAt: "desc" }],
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  if (user.personalPage) {
    return user;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      personalPage: {
        create: {},
      },
    },
    include: {
      personalPage: {
        include: {
          transcripts: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          transcriptDocs: {
            orderBy: [{ createdAt: "desc" }],
          },
        },
      },
    },
  });
}

export function serializePersonalPage(
  user: Awaited<ReturnType<typeof getOrCreatePersonalPageByUserId>>,
): PersonalPagePayload | null {
  if (!user || !user.personalPage) {
    return null;
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    page: {
      headline: user.personalPage.headline ?? "",
      gradeLevel:
        deriveGradeLevelFromGraduationYear(user.personalPage.graduationYear) ||
        user.personalPage.gradeLevel ||
        "",
      profileVisibility: user.personalPage.profileVisibility ?? "PRIVATE",
      bio: user.personalPage.bio ?? "",
      graduationYear: user.personalPage.graduationYear ?? "",
      targetMajors: user.personalPage.targetMajors,
      targetColleges: user.personalPage.targetColleges,
      transcriptNote: user.personalPage.transcriptNote ?? "",
      transcriptDocs: user.personalPage.transcriptDocs.map((item) => ({
        id: item.id,
        title: item.title,
        originalName: item.originalName,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        academicYear: "",
        quarter: "",
        gradeLevel: "",
        notes: "",
        createdAt: item.createdAt.toISOString(),
      })),
      transcripts: user.personalPage.transcripts.map((item) => ({
        id: item.id,
        term: item.term,
        course: item.course,
        grade: item.grade,
        notes: item.notes ?? "",
        sortOrder: item.sortOrder,
      })),
      projects: [],
      standardizedTests: [],
      clubs: [],
      honors: [],
      competitions: [],
    },
  };
}

export async function attachPersonalProjects(
  payload: PersonalPagePayload | null,
  pageId: string | null | undefined,
) {
  if (!payload || !pageId) {
    return payload;
  }

  await ensureTranscriptDocumentExtensions();
  await ensurePersonalPageRecordExtensions();

  const rows = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      year: string | null;
      summary: string;
      link: string | null;
      status: string | null;
      isPublic: boolean;
      sortOrder: number;
    }[]
  >`
    SELECT
      "id",
      "title",
      "year",
      "summary",
      "link",
      "status",
      "isPublic",
      "sortOrder"
    FROM "PrivateProject"
    WHERE "pageId" = ${pageId}
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  payload.page.projects = rows.map((item) => ({
    id: item.id,
    title: item.title,
    year: item.year ?? "",
    summary: item.summary,
    link: item.link ?? "",
    status: item.status ?? "",
    isPublic: item.isPublic,
    sortOrder: item.sortOrder,
  }));

  const transcriptDocs = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      academicYear: string | null;
      quarter: string | null;
      gradeLevelLabel: string | null;
      notes: string | null;
      createdAt: Date;
    }[]
  >`
    SELECT
      "id",
      "title",
      "originalName",
      "mimeType",
      "sizeBytes",
      "academicYear",
      "quarter",
      "gradeLevelLabel",
      "notes",
      "createdAt"
    FROM "TranscriptDocument"
    WHERE "pageId" = ${pageId}
    ORDER BY "createdAt" DESC
  `;

  payload.page.transcriptDocs = transcriptDocs.map((item) => ({
    id: item.id,
    title: item.title,
    originalName: item.originalName,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    academicYear: item.academicYear ?? "",
    quarter: item.quarter ?? "",
    gradeLevel: item.gradeLevelLabel ?? "",
    notes: item.notes ?? "",
    createdAt: item.createdAt.toISOString(),
  }));

  const standardizedTests = await prisma.$queryRaw<
    {
      id: string;
      testType: string;
      testDate: string | null;
      score: string;
      notes: string | null;
      sortOrder: number;
    }[]
  >`
    SELECT
      "id",
      "testType",
      "testDate",
      "score",
      "notes",
      "sortOrder"
    FROM "StandardizedTestRecord"
    WHERE "pageId" = ${pageId}
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  payload.page.standardizedTests = standardizedTests.map((item) => ({
    id: item.id,
    testType: item.testType,
    testDate: item.testDate ?? "",
    score: item.score,
    notes: item.notes ?? "",
    sortOrder: item.sortOrder,
  }));

  const clubs = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      roles: string[];
      gradeLevel: string | null;
      academicYear: string | null;
      notes: string | null;
      sortOrder: number;
    }[]
  >`
    SELECT
      "id",
      "name",
      "roles",
      "gradeLevel",
      "academicYear",
      "notes",
      "sortOrder"
    FROM "ClubRecord"
    WHERE "pageId" = ${pageId}
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  payload.page.clubs = clubs.map((item) => ({
    id: item.id,
    name: item.name,
    roles: item.roles ?? [],
    gradeLevel: item.gradeLevel ?? "",
    academicYear: item.academicYear ?? "",
    notes: item.notes ?? "",
    sortOrder: item.sortOrder,
  }));

  const honors = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      issuer: string | null;
      awardDate: string | null;
      notes: string | null;
      sortOrder: number;
    }[]
  >`
    SELECT
      "id",
      "title",
      "issuer",
      "awardDate",
      "notes",
      "sortOrder"
    FROM "HonorRecord"
    WHERE "pageId" = ${pageId}
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  payload.page.honors = honors.map((item) => ({
    id: item.id,
    title: item.title,
    issuer: item.issuer ?? "",
    awardDate: item.awardDate ?? "",
    notes: item.notes ?? "",
    sortOrder: item.sortOrder,
  }));

  const competitions = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      organizer: string | null;
      result: string | null;
      competitionDate: string | null;
      notes: string | null;
      sortOrder: number;
    }[]
  >`
    SELECT
      "id",
      "title",
      "organizer",
      "result",
      "competitionDate",
      "notes",
      "sortOrder"
    FROM "CompetitionRecord"
    WHERE "pageId" = ${pageId}
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;

  payload.page.competitions = competitions.map((item) => ({
    id: item.id,
    title: item.title,
    organizer: item.organizer ?? "",
    result: item.result ?? "",
    competitionDate: item.competitionDate ?? "",
    notes: item.notes ?? "",
    sortOrder: item.sortOrder,
  }));

  return payload;
}
