import Link from "next/link";
import { RiskBadge } from "@/components/ui/risk-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPools } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getRegisteredPools } from "@/lib/registered-pools";

export default async function MarketplaceMorePage() {
  const registeredPools = await getRegisteredPools();
  const activePools = [...demoPools, ...registeredPools].filter(
    (pool) => pool.status === "Funding" && pool.fundedPct < 100,
  );

  const maxParticipationVolume = Math.max(
    ...activePools.map((pool) => pool.fundedAmount),
    1,
  );

  const rankedPools = [...activePools]
    .sort((left, right) => right.fundedAmount - left.fundedAmount)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="soft-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Pool Marketplace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Pool discovery board
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-500)]">
              Browse verified invoice investment pools by estimated yield, duration, repayment history, and risk profile.
            </p>
          </div>
          <Link className="btn-secondary" href="/marketplace">
            Back to marketplace
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          <section className="rounded-[1.6rem] bg-[linear-gradient(160deg,rgba(244,247,255,0.96),rgba(255,247,236,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Top 3 most participated pools</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  Most selected invoice investment pools
                </h3>
              </div>
              <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[var(--ink-500)] shadow-[0_12px_24px_rgba(126,136,170,0.08)]">
                Live participation ranking
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {rankedPools.map((pool, index) => (
                <Link
                  key={pool.id}
                  href={`/pools/${pool.id}`}
                  className={`relative overflow-hidden h-full rounded-[1.7rem] border p-5 transition hover:-translate-y-1 ${
                    index === 0
                      ? "border-[rgba(255,214,120,0.55)] bg-[linear-gradient(180deg,rgba(255,252,242,0.96),rgba(255,245,223,0.92))] shadow-[0_24px_54px_rgba(215,176,83,0.18)]"
                      : index === 1
                        ? "border-[rgba(196,205,230,0.7)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,255,0.88))] shadow-[0_22px_48px_rgba(126,136,170,0.12)]"
                        : "border-[rgba(240,197,148,0.55)] bg-[linear-gradient(180deg,rgba(255,249,241,0.94),rgba(252,239,226,0.9))] shadow-[0_22px_48px_rgba(190,142,99,0.12)]"
                  }`}
                >
                  <div className="pointer-events-none absolute inset-x-10 top-0 h-px shimmer-line" />
                  <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl ${
                    index === 0
                      ? "bg-[radial-gradient(circle,rgba(255,208,107,0.36),transparent_60%)]"
                      : index === 1
                        ? "bg-[radial-gradient(circle,rgba(149,171,255,0.26),transparent_60%)]"
                        : "bg-[radial-gradient(circle,rgba(255,154,126,0.22),transparent_60%)]"
                  }`} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold ${
                        index === 0
                          ? "bg-[rgba(255,215,120,0.28)] text-[rgba(154,107,18,1)]"
                          : index === 1
                            ? "bg-[rgba(149,171,255,0.18)] text-[var(--brand-600)]"
                            : "bg-[rgba(255,154,126,0.18)] text-[rgba(201,102,70,1)]"
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink-900)]">
                          {pool.name}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ink-500)]">
                          {pool.category} · Key payers {pool.keyDebtorsLabel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="eyebrow">Participation Volume</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {formatCurrency(pool.fundedAmount)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ink-500)]">
                        {pool.fundedPct}% of target funded
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[1.3rem] bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <div className="flex items-center justify-between text-sm text-[var(--ink-600)]">
                      <span>Popularity score</span>
                        <span className="font-semibold text-[var(--ink-900)]">
                          {Math.round((pool.fundedAmount / maxParticipationVolume) * 100)}
                        </span>
                      </div>
                      <div className="mt-3 h-2.5 rounded-full bg-white/85">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
                        style={{ width: `${Math.min(100, Math.round((pool.fundedAmount / maxParticipationVolume) * 100))}%` }}
                        />
                      </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <RiskBadge grade={pool.riskGrade} />
                    <StatusBadge status={pool.status} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <div className="flex items-end justify-between gap-4 px-2 pb-4">
              <div>
                <p className="eyebrow">Additional invoice investment pools</p>
              </div>
              <p className="text-sm text-[var(--ink-500)]">
                {activePools.length} pools
              </p>
            </div>

            <div className="max-h-[58rem] overflow-y-auto pr-2">
              <div className="grid gap-4 lg:grid-cols-3">
                {activePools.map((pool) => (
                  <Link
                    key={pool.id}
                    href={`/pools/${pool.id}`}
                    className="soft-card p-5 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink-900)]">
                          {pool.name}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ink-500)]">
                          {pool.category} · Operator {pool.operatorName}
                        </p>
                      </div>
                      <StatusBadge status={pool.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <RiskBadge grade={pool.riskGrade} />
                        <span className="metric-chip">{pool.avgMaturityDays}d avg</span>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="eyebrow">Pool Face Value</p>
                        <p className="mt-2 text-xl font-semibold">
                          {formatCurrency(pool.invoiceValue)}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Funding Target</p>
                        <p className="mt-2 text-xl font-semibold">
                          {formatCurrency(pool.advanceAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">On-Time Repayment</p>
                        <p className="mt-2 text-xl font-semibold">
                          {pool.onTimeRepaymentRate}%
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Late Exposure</p>
                        <p className="mt-2 text-xl font-semibold">
                          {pool.lateExposurePercent}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 rounded-[1.25rem] bg-[var(--surface-soft)] p-4">
                      <div className="flex items-center justify-between text-sm font-medium text-[var(--ink-600)]">
                        <span>Funding Progress</span>
                        <span>{pool.fundedPct}%</span>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
                          style={{ width: `${pool.fundedPct}%` }}
                        />
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[var(--ink-500)]">
                        {pool.receivablesCount} receivables · Estimated yield {formatPercent(pool.annualizedYieldPct)} · {pool.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
