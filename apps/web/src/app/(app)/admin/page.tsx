"use client";

import { useState } from "react";
import { useDemoSession } from "@/components/providers/demo-session-provider";

export default function AdminPage() {
  const { session } = useDemoSession();
  const [form, setForm] = useState({
    poolName: "",
    category: "Custom",
    operatorName: "",
    invoiceFaceValue: "",
    advanceAmount: "",
    estimatedYieldPct: "",
    onTimeRepaymentPct: "95",
    lateExposurePct: "2",
    avgDurationDays: "45",
    debtorName: "",
    description: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      poolId: `custom-${Date.now()}`,
      poolName: form.poolName,
      category: form.category,
      operatorName: form.operatorName,
      receivablesCount: 1,
      issuerName: form.poolName,
      issuerWallet: "institution-demo-wallet",
      debtorName: form.debtorName,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceFaceValue: Number(form.invoiceFaceValue || 0),
      advanceAmount: Number(form.advanceAmount || 0),
      estimatedYieldPct: Number(form.estimatedYieldPct || 0),
      onTimeRepaymentPct: Number(form.onTimeRepaymentPct || 0),
      lateExposurePct: Number(form.lateExposurePct || 0),
      avgDurationDays: Number(form.avgDurationDays || 45),
      dueDate: new Date(Date.now() + Number(form.avgDurationDays || 45) * 24 * 60 * 60 * 1000).toISOString(),
      paymentTerms: `Net ${form.avgDurationDays || 45}`,
      description: form.description,
      proofDocumentUrl: null,
      riskScore: 78,
      riskGrade: "B",
      status: "Funding",
    };

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("상품 등록에 실패했습니다.");
      return;
    }

    setMessage("투자 상품이 등록되었습니다. Marketplace에서 확인할 수 있습니다.");
  }

  if (session?.role !== "institution") {
    return (
      <div className="soft-card p-6">
        <p className="eyebrow">Operator Console</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">기관 회원 전용 화면</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
          투자 상품 등록과 운영 도구는 기관 회원으로 로그인했을 때만 사용할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.88fr]">
      <section className="soft-card p-6">
        <p className="eyebrow">Operator Console</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Invoice investment product registration
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
          기관 회원은 여기에서 새로운 invoice 투자 상품을 등록하고, 운영 정보와 기본 메타데이터를 관리할 수 있습니다.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[var(--ink-600)]">
              상품명
              <input className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none" placeholder="예: 단기 수출채권 풀" value={form.poolName} onChange={(e) => setForm({ ...form, poolName: e.target.value })} />
            </label>
            <label className="text-sm font-medium text-[var(--ink-600)]">
              운영기관
              <input className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none" placeholder="기관명" value={form.operatorName} onChange={(e) => setForm({ ...form, operatorName: e.target.value })} />
            </label>
            <label className="text-sm font-medium text-[var(--ink-600)]">
              자금 조달 목표
              <input className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none" placeholder="예: 25,000 USDC" value={form.advanceAmount} onChange={(e) => setForm({ ...form, advanceAmount: e.target.value })} />
            </label>
            <label className="text-sm font-medium text-[var(--ink-600)]">
              예상 연간 수익률
              <input className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none" placeholder="예: 8.4%" value={form.estimatedYieldPct} onChange={(e) => setForm({ ...form, estimatedYieldPct: e.target.value })} />
            </label>
            <label className="text-sm font-medium text-[var(--ink-600)]">
              풀 페이스 값
              <input className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none" placeholder="예: 30,000 USDC" value={form.invoiceFaceValue} onChange={(e) => setForm({ ...form, invoiceFaceValue: e.target.value })} />
            </label>
            <label className="text-sm font-medium text-[var(--ink-600)]">
              주요 지불자
              <input className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none" placeholder="예: 주요 지불자 회사명" value={form.debtorName} onChange={(e) => setForm({ ...form, debtorName: e.target.value })} />
            </label>
          </div>
          <label className="text-sm font-medium text-[var(--ink-600)]">
            상품 설명
            <textarea className="mt-2 min-h-32 w-full rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 outline-none" placeholder="인보이스 구조, 지불자 구성, 만기, 운영 포인트를 입력하세요." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <button className="btn-primary w-fit">투자 상품 등록</button>
          {message ? <p className="text-sm text-[var(--brand-700)]">{message}</p> : null}
        </form>
      </section>

      <section className="stat-card stat-card--mint">
        <p className="eyebrow">Operator activity</p>
        <h2 className="mt-8 text-3xl font-semibold">Latest execution</h2>
        <div className="mt-6 rounded-[1.5rem] bg-white/70 p-5">
          <p className="text-sm font-semibold text-[var(--ink-700)]">
            Signature
          </p>
          <p className="mt-3 break-all text-sm text-[var(--ink-500)]">
            5msuT3fB5X8J6sB2n2d3Y9poolopsdemo
          </p>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-500)]">
            Use this area to surface Solana Explorer links after pool creation,
            advances, repayments, or claims.
          </p>
        </div>
      </section>
    </div>
  );
}
