import { NextResponse } from "next/server";
import {
  createIntakeSubmission,
  listIntakeSubmissions,
} from "@/lib/intakeStore";

interface IntakeBody {
  type?: string;
  title?: string;
  subtitle?: string;
  date?: string;
  owner?: string;
  url?: string;
  notes?: string;
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function GET() {
  const { backend, submissions } = await listIntakeSubmissions();
  return NextResponse.json({ backend, submissions });
}

export async function POST(request: Request) {
  const body = (await request.json()) as IntakeBody;
  const type = clean(body.type);
  const title = clean(body.title);

  if (!type || !title) {
    return NextResponse.json(
      { error: "type and title are required" },
      { status: 400 },
    );
  }

  const { backend, submission } = await createIntakeSubmission({
    intakeType: type,
    title,
    subtitle: clean(body.subtitle),
    dateLabel: clean(body.date),
    owner: clean(body.owner),
    url: clean(body.url),
    notes: clean(body.notes),
  });

  return NextResponse.json({ backend, submission }, { status: 201 });
}
