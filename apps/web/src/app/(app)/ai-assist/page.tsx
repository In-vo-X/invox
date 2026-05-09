import Link from "next/link";
import {
  assistChecklist,
  assistProfiles,
  assistRecommendations,
  demoPools,
} from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { RiskBadge } from "@/components/ui/risk-badge";

export default function AiAssistPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="soft-card p-6">
          <p className="eyebrow">AI Assist</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Cashflow and risk explanation assistant
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-500)]">
            InvoX helps users evaluate verified receivable pools without assuming they already understand private credit, servicing, or payer concentration risk. This view explains what matters first, what changed recently, and what to review before participating. This is not financial advice.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {assistProfiles.map((profile) => (
              <div
                key={profile.label}
                className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4"
              >
                <p className="eyebrow">{profile.label}</p>
                <p className="mt-3 text-lg font-semibold text-[var(--ink-900)]">
                  {profile.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
                  {profile.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card stat-card--lavender">
          <p className="eyebrow">How to use this tab</p>
          <h2 className="mt-8 text-3xl font-semibold">
            Learn the filters before participating in a pool
          </h2>
          <div className="mt-6 space-y-3">
            {assistChecklist.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[1.4rem] bg-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              >
                <p className="text-sm font-semibold text-[var(--ink-900)]">
                  {index + 1}. {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="soft-card p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Pool explanations</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              How AI Assist would frame this pool set
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[var(--ink-500)]">
            These are not guarantees or direct recommendations. They are onboarding-oriented explanations that help newer users focus on repayment quality, late exposure, and servicing strength first.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {assistRecommendations.map((recommendation) => {
            const pool = demoPools.find(
              (entry) => entry.id === recommendation.poolId,
            );

            if (!pool) {
              return null;
            }

            return (
              <div
                key={recommendation.title}
                className="rounded-[1.6rem] border border-[var(--line)] bg-white/82 p-5 shadow-[0_16px_40px_rgba(127,139,176,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink-900)]">
                      {recommendation.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-500)]">
                      {recommendation.fit}
                    </p>
                  </div>
                  <span className="metric-chip">
                    {recommendation.confidence}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow">Pool Operator</p>
                    <p className="mt-2 text-base font-semibold">
                      {pool.originator}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Key Payers</p>
                    <p className="mt-2 text-base font-semibold">
                      {pool.keyDebtorsLabel}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Funding Target</p>
                    <p className="mt-2 text-base font-semibold">
                      {formatCurrency(pool.advanceAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Estimated Yield</p>
                    <p className="mt-2 text-base font-semibold">
                      {formatPercent(pool.grossYieldPct)}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Duration</p>
                    <p className="mt-2 text-base font-semibold">
                      {pool.dueLabel}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Risk grade</p>
                    <div className="mt-2">
                      <RiskBadge grade={pool.riskGrade} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
                  <p className="text-sm font-semibold text-[var(--ink-900)]">
                    What this pool means
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
                    {recommendation.why}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[var(--ink-900)]">
                    Main factor to watch
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
                    {recommendation.watchouts}
                  </p>
                </div>

                <Link
                  href={`/pools/${pool.id}`}
                  className="btn-primary mt-5 inline-flex"
                >
                  Explain this pool
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="soft-card p-6">
            <p className="eyebrow">What InvoX is</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Pool-based receivable finance built for approved participants
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--ink-500)]">
            <p>
              Unlike public stocks or ETFs, these opportunities depend on underlying payer repayment, servicing quality, legal documentation, and the operator’s ability to advance and collect short-duration receivables.
            </p>
            <p>
              That means users should avoid treating the highest estimated yield as the best pool. It is usually safer to start with shorter duration, stronger repayment history, lower late exposure, and cleaner servicing updates.
            </p>
          </div>
        </div>

        <div className="soft-card p-6">
            <p className="eyebrow">Suggested prompts</p>
          <div className="mt-4 grid gap-3">
            {[
              "Explain this pool in simple terms",
              "What are the main risks?",
              "When could I receive repayments?",
              "Why is the yield different from other pools?",
              "What does late exposure mean?",
            ].map((question) => (
              <div
                key={question}
                className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 text-sm font-medium text-[var(--ink-700)]"
              >
                {question}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
