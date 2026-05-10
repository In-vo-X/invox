"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  MessageSquareText,
  Radar,
  Sparkles,
  TriangleAlert,
  Waves,
} from "lucide-react";
import {
  assistChecklist,
  assistProfiles,
  assistRecommendations,
  demoPools,
} from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { RiskBadge } from "@/components/ui/risk-badge";

function SignalRing({
  score,
  color,
  label,
}: {
  score: number;
  color: string;
  label: string;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-3 rounded-[1.4rem] bg-white/75 p-4 shadow-[0_14px_30px_rgba(126,136,170,0.08)]">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 90 90" className="h-full w-full -rotate-90">
          <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(116,135,255,0.12)" strokeWidth="10" />
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            className="drop-shadow-[0_6px_14px_rgba(114,135,255,0.18)]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-[var(--ink-900)]">
          {score}
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-500)]">
        {label}
      </p>
    </div>
  );
}

function InsightPill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-3 shadow-[0_10px_22px_rgba(126,136,170,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-500)]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--ink-900)]">{value}</p>
    </div>
  );
}

const insightCards = [
  {
    title: "AI Brief",
    value: "Short-duration pools look healthier when repayment history improves",
    body: "The assistant is currently prioritizing repayment quality, late exposure, and servicing cadence over raw estimated yield.",
    Icon: BrainCircuit,
  },
  {
    title: "Risk Radar",
    value: "Concentration is the hidden driver to watch",
    body: "The largest hidden risk is usually payer concentration, not the headline number shown on the card.",
    Icon: Radar,
  },
  {
    title: "What changed",
    value: "Recent on-chain repayments improve confidence more than static projections",
    body: "When the assistant sees new repayment events, it shifts focus from projected timing assumptions to actual observed cashflow behavior.",
    Icon: Waves,
  },
];

const guidedPrompts = [
  {
    id: "explain",
    label: "Explain this pool in simple terms",
    title: "Plain-language pool summary",
    answer:
      "This pool groups several short-term receivables into one managed structure. You are not selecting a single invoice. You are joining a pool where an operator handles servicing, repayments come back over time, and your claimable distribution depends on those repayments arriving as expected.",
    followups: [
      "Look at repayment rate before estimated yield",
      "Check who the operator is and whether servicing updates are current",
      "Review how concentrated the biggest payers are",
    ],
  },
  {
    id: "yield",
    label: "Why is this yield higher than the others?",
    title: "Why estimated yield differs",
    answer:
      "Higher estimated yield usually means the pool carries more timing uncertainty, concentration risk, weaker repayment history, or more servicing complexity. The assistant should help users understand that higher yield is compensation for extra uncertainty, not a free improvement.",
    followups: [
      "Compare late exposure against the lower-yield pools",
      "Check whether servicing status is Active, Disputed, or Impaired",
      "See if the pool is fully funded or still early in participation",
    ],
  },
  {
    id: "distribution",
    label: "What could delay my distribution?",
    title: "Distribution delay drivers",
    answer:
      "Claimable distributions are delayed when underlying payers repay later than expected, servicing quality weakens, disputes emerge, or the operator has not yet recorded the repayment flow on-chain. The key idea is that cashflow timing matters more than static APR-style presentation.",
    followups: [
      "Watch late exposure and recent repayment events together",
      "Check if the pool is already Repaid or still Advanced",
      "Review the latest servicing update before adding capital",
    ],
  },
  {
    id: "risk",
    label: "What is the biggest hidden risk here?",
    title: "Hidden risk explanation",
    answer:
      "For most users, the biggest hidden risk is not price volatility but operational and cashflow concentration risk: too much exposure to one or two payers, stale servicing updates, or repayment timelines slipping without obvious warning from the headline yield alone.",
    followups: [
      "Check payer concentration and maturity buckets together",
      "Look for repeated delays instead of a single late event",
      "Review whether the operator has a clear servicing rhythm",
    ],
  },
  {
    id: "starter",
    label: "Show me the cleanest pool for a first-time participant",
    title: "First-time participant filter",
    answer:
      "For a first-time participant, the assistant should bias toward shorter duration, stronger repayment history, lower late exposure, and clearer operator/servicing signals. The goal is not maximizing yield first; it is improving clarity and reducing unpleasant surprises in the first cycle.",
    followups: [
      "Prefer stronger repayment history over the highest yield",
      "Avoid impaired servicing pools for a first entry",
      "Use average maturity and late exposure as the first screen",
    ],
  },
  {
    id: "servicing",
    label: "What changed after the latest servicing update?",
    title: "Servicing change interpretation",
    answer:
      "A servicing update matters because it changes how reliable the repayment timeline looks. If servicing improves, confidence in projected distributions can rise. If servicing weakens or turns impaired, the assistant should tell the user to treat timing assumptions and claim expectations more cautiously.",
    followups: [
      "Compare servicing status with repayment event frequency",
      "Treat stale updates as an information risk",
      "Use servicing changes as a reason to revisit participation size",
    ],
  },
];

const faqCards = [
  {
    title: "What exactly am I participating in?",
    body: "You are joining a managed invoice-backed cashflow pool. The operator aggregates receivables, advances funds after participation targets are met, and later repayments drive claimable distributions.",
  },
  {
    title: "Where does the return come from?",
    body: "Returns come from the spread between funding terms and later repayments, after fees, delays, and servicing outcomes are accounted for.",
  },
  {
    title: "When can I get my money back?",
    body: "Your timeline depends on when underlying payers settle and when repayments are reflected in the pool’s claimable distribution flow. Short duration does not mean instant liquidity.",
  },
  {
    title: "What are the biggest real risks?",
    body: "The main risks are delayed payment, payer concentration, servicing quality, disputes, and documentation or legal enforcement issues. Estimated yield is never guaranteed.",
  },
];

const educationGrid = [
  {
    title: "How the cashflow moves",
    body: "Capital enters the pool vault, an authorized operator advances funds after participation targets are met, repayments return over time, and claimable distributions only appear after those cashflows settle.",
  },
  {
    title: "What makes one pool safer than another",
    body: "The strongest pools usually show better repayment history, lower late exposure, broader payer mix, and cleaner operator servicing patterns.",
  },
  {
    title: "What changes after a servicing update",
    body: "A servicing update can improve or weaken confidence in repayment timing. The assistant uses it as a live signal, not just a static label.",
  },
  {
    title: "Why yields differ between pools",
    body: "Higher estimated yield generally reflects more timing uncertainty, concentration risk, or weaker historical repayment quality rather than a free improvement in return.",
  },
];

export default function AiAssistPage() {
  const [activePromptId, setActivePromptId] = useState(guidedPrompts[0].id);

  const activePrompt = useMemo(
    () => guidedPrompts.find((prompt) => prompt.id === activePromptId) ?? guidedPrompts[0],
    [activePromptId],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="glass-panel relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(114,135,255,0.28),transparent_60%)] blur-2xl pulse-glow" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(94,215,198,0.22),transparent_60%)] blur-2xl float-slow" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px shimmer-line" />

          <div className="flex items-center gap-2 text-[var(--brand-700)]">
            <Sparkles className="h-4 w-4" />
            <p className="eyebrow text-[var(--brand-700)]">AI Assist</p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            AI cashflow intelligence for invoice investing
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-600)] sm:text-base">
            Built for people who want invoice investing explained in plain language. AI Assist turns yield, repayment, delay, and operator risk into short signals you can understand quickly.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InsightPill title="AI mode" value="Explain, don’t hype" />
            <InsightPill title="Best for" value="First-time pool participants" />
            <InsightPill title="Main job" value="Translate risk into plain language" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {assistProfiles.map((profile) => (
              <div
                key={profile.label}
                className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(246,248,255,0.82))] p-4 shadow-[0_14px_30px_rgba(126,136,170,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(126,136,170,0.14)]"
              >
                <p className="eyebrow">{profile.label}</p>
                <p className="mt-3 text-lg font-semibold text-[var(--ink-900)]">{profile.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">{profile.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {guidedPrompts.map((chip) => (
              <button
                key={chip.id}
                className={`metric-chip px-4 py-2 text-left text-xs transition hover:-translate-y-0.5 ${
                  activePromptId === chip.id
                    ? "bg-[linear-gradient(135deg,rgba(114,135,255,0.18),rgba(94,215,198,0.16))] text-[var(--ink-900)]"
                    : "bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(242,246,255,0.82))] text-[var(--ink-700)]"
                }`}
                type="button"
                onClick={() => setActivePromptId(chip.id)}
              >
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand-600)]" />
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stat-card stat-card--lavender relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 top-4 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),transparent_60%)] blur-2xl pulse-glow" />
          <p className="eyebrow">Today’s AI view</p>
          <h2 className="mt-8 text-3xl font-semibold">
            Start with the AI summary, not the raw numbers
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SignalRing score={82} color="#7287ff" label="Clarity" />
            <SignalRing score={61} color="#58ddd0" label="Timing Risk" />
            <SignalRing score={34} color="#ff8e7e" label="Delay Pressure" />
          </div>
          <div className="mt-5 space-y-3">
            {insightCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.4rem] bg-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(126,136,170,0.12)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                    <item.Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink-900)]">{item.title}</p>
                    <p className="mt-1 text-base font-semibold text-[var(--ink-900)]">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="soft-card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(114,135,255,0.16),transparent_60%)] blur-2xl pulse-glow" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--brand-700)]">
              <MessageSquareText className="h-4 w-4" />
              <p className="eyebrow text-[var(--brand-700)]">AI readout</p>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              {activePrompt.title}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[var(--ink-500)]">
            This answer is framed to help users interpret invoice investing more clearly, not to offer a direct investment recommendation.
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,249,255,0.86))] p-6 shadow-[0_18px_40px_rgba(126,136,170,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(126,136,170,0.14)]">
            <div className="flex items-center gap-2 text-[var(--brand-700)]">
              <BrainCircuit className="h-4 w-4" />
              <p className="eyebrow text-[var(--brand-700)]">AI explanation</p>
            </div>
            <p className="mt-4 text-base leading-8 text-[var(--ink-700)]">
              {activePrompt.answer}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-soft)] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(126,136,170,0.12)]">
            <div className="flex items-center gap-2 text-[var(--coral-600)]">
              <TriangleAlert className="h-4 w-4" />
              <p className="eyebrow text-[var(--coral-600)]">What to check next</p>
            </div>
            <div className="mt-4 space-y-3">
              {activePrompt.followups.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.3rem] bg-white/80 px-4 py-4 text-sm leading-6 text-[var(--ink-700)] shadow-[0_12px_28px_rgba(126,136,170,0.06)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="soft-card p-6">
        <div>
          <p className="eyebrow">What people actually ask</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            The questions users ask before they trust invoice investing
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-500)]">
            The most important insight from other investment AI products is simple: people usually want clarity, not hype. They want to know what changed, why it matters, and what they should review next.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {faqCards.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.4rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,249,255,0.78))] p-5 shadow-[0_14px_30px_rgba(126,136,170,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(126,136,170,0.12)]"
            >
              <p className="text-base font-semibold text-[var(--ink-900)]">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="soft-card p-6">
          <p className="eyebrow">How AI prioritizes information</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            The details that actually change an invoice-pool decision
          </h2>
          <div className="mt-5 grid gap-4">
            {educationGrid.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,248,255,0.76))] p-4 shadow-[0_12px_28px_rgba(126,136,170,0.06)]"
              >
                <p className="text-sm font-semibold text-[var(--ink-900)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">Before you join</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            A simple checklist the AI wants you to review first
          </h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--ink-500)]">
            {[
              "Who is the pool operator and what is their servicing role?",
              "How concentrated is the pool around a few large payers?",
              "What is the historical on-time repayment rate?",
              "How much late exposure is already visible?",
              "How long could my funds realistically stay tied up?",
              "What events need to happen before claimable distributions appear?",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.35rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,249,255,0.78))] px-4 py-4 text-[var(--ink-700)] shadow-[0_12px_28px_rgba(126,136,170,0.06)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="soft-card p-6">
          <p className="eyebrow">What InvoX is</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Invoice investing, made more understandable
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--ink-500)]">
            <p>
              InvoX turns short-duration invoice and receivable participation into a more legible product surface. The assistant is here to reduce confusion around funding, repayment timing, servicing quality, and claimable distributions.
            </p>
            <p>
              Good investment AI in this category should help users understand what changed, what the biggest risk is, and what to review next. It should not pretend uncertainty is gone.
            </p>
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">Suggested prompts</p>
          <div className="mt-4 grid gap-3">
            {guidedPrompts.map((question) => (
              <button
                key={question.id}
                className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 text-left text-sm font-medium text-[var(--ink-700)] transition hover:-translate-y-0.5"
                type="button"
                onClick={() => setActivePromptId(question.id)}
              >
                {question.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
