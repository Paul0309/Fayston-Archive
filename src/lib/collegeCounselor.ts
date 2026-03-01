import type { PersonalPagePayload } from "@/lib/personalPage";

export interface CounselorInsights {
  summary: string;
  targetContext: string;
  gaps: string[];
  nextActions: string[];
  thirtyDayPlan: string[];
  summerStrategy: string[];
  essayAngles: string[];
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

function formatList(values: string[]) {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function getTargetContext(payload: PersonalPagePayload) {
  const majors = payload.page.targetMajors;
  const colleges = payload.page.targetColleges;

  if (majors.length === 0 && colleges.length === 0) {
    return "Target majors and colleges are still blank, so the strategy is too generic right now.";
  }

  if (majors.length && colleges.length) {
    return `Current target set: majors in ${formatList(majors)} with colleges such as ${formatList(colleges)}.`;
  }

  if (majors.length) {
    return `Current target majors: ${formatList(majors)}. College list is still blank.`;
  }

  return `Current target colleges: ${formatList(colleges)}. Intended major is still blank.`;
}

export function buildCounselorInsights(payload: PersonalPagePayload): CounselorInsights {
  const transcriptCount = payload.page.transcripts.length;
  const projectCount = payload.page.projects.length;
  const rigorousCount = countRigorousCourses(payload);
  const numericGrades = countNumericGrades(payload);
  const average = numericGrades.length
    ? (numericGrades.reduce((sum, value) => sum + value, 0) / numericGrades.length).toFixed(2)
    : null;
  const targetContext = getTargetContext(payload);

  const summaryParts = [
    payload.page.headline || "Profile positioning is still blank.",
    targetContext,
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
  if (payload.page.targetMajors.length === 0) {
    gaps.push("No target major is set, so the counselor cannot optimize your academic story toward a concrete field.");
  }
  if (payload.page.targetColleges.length === 0) {
    gaps.push("No target college list is recorded, so difficulty and selectivity are not anchored.");
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
  if (payload.page.targetMajors.length === 0) {
    nextActions.push("Choose 1-2 target majors so every transcript, project, and essay decision can be optimized against them.");
  }
  if (payload.page.targetColleges.length === 0) {
    nextActions.push("List 5-8 target colleges with a mix of reach, match, and likely options.");
  }
  if (transcriptCount < 6) {
    nextActions.push("Add complete transcript lines for recent semesters before evaluating competitiveness.");
  }
  if (projectCount < 3) {
    nextActions.push("Document 2-3 meaningful projects with outcome, technical depth, and current status.");
  }

  const thirtyDayPlan = [
    "Finalize 1-2 target majors and record them in the page.",
    "Complete transcript coverage for the most recent semesters and add context notes.",
    "Rewrite the top project summary so it clearly shows problem, method, and outcome.",
    "Draft a one-paragraph bio that connects coursework, projects, and intended major.",
  ];

  const summerStrategy = [
    "Choose one project or research thread that can become your flagship summer output.",
    "Add one academically rigorous component: independent study, advanced course, or competition prep.",
    "Create an external proof point such as GitHub, demo link, publication, or presentation.",
    "Keep a running reflection log so summer work can later feed essays and interviews.",
  ];

  const essayAngles = [
    "A systems-building angle: how you used projects to solve real workflow or data problems.",
    "A curiosity-to-discipline angle: how a course or topic became sustained academic direction.",
    "A growth-under-rigor angle: how transcript trends and harder classes changed your habits.",
    "A bridge angle: how your technical work connects to community, school, or human impact.",
  ];

  return {
    summary: summaryParts.join(" "),
    targetContext,
    gaps: gaps.slice(0, 4),
    nextActions: nextActions.slice(0, 4),
    thirtyDayPlan,
    summerStrategy,
    essayAngles,
    starterPrompts: [
      "What are the biggest weak points in my current profile?",
      "How should I frame my projects for my target major?",
      "Give me a 30-day improvement plan.",
      "What essay angles fit my current record?",
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

  if (q.includes("30") || q.includes("30 day") || q.includes("month")) {
    return `30-day plan: ${insights.thirtyDayPlan.join(" ")}`;
  }

  if (q.includes("summer")) {
    return `Summer strategy: ${insights.summerStrategy.join(" ")}`;
  }

  if (q.includes("essay") || q.includes("personal statement")) {
    return `Essay angles: ${insights.essayAngles.join(" ")}`;
  }

  if (q.includes("next") || q.includes("plan") || q.includes("improve")) {
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
      ? `You currently have ${projectCount} projects recorded. The latest visible project is "${latestProject.title}". Strengthen it by clarifying scope, measurable outcome, and why it supports ${payload.page.targetMajors[0] ?? "your target major"}.`
      : `You currently have ${projectCount} projects recorded.`;
  }

  if (q.includes("major") || q.includes("college") || q.includes("application")) {
    return `Current target context: ${insights.targetContext} Current profile read: ${insights.summary} Make sure your headline, bio, transcript note, and top projects all point to the same academic direction.`;
  }

  return `${insights.summary} Most useful next prompt: "${insights.starterPrompts[0]}"`;
}
