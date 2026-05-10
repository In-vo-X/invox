import { notFound } from "next/navigation";
import { InvestPanel } from "@/components/pools/invest-panel";
import { RiskBadge } from "@/components/ui/risk-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPools } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getRegisteredPools } from "@/lib/registered-pools";

export default async function PoolDetailPage(
  props: PageProps<"/pools/[poolId]">,
) {
  const { poolId } = await props.params;
  const registeredPools = await getRegisteredPools();
  const pool = [...demoPools, ...registeredPools].find((entry) => entry.id === poolId);

  if (!pool) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="soft-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Invoice Investment Pool</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {pool.name}
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-500)]">
                {pool.category} · Operator {pool.operatorName}
              </p>
            </div>
            <StatusBadge status={pool.status} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Pool Face Value</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(pool.invoiceValue)}
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Funding target</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(pool.advanceAmount)}
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Estimated Yield</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatPercent(pool.grossYieldPct)}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-500)]">
                Annualized {formatPercent(pool.annualizedYieldPct)}
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Avg. Days to Maturity</p>
              <p className="mt-2 text-2xl font-semibold">{pool.avgMaturityDays}d</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">On-Time Repayment Rate</p>
              <p className="mt-2 text-2xl font-semibold">{pool.onTimeRepaymentRate}%</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Late Exposure</p>
              <p className="mt-2 text-2xl font-semibold">{pool.lateExposurePercent}%</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Risk Grade</p>
              <div className="mt-3">
                <RiskBadge grade={pool.riskGrade} />
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-[var(--ink-500)]">
            {pool.description}
          </p>
          <div className="mt-6 grid gap-3 rounded-[1.5rem] bg-[var(--surface-soft)] p-4 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Pool Operator</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-700)]">
                {pool.operatorName}
              </p>
            </div>
            <div>
              <p className="eyebrow">Key Payers</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-700)]">
                {pool.keyDebtorsLabel}
              </p>
            </div>
            <div>
              <p className="eyebrow">Servicing</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-700)]">
                {pool.servicingStatus} · {pool.servicingUpdated}
              </p>
            </div>
            <div>
              <p className="eyebrow">Invoices in Pool</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-700)]">
                {pool.receivablesCount}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="eyebrow">Legal asset hash</p>
              <p className="mt-2 break-all text-sm font-semibold text-[var(--ink-700)]">
                {pool.legalAssetHash.slice(0, 18)}…
              </p>
            </div>
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">Pool composition</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.35rem] bg-[var(--surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--ink-900)]">Industry mix</p>
              <div className="mt-3 space-y-2 text-sm text-[var(--ink-500)]">
                {pool.composition.industryMix.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.35rem] bg-[var(--surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--ink-900)]">Payer concentration</p>
              <div className="mt-3 space-y-2 text-sm text-[var(--ink-500)]">
                {pool.composition.payerConcentration.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.35rem] bg-[var(--surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--ink-900)]">Maturity buckets</p>
              <div className="mt-3 space-y-2 text-sm text-[var(--ink-500)]">
                {pool.composition.maturityBuckets.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">Repayment timeline</p>
          <div className="mt-5 space-y-3">
            {pool.repaymentEvents.map((event) => (
              <div key={`${event.date}-${event.txSignature}`} className="rounded-[1.35rem] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink-900)]">{event.type}</p>
                    <p className="mt-1 text-sm text-[var(--ink-500)]">{event.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--ink-900)]">{formatCurrency(event.amount)}</p>
                    <p className="mt-1 text-xs text-[var(--ink-500)]">{event.txSignature}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">Risk & Disclosures</p>
          <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--ink-500)]">
            <p>
              Estimated yield is not guaranteed. Repayments depend on underlying payer performance, servicing quality, and collection outcomes.
            </p>
            <p>
              Late payments may reduce or delay claimable distributions, and participation may be restricted by eligibility, jurisdiction, and pool-specific rules.
            </p>
            <div className="rounded-[1.35rem] bg-[var(--surface-soft)] p-4">
              {pool.disclosures.map((item) => (
                <p key={item} className="text-sm text-[var(--ink-600)]">
                  • {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <InvestPanel
          poolId={pool.id}
          fundedPct={pool.fundedPct}
          dueLabel={pool.dueLabel}
          advanceAmount={pool.advanceAmount}
          status={pool.status}
          riskGrade={pool.riskGrade}
          servicingStatus={pool.servicingStatus}
        />
      </section>
    </div>
  );
}
