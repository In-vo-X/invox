import { AnchorProvider, Program } from "@anchor-lang/core";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./flowpay-idl.json";
import { getConfigPda, getPoolPda, PROGRAM_ID } from "./pdas";
import type { CreatePoolParams } from "./types";

export type WalletLike = AnchorProvider["wallet"];

export function createFlowPayClient(
  connection: Connection,
  wallet: WalletLike,
  programId: PublicKey = PROGRAM_ID,
) {
  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  void programId;
  const program = new Program(idl as never, provider);
  const accounts = program.account as Record<
    string,
    {
      fetch(address: PublicKey): Promise<unknown>;
      all(): Promise<unknown[]>;
    }
  >;

  return {
    provider,
    program,
    getPlatformConfig: async () => accounts.platformConfig.fetch(getConfigPda()),
    getPool: async (poolId: bigint) => accounts.invoicePool.fetch(getPoolPda(poolId)),
    getPools: async () => accounts.invoicePool.all(),
    createPool: async (params: CreatePoolParams) => ({ params, next: "wire account metas in UI" }),
  };
}
