import { portfolioRows } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <section className="soft-card p-6">
        <p className="eyebrow">Portfolio</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Investor positions</h1>
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--surface-soft)] text-[var(--ink-500)]">
              <tr>
                {['Pool', 'Invested', 'Claimable', 'Claimed', 'Status'].map((cell) => (
                  <th key={cell} className="px-4 py-4 font-semibold">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {portfolioRows.map((row) => (
                <tr key={row.pool} className="border-t border-[var(--line)] bg-white/80">
                  <td className="px-4 py-4 font-semibold">{row.pool}</td>
                  <td className="px-4 py-4">{formatCurrency(row.invested)}</td>
                  <td className="px-4 py-4">{formatCurrency(row.claimable)}</td>
                  <td className="px-4 py-4">{formatCurrency(row.claimed)}</td>
                  <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
