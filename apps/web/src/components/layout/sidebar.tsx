"use client";

import Image from "next/image";
import Link from "next/link";
import { useDemoSession } from "@/components/providers/demo-session-provider";
import { LayoutDashboard, Sparkles, Wallet } from "lucide-react";

export function Sidebar() {
  const { session } = useDemoSession();

  const items = [
    { href: "/marketplace", label: "Pools", icon: LayoutDashboard },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/ai-assist", label: "AI Assist", icon: Sparkles },
    ...(session?.role === "institution"
      ? [{ href: "/admin", label: "관리자", icon: Sparkles }]
      : []),
  ];

  return (
    <aside className="flex h-full flex-col rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_20px_55px_rgba(127,139,176,0.12)] backdrop-blur-xl">
      <Link href="/" className="block rounded-[1.4rem] bg-[var(--surface-soft)] px-4 py-3 transition hover:bg-white">
        <div>
          <Image
            src="/branding/logo-wordmark.jpg"
            alt="InvoX logo"
            width={1054}
            height={332}
            className="h-9 w-auto object-contain"
            priority
          />
          <p className="text-xs text-[var(--ink-500)]">Invoice investment protocol</p>
        </div>
      </Link>

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
    </aside>
  );
}
