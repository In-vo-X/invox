import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPools } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";

export default function MarketplacePage() {
  const featuredPools = demoPools.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <KpiCard
          eyebrow="Active Financing Volume"
          value="$38.0M"
          note="Currently deployed across active receivable pools"
          accent="linear-gradient(180deg,#7287ff,#5f72dd)"
          chart={[45, 32, 40, 72, 54]}
        />
        <KpiCard
          eyebrow="Total Repaid"
          value="$12.4M"
          note="Cumulative repayments tracked on-chain"
          accent="linear-gradient(180deg,#5ed7c6,#37bfae)"
          chart={[28, 34, 51, 68, 82]}
        />
        <KpiCard
          eyebrow="On-Time Repayment Rate"
          value="97.2%"
          note="Historical repayments completed by due date"
          accent="linear-gradient(180deg,#ff9b87,#ff7f6e)"
          chart={[22, 46, 58, 60, 74]}
        />
      </section>

      <section className="soft-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Pool Marketplace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Browse verified receivable pools
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-500)]">
              Explore verified short-duration receivable pools by estimated yield, duration, funding progress, and repayment quality.
            </p>
          </div>
          <Link className="btn-primary" href="/marketplace/more">
            More
          </Link>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {featuredPools.map((pool) => (
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
                <span className="metric-chip">Avg. {pool.avgMaturityDays}d</span>
                <span className="metric-chip">{pool.receivablesCount} receivables</span>
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
                  <p className="eyebrow">Est. Annualized Yield</p>
                  <p className="mt-2 text-xl font-semibold">
                    {pool.annualizedYieldPct.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="eyebrow">On-Time Repayment</p>
                  <p className="mt-2 text-xl font-semibold">{pool.onTimeRepaymentRate}%</p>
                </div>
                <div>
                  <p className="eyebrow">Late Exposure</p>
                  <p className="mt-2 text-xl font-semibold">{pool.lateExposurePercent}%</p>
                </div>
              </div>
              <div className="mt-6 rounded-[1.25rem] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between text-sm font-medium text-[var(--ink-600)]">
                  <span>Funding progress</span>
                  <span>{pool.fundedPct}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
                    style={{ width: `${pool.fundedPct}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--ink-500)]">
                  {pool.receivablesCount} verified receivables · Late exposure {pool.lateExposurePercent}% · {pool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
