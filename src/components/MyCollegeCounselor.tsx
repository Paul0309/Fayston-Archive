"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import type { CounselorInsights, CounselorMessage } from "@/lib/collegeCounselor";

type Message = CounselorMessage;

interface MyCollegeCounselorProps {
  endpoint: string;
}

type PlannerPanel = "month" | "summer" | "essay";

export default function MyCollegeCounselor({ endpoint }: MyCollegeCounselorProps) {
  const { t } = useI18n();
  const [insights, setInsights] = useState<CounselorInsights | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<PlannerPanel>("month");
  const endRef = useRef<HTMLDivElement | null>(null);

  const plannerItems = useMemo(() => {
    if (!insights) return [];
    if (activePanel === "summer") return insights.summerStrategy;
    if (activePanel === "essay") return insights.essayAngles;
    return insights.thirtyDayPlan;
  }, [activePanel, insights]);

  useEffect(() => {
    let active = true;

    async function loadInsights() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("load failed");
        }

        const data = (await response.json()) as { insights: CounselorInsights };
        if (!active) return;

        setInsights(data.insights);
      } catch {
        if (active) {
          setError(t("counselor.loadFailed"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInsights();

    return () => {
      active = false;
    };
  }, [endpoint, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function sendQuestion(question: string) {
    if (!question.trim() || sending) return;

    const nextMessages = [...messages, { sender: "user" as const, text: question }];
    setMessages(nextMessages);
    setSending(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: nextMessages }),
      });

      if (!response.ok) {
        throw new Error("answer failed");
      }

      const data = (await response.json()) as { answer: string };
      setMessages((prev) => [...prev, { sender: "ai", text: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", text: t("counselor.answerFailed") }]);
    } finally {
      setSending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    await sendQuestion(question);
  }

  async function askPreset(prompt: string) {
    setInput("");
    await sendQuestion(prompt);
  }

  return (
    <section className="section-block px-6 py-6 personal-surface">
      <div className="personal-section-head">
        <div>
          <p className="section-cover-kicker">{t("counselor.collegeTitle")}</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">{t("counselor.admissionsPlanning")}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("counselor.usingOpenAI")}</p>
        </div>
      </div>

      {loading ? <p className="mt-4 text-sm text-[var(--muted)]">{t("counselor.loadingContext")}</p> : null}
      {error ? <p className="auth-error mt-4">{error}</p> : null}

      {insights ? (
        <div className="mt-5 grid gap-5">
          <div className="personal-counselor-hero">
            <div className="personal-counselor-hero-main">
              <p className="section-cover-kicker">{t("counselor.readiness")}</p>
              <h3 className="mt-2 text-2xl font-black text-[var(--primary)]">{insights.readiness}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{insights.overview}</p>
            </div>
            <div className="personal-counselor-hero-side">
              <p className="section-cover-kicker">{t("counselor.targetContext")}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{insights.targetContext}</p>
            </div>
          </div>

          <div className="personal-counselor-grid-2">
            <article className="personal-counselor-card personal-counselor-card-strong">
              <p className="section-cover-kicker">{t("counselor.priorities")}</p>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--primary)]">
                {insights.priorities.map((item) => (
                  <li key={item} className="personal-bullet-item">{item}</li>
                ))}
              </ul>
            </article>

            <article className="personal-counselor-card">
              <p className="section-cover-kicker">{t("counselor.strengths")}</p>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--muted)]">
                {insights.strengths.map((item) => (
                  <li key={item} className="personal-bullet-item">{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="personal-counselor-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="section-cover-kicker">{t("counselor.planner")}</p>
              <div className="personal-counselor-tabs">
                <button
                  type="button"
                  className={`personal-counselor-tab ${activePanel === "month" ? "personal-counselor-tab-active" : ""}`}
                  onClick={() => setActivePanel("month")}
                >
                  {t("counselor.thirtyDayPlan")}
                </button>
                <button
                  type="button"
                  className={`personal-counselor-tab ${activePanel === "summer" ? "personal-counselor-tab-active" : ""}`}
                  onClick={() => setActivePanel("summer")}
                >
                  {t("counselor.summerStrategy")}
                </button>
                <button
                  type="button"
                  className={`personal-counselor-tab ${activePanel === "essay" ? "personal-counselor-tab-active" : ""}`}
                  onClick={() => setActivePanel("essay")}
                >
                  {t("counselor.essayAngles")}
                </button>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-7 text-[var(--muted)]">
              {plannerItems.map((item) => (
                <li key={item} className="personal-bullet-item">{item}</li>
              ))}
            </ul>
          </article>

          <article className="personal-counselor-card">
            <p className="section-cover-kicker">{t("counselor.quickQuestions")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {insights.starterPrompts.map((prompt) => (
                <button key={prompt} type="button" className="section-chip" onClick={() => void askPreset(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </article>

          <article className="personal-counselor-chat">
            <div className="personal-counselor-chat-log">
              {messages.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{t("counselor.noConversation")}</p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.sender}-${index}`}
                    className={`personal-counselor-message ${message.sender === "user" ? "personal-counselor-message-user" : "personal-counselor-message-ai"}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {message.sender === "user" ? t("counselor.you") : t("counselor.counselor")}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--primary)]">{message.text}</p>
                  </div>
                ))
              )}
              {sending ? <p className="text-sm text-[var(--muted)]">{t("counselor.thinking")}</p> : null}
              <div ref={endRef} />
            </div>

            <form onSubmit={onSubmit} className="personal-counselor-input-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="archive-filter-input w-full"
                placeholder={t("counselor.askPlaceholder")}
                disabled={sending}
              />
              <button type="submit" disabled={sending} className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {t("counselor.send")}
              </button>
            </form>
          </article>
        </div>
      ) : null}
    </section>
  );
}
