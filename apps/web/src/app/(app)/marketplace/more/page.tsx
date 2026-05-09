import Link from "next/link";
import { RiskBadge } from "@/components/ui/risk-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPools } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";

export default function MarketplaceMorePage() {
  const rankedPools = [...demoPools]
    .sort((left, right) => right.annualizedYieldPct - left.annualizedYieldPct)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="soft-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Marketplace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Invoice discovery board
            </h2>
          </div>
          <Link className="btn-secondary" href="/marketplace">
            Back to marketplace
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          <section className="rounded-[1.6rem] bg-[linear-gradient(160deg,rgba(244,247,255,0.96),rgba(255,247,236,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Top 3 yield leaderboard</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  Highest annualized invoice opportunities
                </h3>
              </div>
              <p className="text-sm text-[var(--ink-500)]">
                Updated from demo invoices
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {rankedPools.map((pool, index) => (
                <Link
                  key={pool.id}
                  href={`/pools/${pool.id}`}
                  className="soft-card h-full p-5 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-sm font-semibold text-[var(--brand-600)]">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink-900)]">
                          {pool.issuer}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ink-500)]">
                          Debtor · {pool.debtor}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="eyebrow">Annualized</p>
                      <p className="mt-2 text-xl font-semibold">
                        {formatPercent(pool.annualizedYieldPct)}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ink-500)]">
                        Gross {formatPercent(pool.grossYieldPct)}
                      </p>
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
                <p className="eyebrow">Additional invoices</p>
              </div>
              <p className="text-sm text-[var(--ink-500)]">
                {demoPools.length} invoices
              </p>
            </div>

            <div className="max-h-[58rem] overflow-y-auto pr-2">
              <div className="grid gap-4 lg:grid-cols-3">
                {demoPools.map((pool) => (
                  <Link
                    key={pool.id}
                    href={`/pools/${pool.id}`}
                    className="soft-card p-5 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink-900)]">
                          {pool.originator}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ink-500)]">
                          SPV · {pool.spv}
                        </p>
                      </div>
                      <StatusBadge status={pool.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <RiskBadge grade={pool.riskGrade} />
                      <span className="metric-chip">{pool.dueLabel}</span>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="eyebrow">Invoice value</p>
                        <p className="mt-2 text-xl font-semibold">
                          {formatCurrency(pool.invoiceValue)}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Advance target</p>
                        <p className="mt-2 text-xl font-semibold">
                          {formatCurrency(pool.advanceAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Servicing</p>
                        <p className="mt-2 text-xl font-semibold">
                          {pool.servicingStatus}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Annualized</p>
                        <p className="mt-2 text-xl font-semibold">
                          {formatPercent(pool.annualizedYieldPct)}
                        </p>
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
                        {pool.description} Legal hash{" "}
                        {pool.legalAssetHash.slice(0, 10)}… backs the off-chain
                        evidence bundle.
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
