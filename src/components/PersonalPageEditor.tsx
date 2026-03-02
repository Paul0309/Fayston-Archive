"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import MyCollegeCounselor from "@/components/MyCollegeCounselor";
import type { PersonalPagePayload } from "@/lib/personalPage";
import { deriveGradeLevelFromGraduationYear, getGraduationYearOptions } from "@/lib/studentProfile";

interface PersonalPageEditorProps {
  initialPayload: PersonalPagePayload;
  endpoint: string;
  counselorEndpoint: string;
  transcriptUploadEndpoint: string;
  canManage: boolean;
  viewingAsAdmin?: boolean;
}

type PersonalRecordTab = "tests" | "activities" | "honors" | "competitions" | "academics" | "projects";

function normalizePayload(payload: PersonalPagePayload): PersonalPagePayload {
  return {
    ...payload,
    page: {
      ...payload.page,
      gradeLevel: payload.page.gradeLevel ?? "",
      profileVisibility: payload.page.profileVisibility ?? "PRIVATE",
      headline: payload.page.headline ?? "",
      bio: payload.page.bio ?? "",
      graduationYear: payload.page.graduationYear ?? "",
      targetMajors: payload.page.targetMajors ?? [],
      targetColleges: payload.page.targetColleges ?? [],
      transcriptNote: payload.page.transcriptNote ?? "",
      transcriptDocs: (payload.page.transcriptDocs ?? []).map((item) => ({
        ...item,
        academicYear: item.academicYear ?? "",
        quarter: item.quarter ?? "",
        gradeLevel: item.gradeLevel ?? "",
        notes: item.notes ?? "",
      })),
      transcripts: payload.page.transcripts ?? [],
      standardizedTests: payload.page.standardizedTests ?? [],
      clubs: (payload.page.clubs ?? []).map((item) => ({
        ...item,
        roles: item.roles ?? [],
      })),
      honors: payload.page.honors ?? [],
      competitions: payload.page.competitions ?? [],
      projects: (payload.page.projects ?? []).map((item) => ({
        ...item,
        isPublic: item.isPublic ?? false,
      })),
    },
  };
}

function emptyTranscript() {
  return {
    id: crypto.randomUUID(),
    term: "",
    course: "",
    grade: "",
    notes: "",
    sortOrder: 0,
  };
}

function emptyProject() {
  return {
    id: crypto.randomUUID(),
    title: "",
    year: "",
    summary: "",
    link: "",
    status: "",
    isPublic: false,
    sortOrder: 0,
  };
}

function emptyStandardizedTest() {
  return {
    id: crypto.randomUUID(),
    testType: "",
    testDate: "",
    score: "",
    notes: "",
    sortOrder: 0,
  };
}

function emptyClub() {
  return {
    id: crypto.randomUUID(),
    name: "",
    roles: [] as string[],
    gradeLevel: "",
    academicYear: "",
    notes: "",
    sortOrder: 0,
  };
}

function emptyHonor() {
  return {
    id: crypto.randomUUID(),
    title: "",
    issuer: "",
    awardDate: "",
    notes: "",
    sortOrder: 0,
  };
}

function emptyCompetition() {
  return {
    id: crypto.randomUUID(),
    title: "",
    organizer: "",
    result: "",
    competitionDate: "",
    notes: "",
    sortOrder: 0,
  };
}

function formatList(values: string[]) {
  return values.join(", ");
}

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatIsoDate(value: string) {
  return value.slice(0, 10);
}

function emptyTranscriptUploadMeta() {
  return {
    title: "",
    academicYear: "",
    quarter: "",
    gradeLevel: "",
    notes: "",
    file: null as File | null,
  };
}

export default function PersonalPageEditor({
  initialPayload,
  endpoint,
  counselorEndpoint,
  transcriptUploadEndpoint,
  canManage,
  viewingAsAdmin = false,
}: PersonalPageEditorProps) {
  const { t, locale } = useI18n();
  const graduationYears = getGraduationYearOptions(new Date(), 10);
  const [payload, setPayload] = useState(() => normalizePayload(initialPayload));
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMeta, setUploadMeta] = useState(() => emptyTranscriptUploadMeta());
  const [previewDoc, setPreviewDoc] = useState<PersonalPagePayload["page"]["transcriptDocs"][number] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeRecordTab, setActiveRecordTab] = useState<PersonalRecordTab>("academics");
  const [targetMajorsInput, setTargetMajorsInput] = useState(() => formatList(initialPayload.page.targetMajors ?? []));
  const [targetCollegesInput, setTargetCollegesInput] = useState(() => formatList(initialPayload.page.targetColleges ?? []));
  const [clubRoleDrafts, setClubRoleDrafts] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        (initialPayload.page.clubs ?? []).map((item) => [item.id, formatList(item.roles ?? [])]),
      ),
  );

  useEffect(() => {
    if (!notice && !error) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
      setError(null);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [notice, error]);

  const transcriptAverage = useMemo(() => {
    const numeric = payload.page.transcripts
      .map((item) => Number.parseFloat(item.grade))
      .filter((value) => Number.isFinite(value));

    if (numeric.length === 0) {
      return null;
    }

    return (numeric.reduce((sum, value) => sum + value, 0) / numeric.length).toFixed(2);
  }, [payload.page.transcripts]);

  const derivedGradeLevel = useMemo(
    () => deriveGradeLevelFromGraduationYear(payload.page.graduationYear),
    [payload.page.graduationYear],
  );

  function buildPageForSave() {
    return {
      ...payload.page,
      targetMajors: parseList(targetMajorsInput),
      targetColleges: parseList(targetCollegesInput),
      clubs: payload.page.clubs.map((item) => ({
        ...item,
        roles: parseList(clubRoleDrafts[item.id] ?? formatList(item.roles ?? [])),
      })),
    };
  }

  async function onSave() {
    setSaving(true);
    setNotice(null);
    setError(null);

    const pageToSave = buildPageForSave();

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pageToSave),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Save failed" }))) as { error?: string };
      setError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as { payload: PersonalPagePayload };
    const nextPayload = normalizePayload(data.payload);
    setPayload(nextPayload);
    setTargetMajorsInput(formatList(nextPayload.page.targetMajors ?? []));
    setTargetCollegesInput(formatList(nextPayload.page.targetColleges ?? []));
    setClubRoleDrafts(
      Object.fromEntries(nextPayload.page.clubs.map((item) => [item.id, formatList(item.roles ?? [])])),
    );
    setNotice(t("personal.pageSaved"));
    setSaving(false);
  }

  async function onUploadTranscript() {
    const file = uploadMeta.file;
    if (!file) return;

    setUploadingDoc(true);
    setNotice(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", uploadMeta.title.trim() || file.name.replace(/\.[^.]+$/, ""));
    formData.append("academicYear", uploadMeta.academicYear.trim());
    formData.append("quarter", uploadMeta.quarter.trim());
    formData.append("gradeLevel", uploadMeta.gradeLevel.trim());
    formData.append("notes", uploadMeta.notes.trim());

    const response = await fetch(transcriptUploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Upload failed" }))) as { error?: string };
      setError(data.error ?? "Upload failed");
      setUploadingDoc(false);
      return;
    }

    const data = (await response.json()) as {
      document: PersonalPagePayload["page"]["transcriptDocs"][number];
    };

    setPayload((prev) => ({
      ...prev,
      page: {
        ...prev.page,
        transcriptDocs: [data.document, ...(prev.page.transcriptDocs ?? [])],
      },
    }));
    setPreviewDoc(data.document);
    setNotice(t("personal.transcriptUploaded"));
    setUploadMeta(emptyTranscriptUploadMeta());
    setShowUploadForm(false);
    setUploadingDoc(false);
  }

  async function onDeleteTranscriptDoc(id: string) {
    const response = await fetch(`/api/transcript-documents/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Delete failed" }))) as { error?: string };
      setError(data.error ?? "Delete failed");
      return;
    }

    setPayload((prev) => ({
      ...prev,
      page: {
        ...prev.page,
        transcriptDocs: (prev.page.transcriptDocs ?? []).filter((item) => item.id !== id),
      },
    }));
    setPreviewDoc((prev) => (prev?.id === id ? null : prev));
    setNotice(t("personal.transcriptRemoved"));
  }

  return (
    <div className="personal-layout">
      {notice || error ? (
        <div className={`personal-toast ${error ? "personal-toast-error" : "personal-toast-success"}`}>
          {error ?? notice}
        </div>
      ) : null}

      <section className="section-cover border border-[var(--border)] px-6 py-6">
        <p className="section-cover-kicker">{t("personal.privateWorkspace")}</p>
        <div className="personal-page-top">
          <div>
            <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">
              {payload.user.name ?? payload.user.username ?? t("nav.myPage")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              {t("personal.pageDescription")}
            </p>
          </div>
          <div className="personal-meta">
            <span>{payload.user.role}</span>
            <span>{payload.user.username ?? "-"}</span>
            {viewingAsAdmin ? <span>{t("personal.adminView")}</span> : null}
          </div>
        </div>
      </section>

      <div className="personal-columns">
        <div className="personal-main-stack">
          <section className="section-block px-6 py-6 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{t("personal.profile")}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{t("personal.aboutPage")}</h2>
              </div>
              {canManage ? (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? t("personal.saving") : t("personal.savePage")}
                </button>
              ) : null}
            </div>

            <div className="personal-form-grid">
              <label className="auth-field">
                <span>{t("personal.grade")}</span>
                <div className="archive-filter-input w-full personal-readonly-field">
                  {derivedGradeLevel || t("personal.selectYearFirst")}
                </div>
              </label>

              <label className="auth-field">
                <span>{t("personal.headline")}</span>
                <input
                  value={payload.page.headline}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, headline: event.target.value },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                  placeholder="e.g. CS + Math applicant focused on systems and data"
                />
              </label>

              <label className="auth-field">
                <span>{t("personal.targetMajors")}</span>
                <input
                  value={targetMajorsInput}
                  onChange={(event) => setTargetMajorsInput(event.target.value)}
                  onBlur={() =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, targetMajors: parseList(targetMajorsInput) },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                  placeholder="Computer Science, Data Science"
                />
              </label>

              <label className="auth-field">
                <span>{t("personal.graduationYear")}</span>
                <select
                  value={payload.page.graduationYear}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, graduationYear: event.target.value },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                >
                  <option value="">{t("personal.selectGraduatingYear")}</option>
                  {graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="auth-field">
                <span>{t("personal.profileVisibility")}</span>
                <select
                  value={payload.page.profileVisibility}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, profileVisibility: event.target.value },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                >
                  <option value="PRIVATE">{t("personal.private")}</option>
                  <option value="DIRECTORY">{t("personal.publicInStudents")}</option>
                </select>
              </label>

              <label className="auth-field">
                <span>{t("personal.targetColleges")}</span>
                <input
                  value={targetCollegesInput}
                  onChange={(event) => setTargetCollegesInput(event.target.value)}
                  onBlur={() =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, targetColleges: parseList(targetCollegesInput) },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                  placeholder="CMU, Georgia Tech, KAIST"
                />
              </label>

              <label className="auth-field md:col-span-2">
                <span>{t("personal.bio")}</span>
                <textarea
                  value={payload.page.bio}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, bio: event.target.value },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input min-h-32 w-full"
                  placeholder="Short private bio, application context, goals, or academic positioning."
                />
              </label>

              <label className="auth-field md:col-span-2">
                <span>{t("personal.transcriptNote")}</span>
                <textarea
                  value={payload.page.transcriptNote}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, transcriptNote: event.target.value },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input min-h-28 w-full"
                  placeholder="Overall GPA context, AP/IB notes, counselor comments, semester summaries."
                />
              </label>
            </div>

            {notice ? <p className="mt-4 text-sm font-semibold text-[var(--accent)]">{notice}</p> : null}
            {error ? <p className="auth-error mt-4">{error}</p> : null}
          </section>

          <section className="section-block px-6 py-5 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{locale === "ko" ? "기록 입력" : "Records"}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                  {locale === "ko" ? "입력 영역" : "Editing Workspace"}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {locale === "ko"
                    ? "카테고리를 바꿔가며 한 영역씩 집중해서 입력하세요."
                    : "Switch by category so you only work on one record type at a time."}
                </p>
              </div>
            </div>
            <div className="personal-record-tabs mt-4">
              {[
                { id: "academics", label: locale === "ko" ? "성적표" : "Academics" },
                { id: "tests", label: locale === "ko" ? "시험 점수" : "Tests" },
                { id: "activities", label: locale === "ko" ? "클럽" : "Activities" },
                { id: "honors", label: locale === "ko" ? "상장" : "Honors" },
                { id: "competitions", label: locale === "ko" ? "대회" : "Competitions" },
                { id: "projects", label: locale === "ko" ? "프로젝트" : "Projects" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`personal-record-tab ${activeRecordTab === tab.id ? "personal-record-tab-active" : ""}`}
                  onClick={() => setActiveRecordTab(tab.id as PersonalRecordTab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {activeRecordTab === "tests" ? (
          <section className="section-block px-6 py-6 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{locale === "ko" ? "시험 점수" : "Tests"}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                  {locale === "ko" ? "표준화 시험" : "Standardized Tests"}
                </h2>
              </div>
              {canManage ? (
                <button
                  type="button"
                  className="section-chip"
                  onClick={() =>
                    setPayload((prev) => ({
                      ...prev,
                      page: {
                        ...prev.page,
                        standardizedTests: [...prev.page.standardizedTests, emptyStandardizedTest()],
                      },
                    }))
                  }
                >
                  {locale === "ko" ? "시험 점수 추가" : "Add test score"}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              {payload.page.standardizedTests.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  {locale === "ko" ? "시험 점수가 아직 없습니다." : "No standardized test scores yet."}
                </p>
              ) : (
                payload.page.standardizedTests.map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="auth-field">
                        <span>{locale === "ko" ? "시험" : "Test"}</span>
                        <input
                          value={item.testType}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const standardizedTests = [...prev.page.standardizedTests];
                              standardizedTests[index] = { ...item, testType: event.target.value };
                              return { ...prev, page: { ...prev.page, standardizedTests } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="SAT / TOEFL / IELTS / AP"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{locale === "ko" ? "점수" : "Score"}</span>
                        <input
                          value={item.score}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const standardizedTests = [...prev.page.standardizedTests];
                              standardizedTests[index] = { ...item, score: event.target.value };
                              return { ...prev, page: { ...prev.page, standardizedTests } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="1540 / 111 / 5"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{locale === "ko" ? "응시일" : "Test Date"}</span>
                        <input
                          value={item.testDate}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const standardizedTests = [...prev.page.standardizedTests];
                              standardizedTests[index] = { ...item, testDate: event.target.value };
                              return { ...prev, page: { ...prev.page, standardizedTests } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="2026-08 / Oct 2026"
                        />
                      </label>
                    </div>
                    <label className="auth-field">
                      <span>{t("personal.notes")}</span>
                      <textarea
                        value={item.notes}
                        disabled={!canManage}
                        onChange={(event) =>
                          setPayload((prev) => {
                            const standardizedTests = [...prev.page.standardizedTests];
                            standardizedTests[index] = { ...item, notes: event.target.value };
                            return { ...prev, page: { ...prev.page, standardizedTests } };
                          })
                        }
                        className="archive-filter-input min-h-24 w-full"
                        placeholder={locale === "ko" ? "최고 점수, superscore, 응시 계획 메모." : "Superscore, subsection note, or retake plan."}
                      />
                    </label>
                    {canManage ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#b42318]"
                          onClick={() =>
                            setPayload((prev) => ({
                              ...prev,
                              page: {
                                ...prev.page,
                                standardizedTests: prev.page.standardizedTests.filter((_, current) => current !== index),
                              },
                            }))
                          }
                        >
                          {t("personal.remove")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
          ) : null}

          {activeRecordTab === "activities" ? (
          <section className="section-block px-6 py-6 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{locale === "ko" ? "활동" : "Activities"}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                  {locale === "ko" ? "클럽 및 직책" : "Clubs and Roles"}
                </h2>
              </div>
              {canManage ? (
                <button
                  type="button"
                  className="section-chip"
                  onClick={() =>
                    setPayload((prev) => ({
                      ...prev,
                      page: {
                        ...prev.page,
                        clubs: [...prev.page.clubs, emptyClub()],
                      },
                    }))
                  }
                >
                  {locale === "ko" ? "클럽 추가" : "Add club"}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              {payload.page.clubs.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  {locale === "ko" ? "클럽 기록이 아직 없습니다." : "No club records yet."}
                </p>
              ) : (
                payload.page.clubs.map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="auth-field">
                        <span>{locale === "ko" ? "클럽 이름" : "Club Name"}</span>
                        <input
                          value={item.name}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const clubs = [...prev.page.clubs];
                              clubs[index] = { ...item, name: event.target.value };
                              return { ...prev, page: { ...prev.page, clubs } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="Student Council / Robotics / MUN"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{locale === "ko" ? "직책(쉼표로 구분)" : "Roles (comma-separated)"}</span>
                        <input
                          value={clubRoleDrafts[item.id] ?? formatList(item.roles)}
                          disabled={!canManage}
                          onChange={(event) =>
                            setClubRoleDrafts((prev) => ({
                              ...prev,
                              [item.id]: event.target.value,
                            }))
                          }
                          onBlur={() =>
                            setPayload((prev) => {
                              const clubs = [...prev.page.clubs];
                              clubs[index] = {
                                ...item,
                                roles: parseList(clubRoleDrafts[item.id] ?? ""),
                              };
                              return { ...prev, page: { ...prev.page, clubs } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder={locale === "ko" ? "Leader, Treasurer" : "Leader, Treasurer"}
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="auth-field">
                        <span>{locale === "ko" ? "학년" : "Grade"}</span>
                        <select
                          value={item.gradeLevel}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const clubs = [...prev.page.clubs];
                              clubs[index] = { ...item, gradeLevel: event.target.value };
                              return { ...prev, page: { ...prev.page, clubs } };
                            })
                          }
                          className="archive-filter-input w-full"
                        >
                          <option value="">{locale === "ko" ? "학년 선택" : "Select grade"}</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                          <option value="11">11</option>
                          <option value="12">12</option>
                        </select>
                      </label>
                      <label className="auth-field">
                        <span>{locale === "ko" ? "학년도" : "Academic Year"}</span>
                        <input
                          value={item.academicYear}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const clubs = [...prev.page.clubs];
                              clubs[index] = { ...item, academicYear: event.target.value };
                              return { ...prev, page: { ...prev.page, clubs } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="25-26"
                        />
                      </label>
                    </div>
                    <label className="auth-field">
                      <span>{t("personal.notes")}</span>
                      <textarea
                        value={item.notes}
                        disabled={!canManage}
                        onChange={(event) =>
                          setPayload((prev) => {
                            const clubs = [...prev.page.clubs];
                            clubs[index] = { ...item, notes: event.target.value };
                            return { ...prev, page: { ...prev.page, clubs } };
                          })
                        }
                        className="archive-filter-input min-h-24 w-full"
                        placeholder={locale === "ko" ? "무엇을 했는지, 영향, 주당 시간 등." : "Impact, responsibilities, weekly commitment, or results."}
                      />
                    </label>
                    {canManage ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#b42318]"
                          onClick={() =>
                            setPayload((prev) => ({
                              ...prev,
                              page: {
                                ...prev.page,
                                clubs: prev.page.clubs.filter((_, current) => current !== index),
                              },
                            }))
                          }
                        >
                          {t("personal.remove")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
          ) : null}

          {activeRecordTab === "honors" ? (
          <section className="section-block px-6 py-6 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{locale === "ko" ? "성과" : "Recognition"}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                  {locale === "ko" ? "상장 및 수상" : "Honors and Awards"}
                </h2>
              </div>
              {canManage ? (
                <button
                  type="button"
                  className="section-chip"
                  onClick={() =>
                    setPayload((prev) => ({
                      ...prev,
                      page: {
                        ...prev.page,
                        honors: [...prev.page.honors, emptyHonor()],
                      },
                    }))
                  }
                >
                  {locale === "ko" ? "상장 추가" : "Add honor"}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              {payload.page.honors.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  {locale === "ko" ? "상장 기록이 아직 없습니다." : "No honors yet."}
                </p>
              ) : (
                payload.page.honors.map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="auth-field md:col-span-2">
                        <span>{locale === "ko" ? "상장명" : "Award Title"}</span>
                        <input
                          value={item.title}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const honors = [...prev.page.honors];
                              honors[index] = { ...item, title: event.target.value };
                              return { ...prev, page: { ...prev.page, honors } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="High Honor Roll / Principal's Award"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{locale === "ko" ? "수상일" : "Award Date"}</span>
                        <input
                          value={item.awardDate}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const honors = [...prev.page.honors];
                              honors[index] = { ...item, awardDate: event.target.value };
                              return { ...prev, page: { ...prev.page, honors } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="2025-06"
                        />
                      </label>
                    </div>
                    <label className="auth-field">
                      <span>{locale === "ko" ? "수여기관" : "Issuer"}</span>
                      <input
                        value={item.issuer}
                        disabled={!canManage}
                        onChange={(event) =>
                          setPayload((prev) => {
                            const honors = [...prev.page.honors];
                            honors[index] = { ...item, issuer: event.target.value };
                            return { ...prev, page: { ...prev.page, honors } };
                          })
                        }
                        className="archive-filter-input w-full"
                        placeholder="School / Organization / Foundation"
                      />
                    </label>
                    <label className="auth-field">
                      <span>{t("personal.notes")}</span>
                      <textarea
                        value={item.notes}
                        disabled={!canManage}
                        onChange={(event) =>
                          setPayload((prev) => {
                            const honors = [...prev.page.honors];
                            honors[index] = { ...item, notes: event.target.value };
                            return { ...prev, page: { ...prev.page, honors } };
                          })
                        }
                        className="archive-filter-input min-h-24 w-full"
                        placeholder={locale === "ko" ? "선발 기준, 의미, 배경 메모." : "Selection basis, scope, or context."}
                      />
                    </label>
                    {canManage ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#b42318]"
                          onClick={() =>
                            setPayload((prev) => ({
                              ...prev,
                              page: {
                                ...prev.page,
                                honors: prev.page.honors.filter((_, current) => current !== index),
                              },
                            }))
                          }
                        >
                          {t("personal.remove")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
          ) : null}

          {activeRecordTab === "competitions" ? (
          <section className="section-block px-6 py-6 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{locale === "ko" ? "경시/대회" : "Competitions"}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">
                  {locale === "ko" ? "대회 참가 및 수상" : "Competitions and Results"}
                </h2>
              </div>
              {canManage ? (
                <button
                  type="button"
                  className="section-chip"
                  onClick={() =>
                    setPayload((prev) => ({
                      ...prev,
                      page: {
                        ...prev.page,
                        competitions: [...prev.page.competitions, emptyCompetition()],
                      },
                    }))
                  }
                >
                  {locale === "ko" ? "대회 기록 추가" : "Add competition"}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              {payload.page.competitions.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  {locale === "ko" ? "대회 기록이 아직 없습니다." : "No competition records yet."}
                </p>
              ) : (
                payload.page.competitions.map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="auth-field">
                        <span>{locale === "ko" ? "대회명" : "Competition"}</span>
                        <input
                          value={item.title}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const competitions = [...prev.page.competitions];
                              competitions[index] = { ...item, title: event.target.value };
                              return { ...prev, page: { ...prev.page, competitions } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="AMC / Hackathon / Debate / Science Fair"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{locale === "ko" ? "주최" : "Organizer"}</span>
                        <input
                          value={item.organizer}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const competitions = [...prev.page.competitions];
                              competitions[index] = { ...item, organizer: event.target.value };
                              return { ...prev, page: { ...prev.page, competitions } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="MAA / School / Local chapter"
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="auth-field">
                        <span>{locale === "ko" ? "결과" : "Result"}</span>
                        <input
                          value={item.result}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const competitions = [...prev.page.competitions];
                              competitions[index] = { ...item, result: event.target.value };
                              return { ...prev, page: { ...prev.page, competitions } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder={locale === "ko" ? "참가 / Bronze / Winner / Qualifier" : "Participant / Bronze / Winner / Qualifier"}
                        />
                      </label>
                      <label className="auth-field">
                        <span>{locale === "ko" ? "일자" : "Date"}</span>
                        <input
                          value={item.competitionDate}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const competitions = [...prev.page.competitions];
                              competitions[index] = { ...item, competitionDate: event.target.value };
                              return { ...prev, page: { ...prev.page, competitions } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="2025-11"
                        />
                      </label>
                    </div>
                    <label className="auth-field">
                      <span>{t("personal.notes")}</span>
                      <textarea
                        value={item.notes}
                        disabled={!canManage}
                        onChange={(event) =>
                          setPayload((prev) => {
                            const competitions = [...prev.page.competitions];
                            competitions[index] = { ...item, notes: event.target.value };
                            return { ...prev, page: { ...prev.page, competitions } };
                          })
                        }
                        className="archive-filter-input min-h-24 w-full"
                        placeholder={locale === "ko" ? "팀/개인 여부, 역할, 참가 규모 메모." : "Individual/team, role, scale, or context."}
                      />
                    </label>
                    {canManage ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#b42318]"
                          onClick={() =>
                            setPayload((prev) => ({
                              ...prev,
                              page: {
                                ...prev.page,
                                competitions: prev.page.competitions.filter((_, current) => current !== index),
                              },
                            }))
                          }
                        >
                          {t("personal.remove")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
          ) : null}

          {activeRecordTab === "academics" ? (
          <section className="section-block px-6 py-6 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{t("personal.transcriptKicker")}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{t("personal.academicRecord")}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {canManage ? (
                  <button
                    type="button"
                    className="section-chip"
                    onClick={() =>
                      setPayload((prev) => ({
                        ...prev,
                        page: {
                          ...prev.page,
                          transcripts: [...prev.page.transcripts, emptyTranscript()],
                        },
                      }))
                    }
                  >
                    {t("personal.addTranscriptLine")}
                  </button>
                ) : null}
                {canManage ? (
                  <button
                    type="button"
                    className="section-chip"
                    onClick={() => setShowUploadForm((current) => !current)}
                  >
                    {uploadingDoc ? t("personal.uploading") : t("personal.uploadTranscriptFile")}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <p className="section-cover-kicker">{t("personal.transcriptFiles")}</p>
              {canManage && showUploadForm ? (
                <div className="personal-card-grid mt-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="auth-field">
                      <span>{t("personal.title")}</span>
                      <input
                        value={uploadMeta.title}
                        onChange={(event) => setUploadMeta((prev) => ({ ...prev, title: event.target.value }))}
                        className="archive-filter-input w-full"
                        placeholder="Transcript 2024-2025 Q1"
                      />
                    </label>
                    <label className="auth-field">
                      <span>{t("personal.graduationYear")}</span>
                      <input
                        value={uploadMeta.academicYear}
                        onChange={(event) => setUploadMeta((prev) => ({ ...prev, academicYear: event.target.value }))}
                        className="archive-filter-input w-full"
                        placeholder="24-25"
                      />
                    </label>
                    <label className="auth-field">
                      <span>Quarter</span>
                      <select
                        value={uploadMeta.quarter}
                        onChange={(event) => setUploadMeta((prev) => ({ ...prev, quarter: event.target.value }))}
                        className="archive-filter-input w-full"
                      >
                        <option value="">Select quarter</option>
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>
                    </label>
                    <label className="auth-field">
                      <span>{t("personal.grade")}</span>
                      <select
                        value={uploadMeta.gradeLevel}
                        onChange={(event) => setUploadMeta((prev) => ({ ...prev, gradeLevel: event.target.value }))}
                        className="archive-filter-input w-full"
                      >
                        <option value="">Select grade</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                    </label>
                    <label className="auth-field md:col-span-2">
                      <span>{t("personal.notes")}</span>
                      <textarea
                        value={uploadMeta.notes}
                        onChange={(event) => setUploadMeta((prev) => ({ ...prev, notes: event.target.value }))}
                        className="archive-filter-input min-h-24 w-full"
                        placeholder="Quarter GPA context, notable grade change, counselor note."
                      />
                    </label>
                    <label className="auth-field md:col-span-2">
                      <span>{t("personal.uploadTranscriptFile")}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(event) =>
                          setUploadMeta((prev) => ({
                            ...prev,
                            file: event.target.files?.[0] ?? null,
                            title:
                              prev.title ||
                              (event.target.files?.[0]?.name.replace(/\.[^.]+$/, "") ?? ""),
                          }))
                        }
                        className="archive-filter-input w-full"
                        disabled={uploadingDoc}
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void onUploadTranscript()}
                      disabled={uploadingDoc || !uploadMeta.file}
                      className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {uploadingDoc ? t("personal.uploading") : t("personal.uploadTranscriptFile")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadForm(false);
                        setUploadMeta(emptyTranscriptUploadMeta());
                      }}
                      className="border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--primary)]"
                    >
                      {t("floating.cancel")}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="mt-3 grid gap-3">
                {(payload.page.transcriptDocs ?? []).length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">{t("personal.noTranscriptFiles")}</p>
                ) : (
                  (payload.page.transcriptDocs ?? []).map((item) => (
                    <div key={item.id} className="personal-card-grid">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[var(--primary)]">{item.title}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {item.originalName} | {formatBytes(item.sizeBytes)} | {formatIsoDate(item.createdAt)}
                          </p>
                          {item.academicYear || item.quarter || item.gradeLevel ? (
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {[item.academicYear, item.quarter, item.gradeLevel ? `Grade ${item.gradeLevel}` : ""].filter(Boolean).join(" | ")}
                            </p>
                          ) : null}
                          {item.notes ? <p className="mt-2 text-sm text-[var(--muted)]">{item.notes}</p> : null}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm font-semibold">
                          <button
                            type="button"
                            className="text-[var(--accent)]"
                            onClick={() => setPreviewDoc(item)}
                          >
                            {t("personal.preview")}
                          </button>
                          <a
                            href={`/api/transcript-documents/${item.id}/download`}
                            className="text-[var(--accent)]"
                          >
                            {t("personal.download")}
                          </a>
                          {canManage ? (
                            <button
                              type="button"
                              className="text-[#b42318]"
                              onClick={() => void onDeleteTranscriptDoc(item.id)}
                            >
                              {t("personal.delete")}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {previewDoc ? (
                <div className="personal-doc-preview">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--primary)]">{previewDoc.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {previewDoc.originalName} | {previewDoc.mimeType || "file"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--muted)]"
                      onClick={() => setPreviewDoc(null)}
                    >
                      {t("personal.close")}
                    </button>
                  </div>
                  <div className="mt-4">
                    <iframe
                      src={`/api/transcript-documents/${previewDoc.id}/preview`}
                      title={previewDoc.title}
                      className="personal-preview-frame"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <p className="section-cover-kicker">{t("personal.transcriptLines")}</p>
              <div className="mt-3 grid gap-4">
              {(payload.page.transcripts ?? []).length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{t("personal.noTranscriptLines")}</p>
              ) : (
                (payload.page.transcripts ?? []).map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="auth-field">
                        <span>{t("personal.term")}</span>
                        <input
                          value={item.term}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const transcripts = [...prev.page.transcripts];
                              transcripts[index] = { ...item, term: event.target.value };
                              return { ...prev, page: { ...prev.page, transcripts } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="2025 Fall"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{t("personal.course")}</span>
                        <input
                          value={item.course}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const transcripts = [...prev.page.transcripts];
                              transcripts[index] = { ...item, course: event.target.value };
                              return { ...prev, page: { ...prev.page, transcripts } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="AP Calculus BC"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{t("personal.gradeField")}</span>
                        <input
                          value={item.grade}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const transcripts = [...prev.page.transcripts];
                              transcripts[index] = { ...item, grade: event.target.value };
                              return { ...prev, page: { ...prev.page, transcripts } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="A / 4.0 / 97"
                        />
                      </label>
                    </div>
                    <label className="auth-field">
                      <span>{t("personal.notes")}</span>
                      <textarea
                        value={item.notes}
                        disabled={!canManage}
                        onChange={(event) =>
                          setPayload((prev) => {
                            const transcripts = [...prev.page.transcripts];
                            transcripts[index] = { ...item, notes: event.target.value };
                            return { ...prev, page: { ...prev.page, transcripts } };
                          })
                        }
                        className="archive-filter-input min-h-24 w-full"
                        placeholder="Teacher note, class rigor, exam detail, or explanation."
                      />
                    </label>
                    {canManage ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#b42318]"
                          onClick={() =>
                            setPayload((prev) => ({
                              ...prev,
                              page: {
                                ...prev.page,
                                transcripts: prev.page.transcripts.filter((_, current) => current !== index),
                              },
                            }))
                          }
                        >
                          {t("personal.remove")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
              </div>
            </div>
          </section>
          ) : null}

          {activeRecordTab === "projects" ? (
          <section className="section-block px-6 py-6 personal-surface">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">{t("personal.projects")}</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{t("personal.projectLog")}</h2>
              </div>
              {canManage ? (
                <button
                  type="button"
                  className="section-chip"
                  onClick={() =>
                    setPayload((prev) => ({
                      ...prev,
                      page: {
                        ...prev.page,
                        projects: [...prev.page.projects, emptyProject()],
                      },
                    }))
                  }
                >
                  {t("personal.addProject")}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              {(payload.page.projects ?? []).length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{t("personal.noProjects")}</p>
              ) : (
                (payload.page.projects ?? []).map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="auth-field md:col-span-2">
                        <span>{t("personal.title")}</span>
                        <input
                          value={item.title}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const projects = [...prev.page.projects];
                              projects[index] = { ...item, title: event.target.value };
                              return { ...prev, page: { ...prev.page, projects } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="Admissions dashboard for transcript tracking"
                        />
                      </label>
                      <label className="auth-field">
                        <span>{t("personal.year")}</span>
                        <input
                          value={item.year}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const projects = [...prev.page.projects];
                              projects[index] = { ...item, year: event.target.value };
                              return { ...prev, page: { ...prev.page, projects } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="2026"
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="auth-field">
                        <span>{t("personal.status")}</span>
                        <input
                          value={item.status}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const projects = [...prev.page.projects];
                              projects[index] = { ...item, status: event.target.value };
                              return { ...prev, page: { ...prev.page, projects } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="draft / active / submitted"
                        />
                      </label>
                      <div className="auth-field flex items-end">
                        <span>{t("personal.publicProfile")}</span>
                        <label className="personal-checkbox-row">
                          <input
                            type="checkbox"
                            checked={Boolean(item.isPublic)}
                            disabled={!canManage}
                            onChange={(event) =>
                              setPayload((prev) => {
                                const projects = [...prev.page.projects];
                                projects[index] = { ...item, isPublic: event.target.checked };
                                return { ...prev, page: { ...prev.page, projects } };
                              })
                            }
                          />
                          <span>{t("personal.showOnProfile")}</span>
                        </label>
                      </div>
                      <label className="auth-field">
                        <span>{t("personal.link")}</span>
                        <input
                          value={item.link}
                          disabled={!canManage}
                          onChange={(event) =>
                            setPayload((prev) => {
                              const projects = [...prev.page.projects];
                              projects[index] = { ...item, link: event.target.value };
                              return { ...prev, page: { ...prev.page, projects } };
                            })
                          }
                          className="archive-filter-input w-full"
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                    <label className="auth-field">
                      <span>{t("personal.summary")}</span>
                      <textarea
                        value={item.summary}
                        disabled={!canManage}
                        onChange={(event) =>
                          setPayload((prev) => {
                            const projects = [...prev.page.projects];
                            projects[index] = { ...item, summary: event.target.value };
                            return { ...prev, page: { ...prev.page, projects } };
                          })
                        }
                        className="archive-filter-input min-h-24 w-full"
                        placeholder="What it does, current status, what still needs work."
                      />
                    </label>
                    {canManage ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#b42318]"
                          onClick={() =>
                            setPayload((prev) => ({
                              ...prev,
                              page: {
                                ...prev.page,
                                projects: prev.page.projects.filter((_, current) => current !== index),
                              },
                            }))
                          }
                        >
                          {t("personal.remove")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
          ) : null}
        </div>

        <aside className="personal-side-stack">
          <section className="section-block px-5 py-5 personal-surface">
            <p className="section-cover-kicker">{t("personal.snapshot")}</p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
              <div className="personal-stat">
                <span>{t("personal.grade")}</span>
                <strong>{derivedGradeLevel || "-"}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.transcriptLinesCount")}</span>
                <strong>{(payload.page.transcripts ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.transcriptFilesCount")}</span>
                <strong>{(payload.page.transcriptDocs ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.projectsCount")}</span>
                <strong>{(payload.page.projects ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{locale === "ko" ? "시험 점수 수" : "Test Scores"}</span>
                <strong>{(payload.page.standardizedTests ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{locale === "ko" ? "클럽 수" : "Clubs"}</span>
                <strong>{(payload.page.clubs ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{locale === "ko" ? "상장 수" : "Honors"}</span>
                <strong>{(payload.page.honors ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{locale === "ko" ? "대회 기록 수" : "Competitions"}</span>
                <strong>{(payload.page.competitions ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.publicProjectsCount")}</span>
                <strong>{(payload.page.projects ?? []).filter((item) => item.isPublic).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.averageGrade")}</span>
                <strong>{transcriptAverage ?? "-"}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.graduationYear")}</span>
                <strong>{payload.page.graduationYear || "-"}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.visibility")}</span>
                <strong>{payload.page.profileVisibility}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.targetMajorsCount")}</span>
                <strong>{(payload.page.targetMajors ?? []).length}</strong>
              </div>
              <div className="personal-stat">
                <span>{t("personal.targetCollegesCount")}</span>
                <strong>{(payload.page.targetColleges ?? []).length}</strong>
              </div>
            </div>
          </section>

          <section className="section-block px-5 py-5 personal-surface">
            <p className="section-cover-kicker">{t("personal.access")}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {t("personal.accessDescription")}
            </p>
          </section>
        </aside>
      </div>

      <MyCollegeCounselor endpoint={counselorEndpoint} />
    </div>
  );
}
