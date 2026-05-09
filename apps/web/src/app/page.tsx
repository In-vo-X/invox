import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  ChartColumnIncreasing,
  ShieldCheck,
} from "lucide-react";

const highlights = [
  {
    title: "Participate in pools",
    copy: "Approved users fund verified receivable pools with short-duration cashflow exposure.",
    Icon: ChartColumnIncreasing,
  },
  {
    title: "Advance issuer",
    copy: "Operators release funding after the pool reaches its target and passes servicing checks.",
    Icon: BadgeDollarSign,
  },
  {
    title: "Claim distributions",
    copy: "Repayments settle pro-rata and participants claim distributions with clear on-chain records.",
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
              Transparent receivable finance, built on-chain.
            </h1>
          </div>
        </header>

        <section className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-medium text-[var(--ink-600)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-500)]" />
              Faster settlement · lower fees · transparent on-chain tracking
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-600)]">
              Participate in verified short-duration receivable pools, track repayments in real time, and claim distributions with clear on-chain records. Not individual invoice trading. InvoX organizes verified receivables into managed pools so approved participants can access, monitor, and understand real-world cashflow more easily.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="btn-primary" href="/marketplace">
                Explore Pools
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="btn-secondary" href="/marketplace/more">
                View How It Works
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
              Platform Overview
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="stat-card stat-card--lavender md:col-span-2">
                <span className="eyebrow">Active Financing Volume</span>
                <h3 className="mt-8 text-4xl font-semibold tracking-tight">
                  $38.0M
                </h3>
                <p className="mt-2 text-sm text-[var(--ink-500)]">
                  Currently deployed across active receivable pools
                </p>
              </div>
              <div className="stat-card stat-card--coral">
                <span className="eyebrow">Total Repaid</span>
                <h3 className="mt-7 text-3xl font-semibold">$12.4M</h3>
                <p className="mt-2 text-sm text-[var(--ink-500)]">
                  Cumulative repayments tracked on-chain
                </p>
              </div>
              <div className="stat-card stat-card--mint">
                <span className="eyebrow">On-Time Repayment Rate</span>
                <h3 className="mt-7 text-3xl font-semibold">97.2%</h3>
                <p className="mt-2 text-sm text-[var(--ink-500)]">
                  Historical repayments completed by due date
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
                    View How It Works
                </Link>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-500)]">
                 This is a demo environment running on Devnet or Localnet. It does
                 not represent a public securities offering, lending service, or
                 legal assignment to real-world receivables.
                </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
