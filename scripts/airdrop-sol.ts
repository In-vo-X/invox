import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

async function main() {
  const pubkey = process.argv[2];
  if (!pubkey) {
    throw new Error("Usage: tsx scripts/airdrop-sol.ts <pubkey>");
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const signature = await connection.requestAirdrop(
    new PublicKey(pubkey),
    2_000_000_000,
  );
  await connection.confirmTransaction(signature, "confirmed");
  console.log(signature);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
