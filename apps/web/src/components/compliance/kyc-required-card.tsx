export function KycRequiredCard({ onAction }: { onAction: () => void }) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
      <p className="eyebrow">참여 안내</p>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">
        현재 데모에서는 로그인 후 상품을 탐색할 수 있고, 실제 투자 버튼을 누를 때 Solana 지갑 서명이 필요합니다.
      </p>
      <button className="btn-secondary mt-4" type="button" onClick={onAction}>
        계속 진행
      </button>
    </div>
  );
}
