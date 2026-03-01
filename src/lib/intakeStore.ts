import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

export interface IntakeSubmissionRecord {
  id: string;
  intakeType: string;
  title: string;
  subtitle: string | null;
  dateLabel: string | null;
  owner: string | null;
  url: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeSubmissionInput {
  intakeType: string;
  title: string;
  subtitle?: string;
  dateLabel?: string;
  owner?: string;
  url?: string;
  notes?: string;
}

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "intake-submissions.json");

async function ensureFile() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, "[]", "utf8");
  }
}

async function readFallback(): Promise<IntakeSubmissionRecord[]> {
  await ensureFile();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as IntakeSubmissionRecord[];
}

async function writeFallback(records: IntakeSubmissionRecord[]) {
  await ensureFile();
  await writeFile(dataFile, JSON.stringify(records, null, 2), "utf8");
}

function normalizeRecord(record: {
  id: string;
  intakeType: string;
  title: string;
  subtitle: string | null;
  dateLabel: string | null;
  owner: string | null;
  url: string | null;
  notes: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}): IntakeSubmissionRecord {
  return {
    ...record,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : record.createdAt.toISOString(),
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : record.updatedAt.toISOString(),
  };
}

export async function listIntakeSubmissions(): Promise<{
  backend: "prisma" | "json";
  submissions: IntakeSubmissionRecord[];
}> {
  try {
    const submissions = await prisma.intakeSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      backend: "prisma",
      submissions: submissions.map((item) => normalizeRecord(item)),
    };
  } catch {
    const submissions = await readFallback();
    return {
      backend: "json",
      submissions: submissions
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 20),
    };
  }
}

export async function createIntakeSubmission(input: IntakeSubmissionInput): Promise<{
  backend: "prisma" | "json";
  submission: IntakeSubmissionRecord;
}> {
  try {
    const created = await prisma.intakeSubmission.create({
      data: {
        intakeType: input.intakeType,
        title: input.title,
        subtitle: input.subtitle,
        dateLabel: input.dateLabel,
        owner: input.owner,
        url: input.url,
        notes: input.notes,
      },
    });

    return {
      backend: "prisma",
      submission: normalizeRecord(created),
    };
  } catch {
    const current = await readFallback();
    const now = new Date().toISOString();
    const submission: IntakeSubmissionRecord = {
      id: `${Date.now()}`,
      intakeType: input.intakeType,
      title: input.title,
      subtitle: input.subtitle ?? null,
      dateLabel: input.dateLabel ?? null,
      owner: input.owner ?? null,
      url: input.url ?? null,
      notes: input.notes ?? null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await writeFallback([submission, ...current]);
    return {
      backend: "json",
      submission,
    };
  }
}
