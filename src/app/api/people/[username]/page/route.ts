import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { deriveGradeLevelFromGraduationYear } from "@/lib/studentProfile";
import {
  attachPersonalProjects,
  ensurePersonalPageRecordExtensions,
  ensurePersonalPageProjectExtensions,
  getOrCreatePersonalPageByUserId,
  serializePersonalPage,
} from "@/lib/personalPage";

interface PageBody {
  gradeLevel?: string;
  profileVisibility?: string;
  headline?: string;
  bio?: string;
  graduationYear?: string;
  targetMajors?: string[];
  targetColleges?: string[];
  transcriptNote?: string;
  transcripts?: {
    id?: string;
    term?: string;
    course?: string;
    grade?: string;
    notes?: string;
  }[];
  projects?: {
    id?: string;
    title?: string;
    year?: string;
    summary?: string;
    link?: string;
    status?: string;
    isPublic?: boolean;
  }[];
  standardizedTests?: {
    id?: string;
    testType?: string;
    testDate?: string;
    score?: string;
    notes?: string;
  }[];
  clubs?: {
    id?: string;
    name?: string;
    roles?: string[];
    gradeLevel?: string;
    academicYear?: string;
    notes?: string;
  }[];
  honors?: {
    id?: string;
    title?: string;
    issuer?: string;
    awardDate?: string;
    notes?: string;
  }[];
  competitions?: {
    id?: string;
    title?: string;
    organizer?: string;
    result?: string;
    competitionDate?: string;
    notes?: string;
  }[];
}

function clean(value?: string) {
  return value?.trim() ?? "";
}

function cleanList(values?: string[]) {
  return (values ?? []).map((value) => clean(value)).filter(Boolean);
}

async function resolveAuthorizedUser(username: string, sessionUserId: string, sessionRole?: string | null) {
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });

  if (!targetUser) {
    return { error: "Not found", status: 404 as const };
  }

  const canAccess = targetUser.id === sessionUserId || isAdminRole(sessionRole);
  if (!canAccess) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { userId: targetUser.id };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await context.params;
  const resolved = await resolveAuthorizedUser(username, session.user.id, session.user.role);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const user = await getOrCreatePersonalPageByUserId(resolved.userId);
  return NextResponse.json({
    payload: await attachPersonalProjects(serializePersonalPage(user), user?.personalPage?.id),
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await context.params;
  const resolved = await resolveAuthorizedUser(username, session.user.id, session.user.role);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const body = (await request.json()) as PageBody;
  const user = await getOrCreatePersonalPageByUserId(resolved.userId);

  if (!user?.personalPage) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const pageId = user.personalPage.id;
  await ensurePersonalPageProjectExtensions();
  await ensurePersonalPageRecordExtensions();
  const graduationYear = clean(body.graduationYear) || null;
  const derivedGradeLevel = deriveGradeLevelFromGraduationYear(graduationYear);

  const transcripts = (body.transcripts ?? [])
    .map((item, index) => ({
      term: clean(item.term),
      course: clean(item.course),
      grade: clean(item.grade),
      notes: clean(item.notes),
      sortOrder: index,
    }))
    .filter((item) => item.term || item.course || item.grade || item.notes);

  const projects = (body.projects ?? [])
    .map((item, index) => ({
      id: item.id,
      title: clean(item.title),
      year: clean(item.year),
      summary: clean(item.summary),
      link: clean(item.link),
      status: clean(item.status),
      isPublic: Boolean(item.isPublic),
      sortOrder: index,
    }))
    .filter((item) => item.title || item.summary || item.year || item.link || item.status);

  const standardizedTests = (body.standardizedTests ?? [])
    .map((item, index) => ({
      id: item.id,
      testType: clean(item.testType),
      testDate: clean(item.testDate),
      score: clean(item.score),
      notes: clean(item.notes),
      sortOrder: index,
    }))
    .filter((item) => item.testType || item.score || item.testDate || item.notes);

  const clubs = (body.clubs ?? [])
    .map((item, index) => ({
      id: item.id,
      name: clean(item.name),
      roles: cleanList(item.roles),
      gradeLevel: clean(item.gradeLevel),
      academicYear: clean(item.academicYear),
      notes: clean(item.notes),
      sortOrder: index,
    }))
    .filter((item) => item.name || item.roles.length || item.gradeLevel || item.academicYear || item.notes);

  const honors = (body.honors ?? [])
    .map((item, index) => ({
      id: item.id,
      title: clean(item.title),
      issuer: clean(item.issuer),
      awardDate: clean(item.awardDate),
      notes: clean(item.notes),
      sortOrder: index,
    }))
    .filter((item) => item.title || item.issuer || item.awardDate || item.notes);

  const competitions = (body.competitions ?? [])
    .map((item, index) => ({
      id: item.id,
      title: clean(item.title),
      organizer: clean(item.organizer),
      result: clean(item.result),
      competitionDate: clean(item.competitionDate),
      notes: clean(item.notes),
      sortOrder: index,
    }))
    .filter((item) => item.title || item.organizer || item.result || item.competitionDate || item.notes);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "PersonalPage"
      SET
        "headline" = ${clean(body.headline) || null},
        "gradeLevel" = ${derivedGradeLevel || null},
        "profileVisibility" = ${clean(body.profileVisibility) || "PRIVATE"},
        "bio" = ${clean(body.bio) || null},
        "graduationYear" = ${graduationYear},
        "targetMajors" = ${cleanList(body.targetMajors)},
        "targetColleges" = ${cleanList(body.targetColleges)},
        "transcriptNote" = ${clean(body.transcriptNote) || null},
        "updatedAt" = NOW()
      WHERE "id" = ${pageId}
    `;

    await tx.transcriptItem.deleteMany({
      where: { pageId },
    });

    if (transcripts.length > 0) {
      await tx.transcriptItem.createMany({
        data: transcripts.map((item) => ({
          pageId,
          term: item.term,
          course: item.course,
          grade: item.grade,
          notes: item.notes || null,
          sortOrder: item.sortOrder,
        })),
      });
    }

    await tx.$executeRaw`
      DELETE FROM "PrivateProject"
      WHERE "pageId" = ${pageId}
    `;

    for (const item of projects) {
      await tx.$executeRaw`
        INSERT INTO "PrivateProject" (
          "id",
          "pageId",
          "title",
          "year",
          "summary",
          "link",
          "status",
          "isPublic",
          "sortOrder",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${item.id || crypto.randomUUID()},
          ${pageId},
          ${item.title},
          ${item.year || null},
          ${item.summary},
          ${item.link || null},
          ${item.status || null},
          ${item.isPublic},
          ${item.sortOrder},
          NOW(),
          NOW()
        )
      `;
    }

    await tx.$executeRaw`
      DELETE FROM "StandardizedTestRecord"
      WHERE "pageId" = ${pageId}
    `;

    for (const item of standardizedTests) {
      await tx.$executeRaw`
        INSERT INTO "StandardizedTestRecord" (
          "id",
          "pageId",
          "testType",
          "testDate",
          "score",
          "notes",
          "sortOrder",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${item.id || crypto.randomUUID()},
          ${pageId},
          ${item.testType},
          ${item.testDate || null},
          ${item.score},
          ${item.notes || null},
          ${item.sortOrder},
          NOW(),
          NOW()
        )
      `;
    }

    await tx.$executeRaw`
      DELETE FROM "ClubRecord"
      WHERE "pageId" = ${pageId}
    `;

    for (const item of clubs) {
      await tx.$executeRaw`
        INSERT INTO "ClubRecord" (
          "id",
          "pageId",
          "name",
          "roles",
          "gradeLevel",
          "academicYear",
          "notes",
          "sortOrder",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${item.id || crypto.randomUUID()},
          ${pageId},
          ${item.name},
          ${item.roles},
          ${item.gradeLevel || null},
          ${item.academicYear || null},
          ${item.notes || null},
          ${item.sortOrder},
          NOW(),
          NOW()
        )
      `;
    }

    await tx.$executeRaw`
      DELETE FROM "HonorRecord"
      WHERE "pageId" = ${pageId}
    `;

    for (const item of honors) {
      await tx.$executeRaw`
        INSERT INTO "HonorRecord" (
          "id",
          "pageId",
          "title",
          "issuer",
          "awardDate",
          "notes",
          "sortOrder",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${item.id || crypto.randomUUID()},
          ${pageId},
          ${item.title},
          ${item.issuer || null},
          ${item.awardDate || null},
          ${item.notes || null},
          ${item.sortOrder},
          NOW(),
          NOW()
        )
      `;
    }

    await tx.$executeRaw`
      DELETE FROM "CompetitionRecord"
      WHERE "pageId" = ${pageId}
    `;

    for (const item of competitions) {
      await tx.$executeRaw`
        INSERT INTO "CompetitionRecord" (
          "id",
          "pageId",
          "title",
          "organizer",
          "result",
          "competitionDate",
          "notes",
          "sortOrder",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${item.id || crypto.randomUUID()},
          ${pageId},
          ${item.title},
          ${item.organizer || null},
          ${item.result || null},
          ${item.competitionDate || null},
          ${item.notes || null},
          ${item.sortOrder},
          NOW(),
          NOW()
        )
      `;
    }
  });

  const refreshed = await getOrCreatePersonalPageByUserId(resolved.userId);
  return NextResponse.json({
    payload: await attachPersonalProjects(serializePersonalPage(refreshed), refreshed?.personalPage?.id),
  });
}
