const actions = [
  "Mint 10,000 Mock USDC",
  "Advance funded pool",
  "Repay invoice in full",
  "Collect protocol fee",
  "Seed demo invoices",
];

export default function AdminPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.88fr]">
      <section className="soft-card p-6">
        <p className="eyebrow">Admin console</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Hackathon operations panel</h1>
        <div className="mt-6 grid gap-3">
          {actions.map((action) => (
            <button key={action} className="flex items-center justify-between rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 text-left text-sm font-medium text-[var(--ink-700)]">
              <span>{action}</span>
              <span className="metric-chip">Demo</span>
            </button>
          ))}
        </div>
      </section>

      <section className="stat-card stat-card--mint">
        <p className="eyebrow">Transaction surface</p>
        <h2 className="mt-8 text-3xl font-semibold">Latest execution</h2>
        <div className="mt-6 rounded-[1.5rem] bg-white/70 p-5">
          <p className="text-sm font-semibold text-[var(--ink-700)]">Signature</p>
          <p className="mt-3 break-all text-sm text-[var(--ink-500)]">5msuT3fB5X8J6sB2n2d3Y9invoicefinancehackathon</p>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-500)]">
            Use this area to surface Solana Explorer links after pool creation, advances, repayments, or claims.
          </p>
        </div>
      </section>
    </div>
  );
}
