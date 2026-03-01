import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";

interface PageBody {
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
  }[];
}

function clean(value?: string) {
  return value?.trim() ?? "";
}

function cleanList(values?: string[]) {
  return (values ?? []).map((value) => clean(value)).filter(Boolean);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getOrCreatePersonalPageByUserId(session.user.id);
  return NextResponse.json({ payload: serializePersonalPage(user) });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PageBody;
  const user = await getOrCreatePersonalPageByUserId(session.user.id);

  if (!user?.personalPage) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const transcripts = (body.transcripts ?? [])
    .map((item, index) => ({
      id: item.id,
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
      sortOrder: index,
    }))
    .filter((item) => item.title || item.summary || item.year || item.link || item.status);

  await prisma.personalPage.update({
    where: { id: user.personalPage.id },
    data: {
      headline: clean(body.headline) || null,
      bio: clean(body.bio) || null,
      graduationYear: clean(body.graduationYear) || null,
      targetMajors: cleanList(body.targetMajors),
      targetColleges: cleanList(body.targetColleges),
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

  const refreshed = await getOrCreatePersonalPageByUserId(session.user.id);
  return NextResponse.json({ payload: serializePersonalPage(refreshed) });
}
