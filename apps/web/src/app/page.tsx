import Link from "next/link";
import Image from "next/image";
import { BrandWordmark } from "@/components/brand-wordmark";
import {
  ArrowRight,
  BadgeDollarSign,
  ChartColumnIncreasing,
  Clock3,
  DatabaseZap,
  FileCheck2,
  Layers3,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

const highlights = [
  {
    title: "Participate in invoice pools",
    copy: "Approved users fund verified invoice investment pools with short-duration cashflow exposure.",
    Icon: ChartColumnIncreasing,
  },
  {
    title: "Release funding",
    copy: "When the vault reaches the funding target, an authorized on-chain advance transaction releases capital to the issuer.",
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
            <Image
              src="/branding/logo-wordmark.jpg"
              alt="InvoX logo"
              width={1054}
              height={332}
              className="h-14 w-auto object-contain sm:h-16"
              priority
            />
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">
              Transparent invoice investing, built on-chain.
            </h1>
          </div>
        </header>

        <section className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16 lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-medium text-[var(--ink-600)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-500)]" />
              Faster settlement · lower fees · transparent on-chain tracking
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-600)]">
              Participate in verified short-duration invoice investment pools, monitor repayment status through clear on-chain records, and claim distributions with more transparency. InvoX organizes verified invoices into managed pools so users can understand invoice cashflow more clearly.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="btn-primary" href="/marketplace">
                Explore Pools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map(({ title, copy, Icon }) => (
                <div key={title} className="soft-card relative overflow-hidden p-5">
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(114,135,255,0.45),transparent)]" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(114,135,255,0.18),rgba(94,215,198,0.18))] text-[var(--brand-600)]">
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
            <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(114,135,255,0.36),transparent_60%)] blur-2xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(94,215,198,0.28),transparent_60%)] blur-2xl" />
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
                    Currently deployed across active invoice investment pools
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
            <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,249,255,0.86))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_36px_rgba(126,136,170,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Pool lifecycle</p>
                  <h3 className="mt-2 text-lg font-semibold">
                    Pool creation → Participation → Advance → Repayment → Claim
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-500)]">
                 Operators assemble verified receivables into pools. Once a funding target is reached, an authorized on-chain advance transaction moves USDC from the pool vault to the issuer’s wallet, and later repayments flow back into the vault for pro-rata claims.
                </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-t border-[var(--line)] px-6 py-12 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="eyebrow">How InvoX works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              A clearer operating layer for invoice investing.
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--ink-600)]">
              InvoX works alongside verified and experienced invoice investment operators. By pairing their real-world sourcing and servicing expertise with transparent pool data, on-chain repayment records, and claim visibility, the platform makes invoice investing easier to monitor and understand.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                title: "1. Verified pool setup",
                copy: "Operators group short-duration receivables into managed pools, publish servicing metadata, and define the funding target before participation opens.",
                Icon: FileCheck2,
              },
              {
                title: "2. Participation and funding",
                copy: "Approved users participate with USDC. Capital is held in the pool vault until the target is reached and the operator triggers the advance transaction.",
                Icon: WalletCards,
              },
              {
                title: "3. Repayment and claim",
                copy: "When underlying payers settle, repayments are recorded on-chain, claimable distributions update, and participants can withdraw their pro-rata share.",
                Icon: DatabaseZap,
              },
            ].map(({ title, copy, Icon }) => (
              <div key={title} className="glass-panel relative overflow-hidden p-6">
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-[2rem] bg-[linear-gradient(135deg,rgba(114,135,255,0.12),rgba(255,255,255,0))]" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-500)]">{copy}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="soft-card p-6">
              <p className="eyebrow">Why operators use it</p>
              <div className="mt-5 space-y-4">
                {[
                  ["Working-capital speed", "Operators can release funding immediately after pool targets are reached instead of waiting on off-chain reconciliation cycles."],
                  ["Repayment visibility", "Repayment events, claimable distributions, and vault balances become easier to explain to participants and partners."],
                  ["Pool-level reporting", "Servicing status, payer mix, maturity buckets, and historical repayment quality can be presented in a structured investor-facing format."],
                ].map(([title, copy]) => (
                    <div key={title} className="rounded-[1.3rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(245,248,255,0.78))] p-4 shadow-[0_12px_28px_rgba(126,136,170,0.08)]">
                    <p className="text-sm font-semibold text-[var(--ink-900)]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card p-6">
              <p className="eyebrow">What participants should understand</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Estimated yield",
                    copy: "Yield is a projection based on expected timing and fees, not a guaranteed return.",
                    Icon: ChartColumnIncreasing,
                  },
                  {
                    title: "Late exposure",
                    copy: "This shows how much of the pool has slipped past expected timing and may delay distributions.",
                    Icon: Clock3,
                  },
                  {
                    title: "Operator servicing",
                    copy: "The operator still handles collections and updates. InvoX makes those actions more visible, not unnecessary.",
                    Icon: BadgeDollarSign,
                  },
                  {
                    title: "On-chain records",
                    copy: "Participation, advances, repayments, and claims are recorded on-chain so participants can track real cashflow events more clearly.",
                    Icon: Layers3,
                  },
                ].map(({ title, copy, Icon }) => (
                  <div key={title} className="rounded-[1.3rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,249,255,0.78))] p-5 shadow-[0_16px_34px_rgba(126,136,170,0.08)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-[var(--ink-900)]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
