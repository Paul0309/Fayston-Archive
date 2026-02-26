"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

interface Message {
  text: string;
  sender: "user" | "ai";
}

export default function AICounselor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Ask about handbook rules, awards, teams, courses, or events.",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { text: question, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = (await res.json()) as { answer: string };
      setMessages((prev) => [...prev, { text: data.answer, sender: "ai" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Something went wrong. Please try again.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-6xl border-t border-[var(--border)] pt-5">
      <h2 className="text-xl font-bold text-[var(--primary)]">AI Handbook Counselor</h2>

      <div className="mt-3 h-[280px] space-y-3 overflow-y-auto border-y border-[var(--border)] py-3">
        {messages.map((message, idx) => (
          <p
            key={`${message.sender}-${idx}`}
            className={`text-sm leading-6 ${
              message.sender === "user" ? "text-[var(--primary)]" : "text-[var(--muted)]"
            }`}
          >
            <span className="font-semibold">{message.sender === "user" ? "You" : "AI"}: </span>
            {message.text}
          </p>
        ))}

        {loading ? (
          <p className="text-sm text-[var(--muted)]">AI: Generating answer...</p>
        ) : null}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="flex-1 border border-[var(--border)] px-3 py-2 text-sm text-[var(--primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder="Example: What is the dorm curfew?"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
