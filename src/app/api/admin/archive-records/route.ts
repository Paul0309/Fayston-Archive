import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  deleteArchiveOverride,
  getEmptyArchiveRecord,
  getNextArchiveSourceId,
  listArchiveEditorItems,
  saveArchiveOverride,
} from "@/lib/archiveAdminStore";
import { type ArchiveSection } from "@/lib/archiveData";
import { isArchiveSection } from "@/lib/archivePresentation";
import { isAdminRole } from "@/lib/roles";
import { getServerLocale } from "@/lib/serverLocale";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdminRole(session.user.role)) {
    return null;
  }
  return session;
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawSection = searchParams.get("section") ?? "";
  if (!isArchiveSection(rawSection)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  const locale = await getServerLocale();
  const items = await listArchiveEditorItems(rawSection, locale);
  const nextId = await getNextArchiveSourceId(rawSection);

  return NextResponse.json({
    section: rawSection,
    nextId,
    template: getEmptyArchiveRecord(rawSection, nextId),
    items,
  });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    section?: string;
    sourceId?: number;
    payload?: unknown;
  };

  if (!body.section || !isArchiveSection(body.section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  const sourceId = typeof body.sourceId === "number" ? body.sourceId : await getNextArchiveSourceId(body.section);
  const saved = await saveArchiveOverride(body.section, sourceId, body.payload);
  const locale = await getServerLocale();
  const items = await listArchiveEditorItems(body.section, locale);

  return NextResponse.json({
    section: body.section,
    sourceId,
    saved,
    items,
  });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawSection = searchParams.get("section") ?? "";
  const rawSourceId = Number(searchParams.get("sourceId"));
  if (!isArchiveSection(rawSection) || Number.isNaN(rawSourceId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await deleteArchiveOverride(rawSection as ArchiveSection, rawSourceId);
  const locale = await getServerLocale();
  const items = await listArchiveEditorItems(rawSection as ArchiveSection, locale);
  const nextId = await getNextArchiveSourceId(rawSection as ArchiveSection);

  return NextResponse.json({
    section: rawSection,
    items,
    nextId,
    template: getEmptyArchiveRecord(rawSection as ArchiveSection, nextId),
  });
}
