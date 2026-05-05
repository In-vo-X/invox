import { MiniBarChart } from "@/components/ui/mini-bar-chart";

export function KpiCard({ eyebrow, value, note, accent, chart }: { eyebrow: string; value: string; note: string; accent: string; chart: number[] }) {
  return (
    <div className="soft-card p-5">
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight">{value}</h3>
          <p className="mt-2 text-sm text-[var(--ink-500)]">{note}</p>
        </div>
        <MiniBarChart values={chart} accent={accent} />
      </div>
    </div>
  );
}
