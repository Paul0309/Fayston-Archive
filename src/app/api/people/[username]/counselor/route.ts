import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { answerCounselorQuestion, buildCounselorInsights } from "@/lib/collegeCounselor";
import { getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";

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

  const { username } = await context.params;
  const resolved = await resolveAuthorizedUser(username, session.user.id, session.user.role);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const user = await getOrCreatePersonalPageByUserId(resolved.userId);
  const payload = serializePersonalPage(user);
  if (!payload) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ insights: buildCounselorInsights(payload) });
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

  const { question } = (await request.json()) as { question?: string };
  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const user = await getOrCreatePersonalPageByUserId(resolved.userId);
  const payload = serializePersonalPage(user);
  if (!payload) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({
    answer: answerCounselorQuestion(payload, question),
  });
}
