import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPools, portfolioRows } from "@/lib/mock-data";

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
  const weightedYield =
    totalInvested > 0
      ? positions.reduce(
          (sum, position) =>
            sum + position.invested * position.pool.annualizedYieldPct,
          0,
        ) / totalInvested
      : 0;

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
          eyebrow="Claimable now"
          value={formatCurrency(totalClaimable)}
          note="Available to withdraw from repaid positions"
          accent="linear-gradient(180deg,#57d5c6,#2fa79a)"
          chart={[10, 16, 18, 24, 31]}
        />
        <KpiCard
          eyebrow="Blended annualized yield"
          value={`${weightedYield.toFixed(1)}%`}
          note="Weighted by invested capital across active positions"
          accent="linear-gradient(180deg,#ff8d7c,#ff715c)"
          chart={[25, 34, 30, 39, 47]}
        />
      </section>

      <section className="soft-card p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Investor positions
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-500)]">
              A cleaner view of your deployed capital, active invoice exposure,
              and cashflows ready to claim.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--ink-500)]">
            <span className="metric-chip">
              {positions.length} live positions
            </span>
            <span className="metric-chip">
              {formatCurrency(totalClaimed)} realized
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
                        {position.pool.issuer}
                      </p>
                      <StatusBadge status={position.status} />
                    </div>
                    <p className="mt-2 text-sm text-[var(--ink-500)]">
                      Originator {position.pool.originator} · Debtor{" "}
                      {position.pool.debtor}
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
                      <p className="eyebrow">Invested</p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(position.invested)}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow">Claimable</p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(position.claimable)}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow">Claimed</p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatCurrency(position.claimed)}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow">Annualized</p>
                      <p className="mt-2 text-xl font-semibold">
                        {position.pool.annualizedYieldPct.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.35rem] bg-[var(--surface-soft)] p-4">
                  <div className="flex items-center justify-between text-sm font-medium text-[var(--ink-600)]">
                    <span>Funding progress</span>
                    <span>{position.pool.fundedPct}%</span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
                      style={{ width: `${position.pool.fundedPct}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] bg-[linear-gradient(160deg,rgba(244,247,255,0.96),rgba(255,247,236,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="eyebrow">Portfolio breakdown</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Capital allocation by invoice
              </h2>
              <div className="mt-5 space-y-3">
                {positions.map((position) => {
                  const weight = totalInvested
                    ? (position.invested / totalInvested) * 100
                    : 0;

                  return (
                    <div
                      key={position.pool.id}
                      className="rounded-[1.3rem] bg-white/84 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--ink-900)]">
                          {position.pool.issuer}
                        </p>
                        <p className="text-sm text-[var(--ink-500)]">
                          {weight.toFixed(0)}%
                        </p>
                      </div>
                      <div className="mt-3 h-2.5 rounded-full bg-[rgba(116,135,255,0.12)]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
                          style={{ width: `${weight}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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
                    Active positions
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

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--surface-soft)] text-[var(--ink-500)]">
              <tr>
                {[
                  "Position",
                  "Invested",
                  "Claimable",
                  "Claimed",
                  "Yield",
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
                    {position.pool.issuer}
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
                    {position.pool.annualizedYieldPct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={position.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
