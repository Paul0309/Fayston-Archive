"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import type { ArchiveSection } from "@/lib/archiveData";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  references?: Array<{
    label: string;
    title: string;
    excerpt: string;
    href?: string;
    badge?: string;
  }>;
}

export default function AICounselor() {
  return <AICounselorInner variant="page" />;
}

export function AICounselorInner({
  variant = "page",
  presetPrompts = [],
  context = "handbook",
  archiveSection = null,
}: {
  variant?: "page" | "panel";
  presetPrompts?: string[];
  context?: "handbook" | "archive" | "links" | "projects";
  archiveSection?: ArchiveSection | null;
}) {
  const { t } = useI18n();
  const messageIdRef = useRef(0);
  const nextMessageId = () => `msg-${messageIdRef.current++}`;
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "msg-initial",
      text: t("counselor.starter"),
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendQuestion(rawQuestion: string) {
    const question = rawQuestion.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { id: nextMessageId(), text: question, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context, archiveSection }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = (await res.json()) as {
        answer: string;
        references?: Array<{
          label: string;
          title: string;
          excerpt: string;
          href?: string;
          badge?: string;
        }>;
      };
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId(),
          text: data.answer,
          sender: "ai",
          references: data.references ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), text: t("counselor.requestFailed"), sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendQuestion(input);
  }

  return (
    <section className={variant === "panel" ? "ai-counselor-panel" : "max-w-6xl border-t border-[var(--border)] pt-5"}>
      <h2 className="text-xl font-bold text-[var(--primary)]">{t("counselor.title")}</h2>

      {presetPrompts.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {t("counselor.quickQuestions")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {presetPrompts.map((prompt, idx) => (
              <button
                key={`preset-${idx}`}
                type="button"
                className="border border-[var(--border)] px-3 py-2 text-left text-sm text-[var(--primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                onClick={() => void sendQuestion(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={`mt-3 space-y-3 overflow-y-auto border-y border-[var(--border)] py-3 ${variant === "panel" ? "ai-counselor-panel-log" : "h-[280px]"}`}>
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <p
              className={`text-sm leading-6 ${
                message.sender === "user" ? "text-[var(--primary)]" : "text-[var(--muted)]"
              }`}
            >
              <span className="font-semibold">{message.sender === "user" ? t("counselor.you") : t("counselor.ai")}: </span>
              {message.text}
            </p>

            {message.references && message.references.length > 0 ? (
              <div className="ai-reference-grid">
                {message.references.map((reference, idx) => (
                  <div key={`${message.id}-ref-${idx}`} className="ai-reference-card">
                    <div className="ai-reference-top">
                      <p className="ai-reference-label">{reference.label}</p>
                      {reference.badge ? <span className="ai-reference-badge">{reference.badge}</span> : null}
                    </div>
                    <p className="ai-reference-title">{reference.title}</p>
                    <p className="ai-reference-excerpt">{reference.excerpt}</p>
                    {reference.href ? (
                      <Link href={reference.href} className="ai-reference-link" target="_blank">
                        {t("counselor.openSource")}
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {loading ? (
          <p className="text-sm text-[var(--muted)]">{t("counselor.generating")}</p>
        ) : null}
        <div ref={endRef} />
      </div>

      <form suppressHydrationWarning onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          suppressHydrationWarning
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="flex-1 border border-[var(--border)] px-3 py-2 text-sm text-[var(--primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder={t("counselor.example")}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {t("counselor.send")}
        </button>
      </form>
    </section>
  );
}
