import { EligibilityBadge, type EligibilityStatus } from "@/components/compliance/eligibility-badge";

const MESSAGES: Record<EligibilityStatus, string> = {
  not_connected: "Connect wallet to check eligibility.",
  kyc_required: "Complete eligibility check before participating.",
  pending_review: "Eligibility review pending.",
  approved: "This wallet can participate in eligible pools.",
  restricted_region: "This pool is not available in your region.",
  not_whitelisted: "Join the whitelist to access this pool.",
};

export function EligibilityGate({
  status,
  actionLabel,
  onAction,
}: {
  status: EligibilityStatus;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Eligibility status</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">{MESSAGES[status]}</p>
        </div>
        <EligibilityBadge status={status} />
      </div>
      {actionLabel && onAction ? (
        <button className="btn-secondary mt-4" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
