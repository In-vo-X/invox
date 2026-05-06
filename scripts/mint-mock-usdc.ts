import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";

async function main() {
  const mintArg = process.argv[2];
  const recipientArg = process.argv[3];

  if (!mintArg || !recipientArg) {
    throw new Error("Usage: tsx scripts/mint-mock-usdc.ts <mint> <recipient>");
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const authority = Keypair.generate();
  const mint = new PublicKey(mintArg);
  const recipient = new PublicKey(recipientArg);

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    authority,
    mint,
    recipient,
  );
  const signature = await mintTo(
    connection,
    authority,
    mint,
    ata.address,
    authority,
    10_000_000_000,
  );
  console.log(signature);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
