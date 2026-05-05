import { cn } from "@/lib/utils";

const tones = {
  Funding: "bg-[var(--gold-100)] text-[#a86d1b]",
  Funded: "bg-[var(--brand-100)] text-[var(--brand-600)]",
  Advanced: "bg-[var(--mint-100)] text-[#1f8a7f]",
  PartiallyRepaid: "bg-[var(--coral-100)] text-[var(--coral-500)]",
  Repaid: "bg-[var(--mint-100)] text-[#177f71]",
  Defaulted: "bg-[rgba(21,33,59,0.08)] text-[var(--ink-700)]",
};

export function StatusBadge({ status }: { status: keyof typeof tones }) {
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", tones[status])}>{status}</span>;
}
