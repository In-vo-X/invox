import { MiniBarChart } from "@/components/ui/mini-bar-chart";

export function KpiCard({
  eyebrow,
  value,
  note,
  accent,
  chart,
}: {
  eyebrow: string;
  value: string;
  note: string;
  accent: string;
  chart: number[];
}) {
  return (
    <div className="soft-card relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-70 blur-2xl"
        style={{ background: accent }}
      />
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">{value}</h3>
          <p className="mt-2 text-sm text-[var(--ink-500)]">{note}</p>
        </div>
        <div className="rounded-[1.3rem] border border-white/70 bg-white/60 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <MiniBarChart values={chart} accent={accent} />
        </div>
      </div>
    </div>
  );
}
