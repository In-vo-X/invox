export function ParticipationModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(17,24,39,0.35)] px-6">
      <div className="w-full max-w-xl rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(17,24,39,0.18)]">
        <p className="eyebrow">Before you participate</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">Confirm the key pool risks</h3>
        <div className="mt-5 space-y-3 rounded-[1.4rem] bg-[var(--surface-soft)] p-4 text-sm text-[var(--ink-700)]">
          <p>• I understand this is not a guaranteed return.</p>
          <p>• I understand repayments may be delayed.</p>
          <p>• I understand this pool contains multiple receivables.</p>
          <p>• I understand eligibility restrictions may apply.</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn-primary" type="button" onClick={onConfirm}>Confirm and Continue</button>
        </div>
      </div>
    </div>
  );
}
