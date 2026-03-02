import { NextResponse } from "next/server";
import { getRuntimeArchiveItemById } from "@/lib/archiveAdminStore";
import { archiveSectionMeta } from "@/lib/archiveMeta";
import { getServerLocale } from "@/lib/serverLocale";
import {
  getArchiveSectionLabel,
  getArchiveItemFields,
  getArchiveItemSummary,
  getArchiveItemTitle,
  isArchiveSection,
} from "@/lib/archivePresentation";

interface RouteContext {
  params: Promise<{ section: string; id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const locale = await getServerLocale();
  const { section: rawSection, id: rawId } = await context.params;
  if (!isArchiveSection(rawSection)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const item = await getRuntimeArchiveItemById(rawSection, id);
  if (!item) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  const meta = archiveSectionMeta[rawSection];
  const payload = {
    section: getArchiveSectionLabel(rawSection, locale),
    id,
    title: getArchiveItemTitle(rawSection, item, locale),
    summary: getArchiveItemSummary(rawSection, item, locale),
    meta,
    fields: getArchiveItemFields(rawSection, item, locale),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${rawSection}-${id}.json"`,
    },
  });
}
