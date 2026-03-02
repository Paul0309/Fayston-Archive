import { NextResponse } from "next/server";
import { getRuntimeArchiveDataset } from "@/lib/archiveAdminStore";

export async function GET() {
  return NextResponse.json(await getRuntimeArchiveDataset());
}
