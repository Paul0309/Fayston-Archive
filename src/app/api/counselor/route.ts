import { NextResponse } from "next/server";

function getSimulatedResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("dorm") && (q.includes("food") || q.includes("eat"))) {
    return "Dorm personal areas allow light meals, but shared area eating may be restricted by policy.";
  }

  if (q.includes("curfew")) {
    return "Dorm curfew is 00:00. Overnight stay requests should be submitted in advance.";
  }

  if (q.includes("scholarship")) {
    return "Scholarship details are announced at the start of each term by student support.";
  }

  if (q.includes("award") || q.includes("varsity") || q.includes("team")) {
    return "You can check award and varsity history in the archive dashboard by year and section.";
  }

  if (q.includes("course") || q.includes("class")) {
    return "New course announcements are listed under Course Announcements in the archive.";
  }

  if (q.includes("event") || q.includes("festival")) {
    return "Upcoming and past events are tracked with materials in the School Events section.";
  }

  return "Please ask with specific keywords such as curfew, dorm, scholarship, awards, courses, or events.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 },
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
    const answer = getSimulatedResponse(question);
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
