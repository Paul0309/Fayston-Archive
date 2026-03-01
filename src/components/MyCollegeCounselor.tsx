"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { CounselorInsights } from "@/lib/collegeCounselor";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface MyCollegeCounselorProps {
  endpoint: string;
}

export default function MyCollegeCounselor({ endpoint }: MyCollegeCounselorProps) {
  const [insights, setInsights] = useState<CounselorInsights | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadInsights() {
      setLoading(true);
      setError(null);

      const response = await fetch(endpoint);
      if (!response.ok) {
        if (!active) return;
        setError("Could not load counselor insights.");
        setLoading(false);
        return;
      }

      const data = (await response.json()) as { insights: CounselorInsights };
      if (!active) return;

      setInsights(data.insights);
      setMessages([
        {
          sender: "ai",
          text: data.insights.summary,
        },
      ]);
      setLoading(false);
    }

    void loadInsights();

    return () => {
      active = false;
    };
  }, [endpoint]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setInput("");
    setSending(true);
    setError(null);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "The counselor could not answer that right now." },
      ]);
      setSending(false);
      return;
    }

    const data = (await response.json()) as { answer: string };
    setMessages((prev) => [...prev, { sender: "ai", text: data.answer }]);
    setSending(false);
  }

  return (
    <section className="section-block px-5 py-5">
      <div className="personal-section-head">
        <div>
          <p className="section-cover-kicker">AI College Counselor</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--primary)]">Admissions Planning</h2>
        </div>
      </div>

      {loading ? <p className="mt-4 text-sm text-[var(--muted)]">Loading counselor context...</p> : null}
      {error ? <p className="auth-error mt-4">{error}</p> : null}

      {insights ? (
        <div className="mt-5 grid gap-5">
          <div className="personal-counselor-grid">
            <div className="personal-counselor-card">
              <p className="section-cover-kicker">Profile Summary</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{insights.summary}</p>
            </div>

            <div className="personal-counselor-card">
              <p className="section-cover-kicker">Admissions Gaps</p>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--muted)]">
                {insights.gaps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="personal-counselor-card">
              <p className="section-cover-kicker">Next Actions</p>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--muted)]">
                {insights.nextActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="section-cover-kicker">Suggested Prompts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {insights.starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="section-chip"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="border-y border-[var(--border)] py-4">
            <div className="grid max-h-[260px] gap-3 overflow-y-auto">
              {messages.map((message, index) => (
                <p
                  key={`${message.sender}-${index}`}
                  className={`text-sm leading-7 ${
                    message.sender === "user" ? "text-[var(--primary)]" : "text-[var(--muted)]"
                  }`}
                >
                  <span className="font-semibold">{message.sender === "user" ? "You" : "Counselor"}: </span>
                  {message.text}
                </p>
              ))}
              {sending ? <p className="text-sm text-[var(--muted)]">Counselor: Thinking...</p> : null}
              <div ref={endRef} />
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="archive-filter-input w-full"
              placeholder="Ask about your gaps, transcript, projects, or next steps."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
