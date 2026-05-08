import fs from "fs";
import anchorPkg from "@anchor-lang/core";
import * as web3Pkg from "@solana/web3.js";
import * as splPkg from "@solana/spl-token";

const { AnchorProvider, Program, BN } = anchorPkg;
const { Connection, Keypair, PublicKey, SystemProgram } = web3Pkg;
const {
  createMint,
  createAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  getAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} = splPkg;

const idl = JSON.parse(fs.readFileSync("./target/idl/flowpay.json", "utf8"));
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const programId = new PublicKey(
  process.env.FLOWPAY_LOCAL_PROGRAM_ID ??
    "2uuzUgT7cghDjZ5izW3Ab9EZnmBVUrDhZruZduVG44jY",
);

function walletFrom(keypair) {
  return {
    publicKey: keypair.publicKey,
    async signTransaction(transaction) {
      transaction.partialSign(keypair);
      return transaction;
    },
    async signAllTransactions(transactions) {
      transactions.forEach((transaction) => transaction.partialSign(keypair));
      return transactions;
    },
  };
}

function providerFrom(keypair) {
  return new AnchorProvider(
    connection,
    walletFrom(keypair),
    AnchorProvider.defaultOptions(),
  );
}

function programFrom(keypair) {
  return new Program({ ...idl, address: programId.toBase58() }, providerFrom(keypair));
}

function getConfigPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], programId)[0];
}

function getPoolPda(poolId) {
  const seed = new BN(poolId.toString()).toArrayLike(Buffer, "le", 8);
  return PublicKey.findProgramAddressSync([Buffer.from("pool"), seed], programId)[0];
}

function getInvestmentPda(pool, investor) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("investment"), pool.toBuffer(), investor.toBuffer()],
    programId,
  )[0];
}

function getVaultAuthorityPda(pool) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), pool.toBuffer()],
    programId,
  )[0];
}

function decodeStatus(status) {
  if (typeof status === "string") {
    return status;
  }
  return Object.keys(status)[0];
}

async function airdrop(publicKey, sol = 5) {
  const signature = await connection.requestAirdrop(publicKey, sol * 1_000_000_000);
  await connection.confirmTransaction(signature, "confirmed");
}

async function main() {
  const admin = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync("/tmp/invox-local-id.json", "utf8"))),
  );

  const issuer = Keypair.generate();
  const originator = Keypair.generate();
  const spv = Keypair.generate();
  const investor = Keypair.generate();

  await airdrop(originator.publicKey, 5);
  await airdrop(investor.publicKey, 5);

  const usdcMint = await createMint(connection, admin, admin.publicKey, null, 6);
  const treasury = await createAssociatedTokenAccount(
    connection,
    admin,
    usdcMint,
    admin.publicKey,
  );
  const investorAta = await createAssociatedTokenAccount(
    connection,
    admin,
    usdcMint,
    investor.publicKey,
  );
  const issuerAta = await createAssociatedTokenAccount(
    connection,
    admin,
    usdcMint,
    issuer.publicKey,
  );
  const originatorAta = await createAssociatedTokenAccount(
    connection,
    admin,
    usdcMint,
    originator.publicKey,
  );

  const adminProgram = programFrom(admin);
  const config = getConfigPda();
  const initializeSignature = await adminProgram.methods
    .initializePlatform(100)
    .accountsPartial({
      admin: admin.publicKey,
      config,
      usdcMint,
      treasury,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  await connection.confirmTransaction(initializeSignature, "confirmed");

  const poolId = 0n;
  const pool = getPoolPda(poolId);
  const vaultAuthority = getVaultAuthorityPda(pool);
  const vault = getAssociatedTokenAddressSync(usdcMint, vaultAuthority, true);

  const createSignature = await adminProgram.methods
    .createPool(
      new BN("1000000000"),
      new BN("800000000"),
      new BN(Math.floor(Date.now() / 1000) + 3600),
      72,
      Array(32).fill(7),
      "ipfs://local-test-pool",
    )
    .accountsPartial({
      authority: admin.publicKey,
      issuer: issuer.publicKey,
      originator: originator.publicKey,
      spv: spv.publicKey,
      config,
      pool,
      vaultAuthority,
      vault,
      usdcMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  await connection.confirmTransaction(createSignature, "confirmed");

  await mintTo(connection, admin, usdcMint, investorAta, admin, 800_000_000);
  await mintTo(connection, admin, usdcMint, originatorAta, admin, 1_000_000_000);

  const investorProgram = programFrom(investor);
  const investment = getInvestmentPda(pool, investor.publicKey);
  const investSignature = await investorProgram.methods
    .invest(new BN("800000000"))
    .accountsPartial({
      investor: investor.publicKey,
      config,
      pool,
      investment,
      investorTokenAccount: investorAta,
      vault,
      usdcMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  await connection.confirmTransaction(investSignature, "confirmed");

  const advanceSignature = await adminProgram.methods
    .advanceToIssuer()
    .accountsPartial({
      authority: admin.publicKey,
      config,
      pool,
      vault,
      vaultAuthority,
      issuerTokenAccount: issuerAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  await connection.confirmTransaction(advanceSignature, "confirmed");

  const originatorProgram = programFrom(originator);
  const repaySignature = await originatorProgram.methods
    .repay(new BN("1000000000"))
    .accountsPartial({
      authority: originator.publicKey,
      config,
      pool,
      payerTokenAccount: originatorAta,
      vault,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  await connection.confirmTransaction(repaySignature, "confirmed");

  const beforePool = await adminProgram.account.invoicePool.fetch(pool);
  const beforeInvestment = await adminProgram.account.investment.fetch(investment);

  const claimSignature = await investorProgram.methods
    .claim()
    .accountsPartial({
      investor: investor.publicKey,
      config,
      pool,
      investment,
      vault,
      vaultAuthority,
      investorTokenAccount: investorAta,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  await connection.confirmTransaction(claimSignature, "confirmed");

  const afterPool = await adminProgram.account.invoicePool.fetch(pool);
  const afterInvestment = await adminProgram.account.investment.fetch(investment);
  const claimTransaction = await connection.getTransaction(claimSignature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  const investorToken = await getAccount(connection, investorAta);
  const issuerToken = await getAccount(connection, issuerAta);
  const originatorToken = await getAccount(connection, originatorAta);
  const vaultToken = await getAccount(connection, vault);

  console.log(
    JSON.stringify(
      {
        programId: programId.toBase58(),
        config: config.toBase58(),
        pool: pool.toBase58(),
        investor: investor.publicKey.toBase58(),
        issuer: issuer.publicKey.toBase58(),
        originator: originator.publicKey.toBase58(),
        signatures: {
          initialize: initializeSignature,
          createPool: createSignature,
          invest: investSignature,
          advance: advanceSignature,
          repay: repaySignature,
          claim: claimSignature,
        },
        beforeClaim: {
          poolStatus: decodeStatus(beforePool.status),
          poolClaimedAmount: beforePool.claimedAmount.toString(),
          investmentClaimedAmount: beforeInvestment.claimedAmount.toString(),
        },
        afterClaim: {
          poolStatus: decodeStatus(afterPool.status),
          poolClaimedAmount: afterPool.claimedAmount.toString(),
          investmentClaimedAmount: afterInvestment.claimedAmount.toString(),
        },
        balances: {
          investorAta: investorToken.amount.toString(),
          issuerAta: issuerToken.amount.toString(),
          originatorAta: originatorToken.amount.toString(),
          vault: vaultToken.amount.toString(),
        },
        claimMetaErr: claimTransaction?.meta?.err ?? null,
        claimLogs: claimTransaction?.meta?.logMessages ?? [],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
