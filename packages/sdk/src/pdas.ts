import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "EjfVxrCATPwhbEKEcMAamkZaMabRaYStprDmAFu5TQFB",
);

const encodeU64 = (value: bigint) => {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(value);
  return out;
};

export const getConfigPda = (programId: PublicKey = PROGRAM_ID) =>
  PublicKey.findProgramAddressSync([Buffer.from("config")], programId)[0];
export const getPoolPda = (poolId: bigint, programId: PublicKey = PROGRAM_ID) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), encodeU64(poolId)],
    programId,
  )[0];
export const getVaultAuthorityPda = (
  pool: PublicKey,
  programId: PublicKey = PROGRAM_ID,
) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), pool.toBuffer()],
    programId,
  )[0];
export const getInvestmentPda = (
  pool: PublicKey,
  investor: PublicKey,
  programId: PublicKey = PROGRAM_ID,
) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("investment"), pool.toBuffer(), investor.toBuffer()],
    programId,
  )[0];

export { PROGRAM_ID };
