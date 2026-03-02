import { readFile } from "node:fs/promises";
import path from "node:path";

export interface HandbookChunk {
  id: string;
  clause: string | null;
  title: string;
  section: string;
  text: string;
  normalized: string;
  aliases: string[];
}

export interface HandbookSearchResult {
  chunk: HandbookChunk;
  score: number;
}

interface HandbookCorpus {
  chunks: HandbookChunk[];
}

let handbookCorpusPromise: Promise<HandbookCorpus> | null = null;

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\uac00-\ud7a3./+\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string) {
  return Array.from(new Set(normalizeText(input).match(/[a-z0-9\uac00-\ud7a3./+-]+/g) ?? []));
}

function isUpperHeading(line: string) {
  return (
    /^[A-Z][A-Z0-9/&*:'()\-+,.\s]{5,}$/.test(line) &&
    !/\b\d+\b$/.test(line) &&
    !line.includes("@") &&
    !line.includes("www.")
  );
}

function getClauseHeading(line: string) {
  const match = line.match(/^(\d+(?:\.\d+){0,4})\.?\s+(.+)$/);
  if (!match) return null;
  return { clause: match[1], title: match[2].trim() };
}

function extractAliases(section: string, title: string, clause: string | null) {
  const aliases = new Set<string>();
  const add = (value: string) => {
    const normalized = normalizeText(value);
    if (normalized) aliases.add(normalized);
  };

  add(section);
  add(title);
  if (clause) add(clause);

  const acronymMatches = Array.from(title.matchAll(/\(([^)]+)\)/g));
  for (const match of acronymMatches) {
    add(match[1]);
  }

  const acronym = title
    .split(/\s+/)
    .filter((word) => /^[A-Z]/.test(word))
    .map((word) => word.replace(/[^A-Z]/g, ""))
    .join("");
  if (acronym.length >= 2) add(acronym);

  if (title.includes("ENGLISH ONLY POLICY")) {
    add("eop");
    add("english only");
    add("english only policy");
  }

  if (title.includes("DIGITAL DEVICE POLICY")) {
    add("device policy");
    add("phone policy");
    add("cell phone");
  }

  if (title.includes("DRESS CODE POLICY")) {
    add("dress code");
    add("uniform");
  }

  if (title.includes("LATE SUBMISSION")) {
    add("late homework");
    add("late submission");
    add("extension");
  }

  if (title.includes("ATTENDANCE POLICY")) {
    add("attendance");
    add("absence");
    add("tardy");
  }

  if (title.includes("Online Recovery Policy")) {
    add("forgiveness");
    add("recovery policy");
    add("forgiveness policy");
  }

  return Array.from(aliases);
}

function createChunk(
  index: number,
  section: string,
  title: string,
  clause: string | null,
  textLines: string[],
): HandbookChunk | null {
  const text = textLines.join(" ").replace(/\s+/g, " ").trim();
  if (text.length < 40) return null;

  return {
    id: `handbook-${index}`,
    clause,
    title,
    section,
    text,
    normalized: normalizeText(`${section} ${title} ${text}`),
    aliases: extractAliases(section, title, clause),
  };
}

async function parseHandbook(): Promise<HandbookCorpus> {
  const handbookPath = path.join(
    process.cwd(),
    "storage",
    "HS HANDBOOK_ STUDENT [25_26]_files",
    "HS HANDBOOK_ STUDENT [25_26].html",
  );

  const html = await readFile(handbookPath, "utf8");
  const body = decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, "\n"),
  );

  const lines = body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  let philosophyCount = 0;
  let startIndex = 0;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i] === "FAYSTON PREPARATORY PHILOSOPHY") {
      philosophyCount += 1;
      if (philosophyCount === 2) {
        startIndex = i;
        break;
      }
    }
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (lines[i] === "WORKS CITED") {
      endIndex = i;
      break;
    }
  }

  const contentLines = lines.slice(startIndex, endIndex);
  const chunks: HandbookChunk[] = [];

  let majorSection = "STUDENT HANDBOOK";
  let currentTitle = majorSection;
  let currentClause: string | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    const chunk = createChunk(chunks.length + 1, majorSection, currentTitle, currentClause, currentLines);
    if (chunk) chunks.push(chunk);
    currentLines = [];
  };

  for (const line of contentLines) {
    const clauseHeading = getClauseHeading(line);
    if (clauseHeading) {
      flush();
      currentClause = clauseHeading.clause;
      currentTitle = clauseHeading.title;
      continue;
    }

    if (isUpperHeading(line)) {
      flush();
      majorSection = line;
      currentTitle = line;
      currentClause = null;
      continue;
    }

    if (/^\d+$/.test(line)) continue;
    currentLines.push(line);
  }

  flush();
  return { chunks };
}

export async function getHandbookCorpus() {
  if (!handbookCorpusPromise) handbookCorpusPromise = parseHandbook();
  return handbookCorpusPromise;
}

function scoreChunk(question: string, chunk: HandbookChunk) {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return 0;

  const normalizedQuestion = normalizeText(question);
  let score = 0;

  for (const token of queryTokens) {
    if (chunk.normalized.includes(token)) {
      score += token.length > 3 ? 3 : 1;
    }
  }

  for (const alias of chunk.aliases) {
    if (normalizedQuestion.includes(alias)) score += alias.length > 4 ? 12 : 8;
  }

  if (chunk.clause && normalizedQuestion.includes(chunk.clause)) score += 12;
  if (normalizedQuestion.includes(normalizeText(chunk.title))) score += 14;

  const phraseBoosts: Array<{ keywords: string[]; targets: string[] }> = [
    {
      keywords: ["late", "submission", "homework", "assignment", "extension", "숙제", "제출", "연장"],
      targets: ["5.1", "5.2", "5.3", "5.4"],
    },
    {
      keywords: ["attendance", "absence", "tardy", "결석", "지각"],
      targets: ["10.5", "10.6", "10.7", "ATTENDANCE POLICY"],
    },
    {
      keywords: ["device", "phone", "cell", "digital", "휴대폰", "기기"],
      targets: ["11.4", "DIGITAL DEVICE POLICY"],
    },
    {
      keywords: ["dress", "uniform", "복장"],
      targets: ["11.4.4", "DRESS CODE POLICY"],
    },
    {
      keywords: ["forgiveness", "recovery", "forgiveness policy"],
      targets: ["Addendum A", "Online Recovery Policy"],
    },
    {
      keywords: ["eop", "english only", "영어만", "영어 사용"],
      targets: ["12", "ENGLISH ONLY POLICY", "EOP"],
    },
  ];

  for (const rule of phraseBoosts) {
    if (rule.keywords.some((keyword) => normalizedQuestion.includes(normalizeText(keyword)))) {
      if (
        rule.targets.some(
          (target) =>
            chunk.title.includes(target) ||
            chunk.section.includes(target) ||
            chunk.aliases.includes(normalizeText(target)) ||
            chunk.clause === target ||
            (chunk.clause && target.startsWith(chunk.clause)),
        )
      ) {
        score += 18;
      }
    }
  }

  return score;
}

export async function searchHandbook(question: string, limit = 4): Promise<HandbookSearchResult[]> {
  const corpus = await getHandbookCorpus();

  return corpus.chunks
    .map((chunk) => ({ chunk, score: scoreChunk(question, chunk) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function formatHandbookCitation(chunk: HandbookChunk) {
  return chunk.clause ? `${chunk.clause}. ${chunk.title}` : chunk.title;
}

export function getHandbookExcerpt(chunk: HandbookChunk, maxLength = 420) {
  if (chunk.text.length <= maxLength) return chunk.text;
  return `${chunk.text.slice(0, maxLength).trim()}...`;
}

export function getHandbookViewHref(chunk: HandbookChunk) {
  const target = chunk.clause ?? chunk.title;
  return `/handbook?focus=${encodeURIComponent(target)}`;
}

export function getHandbookSourcePath() {
  return path.join(
    process.cwd(),
    "storage",
    "HS HANDBOOK_ STUDENT [25_26]_files",
    "HS HANDBOOK_ STUDENT [25_26].html",
  );
}
