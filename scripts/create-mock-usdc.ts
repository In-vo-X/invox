import { createMint } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const authority = Keypair.generate();
  console.log(
    "Create and fund this mint authority before use:",
    authority.publicKey.toBase58(),
  );
  const mint = await createMint(
    connection,
    authority,
    authority.publicKey,
    null,
    6,
  );
  console.log("Mock USDC mint:", mint.toBase58());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
