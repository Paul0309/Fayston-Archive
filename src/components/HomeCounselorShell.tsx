"use client";

import dynamic from "next/dynamic";

const AICounselor = dynamic(() => import("@/components/AICounselor"), {
  ssr: false,
  loading: () => (
    <section className="max-w-6xl border-t border-[var(--border)] pt-5">
      <h2 className="text-xl font-bold text-[var(--primary)]">AI Handbook Counselor</h2>
      <p className="mt-3 text-sm text-[var(--muted)]">Loading counselor...</p>
    </section>
  ),
});

export default function HomeCounselorShell() {
  return <AICounselor />;
}
