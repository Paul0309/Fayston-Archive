import { NextResponse } from "next/server";
import { getRuntimeArchiveDataset } from "@/lib/archiveAdminStore";
import { type ArchiveSection } from "@/lib/archiveData";

interface Params {
  params: Promise<{ section: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { section } = await params;
  const archiveDataset = await getRuntimeArchiveDataset();

  if (!(section in archiveDataset)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  return NextResponse.json(archiveDataset[section as ArchiveSection]);
}
