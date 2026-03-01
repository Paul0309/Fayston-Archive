"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import MyCollegeCounselor from "@/components/MyCollegeCounselor";
import type { PersonalPagePayload } from "@/lib/personalPage";

interface PersonalPageEditorProps {
  initialPayload: PersonalPagePayload;
  endpoint: string;
  counselorEndpoint: string;
  transcriptUploadEndpoint: string;
  canManage: boolean;
  viewingAsAdmin?: boolean;
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

export default function PersonalPageEditor({
  initialPayload,
  endpoint,
  counselorEndpoint,
  transcriptUploadEndpoint,
  canManage,
  viewingAsAdmin = false,
}: PersonalPageEditorProps) {
  const [payload, setPayload] = useState(initialPayload);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcriptAverage = useMemo(() => {
    const numeric = payload.page.transcripts
      .map((item) => Number.parseFloat(item.grade))
      .filter((value) => Number.isFinite(value));

    if (numeric.length === 0) {
      return null;
    }

    return (numeric.reduce((sum, value) => sum + value, 0) / numeric.length).toFixed(2);
  }, [payload.page.transcripts]);

  async function onSave() {
    setSaving(true);
    setNotice(null);
    setError(null);

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.page),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Save failed" }))) as { error?: string };
      setError(data.error ?? "Save failed");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as { payload: PersonalPagePayload };
    setPayload(data.payload);
    setNotice("Saved.");
    setSaving(false);
  }

  async function onUploadTranscript(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setNotice(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(/\.[^.]+$/, ""));

    const response = await fetch(transcriptUploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Upload failed" }))) as { error?: string };
      setError(data.error ?? "Upload failed");
      setUploadingDoc(false);
      event.target.value = "";
      return;
    }

    const data = (await response.json()) as {
      document: PersonalPagePayload["page"]["transcriptDocs"][number];
    };

    setPayload((prev) => ({
      ...prev,
      page: {
        ...prev.page,
        transcriptDocs: [data.document, ...prev.page.transcriptDocs],
      },
    }));
    setNotice("Transcript file uploaded.");
    setUploadingDoc(false);
    event.target.value = "";
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
        transcriptDocs: prev.page.transcriptDocs.filter((item) => item.id !== id),
      },
    }));
    setNotice("Transcript file removed.");
  }

  return (
    <div className="grid gap-6">
      <section className="section-cover border border-[var(--border)] px-6 py-6">
        <p className="section-cover-kicker">Private Workspace</p>
        <div className="personal-page-top">
          <div>
            <h1 className="mt-2 text-3xl font-black text-[var(--primary)]">
              {payload.user.name ?? payload.user.username ?? "Private Page"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Personal archive page for transcript history, private projects, and self-managed academic notes.
              Only the owner and admins can access this surface.
            </p>
          </div>
          <div className="personal-meta">
            <span>{payload.user.role}</span>
            <span>{payload.user.username ?? "no-username"}</span>
            {viewingAsAdmin ? <span>admin view</span> : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
        <div className="grid gap-6">
          <section className="section-block px-6 py-6">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">Profile</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">About This Page</h2>
              </div>
              {canManage ? (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Page"}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              <label className="auth-field">
                <span>Headline</span>
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
                <span>Graduation Year</span>
                <input
                  value={payload.page.graduationYear}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, graduationYear: event.target.value },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                  placeholder="2027"
                />
              </label>

              <label className="auth-field">
                <span>Target Majors</span>
                <input
                  value={formatList(payload.page.targetMajors)}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, targetMajors: parseList(event.target.value) },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                  placeholder="Computer Science, Data Science"
                />
              </label>

              <label className="auth-field">
                <span>Target Colleges</span>
                <input
                  value={formatList(payload.page.targetColleges)}
                  onChange={(event) =>
                    setPayload((prev) => ({
                      ...prev,
                      page: { ...prev.page, targetColleges: parseList(event.target.value) },
                    }))
                  }
                  disabled={!canManage}
                  className="archive-filter-input w-full"
                  placeholder="CMU, Georgia Tech, KAIST"
                />
              </label>

              <label className="auth-field">
                <span>Bio</span>
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

              <label className="auth-field">
                <span>Transcript Note</span>
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

          <section className="section-block px-6 py-6">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">Transcripts</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">Academic Record</h2>
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
                    Add Transcript Line
                  </button>
                ) : null}
                {canManage ? (
                  <label className="section-chip cursor-pointer">
                    {uploadingDoc ? "Uploading..." : "Upload Transcript File"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={onUploadTranscript}
                      disabled={uploadingDoc}
                    />
                  </label>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <p className="section-cover-kicker">Transcript Files</p>
              <div className="mt-3 grid gap-3">
                {payload.page.transcriptDocs.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No transcript files uploaded yet.</p>
                ) : (
                  payload.page.transcriptDocs.map((item) => (
                    <div key={item.id} className="personal-card-grid">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[var(--primary)]">{item.title}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {item.originalName} | {formatBytes(item.sizeBytes)} | {new Date(item.createdAt).toLocaleDateString("en-CA")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm font-semibold">
                          <a
                            href={`/api/transcript-documents/${item.id}/download`}
                            className="text-[var(--accent)]"
                          >
                            Download
                          </a>
                          {canManage ? (
                            <button
                              type="button"
                              className="text-[#b42318]"
                              onClick={() => void onDeleteTranscriptDoc(item.id)}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {payload.page.transcripts.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No transcript lines yet.</p>
              ) : (
                payload.page.transcripts.map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="auth-field">
                        <span>Term</span>
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
                        <span>Course</span>
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
                        <span>Grade</span>
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
                      <span>Notes</span>
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
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="section-block px-6 py-6">
            <div className="personal-section-head">
              <div>
                <p className="section-cover-kicker">Projects</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">Private Project Log</h2>
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
                  Add Project
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              {payload.page.projects.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No private projects yet.</p>
              ) : (
                payload.page.projects.map((item, index) => (
                  <div key={item.id} className="personal-card-grid">
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="auth-field md:col-span-2">
                        <span>Title</span>
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
                        <span>Year</span>
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
                        <span>Status</span>
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
                      <label className="auth-field">
                        <span>Link</span>
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
                      <span>Summary</span>
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
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="grid gap-6">
          <section className="section-block px-5 py-5">
            <p className="section-cover-kicker">Snapshot</p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
              <div className="personal-stat">
                <span>Transcript lines</span>
                <strong>{payload.page.transcripts.length}</strong>
              </div>
              <div className="personal-stat">
                <span>Transcript files</span>
                <strong>{payload.page.transcriptDocs.length}</strong>
              </div>
              <div className="personal-stat">
                <span>Projects</span>
                <strong>{payload.page.projects.length}</strong>
              </div>
              <div className="personal-stat">
                <span>Average grade</span>
                <strong>{transcriptAverage ?? "-"}</strong>
              </div>
              <div className="personal-stat">
                <span>Graduation year</span>
                <strong>{payload.page.graduationYear || "-"}</strong>
              </div>
              <div className="personal-stat">
                <span>Target majors</span>
                <strong>{payload.page.targetMajors.length}</strong>
              </div>
              <div className="personal-stat">
                <span>Target colleges</span>
                <strong>{payload.page.targetColleges.length}</strong>
              </div>
            </div>
          </section>

          <section className="section-block px-5 py-5">
            <p className="section-cover-kicker">Access</p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              This page is private. Only the owner and users with the admin role can open or edit it.
            </p>
          </section>

          <MyCollegeCounselor endpoint={counselorEndpoint} />
        </aside>
      </div>
    </div>
  );
}
