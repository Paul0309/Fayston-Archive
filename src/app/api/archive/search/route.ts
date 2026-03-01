import { NextResponse } from "next/server";
import { searchArchive } from "@/lib/archiveSearch";
import { isArchiveSection } from "@/lib/archivePresentation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const sectionParam = searchParams.get("section") ?? "";
  const year = searchParams.get("year") ?? "";
  const verification = searchParams.get("verification");

  const results = searchArchive(query, {
    section: isArchiveSection(sectionParam) ? sectionParam : undefined,
    year: year || undefined,
    verification:
      verification === "official" || verification === "reviewing"
        ? verification
        : undefined,
  });

  return NextResponse.json({ query, count: results.length, results });
}
