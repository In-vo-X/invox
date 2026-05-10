import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPools, portfolioRows } from "@/lib/mock-data";

function DonutChart({
  slices,
}: {
  slices: Array<{ label: string; value: number; color: string }>;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-64 w-64">
        <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.96),rgba(245,248,255,0.82))] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_20px_40px_rgba(126,136,170,0.14)]" />
        <svg viewBox="0 0 140 140" className="relative h-full w-full -rotate-90 drop-shadow-[0_12px_24px_rgba(114,135,255,0.18)]">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(116,135,255,0.12)" strokeWidth="18" />
          {slices.map((slice) => {
            const dash = (slice.value / 100) * circumference;
            const offset = circumference - (cumulative / 100) * circumference;
            cumulative += slice.value;
            return (
              <circle
                key={slice.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-500)]">Exposure</p>
          <p className="mt-1 text-4xl font-semibold text-[var(--ink-900)]">100%</p>
        </div>
      </div>
      <div className="grid w-full gap-3 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(247,249,255,0.66))] p-4 shadow-[0_14px_30px_rgba(126,136,170,0.08)]">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[var(--ink-600)]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              <span>{slice.label}</span>
            </div>
            <span className="font-semibold text-[var(--ink-900)]">{slice.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const positions = portfolioRows
    .map((row) => {
      const pool = demoPools.find((entry) => entry.issuer === row.pool);

      if (!pool) {
        return null;
      }

      return {
        ...row,
        pool,
      };
    })
    .filter((position) => position !== null);

  const totalInvested = positions.reduce(
    (sum, position) => sum + position.invested,
    0,
  );
  const totalClaimable = positions.reduce(
    (sum, position) => sum + position.claimable,
    0,
  );
  const totalClaimed = positions.reduce(
    (sum, position) => sum + position.claimed,
    0,
  );
  const totalRepaid = positions.reduce(
    (sum, position) => sum + position.pool.repaidAmount,
    0,
  );
  const weightedDuration =
    totalInvested > 0
      ? positions.reduce(
          (sum, position) => sum + position.invested * position.pool.avgMaturityDays,
          0,
        ) / totalInvested
      : 0;
  const weightedLateExposure =
    totalInvested > 0
      ? positions.reduce(
          (sum, position) => sum + position.invested * position.pool.lateExposurePercent,
          0,
        ) / totalInvested
      : 0;
  const weightedYield =
    totalInvested > 0
      ? positions.reduce(
          (sum, position) =>
            sum + position.invested * position.pool.annualizedYieldPct,
          0,
        ) / totalInvested
      : 0;

  const getRepaymentStatusLabel = (position: (typeof positions)[number]) => {
    const repaidPct = position.pool.repaidAmount
      ? Math.min(100, Math.round((position.pool.repaidAmount / position.pool.advanceAmount) * 100))
      : 0;

    if (repaidPct >= 100) return "상환완료";
    if (repaidPct > 0) return "진행중";
    return "대기중";
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <KpiCard
          eyebrow="Net portfolio value"
          value={formatCurrency(totalInvested + totalClaimable)}
          note="Principal plus currently claimable cashflows"
          accent="linear-gradient(180deg,#7287ff,#5f72dd)"
          chart={[42, 48, 55, 61, 66]}
        />
        <KpiCard
          eyebrow="Claimable Now"
          value={formatCurrency(totalClaimable)}
          note="Available to withdraw from repaid positions"
          accent="linear-gradient(180deg,#57d5c6,#2fa79a)"
          chart={[10, 16, 18, 24, 31]}
        />
        <KpiCard
          eyebrow="Blended Estimated Yield"
          value={`${weightedYield.toFixed(1)}%`}
          note="Weighted by participated capital across active pool positions"
          accent="linear-gradient(180deg,#ff8d7c,#ff715c)"
          chart={[25, 34, 30, 39, 47]}
        />
        <KpiCard
          eyebrow="Total Repaid"
          value={formatCurrency(totalRepaid)}
          note="Cumulative repayments attributed to your pool positions"
          accent="linear-gradient(180deg,#5ed7c6,#37bfae)"
          chart={[18, 23, 29, 37, 45]}
        />
        <KpiCard
          eyebrow="Weighted Avg. Duration"
          value={`${weightedDuration.toFixed(0)}d`}
          note="Average maturity weighted by your participated amount"
          accent="linear-gradient(180deg,#7287ff,#5f72dd)"
          chart={[40, 36, 31, 28, 22]}
        />
        <KpiCard
          eyebrow="Late Exposure"
          value={`${weightedLateExposure.toFixed(1)}%`}
          note="Weighted exposure to delayed receivables across your pools"
          accent="linear-gradient(180deg,#ff9b87,#ff7f6e)"
          chart={[8, 10, 12, 14, 16]}
        />
      </section>

      <section className="soft-card p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Pool positions
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-500)]">
              A cleaner view of your deployed capital, active invoice investment exposure, and claimable distributions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--ink-500)]">
            <span className="metric-chip">보유 중인 풀 {positions.length}개</span>
            <span className="metric-chip">
              실현 금액 {formatCurrency(totalClaimed)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4">
            {positions.map((position) => (
              <Link
                key={position.pool.id}
                href={`/pools/${position.pool.id}`}
                className="rounded-[1.6rem] border border-[var(--line)] bg-white/86 p-5 shadow-[0_14px_34px_rgba(127,139,176,0.08)] transition hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-[var(--ink-900)]">
                {position.pool.name}
                      </p>
                      <StatusBadge status={position.status} />
                    </div>
                    <p className="mt-2 text-sm text-[var(--ink-500)]">
                      Operator {position.pool.operatorName} · Key payers {position.pool.keyDebtorsLabel}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <RiskBadge grade={position.pool.riskGrade} />
                      <span className="metric-chip">
                        {position.pool.dueLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm lg:min-w-[19rem]">
                    <div>
                        <p className="eyebrow">Amount Participated</p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(position.invested)}
                      </p>
                    </div>
                    <div>
                        <p className="eyebrow">Claimable Now</p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(position.claimable)}
                      </p>
                    </div>
                    <div>
                        <p className="eyebrow">Total Claimed</p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(position.claimed)}
                      </p>
                    </div>
                    <div>
                        <p className="eyebrow">Portfolio Weight</p>
                        <p className="mt-2 text-xl font-semibold">
                          {totalInvested ? `${((position.invested / totalInvested) * 100).toFixed(1)}%` : "0%"}
                        </p>
                      </div>
                    </div>
                </div>

                <div className="mt-5 rounded-[1.35rem] bg-[var(--surface-soft)] p-4">
                  <div className="flex items-center justify-between text-sm font-medium text-[var(--ink-600)]">
                    <span>Repayment progress</span>
                    <span>{position.pool.repaidAmount ? Math.min(100, Math.round((position.pool.repaidAmount / position.pool.advanceAmount) * 100)) : 0}% · {getRepaymentStatusLabel(position)}</span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
                      style={{ width: `${position.pool.repaidAmount ? Math.min(100, Math.round((position.pool.repaidAmount / position.pool.advanceAmount) * 100)) : 0}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.18em] text-[var(--ink-400)] sm:grid-cols-3">
                    <span>Invested</span>
                    <span>{position.status === "Advanced" || position.status === "PartiallyRepaid" || position.status === "Repaid" ? "Advanced to originator" : "Funding"}</span>
                    <span>{position.claimable > 0 ? "청구 가능" : "추적 중"}</span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--ink-500)]">다음 지급 예정: {position.claimable > 0 ? "지금 신청 가능" : position.pool.nextDistributionLabel}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] bg-[linear-gradient(160deg,rgba(244,247,255,0.96),rgba(255,247,236,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="eyebrow">Portfolio breakdown</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Capital allocation by pool
              </h2>
              <div className="mt-5">
                <DonutChart
                  slices={positions.map((position, index) => ({
                    label: position.pool.name,
                    value: Number(
                      (
                        totalInvested
                          ? (position.invested / totalInvested) * 100
                          : 0
                      ).toFixed(0),
                    ),
                    color: ["#7287ff", "#5ed7c6", "#ff8e7e", "#c59bff", "#9cc3ff"][index % 5],
                  }))}
                />
              </div>
            </div>

            <div className="soft-card p-5">
              <p className="eyebrow">Cashflow status</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--ink-500)]">
                    Ready to claim
                  </span>
                  <span className="text-base font-semibold text-[var(--ink-900)]">
                    {formatCurrency(totalClaimable)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--ink-500)]">
                    Already claimed
                  </span>
                  <span className="text-base font-semibold text-[var(--ink-900)]">
                    {formatCurrency(totalClaimed)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--ink-500)]">
                    Active pools
                  </span>
                  <span className="text-base font-semibold text-[var(--ink-900)]">
                    {
                      positions.filter((position) =>
                        ["Funding", "Advanced", "Funded"].includes(
                          position.status,
                        ),
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="eyebrow">History</p>
          <div className="mt-3 overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--surface-soft)] text-[var(--ink-500)]">
              <tr>
                {[
                  "Pool",
                  "Participated",
                  "Claimable",
                  "Claimed",
                  "Next Distribution",
                  "Status",
                ].map((cell) => (
                  <th key={cell} className="px-4 py-4 font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr
                  key={position.pool.id}
                  className="border-t border-[var(--line)] bg-white/80"
                >
                  <td className="px-4 py-4 font-semibold">
                    {position.pool.name}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(position.invested)}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(position.claimable)}
                  </td>
                  <td className="px-4 py-4">
                    {formatCurrency(position.claimed)}
                  </td>
                  <td className="px-4 py-4">
                    {position.pool.nextDistributionLabel}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={position.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </div>
  );
}
