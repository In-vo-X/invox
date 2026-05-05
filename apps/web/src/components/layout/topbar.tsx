"use client";

import Link from "next/link";
import { Bell, Search, Sparkles } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Topbar() {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/88 px-5 py-4 shadow-[0_18px_48px_rgba(127,139,176,0.12)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink-500)]">
          <Search className="h-4 w-4" />
          Search pools, issuers, tx signatures
        </div>
        <Link href="/marketplace" className="metric-chip hidden sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5 text-[var(--brand-500)]" />
          RWA dashboard
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <button className="pill text-[var(--ink-600)]" type="button">
          <Bell className="h-4 w-4" />
          Alerts
        </button>
        <WalletMultiButton className="!h-12 !rounded-full !bg-[linear-gradient(135deg,#5f72dd,#7287ff)] !px-5 !font-semibold !shadow-[0_18px_32px_rgba(114,135,255,0.24)]" />
      </div>
    </div>
  );
}
