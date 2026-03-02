"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";

type IntakeType = "publication" | "schoolProfile" | "schoolLink" | "updatePost";

interface SubmissionItem {
  id: string;
  intakeType: string;
  title: string;
  subtitle: string | null;
  dateLabel: string | null;
  owner: string | null;
  url: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

type IntakeBackend = "prisma" | "json";

const templateByType: Record<IntakeType, string[]> = {
  publication: ["title", "issue", "publishDate", "fileUrl", "type"],
  schoolProfile: ["academicYear", "title", "summary", "fileUrl"],
  schoolLink: ["name", "type", "url", "note", "owner", "updatedAt"],
  updatePost: ["title", "slug", "publishDate", "excerpt", "body"],
};

export default function AdminIntakePanel() {
  const { t } = useI18n();
  const [type, setType] = useState<IntakeType>("publication");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [owner, setOwner] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<IntakeBackend | null>(null);

  const payload = useMemo(
    () => ({
      type,
      title,
      subtitle,
      date,
      owner,
      url,
      notes,
    }),
    [type, title, subtitle, date, owner, url, notes],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/admin/intake");
        if (!response.ok) {
          throw new Error("Failed to load submissions");
        }

        const data = (await response.json()) as {
          backend: IntakeBackend;
          submissions: SubmissionItem[];
        };
        if (!cancelled) {
          setBackend(data.backend);
          setSubmissions(data.submissions);
        }
      } catch {
        if (!cancelled) {
          setError(t("admin.loadFailed"));
        }
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save intake");
      }

      const data = (await response.json()) as {
        backend: IntakeBackend;
        submission: SubmissionItem;
      };
      setBackend(data.backend);
      setSubmissions((prev) => [data.submission, ...prev]);
      setTitle("");
      setSubtitle("");
      setDate("");
      setOwner("");
      setUrl("");
      setNotes("");
      setMessage(data.backend === "prisma" ? t("admin.savedPrisma") : t("admin.savedJson"));
    } catch {
      setError(t("admin.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-cover border border-[var(--border)] px-6 py-6">
      <p className="section-cover-kicker">{t("admin.editorialArchiveIntake")}</p>
      <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{t("admin.workflow")}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
        {t("admin.workflowDescription")}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">{t("admin.intakeType")}</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as IntakeType)}
                className="archive-filter-input w-full"
              >
                <option value="publication">Publication</option>
                <option value="schoolProfile">School Profile</option>
                <option value="schoolLink">School Link</option>
                <option value="updatePost">Update Post</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">{t("admin.dateYear")}</span>
              <input
                value={date}
                onChange={(event) => setDate(event.target.value)}
                placeholder="2026-03-01 or 2025-2026"
                className="archive-filter-input w-full"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[var(--primary)]">{t("admin.titleLabel")}</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                type === "updatePost"
                  ? "Why the archive needed an editorial layer"
                  : "Student Handbook 2026"
              }
              className="archive-filter-input w-full"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[var(--primary)]">{t("admin.subtitleIssueSlug")}</span>
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder={
                type === "updatePost"
                  ? "why-archive-needs-editorial-layer"
                  : "v2026.1 or Week 07"
              }
              className="archive-filter-input w-full"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">{t("admin.owner")}</span>
              <input
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder={type === "updatePost" ? "Archive Team" : "Media Office"}
                className="archive-filter-input w-full"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">{t("admin.urlFilePath")}</span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={
                  type === "updatePost"
                    ? "/updates/new-post-slug"
                    : "/files/student-handbook-2026.pdf"
                }
                className="archive-filter-input w-full"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[var(--primary)]">{t("admin.notes")}</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder={
                type === "updatePost"
                  ? "Write the teaser, body draft, or related archive links."
                  : "Describe what changed, upload source, or verification notes."
              }
              className="archive-filter-input w-full resize-y"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? t("admin.saving") : t("admin.saveSubmission")}
            </button>
            {message ? <p className="text-sm font-semibold text-[var(--accent)]">{message}</p> : null}
            {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          </div>
        </form>

        <div className="border border-[var(--border)] bg-white/70 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {t("admin.requiredKeys")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {templateByType[type].map((key) => (
              <span key={key} className="section-chip">
                {key}
              </span>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {t("admin.previewPayload")}
          </p>
          <pre className="admin-json mt-2">{JSON.stringify(payload, null, 2)}</pre>

          <div className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--primary)]">{t("admin.savedQueue")}</p>
            {backend ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t("admin.activeBackend")}: {backend}
              </p>
            ) : null}
            {booting ? (
              <p className="mt-2">{t("admin.loadingSaved")}</p>
            ) : submissions.length === 0 ? (
              <p className="mt-2">{t("admin.noSaved")}</p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {submissions.slice(0, 8).map((submission) => (
                  <li key={submission.id} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          {submission.intakeType}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                          {submission.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {submission.owner ?? t("admin.noOwner")} · {submission.dateLabel ?? t("admin.noDate")}
                        </p>
                      </div>
                      <span className="section-chip">{submission.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
