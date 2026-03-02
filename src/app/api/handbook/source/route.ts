import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getHandbookSourcePath } from "@/lib/handbook";

export async function GET() {
  try {
    const file = await readFile(getHandbookSourcePath(), "utf8");
    return new NextResponse(file, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "Handbook source not found" }, { status: 404 });
  }
}
