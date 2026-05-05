import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("EjfVxrCATPwhbEKEcMAamkZaMabRaYStprDmAFu5TQFB");

const encodeU64 = (value: bigint) => {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(value);
  return out;
};

export const getConfigPda = () => PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM_ID)[0];
export const getPoolPda = (poolId: bigint) =>
  PublicKey.findProgramAddressSync([Buffer.from("pool"), encodeU64(poolId)], PROGRAM_ID)[0];
export const getVaultAuthorityPda = (pool: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("vault_authority"), pool.toBuffer()], PROGRAM_ID)[0];
export const getInvestmentPda = (pool: PublicKey, investor: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("investment"), pool.toBuffer(), investor.toBuffer()], PROGRAM_ID)[0];

export { PROGRAM_ID };
