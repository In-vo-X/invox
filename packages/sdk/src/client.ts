import { AnchorProvider, BN, Program } from "@anchor-lang/core";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "./flowpay-idl.json";
import { getConfigPda, getInvestmentPda, getPoolPda, getVaultAuthorityPda, PROGRAM_ID } from "./pdas";
import type {
  AdvanceToIssuerParams,
  ClaimParams,
  CollectFeeParams,
  CreatePoolParams,
  InvestParams,
  PoolActionParams,
  RepayParams,
  UpdatePoolServicingParams,
  WithdrawCancelledParams,
} from "./types";

export type WalletLike = AnchorProvider["wallet"];

type RpcBuilder = {
  rpc(): Promise<string>;
  signers(signers: unknown[]): RpcBuilder;
};

type MethodBuilder = {
  accountsPartial(accounts: Record<string, unknown>): RpcBuilder;
};

type ProgramMethod = (...args: unknown[]) => MethodBuilder;

const toPublicKey = (value: string | PublicKey) => (value instanceof PublicKey ? value : new PublicKey(value));
const toBn = (value: bigint) => new BN(value.toString());

export function createFlowPayClient(
  connection: Connection,
  wallet: WalletLike,
  programId: PublicKey = PROGRAM_ID,
) {
  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  void programId;
  const program = new Program(idl as never, provider);
  const methods = program.methods as unknown as Record<string, ProgramMethod>;
  const accounts = program.account as Record<
    string,
    {
      fetch(address: PublicKey): Promise<unknown>;
      all(): Promise<unknown[]>;
    }
  >;

  const getPoolAccounts = (poolId: bigint) => {
    const pool = getPoolPda(poolId);
    const vaultAuthority = getVaultAuthorityPda(pool);
    return { pool, vaultAuthority };
  };

  return {
    provider,
    program,
    getPlatformConfig: async () => accounts.platformConfig.fetch(getConfigPda()),
    getPool: async (poolId: bigint) => accounts.invoicePool.fetch(getPoolPda(poolId)),
    getPools: async () => accounts.invoicePool.all(),
    createPool: async (params: CreatePoolParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const usdcMint = toPublicKey((await accounts.platformConfig.fetch(getConfigPda()) as { usdcMint: PublicKey }).usdcMint);
      const vault = getAssociatedTokenAddressSync(usdcMint, vaultAuthority, true);

      return methods.createPool(
        toBn(params.invoiceFaceValue),
        toBn(params.advanceAmount),
        toBn(params.dueTs),
        params.riskScore,
        params.legalAssetHash,
        params.metadataUri,
      ).accountsPartial({
        authority: provider.wallet.publicKey,
        issuer: toPublicKey(params.issuer),
        originator: toPublicKey(params.originator),
        spv: toPublicKey(params.spv),
        config: getConfigPda(),
        pool,
        vaultAuthority,
        vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }).rpc();
    },
    updatePoolServicing: async (params: UpdatePoolServicingParams) =>
      methods.updatePoolServicing(params.riskScore, params.servicingStatus, params.metadataUri).accountsPartial({
        authority: provider.wallet.publicKey,
        config: getConfigPda(),
        pool: getPoolPda(params.poolId),
      }).rpc(),
    invest: async (params: InvestParams) => {
      const pool = getPoolPda(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool) as { usdcMint: PublicKey; vault: PublicKey };
      return methods.invest(toBn(params.amount)).accountsPartial({
        investor: toPublicKey(params.investor),
        config: getConfigPda(),
        pool,
        investment: getInvestmentPda(pool, toPublicKey(params.investor)),
        investorTokenAccount: toPublicKey(params.investorTokenAccount),
        vault: poolAccount.vault,
        usdcMint: poolAccount.usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }).rpc();
    },
    advanceToIssuer: async (params: AdvanceToIssuerParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool) as { vault: PublicKey };
      return methods.advanceToIssuer().accountsPartial({
        authority: provider.wallet.publicKey,
        config: getConfigPda(),
        pool,
        vault: poolAccount.vault,
        vaultAuthority,
        issuerTokenAccount: toPublicKey(params.issuerTokenAccount),
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc();
    },
    markDefaulted: async (params: PoolActionParams) =>
      methods.markDefaulted().accountsPartial({
        authority: provider.wallet.publicKey,
        config: getConfigPda(),
        pool: getPoolPda(params.poolId),
      }).rpc(),
    repay: async (params: RepayParams) => {
      const pool = getPoolPda(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool) as { vault: PublicKey };
      return methods.repay(toBn(params.amount)).accountsPartial({
        authority: provider.wallet.publicKey,
        config: getConfigPda(),
        pool,
        payerTokenAccount: toPublicKey(params.payerTokenAccount),
        vault: poolAccount.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc();
    },
    collectFee: async (params: CollectFeeParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool) as { vault: PublicKey };
      return methods.collectFee().accountsPartial({
        authority: provider.wallet.publicKey,
        config: getConfigPda(),
        pool,
        vault: poolAccount.vault,
        vaultAuthority,
        treasury: toPublicKey(params.treasury),
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc();
    },
    claim: async (params: ClaimParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool) as { vault: PublicKey };
      const investor = toPublicKey(params.investor);
      return methods.claim().accountsPartial({
        investor,
        config: getConfigPda(),
        pool,
        investment: getInvestmentPda(pool, investor),
        vault: poolAccount.vault,
        vaultAuthority,
        investorTokenAccount: toPublicKey(params.investorTokenAccount),
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc();
    },
    withdrawCancelled: async (params: WithdrawCancelledParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool) as { vault: PublicKey };
      const investor = toPublicKey(params.investor);
      return methods.withdrawCancelled().accountsPartial({
        investor,
        pool,
        investment: getInvestmentPda(pool, investor),
        vault: poolAccount.vault,
        vaultAuthority,
        investorTokenAccount: toPublicKey(params.investorTokenAccount),
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc();
    },
    cancelPool: async (params: PoolActionParams) =>
      methods.cancelPool().accountsPartial({
        authority: provider.wallet.publicKey,
        config: getConfigPda(),
        pool: getPoolPda(params.poolId),
      }).rpc(),
  };
}
