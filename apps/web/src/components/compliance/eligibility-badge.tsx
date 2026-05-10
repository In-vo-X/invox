type EligibilityStatus =
  | "not_connected"
  | "kyc_required"
  | "pending_review"
  | "approved"
  | "restricted_region"
  | "not_whitelisted";

const LABELS: Record<EligibilityStatus, string> = {
  not_connected: "지갑 연결 필요",
  kyc_required: "추가 확인 필요",
  pending_review: "검토 중",
  approved: "참여 가능",
  restricted_region: "참여 제한",
  not_whitelisted: "사전 승인 필요",
};

const CLASSES: Record<EligibilityStatus, string> = {
  not_connected: "bg-[var(--surface-soft)] text-[var(--ink-600)]",
  kyc_required: "bg-[rgba(255,226,176,0.45)] text-[rgba(150,102,18,1)]",
  pending_review: "bg-[rgba(145,236,217,0.35)] text-[rgba(37,144,128,1)]",
  approved: "bg-[rgba(94,215,198,0.18)] text-[rgba(37,144,128,1)]",
  restricted_region: "bg-[rgba(255,155,135,0.2)] text-[rgba(217,99,72,1)]",
  not_whitelisted: "bg-[rgba(149,171,255,0.18)] text-[var(--brand-600)]",
};

export function EligibilityBadge({ status }: { status: EligibilityStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CLASSES[status]}`}>
      {LABELS[status]}
    </span>
  );
}

export type { EligibilityStatus };
