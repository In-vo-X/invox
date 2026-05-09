import { AnchorProvider, BN, Program } from "@anchor-lang/core";
import type { Idl } from "@anchor-lang/core";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "./flowpay-idl.json";
import {
  getConfigPda,
  getInvestmentPda,
  getPoolPda,
  getVaultAuthorityPda,
  PROGRAM_ID,
} from "./pdas";
import type {
  AdvanceToIssuerParams,
  ClaimParams,
  CollectFeeParams,
  CreatePoolResult,
  CreatePoolParams,
  InitializePlatformParams,
  InvestParams,
  LegalAssetHash,
  PoolActionParams,
  RepayParams,
  SetPauseParams,
  UpdateAdminParams,
  UpdateFeeBpsParams,
  UpdatePoolServicingParams,
  UpdateTreasuryParams,
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

type ProgramMethod<TArgs extends readonly unknown[] = readonly unknown[]> = (
  ...args: TArgs
) => MethodBuilder;

type PlatformConfigAccount = {
  usdcMint: PublicKey;
  nextPoolId: BN | bigint | number | string;
};

type InvoicePoolAccount = {
  usdcMint: PublicKey;
  vault: PublicKey;
};

type AccountClient<TAccount> = {
  fetch(address: PublicKey): Promise<TAccount>;
  all(): Promise<TAccount[]>;
};

type FlowPayMethods = {
  initializePlatform: ProgramMethod<[number]>;
  createPool: ProgramMethod<[BN, BN, BN, number, number[], string]>;
  updatePoolServicing: ProgramMethod<[number, number, string]>;
  setPause: ProgramMethod<[boolean]>;
  updateAdmin: ProgramMethod<[PublicKey]>;
  updateTreasury: ProgramMethod<[]>;
  updateFeeBps: ProgramMethod<[number]>;
  invest: ProgramMethod<[BN]>;
  advanceToIssuer: ProgramMethod<[]>;
  markDefaulted: ProgramMethod<[]>;
  repay: ProgramMethod<[BN]>;
  collectFee: ProgramMethod<[]>;
  claim: ProgramMethod<[]>;
  withdrawCancelled: ProgramMethod<[]>;
  cancelPool: ProgramMethod<[]>;
};

type FlowPayProgram = Program & {
  methods: FlowPayMethods;
  account: {
    platformConfig: AccountClient<PlatformConfigAccount>;
    invoicePool: AccountClient<InvoicePoolAccount>;
  };
};

const toPublicKey = (value: string | PublicKey) =>
  value instanceof PublicKey ? value : new PublicKey(value);
const toBn = (value: bigint) => new BN(value.toString());
const toBigIntValue = (value: BN | bigint | number | string) =>
  BigInt(value.toString());

const toLegalAssetHash = (value: LegalAssetHash) => {
  const bytes = Array.from(value);

  if (bytes.length !== 32) {
    throw new RangeError("legalAssetHash must contain exactly 32 bytes");
  }

  for (const byte of bytes) {
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
      throw new RangeError(
        "legalAssetHash bytes must be integers between 0 and 255",
      );
    }
  }

  return bytes;
};

export function createFlowPayClient(
  connection: Connection,
  wallet: WalletLike,
  programId: PublicKey = PROGRAM_ID,
) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions(),
  );
  const configPda = getConfigPda(programId);
  const flowPayIdl = { ...idl, address: programId.toBase58() } as Idl;
  const program = new Program(flowPayIdl, provider) as FlowPayProgram;
  const { methods, account: accounts } = program;

  const getPoolAccounts = (poolId: bigint) => {
    const pool = getPoolPda(poolId, programId);
    const vaultAuthority = getVaultAuthorityPda(pool, programId);
    return { pool, vaultAuthority };
  };

  return {
    provider,
    program,
    initializePlatform: async (params: InitializePlatformParams) =>
      methods
        .initializePlatform(params.feeBps)
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
          usdcMint: toPublicKey(params.usdcMint),
          treasury: toPublicKey(params.treasury),
          systemProgram: SystemProgram.programId,
        })
        .rpc(),
    getPlatformConfig: async () => accounts.platformConfig.fetch(configPda),
    getPool: async (poolId: bigint) =>
      accounts.invoicePool.fetch(getPoolPda(poolId, programId)),
    getPools: async () => accounts.invoicePool.all(),
    createPool: async (params: CreatePoolParams): Promise<CreatePoolResult> => {
      const config = await accounts.platformConfig.fetch(configPda);
      const poolId = toBigIntValue(config.nextPoolId);
      const { pool, vaultAuthority } = getPoolAccounts(poolId);
      const usdcMint = toPublicKey(config.usdcMint);
      const vault = getAssociatedTokenAddressSync(
        usdcMint,
        vaultAuthority,
        true,
      );

      const signature = await methods
        .createPool(
          toBn(params.invoiceFaceValue),
          toBn(params.advanceAmount),
          toBn(params.dueTs),
          params.riskScore,
          toLegalAssetHash(params.legalAssetHash),
          params.metadataUri,
        )
        .accountsPartial({
          authority: provider.wallet.publicKey,
          issuer: toPublicKey(params.issuer),
          originator: toPublicKey(params.originator),
          spv: toPublicKey(params.spv),
          config: configPda,
          pool,
          vaultAuthority,
          vault,
          usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature, poolId, pool: pool.toBase58() };
    },
    updatePoolServicing: async (params: UpdatePoolServicingParams) =>
      methods
        .updatePoolServicing(
          params.riskScore,
          params.servicingStatus,
          params.metadataUri,
        )
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: getPoolPda(params.poolId, programId),
        })
        .rpc(),
    setPause: async (params: SetPauseParams) =>
      methods
        .setPause(params.paused)
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
        })
        .rpc(),
    updateAdmin: async (params: UpdateAdminParams) =>
      methods
        .updateAdmin(toPublicKey(params.newAdmin))
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
        })
        .rpc(),
    updateTreasury: async (params: UpdateTreasuryParams) =>
      methods
        .updateTreasury()
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
          treasury: toPublicKey(params.treasury),
        })
        .rpc(),
    updateFeeBps: async (params: UpdateFeeBpsParams) =>
      methods
        .updateFeeBps(params.newFeeBps)
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
        })
        .rpc(),
    invest: async (params: InvestParams) => {
      const pool = getPoolPda(params.poolId, programId);
      const poolAccount = await accounts.invoicePool.fetch(pool);
      const investor = toPublicKey(params.investor);
      return methods
        .invest(toBn(params.amount))
        .accountsPartial({
          investor,
          config: configPda,
          pool,
          investment: getInvestmentPda(pool, investor, programId),
          investorTokenAccount: toPublicKey(params.investorTokenAccount),
          vault: poolAccount.vault,
          usdcMint: poolAccount.usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    advanceToIssuer: async (params: AdvanceToIssuerParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool);
      return methods
        .advanceToIssuer()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool,
          vault: poolAccount.vault,
          vaultAuthority,
          issuerTokenAccount: toPublicKey(params.issuerTokenAccount),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    markDefaulted: async (params: PoolActionParams) =>
      methods
        .markDefaulted()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: getPoolPda(params.poolId, programId),
        })
        .rpc(),
    repay: async (params: RepayParams) => {
      const pool = getPoolPda(params.poolId, programId);
      const poolAccount = await accounts.invoicePool.fetch(pool);
      return methods
        .repay(toBn(params.amount))
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool,
          payerTokenAccount: toPublicKey(params.payerTokenAccount),
          vault: poolAccount.vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    collectFee: async (params: CollectFeeParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool);
      return methods
        .collectFee()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool,
          vault: poolAccount.vault,
          vaultAuthority,
          treasury: toPublicKey(params.treasury),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    claim: async (params: ClaimParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool);
      const investor = toPublicKey(params.investor);
      return methods
        .claim()
        .accountsPartial({
          investor,
          config: configPda,
          pool,
          investment: getInvestmentPda(pool, investor, programId),
          vault: poolAccount.vault,
          vaultAuthority,
          investorTokenAccount: toPublicKey(params.investorTokenAccount),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    withdrawCancelled: async (params: WithdrawCancelledParams) => {
      const { pool, vaultAuthority } = getPoolAccounts(params.poolId);
      const poolAccount = await accounts.invoicePool.fetch(pool);
      const investor = toPublicKey(params.investor);
      return methods
        .withdrawCancelled()
        .accountsPartial({
          investor,
          pool,
          investment: getInvestmentPda(pool, investor, programId),
          vault: poolAccount.vault,
          vaultAuthority,
          investorTokenAccount: toPublicKey(params.investorTokenAccount),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    },
    cancelPool: async (params: PoolActionParams) =>
      methods
        .cancelPool()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: getPoolPda(params.poolId, programId),
        })
        .rpc(),
  };
}
