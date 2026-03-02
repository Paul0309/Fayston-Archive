import { NextResponse } from "next/server";
import { getRuntimeArchiveDataset } from "@/lib/archiveAdminStore";
import { searchArchive } from "@/lib/archiveSearch";
import { isArchiveSection } from "@/lib/archivePresentation";
import { getServerLocale } from "@/lib/serverLocale";

export async function GET(request: Request) {
  const locale = await getServerLocale();
  const dataset = await getRuntimeArchiveDataset();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const sectionParam = searchParams.get("section") ?? "";
  const year = searchParams.get("year") ?? "";
  const verification = searchParams.get("verification");

  const results = searchArchive(
    query,
    {
      section: isArchiveSection(sectionParam) ? sectionParam : undefined,
      year: year || undefined,
      verification:
        verification === "official" || verification === "reviewing"
          ? verification
          : undefined,
    },
    locale,
    dataset,
  );

  return NextResponse.json({ query, count: results.length, results });
}
