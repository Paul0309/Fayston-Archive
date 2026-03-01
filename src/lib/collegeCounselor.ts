import type { PersonalPagePayload } from "@/lib/personalPage";

export interface CounselorInsights {
  summary: string;
  gaps: string[];
  nextActions: string[];
  starterPrompts: string[];
}

function countRigorousCourses(payload: PersonalPagePayload) {
  return payload.page.transcripts.filter((item) =>
    /ap|ib|honors|advanced|research|seminar/i.test(item.course),
  ).length;
}

function countNumericGrades(payload: PersonalPagePayload) {
  return payload.page.transcripts
    .map((item) => Number.parseFloat(item.grade))
    .filter((value) => Number.isFinite(value));
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function buildCounselorInsights(payload: PersonalPagePayload): CounselorInsights {
  const transcriptCount = payload.page.transcripts.length;
  const projectCount = payload.page.projects.length;
  const rigorousCount = countRigorousCourses(payload);
  const numericGrades = countNumericGrades(payload);
  const average = numericGrades.length
    ? (numericGrades.reduce((sum, value) => sum + value, 0) / numericGrades.length).toFixed(2)
    : null;

  const summaryParts = [
    payload.page.headline || "Profile positioning is still blank.",
    transcriptCount
      ? `${transcriptCount} transcript lines are recorded${average ? ` with an average numeric grade of ${average}` : ""}.`
      : "No transcript lines are recorded yet.",
    projectCount
      ? `${projectCount} private projects are documented.`
      : "No private projects are documented yet.",
  ];

  const gaps: string[] = [];
  if (!payload.page.headline) {
    gaps.push("Your positioning headline is empty, so your academic narrative is still unclear.");
  }
  if (transcriptCount < 4) {
    gaps.push("Transcript coverage is thin. Add more semester-level records before using this page for planning.");
  }
  if (rigorousCount === 0) {
    gaps.push("No rigorous or advanced course signal is visible from the transcript entries.");
  }
  if (projectCount === 0) {
    gaps.push("There is no project evidence yet. Add at least one serious project with scope and outcome.");
  }
  if (!payload.page.bio) {
    gaps.push("Your bio is blank, so motivations, goals, and context are missing.");
  }
  if (!payload.page.transcriptNote) {
    gaps.push("Transcript context is missing. Add counselor-style notes for dips, rigor, or special circumstances.");
  }

  const nextActions: string[] = [];
  nextActions.push("Write a one-sentence positioning headline that states intended major, strengths, and direction.");
  if (transcriptCount < 6) {
    nextActions.push("Add complete transcript lines for recent semesters before evaluating competitiveness.");
  }
  if (projectCount < 3) {
    nextActions.push("Document 2-3 meaningful projects with outcome, technical depth, and current status.");
  }
  if (!payload.page.transcriptNote) {
    nextActions.push("Write a transcript note that explains rigor, grade trends, and any anomalies.");
  }
  if (!payload.page.bio) {
    nextActions.push("Fill in the bio with academic interests, target majors, and why those fields fit your work.");
  }

  return {
    summary: summaryParts.join(" "),
    gaps: gaps.slice(0, 4),
    nextActions: nextActions.slice(0, 4),
    starterPrompts: [
      "What are the biggest weak points in my current profile?",
      "How should I frame my projects for a CS application?",
      "What should I improve in the next 30 days?",
      "What story does my transcript currently tell?",
    ],
  };
}

export function answerCounselorQuestion(payload: PersonalPagePayload, question: string) {
  const q = normalize(question);
  const insights = buildCounselorInsights(payload);
  const transcriptCount = payload.page.transcripts.length;
  const projectCount = payload.page.projects.length;
  const latestProject = payload.page.projects[0];

  if (q.includes("weak") || q.includes("gap") || q.includes("missing")) {
    return `Main gaps: ${insights.gaps.join(" ") || "No major structural gaps are visible yet."}`;
  }

  if (q.includes("next") || q.includes("plan") || q.includes("30 day") || q.includes("improve")) {
    return `Next actions: ${insights.nextActions.join(" ")}`;
  }

  if (q.includes("transcript") || q.includes("grade") || q.includes("course")) {
    return transcriptCount
      ? `Your transcript record currently has ${transcriptCount} entries. ${payload.page.transcriptNote || "Add a transcript note so you can explain rigor, trends, and special context more clearly."}`
      : "There is no transcript data yet. Add semester, course, and grade lines first before asking for transcript strategy.";
  }

  if (q.includes("project") || q.includes("activity") || q.includes("ecs") || q.includes("portfolio")) {
    if (!projectCount) {
      return "No private projects are recorded yet. Add at least one serious project with summary, link, and status so the counselor can give usable advice.";
    }

    return latestProject
      ? `You currently have ${projectCount} projects recorded. The latest visible project is "${latestProject.title}". Strengthen it by clarifying scope, measurable outcome, and why it supports your target major.`
      : `You currently have ${projectCount} projects recorded.`;
  }

  if (q.includes("major") || q.includes("college") || q.includes("application") || q.includes("essay")) {
    return `Current profile read: ${insights.summary} For applications, make sure your headline, bio, transcript note, and top 2-3 projects all point to the same academic direction.`;
  }

  return `${insights.summary} Most useful next prompt: "${insights.starterPrompts[0]}"`;
}
