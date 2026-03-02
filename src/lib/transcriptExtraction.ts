import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { privateStoragePath } from "@/lib/privateFiles";
import { ensureTranscriptDocumentExtensions } from "@/lib/personalPage";

export interface TranscriptDocumentContext {
  id: string;
  title: string;
  originalName: string;
  mimeType: string;
  academicYear: string;
  quarter: string;
  gradeLevel: string;
  notes: string;
  extractedText: string;
  facts: TranscriptDocumentFacts | null;
}

export interface TranscriptDocumentFacts {
  schoolYear: string;
  reportedGrade: string;
  finalGpa: string;
  semesterGpas: string[];
  finalAverage: string;
  semesterAverages: string[];
}

function isPdfDocument(mimeType: string, originalName: string) {
  return mimeType === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");
}

function sanitizeExtractedText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseTranscriptFacts(text: string): TranscriptDocumentFacts | null {
  if (!text) return null;

  const schoolYear = text.match(/School Year:\s*([0-9]{4}-[0-9]{4})/i)?.[1] ?? "";
  const reportedGrade = text.match(/Student .*? Grade\s+([0-9]{1,2})/i)?.[1]
    ?? text.match(/Grade\s+([0-9]{1,2})\s+(?:Homeroom|Advisor|Course)/i)?.[1]
    ?? "";

  const gpaMatches = text.match(/Grade Point Average\s+([0-9.]+)(?:\s+([0-9.]+))?(?:\s+([0-9.]+))?/i);
  const averageMatches = text.match(/Numeric Average\s+([0-9.]+)(?:\s+([0-9.]+))?(?:\s+([0-9.]+))?/i);

  const semesterGpas = [gpaMatches?.[1], gpaMatches?.[2]]
    .filter((value): value is string => Boolean(value && value !== "0.00"));
  const finalGpa = gpaMatches?.[3] && gpaMatches[3] !== "0.00"
    ? gpaMatches[3]
    : semesterGpas[semesterGpas.length - 1] ?? "";

  const semesterAverages = [averageMatches?.[1], averageMatches?.[2]]
    .filter((value): value is string => Boolean(value && value !== "0.00"));
  const finalAverage = averageMatches?.[3] && averageMatches[3] !== "0"
    ? averageMatches[3]
    : semesterAverages[semesterAverages.length - 1] ?? "";

  if (!schoolYear && !reportedGrade && !finalGpa && !finalAverage) {
    return null;
  }

  return {
    schoolYear,
    reportedGrade,
    finalGpa,
    semesterGpas,
    finalAverage,
    semesterAverages,
  };
}

async function extractPdfText(relativePath: string) {
  const { PDFParse } = await import("pdf-parse");
  const bytes = await readFile(privateStoragePath(relativePath));
  const parser = new PDFParse({ data: new Uint8Array(bytes) });

  try {
    const parsed = await parser.getText();
    return sanitizeExtractedText(parsed.text || "");
  } finally {
    await parser.destroy();
  }
}

export async function getTranscriptDocumentContexts(pageId: string | null | undefined) {
  if (!pageId) return [];

  await ensureTranscriptDocumentExtensions();
  await prisma.$executeRaw`
    ALTER TABLE "TranscriptDocument"
    ADD COLUMN IF NOT EXISTS "extractedText" TEXT
  `;

  const rows = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      originalName: string;
      mimeType: string;
      relativePath: string;
      academicYear: string | null;
      quarter: string | null;
      gradeLevelLabel: string | null;
      notes: string | null;
      extractedText: string | null;
    }[]
  >`
    SELECT
      "id",
      "title",
      "originalName",
      "mimeType",
      "relativePath",
      "academicYear",
      "quarter",
      "gradeLevelLabel",
      "notes",
      "extractedText"
    FROM "TranscriptDocument"
    WHERE "pageId" = ${pageId}
    ORDER BY "createdAt" DESC
  `;

  const contexts: TranscriptDocumentContext[] = [];

  for (const row of rows) {
    let extractedText = row.extractedText ?? "";

    if (!extractedText && row.relativePath && isPdfDocument(row.mimeType || "", row.originalName)) {
      try {
        extractedText = await extractPdfText(row.relativePath);
        if (extractedText) {
          await prisma.$executeRaw`
            UPDATE "TranscriptDocument"
            SET "extractedText" = ${extractedText}
            WHERE "id" = ${row.id}
          `;
        }
      } catch {
        extractedText = "";
      }
    }

    contexts.push({
      id: row.id,
      title: row.title,
      originalName: row.originalName,
      mimeType: row.mimeType || "",
      academicYear: row.academicYear ?? "",
      quarter: row.quarter ?? "",
      gradeLevel: row.gradeLevelLabel ?? "",
      notes: row.notes ?? "",
      extractedText,
      facts: parseTranscriptFacts(extractedText),
    });
  }

  return contexts;
}
