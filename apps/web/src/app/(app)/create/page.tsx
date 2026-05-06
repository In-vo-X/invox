const fields = [
  "Issuer name",
  "Originator wallet",
  "SPV wallet",
  "Debtor name",
  "Invoice number",
  "Invoice face value",
  "Advance amount",
  "Due date",
  "Legal asset hash",
  "Metadata URI",
  "Risk score",
  "Servicing status",
];

export default function CreatePage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="soft-card p-6">
        <p className="eyebrow">Create Pool</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Contract-root pool intake
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
          Capture the issuer, originator, SPV, immutable legal asset hash, and
          servicing disclosure before opening the Solana pool.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label
              key={field}
              className="block text-sm font-medium text-[var(--ink-600)]"
            >
              <span>{field}</span>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none"
                placeholder={field}
              />
            </label>
          ))}
          <label className="block text-sm font-medium text-[var(--ink-600)] sm:col-span-2">
            <span>Description</span>
            <textarea
              className="mt-2 min-h-36 w-full rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              placeholder="Off-chain invoice bundle notes, assignment evidence, servicing policy, and risk summary"
            />
          </label>
        </div>
        <button className="btn-primary mt-6">Create contract-root pool</button>
      </section>

      <section className="space-y-5">
        <div className="stat-card stat-card--lavender">
          <p className="eyebrow">Creation flow</p>
          <h2 className="mt-8 text-3xl font-semibold">
            Metadata → Pool PDA → Vault ATA
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-500)]">
            The app records off-chain legal metadata, then create_pool snapshots
            fee terms and stores the contract parties before opening a Solana
            vault with deterministic PDA derivations.
          </p>
        </div>
        <div className="soft-card p-6">
          <p className="eyebrow">Compliance note</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
            This is a hackathon MVP and does not represent a public securities
            offering, lending service, or legal claim to real-world invoices.
          </p>
        </div>
      </section>
    </div>
  );
}
