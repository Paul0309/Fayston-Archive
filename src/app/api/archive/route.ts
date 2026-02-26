import { NextResponse } from "next/server";
import { archiveDataset } from "@/lib/archiveData";

export async function GET() {
  return NextResponse.json(archiveDataset);
}

