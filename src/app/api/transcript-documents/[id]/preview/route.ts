import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { privateStoragePath } from "@/lib/privateFiles";
import { isAdminRole } from "@/lib/roles";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const document = await prisma.transcriptDocument.findUnique({
    where: { id },
    include: {
      page: {
        include: {
          user: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canAccess = document.page.user.id === session.user.id || isAdminRole(session.user.role);
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bytes = await readFile(privateStoragePath(document.relativePath));

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": document.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(document.originalName)}"`,
      "Cache-Control": "private, no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
