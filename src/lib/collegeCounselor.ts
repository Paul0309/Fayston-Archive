import type { Locale } from "@/lib/i18n";
import type { PersonalPagePayload } from "@/lib/personalPage";
import type { TranscriptDocumentContext } from "@/lib/transcriptExtraction";

export interface CounselorInsights {
  overview: string;
  readiness: string;
  targetContext: string;
  strengths: string[];
  priorities: string[];
  thirtyDayPlan: string[];
  summerStrategy: string[];
  essayAngles: string[];
  starterPrompts: string[];
}

export interface CounselorMessage {
  sender: "user" | "ai";
  text: string;
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

function formatList(values: string[], locale: Locale) {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (locale === "ko") {
    return `${values.slice(0, -1).join(", ")} 및 ${values[values.length - 1]}`;
  }
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function getTargetContext(payload: PersonalPagePayload, locale: Locale) {
  const majors = payload.page.targetMajors;
  const colleges = payload.page.targetColleges;

  if (majors.length === 0 && colleges.length === 0) {
    return locale === "ko"
      ? "희망 전공과 목표 대학이 아직 비어 있어 현재 플랜은 일반적인 수준입니다."
      : "Target majors and colleges are blank, so the current strategy is still too generic.";
  }

  if (majors.length && colleges.length) {
    return locale === "ko"
      ? `현재 목표는 ${formatList(majors, locale)} 전공이며, ${formatList(colleges, locale)} 같은 대학을 보고 있습니다.`
      : `Current target set: majors in ${formatList(majors, locale)} with colleges such as ${formatList(colleges, locale)}.`;
  }

  if (majors.length) {
    return locale === "ko"
      ? `현재 목표 전공은 ${formatList(majors, locale)}입니다. 목표 대학 목록은 아직 비어 있습니다.`
      : `Current target majors: ${formatList(majors, locale)}. College list is still blank.`;
  }

  return locale === "ko"
    ? `현재 목표 대학은 ${formatList(colleges, locale)}입니다. 희망 전공은 아직 비어 있습니다.`
    : `Current target colleges: ${formatList(colleges, locale)}. Intended major is still blank.`;
}

function buildTranscriptDocumentSummary(documents: TranscriptDocumentContext[]) {
  return documents.slice(0, 4).map((doc) => ({
    title: doc.title,
    academicYear: doc.academicYear,
    quarter: doc.quarter,
    gradeLevel: doc.gradeLevel,
    notes: doc.notes,
    facts: doc.facts,
    extractedText: doc.extractedText.slice(0, 4000),
    extractionStatus: doc.extractedText ? "pdf_text_available" : "pdf_text_missing",
  }));
}

function getTranscriptFactLines(documents: TranscriptDocumentContext[]) {
  return documents
    .map((doc) => {
      if (!doc.facts) return null;
      const parts = [
        doc.facts.schoolYear || doc.academicYear,
        doc.facts.reportedGrade ? `Grade ${doc.facts.reportedGrade}` : doc.gradeLevel ? `Grade ${doc.gradeLevel}` : "",
        doc.facts.finalGpa ? `GPA ${doc.facts.finalGpa}` : "",
        doc.facts.finalAverage ? `Avg ${doc.facts.finalAverage}` : "",
        doc.quarter || "",
      ].filter(Boolean);
      return parts.length ? `${doc.title}: ${parts.join(" | ")}` : null;
    })
    .filter((value): value is string => Boolean(value));
}

function findTranscriptForGrade(documents: TranscriptDocumentContext[], grade: string) {
  return documents.find((doc) => doc.facts?.reportedGrade === grade || doc.gradeLevel === grade);
}

function isExplicitTranscriptSummaryQuestion(q: string) {
  const summarySignals = [
    "성적 요약",
    "요약해",
    "정리해",
    "transcript summary",
    "summarize",
    "summary",
    "read my transcript",
    "what does my transcript",
  ];

  return summarySignals.some((signal) => q.includes(signal));
}

function buildContextBlock(
  payload: PersonalPagePayload,
  locale: Locale,
  transcriptDocuments: TranscriptDocumentContext[],
) {
  const transcriptPreview = payload.page.transcripts.slice(0, 8).map((item) => ({
    term: item.term,
    course: item.course,
    grade: item.grade,
    notes: item.notes,
  }));
  const projectPreview = payload.page.projects.slice(0, 5).map((item) => ({
    title: item.title,
    year: item.year,
    status: item.status,
    summary: item.summary,
    link: item.link,
  }));

  return JSON.stringify(
    {
      locale,
      student: {
        name: payload.user.name,
        username: payload.user.username,
      },
      page: {
        gradeLevel: payload.page.gradeLevel,
        graduationYear: payload.page.graduationYear,
        headline: payload.page.headline,
        bio: payload.page.bio,
        targetMajors: payload.page.targetMajors,
        targetColleges: payload.page.targetColleges,
        transcriptNote: payload.page.transcriptNote,
        transcriptFileCount: payload.page.transcriptDocs.length,
        transcriptCount: payload.page.transcripts.length,
        projectCount: payload.page.projects.length,
        publicProjectCount: payload.page.projects.filter((item) => item.isPublic).length,
        transcriptPreview,
        projectPreview,
        transcriptDocuments: buildTranscriptDocumentSummary(transcriptDocuments),
      },
    },
    null,
    2,
  );
}

function stripCodeFence(value: string) {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

async function runOpenAIJson<T>(prompt: string): Promise<T | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_COUNSELOR_MODEL || "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a pragmatic college admissions counselor. Be specific, realistic, and concise. Do not overpromise admission outcomes. If transcript PDF text or parsed GPA facts are available, use them. Return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(stripCodeFence(content)) as T;
  } catch {
    return null;
  }
}

async function runOpenAIText(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_COUNSELOR_MODEL || "gpt-4.1-mini",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "You are a pragmatic college admissions counselor. Do not act like a data retriever unless the user explicitly asks for raw transcript facts. Your main job is to evaluate the student's situation, explain implications, and give concrete next-step advice. Use parsed transcript facts and transcript PDF text when available. For GPA questions, answer with the actual GPA if present. If the file does not contain the answer, say that clearly. Do not overpromise admission outcomes.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function buildFallbackInsights(
  payload: PersonalPagePayload,
  locale: Locale,
  transcriptDocuments: TranscriptDocumentContext[],
): CounselorInsights {
  const transcriptCount = payload.page.transcripts.length;
  const transcriptFileCount = payload.page.transcriptDocs.length;
  const extractedTranscriptCount = transcriptDocuments.filter((item) => item.extractedText).length;
  const transcriptFactLines = getTranscriptFactLines(transcriptDocuments);
  const projectCount = payload.page.projects.length;
  const rigorousCount = countRigorousCourses(payload);
  const numericGrades = countNumericGrades(payload);
  const average = numericGrades.length
    ? (numericGrades.reduce((sum, value) => sum + value, 0) / numericGrades.length).toFixed(2)
    : null;
  const targetContext = getTargetContext(payload, locale);

  const overview = locale === "ko"
    ? `${payload.page.headline || "헤드라인이 아직 비어 있습니다."} ${transcriptCount ? `성적 항목 ${transcriptCount}개가 입력되어 있습니다${average ? `, 평균 수치 ${average}` : ""}.` : `${transcriptFileCount}개의 성적 파일이 업로드되어 있습니다${extractedTranscriptCount ? `, 그중 ${extractedTranscriptCount}개에서 텍스트를 읽었습니다.` : "."}`} ${transcriptFactLines.length ? `현재 파악된 성적 요약: ${transcriptFactLines.join(" / ")}.` : ""} 프로젝트는 ${projectCount}개 기록되어 있습니다.`
    : `${payload.page.headline || "Profile headline is still blank."} ${transcriptCount ? `${transcriptCount} transcript lines are recorded${average ? ` with an average numeric grade of ${average}` : ""}.` : `${transcriptFileCount} transcript files are uploaded${extractedTranscriptCount ? `, and text was extracted from ${extractedTranscriptCount} file(s).` : "."}`} ${transcriptFactLines.length ? `Current transcript read: ${transcriptFactLines.join(" / ")}.` : ""} ${projectCount} projects are documented.`;

  const strengths: string[] = [];
  if (payload.page.targetMajors.length > 0) {
    strengths.push(locale === "ko" ? `희망 전공이 정해져 있습니다: ${formatList(payload.page.targetMajors, locale)}` : `Target major direction is set: ${formatList(payload.page.targetMajors, locale)}.`);
  }
  if (projectCount > 0) {
    strengths.push(locale === "ko" ? `프로젝트 ${projectCount}개가 이미 기록되어 있습니다.` : `${projectCount} projects are already documented.`);
  }
  if (transcriptCount > 0 || extractedTranscriptCount > 0) {
    strengths.push(locale === "ko" ? `성적 파일 또는 성적 항목에서 읽을 수 있는 학업 근거가 있습니다.` : "There is already transcript evidence to work from.");
  }
  if (rigorousCount > 0) {
    strengths.push(locale === "ko" ? `심화 과목 신호가 ${rigorousCount}개 보입니다.` : `${rigorousCount} rigorous course signals are visible.`);
  }
  if (strengths.length === 0) {
    strengths.push(locale === "ko" ? "기본 프로필 구조는 준비됐지만 입시 판단용 데이터는 아직 부족합니다." : "The basic profile shell exists, but it needs more supporting data.");
  }

  const priorities: string[] = [];
  if (transcriptCount < 4 && extractedTranscriptCount === 0) {
    priorities.push(locale === "ko" ? "상담 정확도를 높이려면 성적 항목이나 읽을 수 있는 transcript PDF가 더 필요합니다." : "Add either transcript lines or readable transcript PDFs before using this for serious planning.");
  }
  if (rigorousCount === 0) {
    priorities.push(locale === "ko" ? "AP, IB, Honors 같은 심화 과목 신호를 더 분명히 보여주세요." : "Show at least one visible rigorous course signal such as AP, IB, or honors work.");
  }
  if (!payload.page.transcriptNote) {
    priorities.push(locale === "ko" ? "성적 하락, 난이도, 특수사정 메모를 추가하세요." : "Add transcript context notes for rigor, dips, or special circumstances.");
  }
  if (projectCount < 2) {
    priorities.push(locale === "ko" ? "결과와 기술 깊이가 드러나는 프로젝트를 더 정리하세요." : "Document more projects with concrete outcome and technical depth.");
  }
  if (!payload.page.headline) {
    priorities.push(locale === "ko" ? "한 줄 헤드라인으로 전공 방향과 강점을 정리하세요." : "Write a one-line positioning headline that states major direction and strengths.");
  }

  const thirtyDayPlan = locale === "ko"
    ? [
        "희망 전공 1~2개를 확정하고 페이지에 반영하세요.",
        transcriptCount ? "최근 학기 성적 항목을 빈칸 없이 정리하세요." : "업로드한 transcript를 기준으로 학기별 성적 항목을 정리하세요.",
        "대표 프로젝트 1개의 설명을 문제-방법-결과 구조로 다시 쓰세요.",
        "수업, 프로젝트, 전공 목표를 연결하는 짧은 자기소개 문단을 작성하세요.",
      ]
    : [
        "Finalize 1-2 target majors and record them clearly.",
        transcriptCount ? "Complete transcript coverage for the most recent semesters." : "Convert uploaded transcript files into semester-level transcript lines.",
        "Rewrite the top project summary with problem, method, and outcome.",
        "Draft a short bio that connects coursework, projects, and intended major.",
      ];

  const summerStrategy = locale === "ko"
    ? [
        "대표 프로젝트가 될 여름 작업 하나를 정하세요.",
        "연구, 대회 준비, 독립 학습 중 하나로 학업 난이도를 더하세요.",
        "GitHub, 데모, 발표자료처럼 외부 증거를 남기세요.",
      ]
    : [
        "Pick one project or research thread that can become your flagship summer output.",
        "Add one academically rigorous component such as research, competition prep, or independent study.",
        "Create an external proof point such as GitHub, a demo, or presentation slides.",
      ];

  const essayAngles = locale === "ko"
    ? [
        "실제 문제를 코드나 시스템으로 해결한 경험",
        "호기심이 학문적 방향으로 발전한 과정",
        "어려운 수업을 통해 습관과 태도가 달라진 경험",
      ]
    : [
        "How you used systems or code to solve a real problem.",
        "How curiosity became a sustained academic direction.",
        "How harder classes changed your habits and discipline.",
      ];

  return {
    overview,
    readiness:
      locale === "ko"
        ? transcriptCount >= 6 || extractedTranscriptCount > 0
          ? "기본 입시 판단에 필요한 근거가 형성되고 있습니다"
          : "기초 근거를 더 쌓아야 합니다"
        : transcriptCount >= 6 || extractedTranscriptCount > 0
          ? "Baseline evidence is forming"
          : "Foundation needs more evidence",
    targetContext,
    strengths: strengths.slice(0, 3),
    priorities: priorities.slice(0, 3),
    thirtyDayPlan,
    summerStrategy,
    essayAngles,
    starterPrompts:
      locale === "ko"
        ? [
            "지금 제일 먼저 메워야 하는 약점은 뭐야?",
            "내 프로젝트를 CS 지원자답게 어떻게 보여줘야 해?",
            "30일 동안 무엇을 하면 가장 효과적일까?",
            "업로드한 transcript 기준으로 어떤 과목을 먼저 보완해야 해?",
          ]
        : [
            "What weak point should I fix first?",
            "How should I frame my projects for Computer Science?",
            "What is the highest-impact 30-day plan?",
            "Based on my uploaded transcript, which subjects need the most work?",
          ],
  };
}

export async function buildCounselorInsights(
  payload: PersonalPagePayload,
  locale: Locale,
  transcriptDocuments: TranscriptDocumentContext[] = [],
): Promise<CounselorInsights> {
  const fallback = buildFallbackInsights(payload, locale, transcriptDocuments);
  const prompt = `
Respond in ${locale === "ko" ? "Korean" : "English"}.
Return valid JSON with this exact shape:
{
  "overview": string,
  "readiness": string,
  "targetContext": string,
  "strengths": string[],
  "priorities": string[],
  "thirtyDayPlan": string[],
  "summerStrategy": string[],
  "essayAngles": string[],
  "starterPrompts": string[]
}
Requirements:
- concise and readable
- no more than 3 items for strengths and priorities
- 3 to 4 items for plans
- avoid admissions guarantees
- use the student's actual data
- if transcript PDF text or parsed GPA facts are available, incorporate them directly
Student context:
${buildContextBlock(payload, locale, transcriptDocuments)}
`;

  const generated = await runOpenAIJson<CounselorInsights>(prompt);
  if (!generated) return fallback;

  return {
    overview: generated.overview || fallback.overview,
    readiness: generated.readiness || fallback.readiness,
    targetContext: generated.targetContext || fallback.targetContext,
    strengths: (generated.strengths || fallback.strengths).slice(0, 3),
    priorities: (generated.priorities || fallback.priorities).slice(0, 3),
    thirtyDayPlan: (generated.thirtyDayPlan || fallback.thirtyDayPlan).slice(0, 4),
    summerStrategy: (generated.summerStrategy || fallback.summerStrategy).slice(0, 4),
    essayAngles: (generated.essayAngles || fallback.essayAngles).slice(0, 4),
    starterPrompts: (generated.starterPrompts || fallback.starterPrompts).slice(0, 4),
  };
}

export async function answerCounselorQuestion(
  payload: PersonalPagePayload,
  question: string,
  locale: Locale,
  transcriptDocuments: TranscriptDocumentContext[] = [],
  history: CounselorMessage[] = [],
): Promise<string> {
  const fallback = buildFallbackInsights(payload, locale, transcriptDocuments);
  const q = question.trim().toLowerCase();
  const grade9Doc = findTranscriptForGrade(transcriptDocuments, "9");
  const grade10Doc = findTranscriptForGrade(transcriptDocuments, "10");

  if (q.includes("gpa") || q.includes("학점") || q.includes("평점")) {
    if ((q.includes("9") || q.includes("9학년")) && grade9Doc?.facts?.finalGpa) {
      return locale === "ko"
        ? `9학년 transcript 기준 최종 GPA는 ${grade9Doc.facts.finalGpa}입니다.${grade9Doc.facts.finalAverage ? ` 최종 Numeric Average는 ${grade9Doc.facts.finalAverage}입니다.` : ""}`
        : `Based on the Grade 9 transcript, the final GPA is ${grade9Doc.facts.finalGpa}.${grade9Doc.facts.finalAverage ? ` The final numeric average is ${grade9Doc.facts.finalAverage}.` : ""}`;
    }

    if ((q.includes("10") || q.includes("10학년")) && grade10Doc?.facts?.finalGpa) {
      return locale === "ko"
        ? `10학년 transcript 기준 현재 확인되는 GPA는 ${grade10Doc.facts.finalGpa}입니다.${grade10Doc.facts.finalAverage ? ` Numeric Average는 ${grade10Doc.facts.finalAverage}입니다.` : ""}`
        : `Based on the Grade 10 transcript, the current GPA shown is ${grade10Doc.facts.finalGpa}.${grade10Doc.facts.finalAverage ? ` The numeric average is ${grade10Doc.facts.finalAverage}.` : ""}`;
    }

    const factDoc = transcriptDocuments.find((doc) => doc.facts?.finalGpa);
    if (factDoc?.facts?.finalGpa) {
      return locale === "ko"
        ? `${factDoc.title} 기준 확인되는 GPA는 ${factDoc.facts.finalGpa}입니다.${factDoc.facts.finalAverage ? ` Numeric Average는 ${factDoc.facts.finalAverage}입니다.` : ""}`
        : `The transcript currently shows a GPA of ${factDoc.facts.finalGpa} in ${factDoc.title}.${factDoc.facts.finalAverage ? ` The numeric average is ${factDoc.facts.finalAverage}.` : ""}`;
    }
  }

  if (isExplicitTranscriptSummaryQuestion(q) && transcriptDocuments.some((doc) => doc.facts)) {
    const lines = getTranscriptFactLines(transcriptDocuments);
    if (lines.length) {
      return locale === "ko"
        ? `현재 읽힌 성적 요약은 다음과 같습니다. ${lines.join(" / ")}`
        : `Current transcript read: ${lines.join(" / ")}`;
    }
  }

  const prompt = `
Respond in ${locale === "ko" ? "Korean" : "English"}.
You are answering a student about college admissions strategy using only the profile context below.
Be concrete, direct, and concise.
Use short paragraphs or bullets when helpful.
Use parsed transcript facts and transcript PDF text when available.
For GPA questions, answer with the actual GPA if present.
If the file does not contain the answer, say that clearly.
If the latest user message is short or ambiguous, use the recent conversation history to resolve what "it", "that", or "how do you think" refers to.
When the student describes a circumstance such as grade forgiveness, homework policy issues, teacher context, or recovery plans, do not just restate transcript data. Evaluate the admissions impact, say what matters and what does not, and suggest how the student should explain or respond to it.
Do not guarantee admission outcomes.
Student context:
${buildContextBlock(payload, locale, transcriptDocuments)}
Recent conversation:
${history
  .slice(-8)
  .map((message) => `${message.sender === "user" ? "User" : "Counselor"}: ${message.text}`)
  .join("\n")}
Question:
${question}
`;

  const generated = await runOpenAIText(prompt);
  if (generated) return generated;

  if (q.includes("essay")) {
    return `${locale === "ko" ? "에세이 방향:" : "Essay directions:"} ${fallback.essayAngles.join(" ")}`;
  }
  if (q.includes("summer")) {
    return `${locale === "ko" ? "여름 전략:" : "Summer strategy:"} ${fallback.summerStrategy.join(" ")}`;
  }
  if (q.includes("30") || q.includes("month") || q.includes("plan")) {
    return `${locale === "ko" ? "30일 계획:" : "30-day plan:"} ${fallback.thirtyDayPlan.join(" ")}`;
  }
  if (q.includes("project") || q.includes("activity") || q.includes("portfolio")) {
    return locale === "ko"
      ? `프로젝트 측면에서는 우선 이것부터 정리하세요. ${fallback.priorities.join(" ")}`
      : `On the project side, focus on this first: ${fallback.priorities.join(" ")}`;
  }
  return `${fallback.overview} ${fallback.priorities.join(" ")}`;
}
