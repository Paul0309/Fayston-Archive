"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArchiveSection } from "@/lib/archiveData";
import { getArchiveSectionLabel } from "@/lib/archivePresentation";
import { useI18n } from "@/components/LanguageProvider";

type SelectOption = { value: string; label: string };

type FieldDefinition =
  | { type: "text" | "number" | "date"; path: string; label: string; placeholder?: string }
  | { type: "textarea"; path: string; label: string; placeholder?: string; rows?: number }
  | { type: "select"; path: string; label: string; options: SelectOption[] }
  | { type: "checkbox"; path: string; label: string }
  | { type: "localized"; path: string; label: string; multiline?: boolean; rows?: number }
  | { type: "stringList"; path: string; label: string; placeholder?: string }
  | { type: "localizedList"; path: string; label: string; placeholder?: string };

interface EditorItem {
  id: number;
  title: string;
  isOverride: boolean;
  payload: unknown;
}

interface AdminArchiveEditorProps {
  initialSection?: ArchiveSection;
  initialSourceId?: number | null;
}

const sections: ArchiveSection[] = [
  "projects",
  "awards",
  "varsityTeams",
  "courseAnnouncements",
  "clubReports",
  "schoolEvents",
  "publications",
  "schoolProfiles",
  "buildingHistory",
  "alumniProfiles",
  "gradeTasks",
];

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? ({ ...(value as Record<string, unknown>) } as Record<string, unknown>)
    : {};
}

function getPathValue(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function setPathValue(source: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const clone = structuredClone(source) as Record<string, unknown>;
  const keys = path.split(".");
  let current: Record<string, unknown> = clone;

  keys.forEach((key, index) => {
    const isLeaf = index === keys.length - 1;
    if (isLeaf) {
      current[key] = value;
      return;
    }

    const next = current[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  });

  return clone;
}

function toText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toLocalizedLines(value: unknown, locale: "en" | "ko"): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      const localized = entry as Record<string, unknown>;
      return typeof localized[locale] === "string" ? (localized[locale] as string) : "";
    }
    return typeof entry === "string" ? entry : "";
  });
}

function buildLocalizedList(enText: string, koText: string) {
  const enLines = enText.split(/\r?\n/).map((line) => line.trim());
  const koLines = koText.split(/\r?\n/).map((line) => line.trim());
  const max = Math.max(enLines.length, koLines.length);
  const result: Array<{ en: string; ko: string }> = [];

  for (let index = 0; index < max; index += 1) {
    const en = enLines[index] ?? "";
    const ko = koLines[index] ?? en;
    if (!en && !ko) continue;
    result.push({ en, ko: ko || en });
  }

  return result;
}

function parseStringList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFieldDefinitions(section: ArchiveSection, locale: "en" | "ko"): FieldDefinition[] {
  const en = locale === "en";

  switch (section) {
    case "projects":
      return [
        { type: "localized", path: "title", label: en ? "Title" : "제목" },
        { type: "localized", path: "description", label: en ? "Description" : "설명", multiline: true, rows: 4 },
        { type: "number", path: "projectYear", label: en ? "Project Year" : "프로젝트 연도" },
        {
          type: "select",
          path: "category",
          label: en ? "Category" : "카테고리",
          options: ["AWARD", "CAPSTONE", "RESEARCH", "PERSONAL"].map((value) => ({ value, label: value })),
        },
        { type: "text", path: "githubUrl", label: "GitHub URL" },
        { type: "stringList", path: "members", label: en ? "Members" : "구성원", placeholder: en ? "Comma separated" : "쉼표로 구분" },
        { type: "stringList", path: "tags", label: en ? "Tags" : "태그", placeholder: en ? "Comma separated" : "쉼표로 구분" },
        {
          type: "select",
          path: "status",
          label: en ? "Status" : "상태",
          options: ["pending", "approved", "rejected"].map((value) => ({ value, label: value })),
        },
      ];
    case "awards":
      return [
        { type: "localized", path: "title", label: en ? "Title" : "제목" },
        { type: "date", path: "awardDate", label: en ? "Award Date" : "수상일" },
        { type: "localized", path: "level", label: en ? "Level" : "등급" },
        { type: "localized", path: "category", label: en ? "Category" : "분류" },
        { type: "localized", path: "organizer", label: en ? "Organizer" : "주최" },
        { type: "stringList", path: "recipients", label: en ? "Recipients" : "수상자", placeholder: en ? "Comma separated" : "쉼표로 구분" },
      ];
    case "varsityTeams":
      return [
        { type: "localized", path: "name", label: en ? "Team Name" : "팀 이름" },
        { type: "localized", path: "sportType", label: en ? "Type" : "종목" },
        { type: "checkbox", path: "varsity", label: en ? "Varsity Team" : "대표팀" },
        { type: "text", path: "coach", label: en ? "Coach" : "코치" },
        { type: "localizedList", path: "achievements", label: en ? "Achievements" : "성과", placeholder: en ? "One per line" : "한 줄에 하나씩" },
      ];
    case "courseAnnouncements":
      return [
        { type: "text", path: "courseCode", label: en ? "Course Code" : "과목 코드" },
        { type: "localized", path: "title", label: en ? "Title" : "제목" },
        { type: "localized", path: "department", label: en ? "Department" : "학과" },
        { type: "localized", path: "semester", label: en ? "Semester" : "학기" },
        { type: "date", path: "announcedAt", label: en ? "Announced At" : "공지일" },
        { type: "localized", path: "summary", label: en ? "Summary" : "요약", multiline: true, rows: 4 },
      ];
    case "clubReports":
      return [
        { type: "localized", path: "organization", label: en ? "Organization" : "조직" },
        { type: "text", path: "period", label: en ? "Period" : "기간" },
        { type: "localizedList", path: "leaders", label: en ? "Leaders" : "리더", placeholder: en ? "One per line" : "한 줄에 하나씩" },
        { type: "localized", path: "reportTitle", label: en ? "Report Title" : "보고서 제목" },
        { type: "text", path: "reportUrl", label: en ? "Report URL" : "보고서 URL" },
      ];
    case "schoolEvents":
      return [
        { type: "localized", path: "title", label: en ? "Title" : "제목" },
        { type: "select", path: "type", label: en ? "Type" : "유형", options: [
          { value: "upcoming", label: en ? "Upcoming" : "예정" },
          { value: "past", label: en ? "Past" : "종료" },
        ] },
        { type: "date", path: "eventDate", label: en ? "Event Date" : "행사일" },
        { type: "localized", path: "location", label: en ? "Location" : "장소" },
        { type: "localizedList", path: "materials", label: en ? "Materials" : "자료", placeholder: en ? "One per line" : "한 줄에 하나씩" },
      ];
    case "publications":
      return [
        { type: "select", path: "type", label: en ? "Type" : "유형", options: [
          { value: "student-handbook", label: en ? "Student Handbook" : "학생 핸드북" },
          { value: "weekly-letter", label: en ? "Weekly Letter" : "위클리 레터" },
        ] },
        { type: "localized", path: "title", label: en ? "Title" : "제목" },
        { type: "text", path: "issue", label: en ? "Issue" : "이슈" },
        { type: "date", path: "publishDate", label: en ? "Publish Date" : "발행일" },
        { type: "text", path: "fileUrl", label: en ? "File URL" : "파일 URL" },
      ];
    case "schoolProfiles":
      return [
        { type: "text", path: "academicYear", label: en ? "Academic Year" : "학사년도" },
        { type: "localized", path: "title", label: en ? "Title" : "제목" },
        { type: "localized", path: "summary", label: en ? "Summary" : "요약", multiline: true, rows: 4 },
        { type: "text", path: "fileUrl", label: en ? "File URL" : "파일 URL" },
      ];
    case "buildingHistory":
      return [
        { type: "localized", path: "buildingName", label: en ? "Building Name" : "건물명" },
        { type: "number", path: "timelineYear", label: en ? "Timeline Year" : "연도" },
        { type: "select", path: "changeType", label: en ? "Change Type" : "변경 유형", options: [
          { value: "construction", label: en ? "Construction" : "신축" },
          { value: "renovation", label: en ? "Renovation" : "리노베이션" },
          { value: "repurpose", label: en ? "Repurpose" : "용도 변경" },
        ] },
        { type: "localized", path: "note", label: en ? "Note" : "메모", multiline: true, rows: 4 },
      ];
    case "alumniProfiles":
      return [
        { type: "text", path: "name", label: en ? "Name" : "이름" },
        { type: "number", path: "graduationYear", label: en ? "Graduation Year" : "졸업연도" },
        { type: "localized", path: "major", label: en ? "Major" : "전공" },
        { type: "localized", path: "currentRole", label: en ? "Current Role" : "현재 역할" },
        { type: "text", path: "linkedinUrl", label: "LinkedIn URL" },
        { type: "text", path: "snsUrl", label: en ? "SNS URL" : "SNS URL" },
        { type: "checkbox", path: "consentToShare", label: en ? "Consent To Share" : "공개 동의" },
      ];
    case "gradeTasks":
      return [
        { type: "localized", path: "grade", label: en ? "Grade" : "학년" },
        { type: "localized", path: "taskTitle", label: en ? "Task Title" : "과제 제목" },
        { type: "date", path: "dueDate", label: en ? "Due Date" : "마감일" },
        { type: "localized", path: "owner", label: en ? "Owner" : "담당" },
        { type: "localized", path: "status", label: en ? "Status" : "상태" },
      ];
  }
}

function renderField(
  field: FieldDefinition,
  draft: Record<string, unknown>,
  locale: "en" | "ko",
  updateDraft: (next: Record<string, unknown>) => void,
) {
  if (field.type === "text" || field.type === "number" || field.type === "date") {
    const value = toText(getPathValue(draft, field.path));
    return (
      <label key={field.path} className="text-sm">
        <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label}</span>
        <input
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => {
            const raw = event.target.value;
            const nextValue = field.type === "number" ? (raw === "" ? 0 : Number(raw)) : raw;
            updateDraft(setPathValue(draft, field.path, nextValue));
          }}
          className="archive-filter-input w-full"
        />
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label key={field.path} className="text-sm md:col-span-2">
        <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label}</span>
        <textarea
          value={toText(getPathValue(draft, field.path))}
          rows={field.rows ?? 4}
          placeholder={field.placeholder}
          onChange={(event) => updateDraft(setPathValue(draft, field.path, event.target.value))}
          className="archive-filter-input w-full resize-y"
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label key={field.path} className="text-sm">
        <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label}</span>
        <select
          value={toText(getPathValue(draft, field.path))}
          onChange={(event) => updateDraft(setPathValue(draft, field.path, event.target.value))}
          className="archive-filter-input w-full"
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label key={field.path} className="flex items-center gap-3 border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
        <input
          type="checkbox"
          checked={Boolean(getPathValue(draft, field.path))}
          onChange={(event) => updateDraft(setPathValue(draft, field.path, event.target.checked))}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "localized") {
    const enValue = toText(getPathValue(draft, `${field.path}.en`));
    const koValue = toText(getPathValue(draft, `${field.path}.ko`));
    const InputTag = field.multiline ? "textarea" : "input";

    return (
      <div key={field.path} className="grid gap-3 md:col-span-2 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label} (EN)</span>
          <InputTag
            {...(field.multiline ? { rows: field.rows ?? 4 } : { type: "text" })}
            value={enValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              updateDraft(setPathValue(draft, `${field.path}.en`, event.target.value))
            }
            className="archive-filter-input w-full resize-y"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label} (KO)</span>
          <InputTag
            {...(field.multiline ? { rows: field.rows ?? 4 } : { type: "text" })}
            value={koValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              updateDraft(setPathValue(draft, `${field.path}.ko`, event.target.value))
            }
            className="archive-filter-input w-full resize-y"
          />
        </label>
      </div>
    );
  }

  if (field.type === "stringList") {
    return (
      <label key={field.path} className="text-sm md:col-span-2">
        <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label}</span>
        <input
          type="text"
          value={toStringList(getPathValue(draft, field.path)).join(", ")}
          placeholder={field.placeholder}
          onChange={(event) => updateDraft(setPathValue(draft, field.path, parseStringList(event.target.value)))}
          className="archive-filter-input w-full"
        />
      </label>
    );
  }

  const enLines = toLocalizedLines(getPathValue(draft, field.path), "en").join("\n");
  const koLines = toLocalizedLines(getPathValue(draft, field.path), "ko").join("\n");

  return (
    <div key={field.path} className="grid gap-3 md:col-span-2 md:grid-cols-2">
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label} (EN)</span>
        <textarea
          rows={5}
          value={enLines}
          placeholder={field.placeholder}
          onChange={(event) =>
            updateDraft(setPathValue(draft, field.path, buildLocalizedList(event.target.value, koLines)))
          }
          className="archive-filter-input w-full resize-y"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-[var(--primary)]">{field.label} (KO)</span>
        <textarea
          rows={5}
          value={koLines}
          placeholder={field.placeholder}
          onChange={(event) =>
            updateDraft(setPathValue(draft, field.path, buildLocalizedList(enLines, event.target.value)))
          }
          className="archive-filter-input w-full resize-y"
        />
      </label>
    </div>
  );
}

export default function AdminArchiveEditor({
  initialSection = "projects",
  initialSourceId = null,
}: AdminArchiveEditorProps) {
  const { locale } = useI18n();
  const [section, setSection] = useState<ArchiveSection>(initialSection);
  const [items, setItems] = useState<EditorItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialSourceId);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [rawJson, setRawJson] = useState("{}");
  const [template, setTemplate] = useState<Record<string, unknown>>({});
  const [nextId, setNextId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const fieldDefinitions = useMemo(() => getFieldDefinitions(section, locale), [section, locale]);

  function setDraftState(nextDraft: Record<string, unknown>) {
    setDraft(nextDraft);
    setRawJson(JSON.stringify(nextDraft, null, 2));
  }

  useEffect(() => {
    setSection(initialSection);
    setSelectedId(initialSourceId);
    setMessage(null);
    setError(null);
  }, [initialSection, initialSourceId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage(null);
      setError(null);
      try {
        const response = await fetch(`/api/admin/archive-records?section=${section}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load section");
        }
        const data = (await response.json()) as {
          nextId: number;
          template: unknown;
          items: EditorItem[];
        };
        if (cancelled) return;

        const nextTemplate = asObject(data.template);
        const requestedId = initialSourceId;
        const matchedItem = requestedId !== null ? data.items.find((item) => item.id === requestedId) : null;
        const initialPayload = asObject(matchedItem?.payload ?? data.items[0]?.payload ?? nextTemplate);

        setItems(data.items);
        setNextId(data.nextId);
        setTemplate(nextTemplate);
        setSelectedId(matchedItem?.id ?? requestedId ?? data.items[0]?.id ?? data.nextId);
        setDraftState(initialPayload);
      } catch {
        if (!cancelled) {
          setError(locale === "ko" ? "섹션 데이터를 불러오지 못했습니다." : "Failed to load section data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [section, locale, reloadKey, initialSourceId]);

  function handleSelect(item: EditorItem) {
    setSelectedId(item.id);
    setDraftState(asObject(item.payload));
    setMessage(null);
    setError(null);
  }

  function handleNewRecord() {
    const nextDraft = setPathValue(template, "id", nextId);
    setSelectedId(nextId);
    setDraftState(nextDraft);
    setMessage(null);
    setError(null);
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const parsed = JSON.parse(rawJson) as Record<string, unknown>;
      const response = await fetch("/api/admin/archive-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          sourceId: selectedId ?? nextId,
          payload: parsed,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save");
      }
      const data = (await response.json()) as { items: EditorItem[]; sourceId: number; saved: unknown };
      const savedPayload = asObject(data.saved);
      setItems(data.items);
      setSelectedId(data.sourceId);
      setDraftState(savedPayload);
      setMessage(locale === "ko" ? "레코드를 저장했습니다." : "Record saved.");
    } catch {
      setError(locale === "ko" ? "저장에 실패했습니다. 입력값과 고급 JSON을 확인하세요." : "Save failed. Check form values and advanced JSON.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedId || !selectedItem?.isOverride) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/archive-records?section=${section}&sourceId=${selectedId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      const data = (await response.json()) as { items: EditorItem[]; nextId: number; template: unknown };
      const nextTemplate = asObject(data.template);
      const initialPayload = asObject(data.items[0]?.payload ?? nextTemplate);
      setItems(data.items);
      setNextId(data.nextId);
      setTemplate(nextTemplate);
      setSelectedId(data.items[0]?.id ?? data.nextId);
      setDraftState(initialPayload);
      setMessage(locale === "ko" ? "오버라이드를 삭제했습니다." : "Override deleted.");
    } catch {
      setError(locale === "ko" ? "삭제에 실패했습니다." : "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-cover border border-[var(--border)] px-6 py-6">
      <p className="section-cover-kicker">{locale === "ko" ? "아카이브 섹션 편집" : "Archive Section Editor"}</p>
      <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
        {locale === "ko" ? "섹션별 추가 및 수정" : "Section Add / Edit"}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
        {locale === "ko"
          ? "관리자만 각 섹션의 실제 레코드를 추가하거나 수정할 수 있습니다. 폼 입력이 기본이고, 필요할 때만 고급 JSON을 열면 됩니다."
          : "Admins can add or edit live records for each section. Form input is the default, and advanced JSON is optional."}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[var(--primary)]">{locale === "ko" ? "섹션" : "Section"}</span>
            <select
              value={section}
              onChange={(event) => setSection(event.target.value as ArchiveSection)}
              className="archive-filter-input w-full"
            >
              {sections.map((value) => (
                <option key={value} value={value}>
                  {getArchiveSectionLabel(value, locale)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={handleNewRecord} className="border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--primary)]">
              {locale === "ko" ? "새 레코드" : "New record"}
            </button>
            <button type="button" onClick={() => setReloadKey((current) => current + 1)} className="border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--primary)]">
              {locale === "ko" ? "새로고침" : "Refresh"}
            </button>
          </div>

          <div className="border border-[var(--border)]">
            <div className="border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {locale === "ko" ? "레코드 목록" : "Records"}
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {items.map((item) => (
                <button
                  key={`${section}-${item.id}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`block w-full border-b border-[var(--border)] px-4 py-3 text-left ${
                    selectedId === item.id ? "bg-[var(--surface-strong)]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[var(--primary)]">{item.title}</span>
                    {item.isOverride ? <span className="section-chip">override</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">ID {item.id}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {locale === "ko" ? "선택한 레코드" : "Selected record"}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                {locale === "ko" ? "레코드 ID" : "Record ID"}: {selectedId ?? nextId}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleSave} disabled={loading} className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {loading ? (locale === "ko" ? "저장 중..." : "Saving...") : locale === "ko" ? "저장" : "Save"}
              </button>
              <button type="button" onClick={handleDelete} disabled={loading || !selectedItem?.isOverride} className="border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--primary)] disabled:opacity-40">
                {locale === "ko" ? "삭제" : "Delete"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fieldDefinitions.map((field) => renderField(field, draft, locale, setDraftState))}
          </div>

          <details className="border border-[var(--border)] px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--primary)]">
              {locale === "ko" ? "고급 JSON 편집" : "Advanced JSON editor"}
            </summary>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {locale === "ko" ? "폼으로 다루기 어려운 경우에만 사용하세요." : "Use this only when the form is not enough."}
            </p>
            <textarea
              value={rawJson}
              onChange={(event) => {
                const nextRaw = event.target.value;
                setRawJson(nextRaw);
                try {
                  const parsed = JSON.parse(nextRaw) as Record<string, unknown>;
                  setDraft(parsed);
                } catch {
                  // keep raw text editable even while invalid
                }
              }}
              className="admin-json mt-3 min-h-[320px] w-full resize-y"
              spellCheck={false}
            />
          </details>

          {message ? <p className="text-sm font-semibold text-[var(--accent)]">{message}</p> : null}
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
