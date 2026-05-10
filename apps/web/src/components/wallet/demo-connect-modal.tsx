"use client";

import { FormEvent, useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { useDemoSession } from "@/components/providers/demo-session-provider";

export function DemoConnectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connectWithEmail, connectWithProvider } = useDemoSession();
  const [email, setEmail] = useState("demo@invox.ai");

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    connectWithEmail(email.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(17,24,39,0.36)] px-6">
      <div className="glass-panel w-full max-w-lg p-6">
        <div className="flex items-center gap-2 text-[var(--brand-700)]">
          <Sparkles className="h-4 w-4" />
          <p className="eyebrow text-[var(--brand-700)]">Walletless demo access</p>
        </div>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight">Enter InvoX without installing a wallet</h3>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-600)]">
          This demo session lets users explore pools, portfolio analytics, and AI Assist with familiar login UX. Real on-chain actions still require a Solana wallet for signing.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn-secondary h-auto flex-col items-start rounded-[1.35rem] px-4 py-4 text-left"
            onClick={() => {
              connectWithProvider("google");
              onClose();
            }}
          >
            <span className="text-base font-semibold">Continue with Google</span>
            <span className="mt-1 text-sm text-[var(--ink-500)]">Fastest demo path</span>
          </button>
          <button
            type="button"
            className="btn-secondary h-auto flex-col items-start rounded-[1.35rem] px-4 py-4 text-left"
            onClick={() => {
              connectWithProvider("apple");
              onClose();
            }}
          >
            <span className="text-base font-semibold">Continue with Apple</span>
            <span className="mt-1 text-sm text-[var(--ink-500)]">Private and familiar</span>
          </button>
        </div>

        <form className="mt-5 rounded-[1.35rem] bg-[var(--surface-soft)] p-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-[var(--ink-600)]">
            Continue with email
            <div className="mt-3 flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-3">
              <Mail className="h-4 w-4 text-[var(--ink-500)]" />
              <input
                className="w-full bg-transparent text-sm text-[var(--ink-800)] outline-none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                type="email"
              />
            </div>
          </label>
          <button className="btn-primary mt-4 w-full" type="submit">
            Start demo session
          </button>
        </form>

        <div className="mt-4 flex justify-end">
          <button className="text-sm font-medium text-[var(--ink-500)] transition hover:text-[var(--ink-900)]" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
