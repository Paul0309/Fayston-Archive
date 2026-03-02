import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { answerCounselorQuestion, buildCounselorInsights, type CounselorMessage } from "@/lib/collegeCounselor";
import { attachPersonalProjects, getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";
import { getServerLocale } from "@/lib/serverLocale";
import { getTranscriptDocumentContexts } from "@/lib/transcriptExtraction";

async function resolveAuthorizedUser(username: string, sessionUserId: string, sessionRole?: string | null) {
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    return { error: "Not found", status: 404 as const };
  }

  if (targetUser.id !== sessionUserId && !isAdminRole(sessionRole)) {
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

  const locale = await getServerLocale();
  const { username } = await context.params;
  const resolved = await resolveAuthorizedUser(username, session.user.id, session.user.role);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const user = await getOrCreatePersonalPageByUserId(resolved.userId);
  const payload = await attachPersonalProjects(serializePersonalPage(user), user?.personalPage?.id);
  if (!payload) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const transcriptDocuments = await getTranscriptDocumentContexts(user?.personalPage?.id);
  return NextResponse.json({ insights: await buildCounselorInsights(payload, locale, transcriptDocuments) });
}

export async function POST(
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

  const { question, history } = (await request.json()) as {
    question?: string;
    history?: CounselorMessage[];
  };
  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const locale = await getServerLocale();
  const user = await getOrCreatePersonalPageByUserId(resolved.userId);
  const payload = await attachPersonalProjects(serializePersonalPage(user), user?.personalPage?.id);
  if (!payload) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const transcriptDocuments = await getTranscriptDocumentContexts(user?.personalPage?.id);
  return NextResponse.json({
    answer: await answerCounselorQuestion(
      payload,
      question,
      locale,
      transcriptDocuments,
      Array.isArray(history) ? history : [],
    ),
  });
}
