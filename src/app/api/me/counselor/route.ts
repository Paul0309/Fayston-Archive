import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { answerCounselorQuestion, buildCounselorInsights } from "@/lib/collegeCounselor";
import { getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getOrCreatePersonalPageByUserId(session.user.id);
  const payload = serializePersonalPage(user);
  if (!payload) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ insights: buildCounselorInsights(payload) });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question } = (await request.json()) as { question?: string };
  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const user = await getOrCreatePersonalPageByUserId(session.user.id);
  const payload = serializePersonalPage(user);
  if (!payload) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({
    answer: answerCounselorQuestion(payload, question),
  });
}
