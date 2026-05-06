import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/ui/risk-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { demoPools } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/format";

export default async function PoolDetailPage(
  props: PageProps<"/pools/[poolId]">,
) {
  const { poolId } = await props.params;
  const pool = demoPools.find((entry) => entry.id === poolId);

  if (!pool) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="soft-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Pool detail</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {pool.originator}
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-500)]">
                SPV · {pool.spv}
              </p>
            </div>
            <StatusBadge status={pool.status} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Invoice value</p>
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
              <p className="eyebrow">Gross yield</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatPercent(pool.grossYieldPct)}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-500)]">
                Annualized {formatPercent(pool.annualizedYieldPct)}
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
              <p className="eyebrow">Risk grade</p>
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
              <p className="eyebrow">Issuer</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-700)]">
                {pool.issuer}
              </p>
            </div>
            <div>
              <p className="eyebrow">Debtor</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-700)]">
                {pool.debtor}
              </p>
            </div>
            <div>
              <p className="eyebrow">Servicing</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-700)]">
                {pool.servicingStatus} · {pool.servicingUpdated}
              </p>
            </div>
            <div>
              <p className="eyebrow">Legal asset hash</p>
              <p className="mt-2 break-all text-sm font-semibold text-[var(--ink-700)]">
                {pool.legalAssetHash.slice(0, 18)}…
              </p>
            </div>
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">Transaction history</p>
          <div className="mt-5 rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--ink-700)]">
              Most recent signature
            </p>
            <p className="mt-2 break-all text-sm text-[var(--ink-500)]">
              {pool.txSig}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[var(--ink-400)]">
              Legal hash
            </p>
            <p className="mt-2 break-all text-sm text-[var(--ink-500)]">
              {pool.legalAssetHash}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="stat-card stat-card--lavender">
          <p className="eyebrow">Invest panel</p>
          <h2 className="mt-8 text-3xl font-semibold">Commit USDC</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
            Funding progress {pool.fundedPct}% · expected settlement in{" "}
            {pool.dueLabel}.
          </p>
          <div className="mt-6 h-3 rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
              style={{ width: `${pool.fundedPct}%` }}
            />
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-white/74 p-4">
            <label className="text-sm font-medium text-[var(--ink-600)]">
              Investment amount
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none"
                defaultValue="500"
              />
            </label>
            <button className="btn-primary mt-4 w-full">
              Invest with Solana wallet
            </button>
          </div>
        </div>

        <div className="soft-card p-6">
          <p className="eyebrow">Admin actions</p>
          <div className="mt-4 grid gap-3">
            {[
              "Advance to issuer",
              "Repay from originator",
              "Update servicing",
              "Mark defaulted",
            ].map((label) => (
              <button
                key={label}
                className="btn-secondary justify-between text-sm"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
