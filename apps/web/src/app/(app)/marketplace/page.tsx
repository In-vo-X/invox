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
          eyebrow="Total RWA TVL"
          value="$38,050"
          note={`Across ${featuredPools.length} featured invoice pools`}
          accent="linear-gradient(180deg,#7287ff,#5f72dd)"
          chart={[45, 32, 40, 72, 54]}
        />
        <KpiCard
          eyebrow="Upcoming payouts"
          value="$10,499"
          note="Net investor distributions expected"
          accent="linear-gradient(180deg,#5ed7c6,#37bfae)"
          chart={[28, 34, 51, 68, 82]}
        />
        <KpiCard
          eyebrow="Originator score"
          value="92 / 100"
          note="Average diligence profile"
          accent="linear-gradient(180deg,#ff9b87,#ff7f6e)"
          chart={[22, 46, 58, 60, 74]}
        />
      </section>

      <section className="soft-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Marketplace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Invoice cashflow opportunities
            </h2>
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
                    {pool.originator}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-500)]">
                    SPV · {pool.spv}
                  </p>
                </div>
                <StatusBadge status={pool.status} />
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
                  <p className="eyebrow">Risk</p>
                  <div className="mt-2">
                    <RiskBadge grade={pool.riskGrade} />
                  </div>
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
      </section>
    </div>
  );
}
