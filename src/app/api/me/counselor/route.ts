import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { answerCounselorQuestion, buildCounselorInsights, type CounselorMessage } from "@/lib/collegeCounselor";
import { attachPersonalProjects, getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";
import { getServerLocale } from "@/lib/serverLocale";
import { getTranscriptDocumentContexts } from "@/lib/transcriptExtraction";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locale = await getServerLocale();
  const user = await getOrCreatePersonalPageByUserId(session.user.id);
  const payload = await attachPersonalProjects(serializePersonalPage(user), user?.personalPage?.id);
  if (!payload) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const transcriptDocuments = await getTranscriptDocumentContexts(user?.personalPage?.id);
  return NextResponse.json({ insights: await buildCounselorInsights(payload, locale, transcriptDocuments) });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, history } = (await request.json()) as {
    question?: string;
    history?: CounselorMessage[];
  };
  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const locale = await getServerLocale();
  const user = await getOrCreatePersonalPageByUserId(session.user.id);
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
