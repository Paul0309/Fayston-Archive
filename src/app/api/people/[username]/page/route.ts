import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";

interface PageBody {
  headline?: string;
  bio?: string;
  graduationYear?: string;
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
  }[];
}

function clean(value?: string) {
  return value?.trim() ?? "";
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
  return NextResponse.json({ payload: serializePersonalPage(user) });
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
      title: clean(item.title),
      year: clean(item.year),
      summary: clean(item.summary),
      link: clean(item.link),
      status: clean(item.status),
      sortOrder: index,
    }))
    .filter((item) => item.title || item.summary || item.year || item.link || item.status);

  await prisma.personalPage.update({
    where: { id: user.personalPage.id },
    data: {
      headline: clean(body.headline) || null,
      bio: clean(body.bio) || null,
      graduationYear: clean(body.graduationYear) || null,
      transcriptNote: clean(body.transcriptNote) || null,
      transcripts: {
        deleteMany: {},
        create: transcripts,
      },
      projects: {
        deleteMany: {},
        create: projects,
      },
    },
  });

  const refreshed = await getOrCreatePersonalPageByUserId(resolved.userId);
  return NextResponse.json({ payload: serializePersonalPage(refreshed) });
}
