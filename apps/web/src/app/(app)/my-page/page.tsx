"use client";

import { WalletModalButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDemoSession } from "@/components/providers/demo-session-provider";

export default function MyPage() {
  const { connected, wallet } = useWallet();
  const { session, disconnect } = useDemoSession();
  const walletAddress = connected ? wallet?.adapter.publicKey?.toBase58?.() ?? null : null;
  const shortWalletAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "Not connected";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.88fr]">
      <section className="soft-card p-6">
        <p className="eyebrow">My Page</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Account and wallet status</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
          Use this page to review your account role, wallet connection, and the signing setup used for on-chain actions.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
            <p className="eyebrow">Logged in as</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">{session?.label ?? "Not logged in"}</p>
          </div>
          <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
            <p className="eyebrow">Role</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">
              {session?.role === "institution" ? "Institution" : session ? "Investor" : "Guest"}
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
            <p className="eyebrow">Connection status</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">
              {connected ? "Connected" : "Not connected"}
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4">
            <p className="eyebrow">Connected wallet</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">
              {connected ? wallet?.adapter.name ?? "Unknown wallet" : "None"}
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[var(--surface-soft)] p-4 sm:col-span-2">
            <p className="eyebrow">Wallet address</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">
              {shortWalletAddress}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {connected ? (
            <WalletMultiButton className="!h-12 !justify-center !rounded-full !bg-[linear-gradient(135deg,#5f72dd,#7287ff)] !px-5 !font-semibold !shadow-[0_18px_32px_rgba(114,135,255,0.24)]" />
          ) : (
            <WalletModalButton className="btn-primary">지갑 연결</WalletModalButton>
          )}
          {session ? (
            <button
              className="btn-secondary"
              onClick={() => {
                disconnect();
                window.location.href = "/marketplace";
              }}
              type="button"
            >
              로그아웃
            </button>
          ) : null}
        </div>
      </section>

      <section className="stat-card stat-card--lavender">
        <p className="eyebrow">How this account works</p>
        <h2 className="mt-8 text-3xl font-semibold">Explore first, sign when needed</h2>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-500)]">
          You can browse pools, AI guidance, and portfolio surfaces after login. When it is time to invest, claim, or run operator actions, a Solana wallet is still required for on-chain signatures.
        </p>
      </section>
    </div>
  );
}
