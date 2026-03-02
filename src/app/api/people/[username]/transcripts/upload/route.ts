import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureTranscriptDocumentExtensions, getOrCreatePersonalPageByUserId } from "@/lib/personalPage";
import { saveTranscriptFile } from "@/lib/privateFiles";
import { isAdminRole } from "@/lib/roles";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await context.params;
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (targetUser.id !== session.user.id && !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const titleInput = clean(formData.get("title"));
  const academicYear = clean(formData.get("academicYear"));
  const quarter = clean(formData.get("quarter"));
  const gradeLevel = clean(formData.get("gradeLevel"));
  const notes = clean(formData.get("notes"));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File must be between 1 byte and 10MB" }, { status: 400 });
  }

  const user = await getOrCreatePersonalPageByUserId(targetUser.id);
  if (!user?.personalPage) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await ensureTranscriptDocumentExtensions();

  const doc = await prisma.transcriptDocument.create({
    data: {
      pageId: user.personalPage.id,
      title: titleInput || file.name,
      originalName: file.name,
      storedName: "",
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      relativePath: "",
    },
  });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const saved = await saveTranscriptFile({
    userId: targetUser.id,
    documentId: doc.id,
    fileName: file.name,
    bytes,
  });

  const updated = await prisma.transcriptDocument.update({
    where: { id: doc.id },
    data: {
      storedName: saved.storedName,
      relativePath: saved.relativePath,
    },
    select: {
      id: true,
      title: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  });

  await prisma.$executeRaw`
    UPDATE "TranscriptDocument"
    SET
      "academicYear" = ${academicYear || null},
      "quarter" = ${quarter || null},
      "gradeLevelLabel" = ${gradeLevel || null},
      "notes" = ${notes || null}
    WHERE "id" = ${doc.id}
  `;

  return NextResponse.json({
    document: {
      ...updated,
      academicYear,
      quarter,
      gradeLevel,
      notes,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}
