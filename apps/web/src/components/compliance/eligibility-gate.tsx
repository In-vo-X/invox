import { EligibilityBadge, type EligibilityStatus } from "@/components/compliance/eligibility-badge";

const MESSAGES: Record<EligibilityStatus, string> = {
  not_connected: "지갑을 연결하면 투자 진행이 가능합니다.",
  kyc_required: "현재 데모에서는 로그인 후 상품을 확인할 수 있고, 실제 투자 단계에서 지갑 서명이 필요합니다.",
  pending_review: "현재 상태를 확인하고 있습니다.",
  approved: "이 계정은 현재 풀 참여를 진행할 수 있습니다.",
  restricted_region: "이 풀은 현재 이 계정에서 참여할 수 없습니다.",
  not_whitelisted: "이 풀은 사전 승인 후 참여할 수 있습니다.",
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
          <p className="eyebrow">참여 상태</p>
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
