"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  MessageSquareText,
  Radar,
  Sparkles,
  TriangleAlert,
  Waves,
} from "lucide-react";
import { assistProfiles, assistRecommendations, demoPools } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { RiskBadge } from "@/components/ui/risk-badge";

function SignalRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="group rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,248,255,0.78))] p-5 text-center shadow-[0_16px_36px_rgba(126,136,170,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(126,136,170,0.16)]">
      <div className="relative mx-auto h-28 w-28">
        <div className="absolute inset-2 rounded-full bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
        <svg viewBox="0 0 100 100" className="relative h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(116,135,255,0.12)" strokeWidth="12" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            className="drop-shadow-[0_10px_18px_rgba(114,135,255,0.22)]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-[var(--ink-900)]">
          {score}
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-500)]">{label}</p>
    </div>
  );
}

const guidedPrompts = [
  {
    id: "explain",
    label: "Explain this invoice pool simply",
    answer:
      "This is an invoice investment pool. Instead of selecting one invoice, you join a pool that groups multiple invoice cashflows. The operator manages funding, servicing, and repayment updates, while you monitor the pool and claim distributions later.",
    bullets: [
      "Start with repayment quality, not headline yield",
      "Check who the operator is",
      "Look at payer concentration before joining",
    ],
  },
  {
    id: "yield",
    label: "Why is the yield high?",
    answer:
      "Higher estimated yield usually means the pool has more uncertainty around timing, servicing, or payer concentration. It is not free extra return — it is compensation for more risk in the cashflow story.",
    bullets: [
      "Compare late exposure first",
      "Review servicing status",
      "Check if repayments have already started",
    ],
  },
  {
    id: "delay",
    label: "What could delay my payout?",
    answer:
      "The biggest reasons are slower payer repayments, disputes, weak servicing, or concentration in a few important payers. Claimable distributions appear only after real cash has come back into the pool.",
    bullets: [
      "Watch recent repayment events",
      "Check late exposure and maturity together",
      "Treat stale servicing updates as a warning signal",
    ],
  },
  {
    id: "starter",
    label: "What should a first-time user pick?",
    answer:
      "For a first invoice investment, the assistant would usually prefer a shorter-duration pool with a stronger repayment rate, lower late exposure, and clearer servicing history rather than the highest yield on the page.",
    bullets: [
      "Shorter duration is easier to understand",
      "Lower late exposure matters more than hype",
      "Stable repayment history is the cleanest signal",
    ],
  },
];

const compactFaq = [
  "What exactly am I investing in?",
  "When can I get distributions?",
  "Why is the yield different across pools?",
  "What does late exposure mean?",
  "What are the biggest risks?",
  "What changed after servicing updates?",
];

export default function AiAssistPage() {
  const [activePromptId, setActivePromptId] = useState(guidedPrompts[0].id);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    {
      role: "assistant",
      text: "Hi, I’m InvoX AI Assist. I help explain invoice investing in simple terms — yield, repayments, delays, and what to review before joining a pool.",
    },
  ]);

  const activePrompt = useMemo(
    () => guidedPrompts.find((prompt) => prompt.id === activePromptId) ?? guidedPrompts[0],
    [activePromptId],
  );

  const featuredPool = useMemo(
    () => demoPools.find((pool) => pool.id === assistRecommendations[0]?.poolId) ?? demoPools[0],
    [],
  );

  function buildReply(question: string) {
    const normalized = question.toLowerCase();

    if (normalized.includes("yield") || normalized.includes("return") || normalized.includes("수익")) {
      return "In invoice investing, yield comes from the difference between the pool’s funding terms and the repayments that come back later, after fees, delays, and servicing outcomes are considered.";
    }

    if (normalized.includes("delay") || normalized.includes("late") || normalized.includes("지연")) {
      return "Delays usually come from slower payer settlement, concentration in a few large payers, disputes, or weak servicing. That is why late exposure matters so much.";
    }

    if (normalized.includes("risk") || normalized.includes("위험")) {
      return "The biggest hidden risk in invoice investing is often not volatility but cashflow concentration and servicing quality. A pool can look attractive on yield and still be weak on timing reliability.";
    }

    return "The main way to read invoice investing is: understand where the cashflow comes from, who repays it, how concentrated the pool is, and how quickly real repayments are likely to become claimable distributions.";
  }

  function sendPrompt(question: string) {
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: buildReply(question) },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = chatInput.trim();
    if (!value) return;
    sendPrompt(value);
    setChatInput("");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="glass-panel relative overflow-hidden p-6">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(114,135,255,0.34),transparent_60%)] blur-2xl pulse-glow" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(94,215,198,0.28),transparent_60%)] blur-2xl float-slow" />
          <div className="absolute inset-x-10 top-0 h-px shimmer-line" />

          <div className="flex items-center gap-2 text-[var(--brand-700)]">
            <Sparkles className="h-4 w-4" />
            <p className="eyebrow text-[var(--brand-700)]">AI Assist</p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Invoice investing, explained by AI
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-600)] sm:text-base">
            Less reading, more understanding. The assistant turns invoice investing into clear signals: what changed, what matters, what could delay payouts, and what to check next.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SignalRing score={82} color="#7287ff" label="Clarity" />
            <SignalRing score={61} color="#58ddd0" label="Timing" />
            <SignalRing score={34} color="#ff8e7e" label="Delay" />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {guidedPrompts.map((prompt) => (
              <button
                key={prompt.id}
                className={`metric-chip px-4 py-2 text-xs transition hover:-translate-y-0.5 ${
                  activePromptId === prompt.id
                    ? "bg-[linear-gradient(135deg,rgba(114,135,255,0.18),rgba(94,215,198,0.16))] text-[var(--ink-900)]"
                    : "bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(242,246,255,0.82))] text-[var(--ink-700)]"
                }`}
                type="button"
                onClick={() => {
                  setActivePromptId(prompt.id);
                  sendPrompt(prompt.label);
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand-600)]" />
                {prompt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stat-card stat-card--lavender relative overflow-hidden">
          <div className="absolute -right-16 top-4 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),transparent_60%)] blur-2xl pulse-glow" />
          <p className="eyebrow">AI Brief</p>
          <h2 className="mt-8 text-3xl font-semibold">Start with the signal, not the wall of text</h2>
          <div className="mt-6 space-y-3">
            {[
              {
                title: "Best first read",
                value: "Repayment quality beats headline yield",
                Icon: BrainCircuit,
              },
              {
                title: "Current watch item",
                value: "Concentration risk still matters most",
                Icon: Radar,
              },
              {
                title: "Recent insight",
                value: "Repayment events improve trust more than projections",
                Icon: Waves,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.35rem] bg-white/80 p-4 shadow-[0_14px_28px_rgba(126,136,170,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_rgba(126,136,170,0.14)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                    <item.Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink-900)]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-600)]">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="soft-card relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(114,135,255,0.16),transparent_60%)] blur-2xl pulse-glow" />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,249,255,0.86))] p-6 shadow-[0_18px_40px_rgba(126,136,170,0.1)]">
            <div className="flex items-center gap-2 text-[var(--brand-700)]">
              <MessageSquareText className="h-4 w-4" />
              <p className="eyebrow text-[var(--brand-700)]">Ask the assistant</p>
            </div>
            <div className="mt-5 max-h-[24rem] space-y-3 overflow-y-auto pr-2">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-[1.35rem] px-4 py-4 text-sm leading-7 shadow-[0_12px_28px_rgba(126,136,170,0.08)] ${
                    message.role === "assistant"
                      ? "bg-white/88 text-[var(--ink-700)]"
                      : "ml-10 bg-[linear-gradient(135deg,rgba(114,135,255,0.18),rgba(94,215,198,0.14))] text-[var(--ink-900)]"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
              <input
                className="h-12 flex-1 rounded-full border border-[var(--line)] bg-white/90 px-4 text-sm outline-none"
                placeholder="Ask about yield, delays, or invoice pool risk..."
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
              />
              <button className="btn-primary" type="submit">
                Ask
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-soft)] p-6 shadow-[0_18px_36px_rgba(126,136,170,0.08)]">
              <div className="flex items-center gap-2 text-[var(--coral-600)]">
                <TriangleAlert className="h-4 w-4" />
                <p className="eyebrow text-[var(--coral-600)]">What to check next</p>
              </div>
              <div className="mt-4 space-y-3">
                {activePrompt.bullets.map((item) => (
                  <div key={item} className="rounded-[1.25rem] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--ink-700)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(114,135,255,0.16),rgba(94,215,198,0.14))] p-6 shadow-[0_18px_40px_rgba(126,136,170,0.1)]">
              <p className="eyebrow text-[var(--brand-700)]">Pool snapshot</p>
              <p className="mt-3 text-xl font-semibold text-[var(--ink-900)]">{featuredPool.name}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/70 p-4">
                  <p className="eyebrow">Estimated Yield</p>
                  <p className="mt-2 text-lg font-semibold">{formatPercent(featuredPool.annualizedYieldPct)}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/70 p-4">
                  <p className="eyebrow">Late Exposure</p>
                  <p className="mt-2 text-lg font-semibold">{featuredPool.lateExposurePercent}%</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/70 p-4">
                  <p className="eyebrow">Pool Face Value</p>
                  <p className="mt-2 text-lg font-semibold">{formatCurrency(featuredPool.invoiceValue)}</p>
                </div>
                <div className="rounded-[1.2rem] bg-white/70 p-4">
                  <p className="eyebrow">Risk Grade</p>
                  <div className="mt-2"><RiskBadge grade={featuredPool.riskGrade} /></div>
                </div>
              </div>
              <Link href={`/pools/${featuredPool.id}`} className="btn-secondary mt-4 w-full justify-center">
                View this pool
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="soft-card p-6">
          <p className="eyebrow">Fast answers</p>
          <div className="mt-4 grid gap-3">
            {compactFaq.map((item) => (
              <button
                key={item}
                className="rounded-[1.3rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,249,255,0.8))] px-4 py-4 text-left text-sm font-medium text-[var(--ink-700)] shadow-[0_12px_24px_rgba(126,136,170,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(126,136,170,0.12)]"
                type="button"
                onClick={() => sendPrompt(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">What the AI cares about</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Repayment quality",
                body: "How consistently past cashflow came back on time.",
              },
              {
                title: "Payer concentration",
                body: "Whether too much of the pool depends on a few names.",
              },
              {
                title: "Servicing rhythm",
                body: "Whether operator updates are timely and credible.",
              },
              {
                title: "Distribution timing",
                body: "How quickly repayments may become claimable cash.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.3rem] bg-[var(--surface-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--ink-900)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
