import { PublicKey } from "@solana/web3.js";
import { FLOWPAY_PROGRAM_ID } from "@/lib/constants";

const encodeU64 = (value: bigint) => {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(value);
  return out;
};

export function getConfigPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], FLOWPAY_PROGRAM_ID)[0];
}

export function getPoolPda(poolId: bigint) {
  return PublicKey.findProgramAddressSync([Buffer.from("pool"), encodeU64(poolId)], FLOWPAY_PROGRAM_ID)[0];
}

export function getVaultAuthorityPda(pool: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("vault_authority"), pool.toBuffer()], FLOWPAY_PROGRAM_ID)[0];
}

export function getInvestmentPda(pool: PublicKey, investor: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("investment"), pool.toBuffer(), investor.toBuffer()],
    FLOWPAY_PROGRAM_ID,
  )[0];
}
