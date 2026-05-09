export function KycRequiredCard({ onAction }: { onAction: () => void }) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
      <p className="eyebrow">Eligibility check</p>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">
        Participation in this verified receivable pool requires a demo KYC and eligibility check before funds can be committed.
      </p>
      <button className="btn-secondary mt-4" type="button" onClick={onAction}>
        Complete KYC
      </button>
    </div>
  );
}
