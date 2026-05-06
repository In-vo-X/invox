import Link from "next/link";
import {
  BriefcaseBusiness,
  CircleDollarSign,
  FileStack,
  LayoutDashboard,
  ShieldEllipsis,
  Wallet,
} from "lucide-react";

const items = [
  { href: "/marketplace", label: "Marketplace", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/create", label: "Create Pool", icon: FileStack },
  { href: "/admin", label: "Admin", icon: ShieldEllipsis },
];

export function Sidebar() {
  return (
    <aside className="flex h-full flex-col rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_20px_55px_rgba(127,139,176,0.12)] backdrop-blur-xl">
      <div className="flex items-center gap-3 rounded-[1.4rem] bg-[var(--surface-soft)] px-4 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-100)] text-[var(--brand-600)]">
          <CircleDollarSign className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink-900)]">FlowPay</p>
          <p className="text-xs text-[var(--ink-500)]">
            Invoice cashflow protocol
          </p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--ink-600)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--ink-900)]"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-[1.75rem] bg-[linear-gradient(160deg,rgba(255,245,227,0.84),rgba(235,239,255,0.94))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--coral-500)] shadow-sm">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <p className="mt-4 text-base font-semibold">Hackathon mode</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
          Mock USDC, demo originators, and claim-based settlement running on
          Solana Devnet or Localnet.
        </p>
      </div>
    </aside>
  );
}
