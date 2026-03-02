import { archiveSectionMeta } from "@/lib/archiveMeta";
import {
  getArchiveSectionLabel,
  getArchiveItemHref,
  getArchiveItemSummary,
  getArchiveItemTitle,
  getArchiveItemYear,
} from "@/lib/archivePresentation";
import { archiveDataset, type ArchiveSection } from "@/lib/archiveData";
import type { Locale } from "@/lib/i18n";
type ArchiveDatasetShape = typeof archiveDataset;

export interface SearchResultItem {
  section: ArchiveSection;
  id: number;
  sectionLabel: string;
  title: string;
  snippet: string;
  href: string;
  year?: string;
  verification: "official" | "reviewing";
}

export interface ArchiveSearchFilters {
  section?: ArchiveSection;
  year?: string;
  verification?: "official" | "reviewing";
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

export function searchArchive(
  query: string,
  filters: ArchiveSearchFilters = {},
  locale: Locale = "en",
  dataset: ArchiveDatasetShape = archiveDataset,
): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q && !filters.section && !filters.year && !filters.verification) return [];

  const results: SearchResultItem[] = [];

  (Object.keys(dataset) as ArchiveSection[]).forEach((section) => {
    if (filters.section && filters.section !== section) return;

    dataset[section].forEach((rawItem) => {
      const item = rawItem as unknown as Record<string, unknown>;
      const text = stringifyRecord(item).toLowerCase();
      const year = getArchiveItemYear(
        section,
        rawItem as never,
      );
      const verification = archiveSectionMeta[section].verification;

      if (q && !text.includes(q)) return;
      if (filters.year && filters.year !== year) return;
      if (filters.verification && filters.verification !== verification) return;

      results.push({
        section,
        sectionLabel: getArchiveSectionLabel(section, locale),
        id: Number(item.id),
        title: getArchiveItemTitle(section, rawItem as never, locale),
        snippet: getArchiveItemSummary(section, rawItem as never, locale),
        href: getArchiveItemHref(section, Number(item.id)),
        year,
        verification,
      });
    });
  });

  return results;
}
