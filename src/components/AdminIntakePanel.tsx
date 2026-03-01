"use client";

import { useMemo, useState } from "react";

type IntakeType = "publication" | "schoolProfile" | "schoolLink";

const templateByType: Record<IntakeType, string[]> = {
  publication: ["title", "issue", "publishDate", "fileUrl", "type"],
  schoolProfile: ["academicYear", "title", "summary", "fileUrl"],
  schoolLink: ["name", "type", "url", "note", "owner", "updatedAt"],
};

export default function AdminIntakePanel() {
  const [type, setType] = useState<IntakeType>("publication");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [owner, setOwner] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

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

  return (
    <section className="section-cover border border-[var(--border)] px-6 py-6">
      <p className="section-cover-kicker">Mock Intake Desk</p>
      <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">Admin Input Workflow</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
        This is a pre-DB intake surface for collecting publication, school profile, and school
        link submissions in a consistent format before real persistence is added.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">Intake Type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as IntakeType)}
                className="archive-filter-input w-full"
              >
                <option value="publication">Publication</option>
                <option value="schoolProfile">School Profile</option>
                <option value="schoolLink">School Link</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">Date / Year</span>
              <input
                value={date}
                onChange={(event) => setDate(event.target.value)}
                placeholder="2026-03-01 or 2025-2026"
                className="archive-filter-input w-full"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[var(--primary)]">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Student Handbook 2026"
              className="archive-filter-input w-full"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[var(--primary)]">Subtitle / Issue</span>
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="v2026.1 or Week 07"
              className="archive-filter-input w-full"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">Owner</span>
              <input
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder="Media Office"
                className="archive-filter-input w-full"
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--primary)]">URL / File Path</span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="/files/student-handbook-2026.pdf"
                className="archive-filter-input w-full"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-semibold text-[var(--primary)]">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Describe what changed, upload source, or verification notes."
              className="archive-filter-input w-full resize-y"
            />
          </label>
        </div>

        <div className="border border-[var(--border)] bg-white/70 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Required Keys
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {templateByType[type].map((key) => (
              <span key={key} className="section-chip">
                {key}
              </span>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Preview Payload
          </p>
          <pre className="admin-json mt-2">{JSON.stringify(payload, null, 2)}</pre>

          <div className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--primary)]">Next DB step</p>
            <p className="mt-1 leading-7">
              Connect this form to Prisma and add review states. Until then, this view keeps field
              contracts stable for manual data entry.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
