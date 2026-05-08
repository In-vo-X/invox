import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  ChartColumnIncreasing,
  ShieldCheck,
} from "lucide-react";

const highlights = [
  {
    title: "Fund pool",
    copy: "Investors fill the advance target with USDC-backed liquidity.",
    Icon: ChartColumnIncreasing,
  },
  {
    title: "Advance issuer",
    copy: "Originators or admins trigger the working-capital payout.",
    Icon: BadgeDollarSign,
  },
  {
    title: "Claim yield",
    copy: "Repayments settle pro-rata and investors claim transparently.",
    Icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden px-6 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(149,171,255,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(145,236,217,0.20),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,212,177,0.22),_transparent_28%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col rounded-[2rem] border border-white/70 bg-white/86 shadow-[0_30px_80px_rgba(119,133,181,0.12)] backdrop-blur-xl">
        <header className="border-b border-[var(--line)] px-6 py-5 sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--ink-500)]">
              InvoX
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
              Turn unpaid invoices into on-chain cashflows.
            </h1>
          </div>
        </header>

        <section className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-medium text-[var(--ink-600)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-500)]" />
              Solana 기반 빠른 정산 · 낮은 비용 · 투명한 거래 추적
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-600)]">
              FlowPay keeps legal invoice ownership off-chain while moving
              investment, advances, repayments, and investor claims onto Solana.
              Investors evaluate short-duration cashflows like a clean wealth
              dashboard instead of a noisy crypto trading screen.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="btn-primary" href="/marketplace">
                Start InvoX
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="btn-secondary" href="/ai-assist">
                AI Assist
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map(({ title, copy, Icon }) => (
                <div key={title} className="soft-card p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden p-6 sm:p-8">
            <div className="absolute right-6 top-6 rounded-full bg-[rgba(255,255,255,0.75)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              RWA dashboard
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="stat-card stat-card--lavender md:col-span-2">
                <span className="eyebrow">Working balance</span>
                <h3 className="mt-8 text-4xl font-semibold tracking-tight">
                  $9,500
                </h3>
                <p className="mt-2 text-sm text-[var(--ink-500)]">
                  Current funding target
                </p>
              </div>
              <div className="stat-card stat-card--coral">
                <span className="eyebrow">Expected gross yield</span>
                <h3 className="mt-7 text-3xl font-semibold">4.28%</h3>
                <p className="mt-2 text-sm text-[var(--ink-500)]">
                  Your spending increased
                </p>
              </div>
              <div className="stat-card stat-card--mint">
                <span className="eyebrow">Risk grade</span>
                <h3 className="mt-7 text-3xl font-semibold">B</h3>
                <p className="mt-2 text-sm text-[var(--ink-500)]">
                  Originator verified
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Demo journey</p>
                  <h3 className="mt-2 text-lg font-semibold">
                    Submit → Fund → Repay → Claim
                  </h3>
                </div>
                <Link
                  className="btn-secondary h-10 px-4 text-sm"
                  href="/marketplace/more"
                >
                  Open invoice board
                </Link>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-500)]">
                This is a hackathon MVP running on Devnet or Localnet. It does
                not represent a public securities offering, lending service, or
                legal claim to real-world invoices.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
