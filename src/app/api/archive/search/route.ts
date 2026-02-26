import { NextResponse } from "next/server";
import { searchArchive } from "@/lib/archiveSearch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const results = searchArchive(query);
  return NextResponse.json({ query, count: results.length, results });
}

