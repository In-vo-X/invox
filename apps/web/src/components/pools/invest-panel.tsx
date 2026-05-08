"use client";

import { useMemo, useState } from "react";
import { AnchorProvider, BN } from "@anchor-lang/core";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { FLOWPAY_PROGRAM_ID, USDC_DECIMALS } from "@/lib/constants";
import { createFlowPayProgram } from "@/lib/flowpayClient";
import { getConfigPda, getInvestmentPda } from "@/lib/pda";

type InvestPanelProps = {
  poolId: string;
  fundedPct: number;
  dueLabel: string;
  advanceAmount: number;
  status: string;
};

type FlowPayConfigAccount = {
  usdcMint: PublicKey;
};

type FlowPayPoolAccount = {
  vault: PublicKey;
  usdcMint: PublicKey;
};

type FetchableAccount<T> = {
  fetch(address: PublicKey): Promise<T>;
};

type InvestMethodBuilder = {
  accountsPartial(accounts: Record<string, unknown>): {
    rpc(): Promise<string>;
  };
};

type InvestProgram = ReturnType<typeof createFlowPayProgram> & {
  account: {
    platformConfig: FetchableAccount<FlowPayConfigAccount>;
    invoicePool: FetchableAccount<FlowPayPoolAccount>;
  };
  methods: {
    invest(amount: BN): InvestMethodBuilder;
  };
};

function getPoolAddress(poolId: string) {
  const poolSeed = new BN(poolId).toArrayLike(Buffer, "le", 8);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), poolSeed],
    FLOWPAY_PROGRAM_ID,
  )[0];
}

function parseUsdcAmount(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d{0,6})?$/.test(normalized)) {
    return null;
  }

  const [whole, fraction = ""] = normalized.split(".");
  const paddedFraction = `${fraction}000000`.slice(0, USDC_DECIMALS);

  const base = new BN(whole).mul(new BN(10).pow(new BN(USDC_DECIMALS)));
  return base.add(new BN(paddedFraction || "0"));
}

export function InvestPanel({
  poolId,
  fundedPct,
  dueLabel,
  advanceAmount,
  status,
}: InvestPanelProps) {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey, connected, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("500");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const isFundingOpen = status === "Funding";
  const parsedAmount = useMemo(() => parseUsdcAmount(amount), [amount]);

  async function ensureInvestorAta(usdcMint: PublicKey, owner: PublicKey) {
    const ata = getAssociatedTokenAddressSync(usdcMint, owner);

    try {
      await getAccount(connection, ata);
      return ata;
    } catch {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(owner, ata, owner, usdcMint),
      );
      const ataSignature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(ataSignature, "confirmed");
      return ata;
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!connected || !wallet || !publicKey) {
      setFeedback("먼저 지갑을 연결해야 투자할 수 있습니다.");
      return;
    }

    if (!isFundingOpen) {
      setFeedback("현재 이 풀은 투자 가능한 Funding 상태가 아닙니다.");
      return;
    }

    if (!parsedAmount || parsedAmount.lte(new BN(0))) {
      setFeedback("USDC 금액을 올바르게 입력해주세요. 소수점은 6자리까지 가능합니다.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    setSignature(null);

    try {
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions(),
      );
      const program = createFlowPayProgram(
        provider,
        FLOWPAY_PROGRAM_ID,
      ) as InvestProgram;
      const config = await program.account.platformConfig.fetch(getConfigPda());
      const onchainPool = getPoolAddress(poolId);
      const poolAccount = await program.account.invoicePool.fetch(onchainPool);
      const investorTokenAccount = await ensureInvestorAta(config.usdcMint, publicKey);

      const txSignature = await program.methods
        .invest(parsedAmount)
        .accountsPartial({
          investor: publicKey,
          config: getConfigPda(),
          pool: onchainPool,
          investment: getInvestmentPda(onchainPool, publicKey),
          investorTokenAccount,
          vault: poolAccount.vault,
          usdcMint: poolAccount.usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(txSignature, "confirmed");
      setSignature(txSignature);
      setFeedback("투자 트랜잭션이 제출되고 확인되었습니다.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setFeedback(`투자에 실패했습니다: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stat-card stat-card--lavender">
      <p className="eyebrow">Invest panel</p>
      <h2 className="mt-8 text-3xl font-semibold">Commit USDC</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
        Funding progress {fundedPct}% · expected settlement in {dueLabel}.
      </p>
      <div className="mt-6 h-3 rounded-full bg-white">
        <div
          className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
          style={{ width: `${fundedPct}%` }}
        />
      </div>
      <form className="mt-6 rounded-[1.5rem] bg-white/74 p-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-[var(--ink-600)]">
          Investment amount
          <input
            className="mt-2 h-12 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 outline-none"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="500"
          />
        </label>
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--ink-500)]">
          <span>Pool target</span>
          <span>${advanceAmount.toLocaleString()} USDC</span>
        </div>
        <button className="btn-primary mt-4 w-full" disabled={submitting}>
          {submitting ? "Submitting transaction..." : "Invest with Solana wallet"}
        </button>
        {feedback ? (
          <p className="mt-4 text-sm leading-6 text-[var(--ink-600)]">{feedback}</p>
        ) : null}
        {signature ? (
          <p className="mt-2 break-all text-xs text-[var(--ink-500)]">
            Tx signature: {signature}
          </p>
        ) : null}
      </form>
    </div>
  );
}
