import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removePrivateFile } from "@/lib/privateFiles";
import { isAdminRole } from "@/lib/roles";

export async function DELETE(
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

  const canManage =
    document.page.user.id === session.user.id || isAdminRole(session.user.role);

  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.transcriptDocument.delete({
    where: { id: document.id },
  });
  await removePrivateFile(document.relativePath);

  return NextResponse.json({ ok: true });
}
