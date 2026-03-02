import { NextResponse } from "next/server";
import { getRuntimeArchiveSectionItems } from "@/lib/archiveAdminStore";

export async function GET() {
  return NextResponse.json(await getRuntimeArchiveSectionItems("projects"));
}
