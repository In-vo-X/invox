"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnchorProvider, BN } from "@anchor-lang/core";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { FLOWPAY_PROGRAM_ID, USDC_DECIMALS } from "@/lib/constants";
import { createFlowPayProgram } from "@/lib/flowpayClient";
import {
  getConfigPda,
  getInvestmentPda,
  getPoolPda,
  getVaultAuthorityPda,
} from "@/lib/pda";

type InvestPanelProps = {
  poolId: string;
  fundedPct: number;
  dueLabel: string;
  advanceAmount: number;
  status: string;
  riskGrade: "A" | "B" | "C" | "D";
  servicingStatus: "Active" | "Disputed" | "Impaired";
};

type WalletLike = AnchorProvider["wallet"];

type FlowPayConfigAccount = {
  admin: PublicKey;
  usdcMint: PublicKey;
  treasury: PublicKey;
};

type FlowPayPoolAccount = {
  issuer: PublicKey;
  originator: PublicKey;
  usdcMint: PublicKey;
  vault: PublicKey;
  advanceAmount: BN;
  fundedAmount: BN;
  repaidAmount: BN;
  feeOwedAmount: BN;
  claimedAmount: BN;
  dueTs: BN;
  status: unknown;
  riskScore: number;
  servicingStatus: number;
  metadataUri: string;
};

type InvestmentAccount = {
  amount: BN;
  claimedAmount: BN;
};

type FetchableAccount<T> = {
  fetch(address: PublicKey): Promise<T>;
};

type MethodBuilder<TArgs extends unknown[] = []> = (...args: TArgs) => {
  accountsPartial(accounts: Record<string, unknown>): {
    rpc(): Promise<string>;
  };
};

type FlowPayProgram = ReturnType<typeof createFlowPayProgram> & {
  account: {
    platformConfig: FetchableAccount<FlowPayConfigAccount>;
    invoicePool: FetchableAccount<FlowPayPoolAccount>;
    investment: FetchableAccount<InvestmentAccount>;
  };
  methods: {
    invest: MethodBuilder<[BN]>;
    claim: MethodBuilder;
    advanceToIssuer: MethodBuilder;
    repay: MethodBuilder<[BN]>;
    updatePoolServicing: MethodBuilder<[number, number, string]>;
    markDefaulted: MethodBuilder;
  };
};

type ChainSnapshot = {
  config: FlowPayConfigAccount;
  poolAddress: PublicKey;
  pool: FlowPayPoolAccount;
  claimable: BN;
  investment: InvestmentAccount | null;
  statusLabel: string;
};

const STATUS_LABELS: Record<string, string> = {
  funding: "Funding",
  funded: "Funded",
  advanced: "Advanced",
  partiallyRepaid: "PartiallyRepaid",
  repaid: "Repaid",
  closed: "Closed",
  cancelled: "Cancelled",
  defaulted: "Defaulted",
};

const SERVICING_LABEL_TO_VALUE = {
  Active: 0,
  Disputed: 1,
  Impaired: 2,
} as const;

const SERVICING_VALUE_TO_LABEL = {
  0: "Active",
  1: "Disputed",
  2: "Impaired",
} as const;

const RISK_GRADE_TO_SCORE = {
  A: 92,
  B: 78,
  C: 64,
  D: 48,
} as const;

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

function formatBnUsdc(value: BN) {
  const raw = value.toString().padStart(USDC_DECIMALS + 1, "0");
  const whole = raw.slice(0, -USDC_DECIMALS);
  const fraction = raw.slice(-USDC_DECIMALS).replace(/0+$/, "");
  return fraction ? `$${whole}.${fraction}` : `$${whole}`;
}

function decodeStatus(status: unknown) {
  if (typeof status === "string") {
    return status;
  }

  if (status && typeof status === "object") {
    const key = Object.keys(status as Record<string, unknown>)[0];
    return STATUS_LABELS[key] ?? key;
  }

  return "Unknown";
}

function createReadOnlyWallet(): WalletLike {
  const publicKey = SystemProgram.programId;

  return {
    publicKey,
    signTransaction: async () => {
      throw new Error("Wallet connection required for signing");
    },
    signAllTransactions: async () => {
      throw new Error("Wallet connection required for signing");
    },
  };
}

export function InvestPanel({
  poolId,
  fundedPct,
  dueLabel,
  advanceAmount,
  status,
  riskGrade,
  servicingStatus,
}: InvestPanelProps) {
  const router = useRouter();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [amount, setAmount] = useState("500");
  const [repayAmount, setRepayAmount] = useState("500");
  const [riskScore, setRiskScore] = useState(
    String(RISK_GRADE_TO_SCORE[riskGrade]),
  );
  const [servicingValue, setServicingValue] = useState(
    String(SERVICING_LABEL_TO_VALUE[servicingStatus]),
  );
  const [metadataUri, setMetadataUri] = useState(
    `ipfs://invox-demo-pool-${poolId}`,
  );
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [chainSnapshot, setChainSnapshot] = useState<ChainSnapshot | null>(
    null,
  );

  const parsedInvestAmount = useMemo(() => parseUsdcAmount(amount), [amount]);
  const parsedRepayAmount = useMemo(
    () => parseUsdcAmount(repayAmount),
    [repayAmount],
  );
  const isFundingOpen = (chainSnapshot?.statusLabel ?? status) === "Funding";

  const getProgram = useCallback(
    (walletOverride?: WalletLike) => {
      const provider = new AnchorProvider(
        connection,
        walletOverride ?? anchorWallet ?? createReadOnlyWallet(),
        AnchorProvider.defaultOptions(),
      );

      return createFlowPayProgram(
        provider,
        FLOWPAY_PROGRAM_ID,
      ) as FlowPayProgram;
    },
    [anchorWallet, connection],
  );

  const fetchChainSnapshot = useCallback(async (): Promise<ChainSnapshot> => {
    const program = getProgram();
    const config = await program.account.platformConfig.fetch(getConfigPda());
    const poolAddress = getPoolPda(BigInt(poolId));
    const pool = await program.account.invoicePool.fetch(poolAddress);

    let investment: InvestmentAccount | null = null;
    let claimable = new BN(0);

    if (publicKey) {
      try {
        investment = await program.account.investment.fetch(
          getInvestmentPda(poolAddress, publicKey),
        );
        const netRepaid = pool.repaidAmount.sub(pool.feeOwedAmount);
        const entitlement = netRepaid
          .mul(investment.amount)
          .div(pool.advanceAmount);
        claimable = entitlement.sub(investment.claimedAmount);
        if (claimable.isNeg()) {
          claimable = new BN(0);
        }
      } catch {
        investment = null;
      }
    }

    return {
      config,
      poolAddress,
      pool,
      claimable,
      investment,
      statusLabel: decodeStatus(pool.status),
    };
  }, [getProgram, poolId, publicKey]);

  const applyChainSnapshot = useCallback(
    (snapshot: ChainSnapshot) => {
      setChainSnapshot(snapshot);
      setRiskScore(String(snapshot.pool.riskScore));
      setServicingValue(String(snapshot.pool.servicingStatus));
      setMetadataUri(
        snapshot.pool.metadataUri || `ipfs://invox-demo-pool-${poolId}`,
      );
    },
    [poolId],
  );

  async function ensureTokenAccount(
    usdcMint: PublicKey,
    owner: PublicKey,
    payer: PublicKey,
  ) {
    const ata = getAssociatedTokenAddressSync(usdcMint, owner);

    try {
      await getAccount(connection, ata);
      return ata;
    } catch {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(payer, ata, owner, usdcMint),
      );
      const ataSignature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(ataSignature, "confirmed");
      return ata;
    }
  }

  const refreshChainSnapshot = useCallback(async () => {
    try {
      const snapshot = await fetchChainSnapshot();
      applyChainSnapshot(snapshot);
    } catch {
      setChainSnapshot(null);
    }
  }, [applyChainSnapshot, fetchChainSnapshot]);

  useEffect(() => {
    let isCurrent = true;

    async function loadChainSnapshot() {
      try {
        const snapshot = await fetchChainSnapshot();
        if (isCurrent) {
          applyChainSnapshot(snapshot);
        }
      } catch {
        if (isCurrent) {
          setChainSnapshot(null);
        }
      }
    }

    void loadChainSnapshot();

    return () => {
      isCurrent = false;
    };
  }, [applyChainSnapshot, fetchChainSnapshot]);

  async function runAction(
    label: string,
    callback: (snapshot: ChainSnapshot) => Promise<string>,
  ) {
    if (!connected || !anchorWallet || !publicKey) {
      setFeedback("Connect your wallet before running this action.");
      return;
    }

    setSubmittingAction(label);
    setFeedback(null);
    setSignature(null);

    try {
      const snapshot = await fetchChainSnapshot();
      applyChainSnapshot(snapshot);

      const txSignature = await callback(snapshot);
      await connection.confirmTransaction(txSignature, "confirmed");
      await refreshChainSnapshot();
      setSignature(txSignature);
      setFeedback(`${label} transaction submitted and confirmed.`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setFeedback(`${label} failed: ${message}`);
    } finally {
      setSubmittingAction(null);
    }
  }

  async function handleInvest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!parsedInvestAmount || parsedInvestAmount.lte(new BN(0))) {
      setFeedback(
        "Enter a valid USDC amount. Decimals are supported up to 6 places.",
      );
      return;
    }

    if (!isFundingOpen) {
      setFeedback("This pool is not currently open for funding.");
      return;
    }

    await runAction("Investment", async (snapshot) => {
      const investorTokenAccount = await ensureTokenAccount(
        snapshot.config.usdcMint,
        publicKey!,
        publicKey!,
      );

      return getProgram(anchorWallet)
        .methods.invest(parsedInvestAmount)
        .accountsPartial({
          investor: publicKey!,
          config: getConfigPda(),
          pool: snapshot.poolAddress,
          investment: getInvestmentPda(snapshot.poolAddress, publicKey!),
          investorTokenAccount,
          vault: snapshot.pool.vault,
          usdcMint: snapshot.pool.usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    });
  }

  async function handleClaim() {
    await runAction("Claim", async (snapshot) => {
      if (!snapshot.investment || snapshot.claimable.lte(new BN(0))) {
        throw new Error("There is no claimable repayment available right now.");
      }

      const investorTokenAccount = await ensureTokenAccount(
        snapshot.config.usdcMint,
        publicKey!,
        publicKey!,
      );

      return getProgram(anchorWallet)
        .methods.claim()
        .accountsPartial({
          investor: publicKey!,
          config: getConfigPda(),
          pool: snapshot.poolAddress,
          investment: getInvestmentPda(snapshot.poolAddress, publicKey!),
          vault: snapshot.pool.vault,
          vaultAuthority: getVaultAuthorityPda(snapshot.poolAddress),
          investorTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    });
  }

  async function handleAdvance() {
    await runAction("Advance", async (snapshot) => {
      const issuerTokenAccount = await ensureTokenAccount(
        snapshot.config.usdcMint,
        snapshot.pool.issuer,
        publicKey!,
      );

      return getProgram(anchorWallet)
        .methods.advanceToIssuer()
        .accountsPartial({
          authority: publicKey!,
          config: getConfigPda(),
          pool: snapshot.poolAddress,
          vault: snapshot.pool.vault,
          vaultAuthority: getVaultAuthorityPda(snapshot.poolAddress),
          issuerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    });
  }

  async function handleRepay() {
    if (!parsedRepayAmount || parsedRepayAmount.lte(new BN(0))) {
      setFeedback("Enter a valid repayment amount.");
      return;
    }

    await runAction("Repayment", async (snapshot) => {
      const payerTokenAccount = await ensureTokenAccount(
        snapshot.config.usdcMint,
        publicKey!,
        publicKey!,
      );

      return getProgram(anchorWallet)
        .methods.repay(parsedRepayAmount)
        .accountsPartial({
          authority: publicKey!,
          config: getConfigPda(),
          pool: snapshot.poolAddress,
          payerTokenAccount,
          vault: snapshot.pool.vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    });
  }

  async function handleServicingUpdate() {
    const parsedRiskScore = Number(riskScore);
    const parsedServicing = Number(servicingValue);

    if (
      !Number.isInteger(parsedRiskScore) ||
      parsedRiskScore < 0 ||
      parsedRiskScore > 100
    ) {
      setFeedback("Risk score must be an integer between 0 and 100.");
      return;
    }

    await runAction("Servicing update", async (snapshot) =>
      getProgram(anchorWallet)
        .methods.updatePoolServicing(
          parsedRiskScore,
          parsedServicing,
          metadataUri,
        )
        .accountsPartial({
          authority: publicKey!,
          config: getConfigPda(),
          pool: snapshot.poolAddress,
        })
        .rpc(),
    );
  }

  async function handleDefault() {
    await runAction("Default update", async (snapshot) =>
      getProgram(anchorWallet)
        .methods.markDefaulted()
        .accountsPartial({
          authority: publicKey!,
          config: getConfigPda(),
          pool: snapshot.poolAddress,
        })
        .rpc(),
    );
  }

  const chainStatusLabel = chainSnapshot?.statusLabel ?? status;
  const claimableLabel = chainSnapshot
    ? formatBnUsdc(chainSnapshot.claimable)
    : "$0";
  const fundingLabel = chainSnapshot
    ? `${chainSnapshot.pool.fundedAmount.mul(new BN(100)).div(chainSnapshot.pool.advanceAmount).toString()}%`
    : `${fundedPct}%`;

  return (
    <div className="space-y-6">
      <div className="stat-card stat-card--lavender">
        <p className="eyebrow">Invest panel</p>
        <h2 className="mt-8 text-3xl font-semibold">Commit USDC</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
          On-chain status {chainStatusLabel} · expected settlement in {dueLabel}
          .
        </p>
        <div className="mt-6 h-3 rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[linear-gradient(135deg,#5f72dd,#7287ff)]"
            style={{ width: fundingLabel }}
          />
        </div>
        <form
          className="mt-6 rounded-[1.5rem] bg-white/74 p-4"
          onSubmit={handleInvest}
        >
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
          <button
            className="btn-primary mt-4 w-full"
            disabled={submittingAction !== null}
          >
            {submittingAction === "Investment"
              ? "Submitting transaction..."
              : "Invest with Solana wallet"}
          </button>
        </form>
      </div>

      <div className="soft-card p-6">
        <p className="eyebrow">Claim</p>
        <div className="mt-4 rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--ink-500)]">
                Currently claimable
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ink-900)]">
                {claimableLabel}
              </p>
            </div>
            <button
              className="btn-secondary"
              disabled={submittingAction !== null}
              onClick={handleClaim}
            >
              {submittingAction === "Claim" ? "Claiming..." : "Claim repayment"}
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">
            Connect the investor wallet to calculate and withdraw the currently
            available pro-rata repayment.
          </p>
        </div>
      </div>

      <div className="soft-card p-6">
        <p className="eyebrow">Admin actions</p>
        <div className="mt-4 space-y-4">
          <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--ink-900)]">
                  Advance to issuer
                </p>
                <p className="mt-1 text-sm text-[var(--ink-500)]">
                  Transfer the funded advance amount from vault to issuer ATA.
                </p>
              </div>
              <button
                className="btn-secondary"
                disabled={submittingAction !== null}
                onClick={handleAdvance}
              >
                {submittingAction === "Advance" ? "Advancing..." : "Advance"}
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--ink-900)]">
              Repay from originator
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                className="h-12 flex-1 rounded-2xl border border-[var(--line)] bg-white px-4 outline-none"
                value={repayAmount}
                onChange={(event) => setRepayAmount(event.target.value)}
                inputMode="decimal"
                placeholder="500"
              />
              <button
                className="btn-secondary"
                disabled={submittingAction !== null}
                onClick={handleRepay}
              >
                {submittingAction === "Repayment" ? "Repaying..." : "Repay"}
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--ink-900)]">
              Update servicing
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 outline-none"
                value={riskScore}
                onChange={(event) => setRiskScore(event.target.value)}
                inputMode="numeric"
                placeholder="Risk score"
              />
              <select
                className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 outline-none"
                value={servicingValue}
                onChange={(event) => setServicingValue(event.target.value)}
              >
                <option value="0">Active</option>
                <option value="1">Disputed</option>
                <option value="2">Impaired</option>
              </select>
              <input
                className="h-12 rounded-2xl border border-[var(--line)] bg-white px-4 outline-none sm:col-span-2"
                value={metadataUri}
                onChange={(event) => setMetadataUri(event.target.value)}
                placeholder="Metadata URI"
              />
            </div>
            <button
              className="btn-secondary mt-3"
              disabled={submittingAction !== null}
              onClick={handleServicingUpdate}
            >
              {submittingAction === "Servicing update"
                ? "Updating..."
                : "Update servicing"}
            </button>
            <p className="mt-2 text-xs text-[var(--ink-500)]">
              Current on-chain servicing:{" "}
              {chainSnapshot
                ? (SERVICING_VALUE_TO_LABEL[
                    chainSnapshot.pool.servicingStatus as 0 | 1 | 2
                  ] ?? "Unknown")
                : servicingStatus}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[var(--surface-soft)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--ink-900)]">
                  Mark defaulted
                </p>
                <p className="mt-1 text-sm text-[var(--ink-500)]">
                  Allowed only after due date and only for Advanced /
                  PartiallyRepaid pools.
                </p>
              </div>
              <button
                className="btn-secondary"
                disabled={submittingAction !== null}
                onClick={handleDefault}
              >
                {submittingAction === "Default update"
                  ? "Updating..."
                  : "Mark defaulted"}
              </button>
            </div>
          </div>
        </div>

        {feedback ? (
          <p className="mt-4 text-sm leading-6 text-[var(--ink-600)]">
            {feedback}
          </p>
        ) : null}
        {signature ? (
          <p className="mt-2 break-all text-xs text-[var(--ink-500)]">
            Tx signature: {signature}
          </p>
        ) : null}
      </div>
    </div>
  );
}
