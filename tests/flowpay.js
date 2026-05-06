const anchor = require("@anchor-lang/core");
const { BN } = anchor;
const {
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} = require("@solana/web3.js");
const { expect } = require("chai");

const CONFIG_SEED = Buffer.from("config");
const POOL_SEED = Buffer.from("pool");
const VAULT_AUTHORITY_SEED = Buffer.from("vault_authority");
const INVESTMENT_SEED = Buffer.from("investment");
const DECIMALS = 6;
const ONE_USDC = 10 ** DECIMALS;
const LEGAL_ASSET_HASH = Array.from(Buffer.alloc(32, 7));

const airdrop = async (provider, pubkey) => {
  const sig = await provider.connection.requestAirdrop(
    pubkey,
    2 * LAMPORTS_PER_SOL,
  );
  await provider.connection.confirmTransaction(sig, "confirmed");
};

describe("flowpay", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();
  const program = anchor.workspace.flowpay;
  const payer = provider.wallet.payer;

  let usdcMint;
  let treasuryAta;
  let issuerAta;
  let originatorAta;
  let adminAta;
  let investorOneAta;
  let investorTwoAta;

  const issuer = Keypair.generate();
  const originator = Keypair.generate();
  const spv = Keypair.generate();
  const treasuryOwner = Keypair.generate();
  const investorOne = Keypair.generate();
  const investorTwo = Keypair.generate();

  const [configPda] = PublicKey.findProgramAddressSync(
    [CONFIG_SEED],
    program.programId,
  );

  before(async () => {
    await Promise.all([
      airdrop(provider, issuer.publicKey),
      airdrop(provider, originator.publicKey),
      airdrop(provider, spv.publicKey),
      airdrop(provider, treasuryOwner.publicKey),
      airdrop(provider, investorOne.publicKey),
      airdrop(provider, investorTwo.publicKey),
    ]);

    usdcMint = await createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      null,
      DECIMALS,
    );
    treasuryAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        usdcMint,
        treasuryOwner.publicKey,
      )
    ).address;
    issuerAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        usdcMint,
        issuer.publicKey,
      )
    ).address;
    originatorAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        usdcMint,
        originator.publicKey,
      )
    ).address;
    adminAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        usdcMint,
        provider.wallet.publicKey,
      )
    ).address;
    investorOneAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        usdcMint,
        investorOne.publicKey,
      )
    ).address;
    investorTwoAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        usdcMint,
        investorTwo.publicKey,
      )
    ).address;

    await mintTo(
      provider.connection,
      payer,
      usdcMint,
      adminAta,
      payer,
      50_000 * ONE_USDC,
    );
    await mintTo(
      provider.connection,
      payer,
      usdcMint,
      originatorAta,
      payer,
      50_000 * ONE_USDC,
    );
    await mintTo(
      provider.connection,
      payer,
      usdcMint,
      investorOneAta,
      payer,
      20_000 * ONE_USDC,
    );
    await mintTo(
      provider.connection,
      payer,
      usdcMint,
      investorTwoAta,
      payer,
      20_000 * ONE_USDC,
    );
  });

  it("initializes the platform", async () => {
    await program.methods
      .initializePlatform(50)
      .accountsPartial({
        admin: provider.wallet.publicKey,
        config: configPda,
        usdcMint,
        treasury: treasuryAta,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.platformConfig.fetch(configPda);
    expect(config.admin.toBase58()).to.equal(
      provider.wallet.publicKey.toBase58(),
    );
    expect(config.usdcMint.toBase58()).to.equal(usdcMint.toBase58());
    expect(config.treasury.toBase58()).to.equal(treasuryAta.toBase58());
    expect(config.feeBps).to.equal(50);
  });

  it("creates, funds, advances, repays, collects fees, and claims", async () => {
    const poolId = new BN(0);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [POOL_SEED, poolId.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [VAULT_AUTHORITY_SEED, poolPda.toBuffer()],
      program.programId,
    );
    const vault = getAssociatedTokenAddressSync(usdcMint, vaultAuthority, true);

    await program.methods
      .createPool(
        new BN(10_000 * ONE_USDC),
        new BN(9_500 * ONE_USDC),
        new BN(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60),
        78,
        LEGAL_ASSET_HASH,
        "demo://pool-1",
      )
      .accountsPartial({
        authority: provider.wallet.publicKey,
        issuer: issuer.publicKey,
        originator: originator.publicKey,
        spv: spv.publicKey,
        config: configPda,
        pool: poolPda,
        vaultAuthority,
        vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    let pool = await program.account.invoicePool.fetch(poolPda);
    expect(pool.originator.toBase58()).to.equal(
      originator.publicKey.toBase58(),
    );
    expect(pool.spv.toBase58()).to.equal(spv.publicKey.toBase58());
    expect(pool.feeBps).to.equal(50);
    expect(pool.legalAssetHash).to.deep.equal(LEGAL_ASSET_HASH);

    await program.methods
      .updatePoolServicing(72, 1, "demo://pool-1-servicing")
      .accountsPartial({
        authority: originator.publicKey,
        config: configPda,
        pool: poolPda,
      })
      .signers([originator])
      .rpc();

    pool = await program.account.invoicePool.fetch(poolPda);
    expect(pool.riskScore).to.equal(72);
    expect(pool.servicingStatus).to.equal(1);
    expect(pool.metadataUri).to.equal("demo://pool-1-servicing");

    const [investmentOnePda] = PublicKey.findProgramAddressSync(
      [INVESTMENT_SEED, poolPda.toBuffer(), investorOne.publicKey.toBuffer()],
      program.programId,
    );
    const [investmentTwoPda] = PublicKey.findProgramAddressSync(
      [INVESTMENT_SEED, poolPda.toBuffer(), investorTwo.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .invest(new BN(4_000 * ONE_USDC))
      .accountsPartial({
        investor: investorOne.publicKey,
        config: configPda,
        pool: poolPda,
        investment: investmentOnePda,
        investorTokenAccount: investorOneAta,
        vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investorOne])
      .rpc();

    await program.methods
      .invest(new BN(5_500 * ONE_USDC))
      .accountsPartial({
        investor: investorTwo.publicKey,
        config: configPda,
        pool: poolPda,
        investment: investmentTwoPda,
        investorTokenAccount: investorTwoAta,
        vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investorTwo])
      .rpc();

    pool = await program.account.invoicePool.fetch(poolPda);
    expect(pool.status).to.deep.equal({ funded: {} });

    await program.methods
      .advanceToIssuer()
      .accountsPartial({
        authority: originator.publicKey,
        config: configPda,
        pool: poolPda,
        vault,
        vaultAuthority,
        issuerTokenAccount: issuerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([originator])
      .rpc();

    pool = await program.account.invoicePool.fetch(poolPda);
    expect(pool.status).to.deep.equal({ advanced: {} });

    const issuerBalance = await getAccount(provider.connection, issuerAta);
    expect(Number(issuerBalance.amount)).to.equal(9_500 * ONE_USDC);

    await program.methods
      .repay(new BN(10_000 * ONE_USDC))
      .accountsPartial({
        authority: originator.publicKey,
        config: configPda,
        pool: poolPda,
        payerTokenAccount: originatorAta,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([originator])
      .rpc();

    pool = await program.account.invoicePool.fetch(poolPda);
    expect(pool.status).to.deep.equal({ repaid: {} });

    await program.methods
      .collectFee()
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: poolPda,
        vault,
        vaultAuthority,
        treasury: treasuryAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const treasuryBalance = await getAccount(provider.connection, treasuryAta);
    expect(Number(treasuryBalance.amount)).to.equal(50 * ONE_USDC);

    await program.methods
      .claim()
      .accountsPartial({
        investor: investorOne.publicKey,
        config: configPda,
        pool: poolPda,
        investment: investmentOnePda,
        vault,
        vaultAuthority,
        investorTokenAccount: investorOneAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investorOne])
      .rpc();

    await program.methods
      .claim()
      .accountsPartial({
        investor: investorTwo.publicKey,
        config: configPda,
        pool: poolPda,
        investment: investmentTwoPda,
        vault,
        vaultAuthority,
        investorTokenAccount: investorTwoAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investorTwo])
      .rpc();

    const investorOneBalance = await getAccount(
      provider.connection,
      investorOneAta,
    );
    const investorTwoBalance = await getAccount(
      provider.connection,
      investorTwoAta,
    );
    expect(Number(investorOneBalance.amount)).to.equal(20_189_473_684);
    expect(Number(investorTwoBalance.amount)).to.equal(20_260_526_315);
  });

  it("cancels and refunds a partially funded pool", async () => {
    const poolId = new BN(1);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [POOL_SEED, poolId.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [VAULT_AUTHORITY_SEED, poolPda.toBuffer()],
      program.programId,
    );
    const vault = getAssociatedTokenAddressSync(usdcMint, vaultAuthority, true);
    const [investmentPda] = PublicKey.findProgramAddressSync(
      [INVESTMENT_SEED, poolPda.toBuffer(), investorOne.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .createPool(
        new BN(5_000 * ONE_USDC),
        new BN(4_800 * ONE_USDC),
        new BN(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30),
        65,
        LEGAL_ASSET_HASH,
        "demo://pool-2",
      )
      .accountsPartial({
        authority: provider.wallet.publicKey,
        issuer: issuer.publicKey,
        originator: originator.publicKey,
        spv: spv.publicKey,
        config: configPda,
        pool: poolPda,
        vaultAuthority,
        vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    await program.methods
      .invest(new BN(1_000 * ONE_USDC))
      .accountsPartial({
        investor: investorOne.publicKey,
        config: configPda,
        pool: poolPda,
        investment: investmentPda,
        investorTokenAccount: investorOneAta,
        vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investorOne])
      .rpc();

    await program.methods
      .cancelPool()
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: poolPda,
      })
      .rpc();

    await program.methods
      .withdrawCancelled()
      .accountsPartial({
        investor: investorOne.publicKey,
        pool: poolPda,
        investment: investmentPda,
        vault,
        vaultAuthority,
        investorTokenAccount: investorOneAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investorOne])
      .rpc();

    const vaultAccount = await getAccount(provider.connection, vault);
    expect(Number(vaultAccount.amount)).to.equal(0);
  });
});
