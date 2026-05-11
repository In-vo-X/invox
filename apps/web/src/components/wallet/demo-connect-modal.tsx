"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, Sparkles, WalletCards } from "lucide-react";
import { WalletModalButton } from "@solana/wallet-adapter-react-ui";
import { useDemoSession } from "@/components/providers/demo-session-provider";

const DEMO_EMAIL_BY_ROLE = {
  investor: "demo@invox.ai",
  institution: "institution@invox.ai",
} as const;

export function DemoConnectModal({
  open,
  onClose,
  initialView = "login",
}: {
  open: boolean;
  onClose: () => void;
  initialView?: "login" | "wallet";
}) {
  const { loginWithEmail, signupWithEmail, connectWithProvider } = useDemoSession();
  const [email, setEmail] = useState("demo@invox.ai");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<"investor" | "institution">("investor");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMode("login");
    setRole("investor");
    setEmail(DEMO_EMAIL_BY_ROLE.investor);
    setPassword("demo1234");
    setError(null);
  }, [open, initialView]);

  useEffect(() => {
    setEmail(DEMO_EMAIL_BY_ROLE[role]);
    setPassword("demo1234");
  }, [role]);

  if (!open || !mounted) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const result =
      mode === "login"
        ? loginWithEmail(email, password)
        : signupWithEmail(email, password, role);

    if (!result.ok) {
      setError(result.error ?? "처리에 실패했습니다.");
      return;
    }

    setError(null);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto bg-[rgba(17,24,39,0.48)] px-6 py-8">
      <div className="glass-panel w-full max-w-lg p-6">
        <div className="flex items-center gap-2 text-[var(--brand-700)]">
          <Sparkles className="h-4 w-4" />
          <p className="eyebrow text-[var(--brand-700)]">{initialView === "wallet" ? "Wallet Connect" : mode === "login" ? "Login" : "Sign up"}</p>
        </div>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight">
          {initialView === "wallet" ? "Connect your Solana wallet" : mode === "login" ? "Log in to InvoX" : "Create your InvoX account"}
        </h3>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-600)]">
          {initialView === "wallet"
            ? "Use a real wallet only when you need on-chain signatures such as investing, claiming, or operator actions."
            : mode === "login"
              ? "Explore pools, portfolio analytics, and AI Assist first. Real on-chain actions still require wallet signing."
              : "Choose whether you are signing up as an investor or an institution. Institution accounts can access invoice product registration and operator workflows."}
        </p>

        {mode === "signup" ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                role === "investor"
                  ? "border-[rgba(114,135,255,0.4)] bg-[linear-gradient(135deg,rgba(114,135,255,0.16),rgba(94,215,198,0.12))] shadow-[0_16px_30px_rgba(126,136,170,0.12)]"
                  : "border-[var(--line)] bg-white/70"
              }`}
              onClick={() => setRole("investor")}
            >
              <span className="text-base font-semibold">개인 회원</span>
              <span className="mt-1 block text-sm text-[var(--ink-500)]">상품 참여와 투자 흐름 확인</span>
            </button>
            <button
              type="button"
              className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                role === "institution"
                  ? "border-[rgba(114,135,255,0.4)] bg-[linear-gradient(135deg,rgba(114,135,255,0.16),rgba(94,215,198,0.12))] shadow-[0_16px_30px_rgba(126,136,170,0.12)]"
                  : "border-[var(--line)] bg-white/70"
              }`}
              onClick={() => setRole("institution")}
            >
              <span className="text-base font-semibold">기관 회원</span>
              <span className="mt-1 block text-sm text-[var(--ink-500)]">운영과 투자상품 등록 기능 포함</span>
            </button>
          </div>
        ) : null}

        <form className="mt-6 rounded-[1.35rem] bg-[var(--surface-soft)] p-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-[var(--ink-600)]">
            ID / Email
            <div className="mt-3 flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-3">
              <Mail className="h-4 w-4 text-[var(--ink-500)]" />
              <input
                className="w-full bg-transparent text-sm text-[var(--ink-800)] outline-none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="demo@invox.ai"
                type="email"
              />
            </div>
          </label>

          <label className="mt-4 block text-sm font-medium text-[var(--ink-600)]">
            Password
            <div className="mt-3 rounded-full border border-[var(--line)] bg-white px-4 py-3">
              <input
                className="w-full bg-transparent text-sm text-[var(--ink-800)] outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="demo1234"
                type="password"
              />
            </div>
          </label>

          {error ? <p className="mt-3 text-sm text-[var(--coral-600)]">{error}</p> : null}

          <button className="btn-primary mt-4 w-full" type="submit">
            {mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        <p className="mt-4 text-sm text-[var(--ink-500)]">아직 회원이 아니신가요?</p>
        <button
          className="btn-secondary mt-3 w-full"
          type="button"
          onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
        >
          {mode === "login" ? "회원가입" : "로그인으로 돌아가기"}
        </button>

        <p className="mt-3 text-xs leading-6 text-[var(--ink-500)]">
          데모 계정: 투자자 <span className="font-semibold text-[var(--ink-700)]">demo@invox.ai / demo1234</span>, 기관 <span className="font-semibold text-[var(--ink-700)]">institution@invox.ai / demo1234</span>
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn-secondary h-auto flex-col items-start rounded-[1.35rem] px-4 py-4 text-left"
            onClick={() => {
              connectWithProvider("google", role);
              onClose();
            }}
          >
            <span className="text-base font-semibold">구글 연동</span>
            <span className="mt-1 text-sm text-[var(--ink-500)]">빠른 데모 진입</span>
          </button>
          <WalletModalButton className="btn-secondary h-auto flex-col items-start rounded-[1.35rem] px-4 py-4 text-left">
            <div className="flex items-start gap-3">
              <WalletCards className="mt-0.5 h-5 w-5 text-[var(--brand-600)]" />
              <div>
                <span className="block text-base font-semibold">지갑 연결</span>
                <span className="mt-1 block text-sm text-[var(--ink-500)]">실제 온체인 서명 사용</span>
              </div>
            </div>
          </WalletModalButton>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="text-sm font-medium text-[var(--ink-500)] transition hover:text-[var(--ink-900)]" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
