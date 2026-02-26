import { archiveDataset, type ArchiveSection } from "@/lib/archiveData";

export interface SearchResultItem {
  section: ArchiveSection;
  id: number;
  title: string;
  snippet: string;
}

function stringifyRecord(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => stringifyRecord(item)).join(" ");
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((entry) => stringifyRecord(entry))
      .join(" ");
  }
  return "";
}

function sectionTitle(section: ArchiveSection, item: Record<string, unknown>): string {
  if (typeof item.title === "string") return item.title;
  if (typeof item.name === "string") return item.name;
  if (typeof item.courseCode === "string" && typeof item.title === "string") {
    return `${item.courseCode} ${item.title}`;
  }
  return section;
}

export function searchArchive(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  (Object.keys(archiveDataset) as ArchiveSection[]).forEach((section) => {
    archiveDataset[section].forEach((rawItem) => {
      const item = rawItem as unknown as Record<string, unknown>;
      const text = stringifyRecord(item).toLowerCase();
      if (!text.includes(q)) return;

      results.push({
        section,
        id: Number(item.id),
        title: sectionTitle(section, item),
        snippet: stringifyRecord(item).slice(0, 140),
      });
    });
  });

  return results;
}

