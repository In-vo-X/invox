const tones = {
  A: "bg-[var(--mint-100)] text-[#177f71]",
  B: "bg-[var(--brand-100)] text-[var(--brand-600)]",
  C: "bg-[var(--coral-100)] text-[var(--coral-500)]",
  D: "bg-[rgba(21,33,59,0.08)] text-[var(--ink-700)]",
};

export function RiskBadge({ grade }: { grade: keyof typeof tones }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[grade]}`}>{grade}</span>;
}
