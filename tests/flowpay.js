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
const CLOCK_SYSVAR_PUBKEY = new PublicKey(
  "SysvarC1ock11111111111111111111111111111111",
);
const DECIMALS = 6;
const ONE_USDC = 10 ** DECIMALS;
const LEGAL_ASSET_HASH = Array.from(Buffer.alloc(32, 7));

const confirmSignature = async (connection, signature) => {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
};

const airdrop = async (provider, pubkey) => {
  const sig = await provider.connection.requestAirdrop(
    pubkey,
    2 * LAMPORTS_PER_SOL,
  );
  await confirmSignature(provider.connection, sig);
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
  let updatedTreasuryAta;

  const issuer = Keypair.generate();
  const originator = Keypair.generate();
  const spv = Keypair.generate();
  const treasuryOwner = Keypair.generate();
  const updatedAdmin = Keypair.generate();
  const updatedTreasuryOwner = Keypair.generate();
  const investorOne = Keypair.generate();
  const investorTwo = Keypair.generate();

  const [configPda] = PublicKey.findProgramAddressSync(
    [CONFIG_SEED],
    program.programId,
  );

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const futureTs = (secondsFromNow) =>
    new BN(Math.floor(Date.now() / 1000) + secondsFromNow);
  const currentChainTs = async () => {
    const clockAccount =
      await provider.connection.getAccountInfo(CLOCK_SYSVAR_PUBKEY);
    if (!clockAccount) {
      throw new Error("Clock sysvar account not found");
    }

    return Number(clockAccount.data.readBigInt64LE(32));
  };
  const futureChainTs = async (secondsFromNow) =>
    new BN((await currentChainTs()) + secondsFromNow);
  const waitPastDue = async (dueTs) => {
    const maxAttempts = 20;
    const dueTsNumber = dueTs.toNumber();

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if ((await currentChainTs()) > dueTsNumber) {
        return;
      }

      const sig = await provider.connection.requestAirdrop(
        provider.wallet.publicKey,
        1,
      );
      await confirmSignature(provider.connection, sig);
      await sleep(250);
    }

    throw new Error(
      `Validator clock did not advance past due timestamp ${dueTsNumber}`,
    );
  };

  const derivePoolAccounts = (poolId) => {
    const poolIdBn = new BN(poolId);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [POOL_SEED, poolIdBn.toArrayLike(Buffer, "le", 8)],
      program.programId,
    );
    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [VAULT_AUTHORITY_SEED, poolPda.toBuffer()],
      program.programId,
    );
    const vault = getAssociatedTokenAddressSync(usdcMint, vaultAuthority, true);

    return { poolPda, vaultAuthority, vault };
  };

  const deriveInvestmentPda = (poolPda, investorPubkey) => {
    const [investmentPda] = PublicKey.findProgramAddressSync(
      [INVESTMENT_SEED, poolPda.toBuffer(), investorPubkey.toBuffer()],
      program.programId,
    );
    return investmentPda;
  };

  const expectAnchorError = async (promise, expectedError) => {
    try {
      await promise;
    } catch (err) {
      const details = [
        err.error?.errorCode?.code,
        err.error?.errorMessage,
        err.message,
        err.logs?.join("\n"),
      ]
        .filter(Boolean)
        .join("\n");
      expect(details).to.include(expectedError);
      return;
    }

    throw new Error(`Expected Anchor error ${expectedError}`);
  };

  const createPool = async ({
    invoiceFaceValue = 5_000 * ONE_USDC,
    advanceAmount = 4_800 * ONE_USDC,
    dueTs = futureTs(60 * 60 * 24 * 30),
    riskScore = 65,
    metadataUri,
    authority = provider.wallet.publicKey,
    signers = [],
  } = {}) => {
    const config = await program.account.platformConfig.fetch(configPda);
    const nextPoolId = config.nextPoolId;
    const accounts = derivePoolAccounts(nextPoolId);

    await program.methods
      .createPool(
        new BN(invoiceFaceValue),
        new BN(advanceAmount),
        dueTs,
        riskScore,
        LEGAL_ASSET_HASH,
        metadataUri ?? `demo://pool-${nextPoolId.toString()}`,
      )
      .accountsPartial({
        authority,
        issuer: issuer.publicKey,
        originator: originator.publicKey,
        spv: spv.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        vaultAuthority: accounts.vaultAuthority,
        vault: accounts.vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers(signers)
      .rpc();

    return accounts;
  };

  const investInPool = async ({
    poolPda,
    vault,
    investor,
    investorTokenAccount,
    amount,
  }) => {
    const investmentPda = deriveInvestmentPda(poolPda, investor.publicKey);

    await program.methods
      .invest(new BN(amount))
      .accountsPartial({
        investor: investor.publicKey,
        config: configPda,
        pool: poolPda,
        investment: investmentPda,
        investorTokenAccount,
        vault,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

    return investmentPda;
  };

  const advancePool = ({ poolPda, vault, vaultAuthority }) =>
    program.methods
      .advanceToIssuer()
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: poolPda,
        vault,
        vaultAuthority,
        issuerTokenAccount: issuerAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

  before(async () => {
    await Promise.all([
      airdrop(provider, issuer.publicKey),
      airdrop(provider, originator.publicKey),
      airdrop(provider, spv.publicKey),
      airdrop(provider, treasuryOwner.publicKey),
      airdrop(provider, updatedAdmin.publicKey),
      airdrop(provider, updatedTreasuryOwner.publicKey),
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
    updatedTreasuryAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        usdcMint,
        updatedTreasuryOwner.publicKey,
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
    const { poolPda, vaultAuthority, vault } = await createPool({
      invoiceFaceValue: 10_000 * ONE_USDC,
      advanceAmount: 9_500 * ONE_USDC,
      dueTs: futureTs(60 * 60 * 24 * 60),
      riskScore: 78,
      metadataUri: "demo://pool-1",
    });

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

    const investmentOnePda = await investInPool({
      poolPda,
      vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 4_000 * ONE_USDC,
    });

    const investmentTwoPda = await investInPool({
      poolPda,
      vault,
      investor: investorTwo,
      investorTokenAccount: investorTwoAta,
      amount: 5_500 * ONE_USDC,
    });

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
    const { poolPda, vaultAuthority, vault } = await createPool({
      metadataUri: "demo://pool-2",
    });

    const investmentPda = await investInPool({
      poolPda,
      vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });

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

    await expectAnchorError(
      program.methods
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
        .rpc(),
      "AlreadyCancelled",
    );

    const vaultAccount = await getAccount(provider.connection, vault);
    expect(Number(vaultAccount.amount)).to.equal(0);
  });

  it("rejects invalid pool creation inputs", async () => {
    await expectAnchorError(createPool({ riskScore: 101 }), "InvalidRiskScore");
    await expectAnchorError(
      createPool({ metadataUri: "x".repeat(201) }),
      "InvalidMetadataUri",
    );
    await expectAnchorError(createPool({ dueTs: new BN(1) }), "InvalidDueDate");
    await expectAnchorError(
      createPool({
        invoiceFaceValue: 1_000 * ONE_USDC,
        advanceAmount: 1_000 * ONE_USDC,
      }),
      "InvalidAmount",
    );
    await expectAnchorError(createPool({ advanceAmount: 0 }), "InvalidAmount");
    await expectAnchorError(
      createPool({ authority: investorOne.publicKey, signers: [investorOne] }),
      "Unauthorized",
    );
  });

  it("rejects over-funding", async () => {
    const { poolPda, vault } = await createPool({
      invoiceFaceValue: 1_100 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://overfund",
    });

    await investInPool({
      poolPda,
      vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 900 * ONE_USDC,
    });

    const investmentTwoPda = deriveInvestmentPda(
      poolPda,
      investorTwo.publicKey,
    );
    await expectAnchorError(
      program.methods
        .invest(new BN(200 * ONE_USDC))
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
        .rpc(),
      "OverFunding",
    );
  });

  it("rejects claims and fee collection before repayment", async () => {
    const accounts = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://pre-repay-guards",
    });
    const investmentPda = await investInPool({
      poolPda: accounts.poolPda,
      vault: accounts.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });

    await advancePool(accounts);

    await expectAnchorError(
      program.methods
        .claim()
        .accountsPartial({
          investor: investorOne.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          investment: investmentPda,
          vault: accounts.vault,
          vaultAuthority: accounts.vaultAuthority,
          investorTokenAccount: investorOneAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investorOne])
        .rpc(),
      "PoolNotRepaid",
    );

    await expectAnchorError(
      program.methods
        .collectFee()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          vault: accounts.vault,
          vaultAuthority: accounts.vaultAuthority,
          treasury: treasuryAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc(),
      "PoolNotRepaid",
    );
  });

  it("rejects invalid amounts and servicing updates", async () => {
    const accounts = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://invalid-amount-guards",
    });

    await expectAnchorError(
      program.methods
        .invest(new BN(0))
        .accountsPartial({
          investor: investorOne.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          investment: deriveInvestmentPda(
            accounts.poolPda,
            investorOne.publicKey,
          ),
          investorTokenAccount: investorOneAta,
          vault: accounts.vault,
          usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([investorOne])
        .rpc(),
      "InvalidAmount",
    );

    await investInPool({
      poolPda: accounts.poolPda,
      vault: accounts.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });
    await advancePool(accounts);

    await expectAnchorError(
      program.methods
        .repay(new BN(0))
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          payerTokenAccount: adminAta,
          vault: accounts.vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc(),
      "InvalidAmount",
    );

    await expectAnchorError(
      program.methods
        .updatePoolServicing(50, 3, "demo://bad-servicing")
        .accountsPartial({
          authority: originator.publicKey,
          config: configPda,
          pool: accounts.poolPda,
        })
        .signers([originator])
        .rpc(),
      "InvalidServicingStatus",
    );
  });

  it("allows partial repayment and partial investor claim", async () => {
    const accounts = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://partial-recovery",
    });
    const investmentPda = await investInPool({
      poolPda: accounts.poolPda,
      vault: accounts.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });

    await advancePool(accounts);

    await program.methods
      .repay(new BN(600 * ONE_USDC))
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        payerTokenAccount: adminAta,
        vault: accounts.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    let pool = await program.account.invoicePool.fetch(accounts.poolPda);
    expect(pool.status).to.deep.equal({ partiallyRepaid: {} });
    expect(pool.repaidAmount.toNumber()).to.equal(600 * ONE_USDC);
    expect(pool.feeOwedAmount.toNumber()).to.equal(3 * ONE_USDC);

    await program.methods
      .claim()
      .accountsPartial({
        investor: investorOne.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        investment: investmentPda,
        vault: accounts.vault,
        vaultAuthority: accounts.vaultAuthority,
        investorTokenAccount: investorOneAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investorOne])
      .rpc();

    pool = await program.account.invoicePool.fetch(accounts.poolPda);
    expect(pool.status).to.deep.equal({ partiallyRepaid: {} });
    expect(pool.claimedAmount.toNumber()).to.equal(597 * ONE_USDC);

    await expectAnchorError(
      program.methods
        .claim()
        .accountsPartial({
          investor: investorOne.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          investment: investmentPda,
          vault: accounts.vault,
          vaultAuthority: accounts.vaultAuthority,
          investorTokenAccount: investorOneAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investorOne])
        .rpc(),
      "NothingToClaim",
    );
  });

  it("rejects default before the due date", async () => {
    const accounts = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://default-guard",
    });

    await investInPool({
      poolPda: accounts.poolPda,
      vault: accounts.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });
    await advancePool(accounts);

    await expectAnchorError(
      program.methods
        .markDefaulted()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: accounts.poolPda,
        })
        .rpc(),
      "DefaultNotReached",
    );
  });

  it("rejects lifecycle actions from invalid states or authorities", async () => {
    const fundingPool = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://lifecycle-funding-guards",
    });

    await expectAnchorError(advancePool(fundingPool), "PoolNotFunded");

    await expectAnchorError(
      program.methods
        .repay(new BN(100 * ONE_USDC))
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: fundingPool.poolPda,
          payerTokenAccount: adminAta,
          vault: fundingPool.vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc(),
      "RepaymentNotOpen",
    );

    await investInPool({
      poolPda: fundingPool.poolPda,
      vault: fundingPool.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });

    await expectAnchorError(
      program.methods
        .advanceToIssuer()
        .accountsPartial({
          authority: investorOne.publicKey,
          config: configPda,
          pool: fundingPool.poolPda,
          vault: fundingPool.vault,
          vaultAuthority: fundingPool.vaultAuthority,
          issuerTokenAccount: issuerAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investorOne])
        .rpc(),
      "Unauthorized",
    );

    await expectAnchorError(
      program.methods
        .cancelPool()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: fundingPool.poolPda,
        })
        .rpc(),
      "PoolNotFunding",
    );

    await advancePool(fundingPool);

    await expectAnchorError(
      program.methods
        .markDefaulted()
        .accountsPartial({
          authority: investorOne.publicKey,
          config: configPda,
          pool: fundingPool.poolPda,
        })
        .signers([investorOne])
        .rpc(),
      "Unauthorized",
    );

    const partialRepaymentPool = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://lifecycle-partial-repay-guards",
    });

    await investInPool({
      poolPda: partialRepaymentPool.poolPda,
      vault: partialRepaymentPool.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });
    await advancePool(partialRepaymentPool);

    await program.methods
      .repay(new BN(100 * ONE_USDC))
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: partialRepaymentPool.poolPda,
        payerTokenAccount: adminAta,
        vault: partialRepaymentPool.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    await expectAnchorError(
      program.methods
        .markDefaulted()
        .accountsPartial({
          authority: investorOne.publicKey,
          config: configPda,
          pool: partialRepaymentPool.poolPda,
        })
        .signers([investorOne])
        .rpc(),
      "Unauthorized",
    );
  });

  it("allows recoveries, fees, and claims after default", async () => {
    const dueTs = await futureChainTs(5);
    const accounts = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      dueTs,
      metadataUri: "demo://defaulted-recovery",
    });
    const investmentPda = await investInPool({
      poolPda: accounts.poolPda,
      vault: accounts.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });

    await advancePool(accounts);

    await program.methods
      .repay(new BN(600 * ONE_USDC))
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        payerTokenAccount: adminAta,
        vault: accounts.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    await waitPastDue(dueTs);

    await program.methods
      .markDefaulted()
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
      })
      .rpc();

    let pool = await program.account.invoicePool.fetch(accounts.poolPda);
    expect(pool.status).to.deep.equal({ defaulted: {} });

    await program.methods
      .collectFee()
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        vault: accounts.vault,
        vaultAuthority: accounts.vaultAuthority,
        treasury: treasuryAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    await program.methods
      .claim()
      .accountsPartial({
        investor: investorOne.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        investment: investmentPda,
        vault: accounts.vault,
        vaultAuthority: accounts.vaultAuthority,
        investorTokenAccount: investorOneAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investorOne])
      .rpc();

    pool = await program.account.invoicePool.fetch(accounts.poolPda);
    expect(pool.status).to.deep.equal({ defaulted: {} });
    expect(pool.feeCollectedAmount.toNumber()).to.equal(3 * ONE_USDC);
    expect(pool.claimedAmount.toNumber()).to.equal(597 * ONE_USDC);

    await program.methods
      .repay(new BN(100 * ONE_USDC))
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        payerTokenAccount: adminAta,
        vault: accounts.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    pool = await program.account.invoicePool.fetch(accounts.poolPda);
    expect(pool.status).to.deep.equal({ defaulted: {} });
    expect(pool.repaidAmount.toNumber()).to.equal(700 * ONE_USDC);
    expect(pool.feeOwedAmount.toNumber()).to.equal(3_500_000);

    await program.methods
      .repay(new BN(500 * ONE_USDC))
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        payerTokenAccount: adminAta,
        vault: accounts.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    pool = await program.account.invoicePool.fetch(accounts.poolPda);
    expect(pool.status).to.deep.equal({ defaulted: {} });
    expect(pool.repaidAmount.toNumber()).to.equal(1_200 * ONE_USDC);
    expect(pool.feeOwedAmount.toNumber()).to.equal(6 * ONE_USDC);
  });

  it("rejects invalid fee and treasury updates", async () => {
    await expectAnchorError(
      program.methods
        .updateFeeBps(1001)
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
        })
        .rpc(),
      "FeeTooHigh",
    );

    const wrongMint = await createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      null,
      DECIMALS,
    );
    const wrongTreasuryAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        wrongMint,
        treasuryOwner.publicKey,
      )
    ).address;

    await expectAnchorError(
      program.methods
        .updateTreasury()
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
          treasury: wrongTreasuryAta,
        })
        .rpc(),
      "InvalidTreasury",
    );
  });

  it("updates platform admin, treasury, and future pool fee snapshots", async () => {
    await expectAnchorError(
      program.methods
        .updateFeeBps(100)
        .accountsPartial({
          admin: investorOne.publicKey,
          config: configPda,
        })
        .signers([investorOne])
        .rpc(),
      "Unauthorized",
    );

    const preUpdatePoolAccounts = await createPool({
      invoiceFaceValue: 1_100 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://pre-fee-snapshot",
    });

    await program.methods
      .updateFeeBps(100)
      .accountsPartial({
        admin: provider.wallet.publicKey,
        config: configPda,
      })
      .rpc();

    let config = await program.account.platformConfig.fetch(configPda);
    expect(config.feeBps).to.equal(100);

    const preUpdatePool = await program.account.invoicePool.fetch(
      preUpdatePoolAccounts.poolPda,
    );
    expect(preUpdatePool.feeBps).to.equal(50);

    const newPoolAccounts = await createPool({
      invoiceFaceValue: 1_100 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://fee-snapshot",
    });
    const newPool = await program.account.invoicePool.fetch(
      newPoolAccounts.poolPda,
    );
    expect(newPool.feeBps).to.equal(100);

    await program.methods
      .updateTreasury()
      .accountsPartial({
        admin: provider.wallet.publicKey,
        config: configPda,
        treasury: updatedTreasuryAta,
      })
      .rpc();

    config = await program.account.platformConfig.fetch(configPda);
    expect(config.treasury.toBase58()).to.equal(updatedTreasuryAta.toBase58());

    await program.methods
      .updateAdmin(updatedAdmin.publicKey)
      .accountsPartial({
        admin: provider.wallet.publicKey,
        config: configPda,
      })
      .rpc();

    config = await program.account.platformConfig.fetch(configPda);
    expect(config.admin.toBase58()).to.equal(updatedAdmin.publicKey.toBase58());

    await expectAnchorError(
      program.methods
        .setPause(true)
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
        })
        .rpc(),
      "Unauthorized",
    );

    await program.methods
      .setPause(true)
      .accountsPartial({
        admin: updatedAdmin.publicKey,
        config: configPda,
      })
      .signers([updatedAdmin])
      .rpc();

    config = await program.account.platformConfig.fetch(configPda);
    expect(config.paused).to.equal(true);

    await program.methods
      .setPause(false)
      .accountsPartial({
        admin: updatedAdmin.publicKey,
        config: configPda,
      })
      .signers([updatedAdmin])
      .rpc();

    await program.methods
      .updateAdmin(provider.wallet.publicKey)
      .accountsPartial({
        admin: updatedAdmin.publicKey,
        config: configPda,
      })
      .signers([updatedAdmin])
      .rpc();

    config = await program.account.platformConfig.fetch(configPda);
    expect(config.admin.toBase58()).to.equal(
      provider.wallet.publicKey.toBase58(),
    );
    expect(config.paused).to.equal(false);
  });

  it("rejects guarded instructions while paused", async () => {
    const fundingPool = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://paused-funding",
    });
    const fundedPool = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://paused-funded",
    });
    const advancedPool = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://paused-advanced",
    });
    const repaidPool = await createPool({
      invoiceFaceValue: 1_200 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://paused-repaid",
    });

    await investInPool({
      poolPda: fundedPool.poolPda,
      vault: fundedPool.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });
    await investInPool({
      poolPda: advancedPool.poolPda,
      vault: advancedPool.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });
    const repaidInvestmentPda = await investInPool({
      poolPda: repaidPool.poolPda,
      vault: repaidPool.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });

    await advancePool(advancedPool);
    await advancePool(repaidPool);
    await program.methods
      .repay(new BN(1_200 * ONE_USDC))
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: repaidPool.poolPda,
        payerTokenAccount: adminAta,
        vault: repaidPool.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const setPaused = (paused) =>
      program.methods
        .setPause(paused)
        .accountsPartial({
          admin: provider.wallet.publicKey,
          config: configPda,
        })
        .rpc();

    await setPaused(true);
    try {
      await expectAnchorError(
        createPool({ metadataUri: "demo://paused-create" }),
        "PlatformPaused",
      );

      await expectAnchorError(
        program.methods
          .updatePoolServicing(50, 1, "demo://paused-servicing")
          .accountsPartial({
            authority: originator.publicKey,
            config: configPda,
            pool: fundingPool.poolPda,
          })
          .signers([originator])
          .rpc(),
        "PlatformPaused",
      );

      await expectAnchorError(
        program.methods
          .invest(new BN(100 * ONE_USDC))
          .accountsPartial({
            investor: investorOne.publicKey,
            config: configPda,
            pool: fundingPool.poolPda,
            investment: deriveInvestmentPda(
              fundingPool.poolPda,
              investorOne.publicKey,
            ),
            investorTokenAccount: investorOneAta,
            vault: fundingPool.vault,
            usdcMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([investorOne])
          .rpc(),
        "PlatformPaused",
      );

      await expectAnchorError(
        program.methods
          .cancelPool()
          .accountsPartial({
            authority: provider.wallet.publicKey,
            config: configPda,
            pool: fundingPool.poolPda,
          })
          .rpc(),
        "PlatformPaused",
      );

      await expectAnchorError(
        program.methods
          .advanceToIssuer()
          .accountsPartial({
            authority: provider.wallet.publicKey,
            config: configPda,
            pool: fundedPool.poolPda,
            vault: fundedPool.vault,
            vaultAuthority: fundedPool.vaultAuthority,
            issuerTokenAccount: issuerAta,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc(),
        "PlatformPaused",
      );

      await expectAnchorError(
        program.methods
          .repay(new BN(100 * ONE_USDC))
          .accountsPartial({
            authority: provider.wallet.publicKey,
            config: configPda,
            pool: advancedPool.poolPda,
            payerTokenAccount: adminAta,
            vault: advancedPool.vault,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc(),
        "PlatformPaused",
      );

      await expectAnchorError(
        program.methods
          .claim()
          .accountsPartial({
            investor: investorOne.publicKey,
            config: configPda,
            pool: repaidPool.poolPda,
            investment: repaidInvestmentPda,
            vault: repaidPool.vault,
            vaultAuthority: repaidPool.vaultAuthority,
            investorTokenAccount: investorOneAta,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([investorOne])
          .rpc(),
        "PlatformPaused",
      );

      const config = await program.account.platformConfig.fetch(configPda);
      await expectAnchorError(
        program.methods
          .collectFee()
          .accountsPartial({
            authority: provider.wallet.publicKey,
            config: configPda,
            pool: repaidPool.poolPda,
            vault: repaidPool.vault,
            vaultAuthority: repaidPool.vaultAuthority,
            treasury: config.treasury,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc(),
        "PlatformPaused",
      );

      await expectAnchorError(
        program.methods
          .markDefaulted()
          .accountsPartial({
            authority: provider.wallet.publicKey,
            config: configPda,
            pool: advancedPool.poolPda,
          })
          .rpc(),
        "PlatformPaused",
      );
    } finally {
      await setPaused(false);
    }
  });

  it("allows fee collection after investor claims close a repaid pool", async () => {
    const accounts = await createPool({
      invoiceFaceValue: 1_100 * ONE_USDC,
      advanceAmount: 1_000 * ONE_USDC,
      metadataUri: "demo://claim-first-fees",
    });
    const investmentPda = await investInPool({
      poolPda: accounts.poolPda,
      vault: accounts.vault,
      investor: investorOne,
      investorTokenAccount: investorOneAta,
      amount: 1_000 * ONE_USDC,
    });

    await advancePool(accounts);

    await program.methods
      .repay(new BN(1_100 * ONE_USDC))
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        payerTokenAccount: adminAta,
        vault: accounts.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    await program.methods
      .claim()
      .accountsPartial({
        investor: investorOne.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        investment: investmentPda,
        vault: accounts.vault,
        vaultAuthority: accounts.vaultAuthority,
        investorTokenAccount: investorOneAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investorOne])
      .rpc();

    await expectAnchorError(
      program.methods
        .claim()
        .accountsPartial({
          investor: investorOne.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          investment: investmentPda,
          vault: accounts.vault,
          vaultAuthority: accounts.vaultAuthority,
          investorTokenAccount: investorOneAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investorOne])
        .rpc(),
      "PoolNotRepaid",
    );

    let pool = await program.account.invoicePool.fetch(accounts.poolPda);
    const expectedFeeOwed =
      (pool.repaidAmount.toNumber() * pool.feeBps) / 10_000;
    const config = await program.account.platformConfig.fetch(configPda);
    expect(pool.status).to.deep.equal({ closed: {} });
    expect(pool.feeOwedAmount.toNumber()).to.equal(expectedFeeOwed);
    expect(pool.feeCollectedAmount.toNumber()).to.equal(0);

    await program.methods
      .collectFee()
      .accountsPartial({
        authority: provider.wallet.publicKey,
        config: configPda,
        pool: accounts.poolPda,
        vault: accounts.vault,
        vaultAuthority: accounts.vaultAuthority,
        treasury: config.treasury,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    pool = await program.account.invoicePool.fetch(accounts.poolPda);
    expect(pool.status).to.deep.equal({ closed: {} });
    expect(pool.feeCollectedAmount.toNumber()).to.equal(expectedFeeOwed);

    await expectAnchorError(
      program.methods
        .collectFee()
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          vault: accounts.vault,
          vaultAuthority: accounts.vaultAuthority,
          treasury: config.treasury,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc(),
      "NothingToCollect",
    );

    await expectAnchorError(
      program.methods
        .repay(new BN(1 * ONE_USDC))
        .accountsPartial({
          authority: provider.wallet.publicKey,
          config: configPda,
          pool: accounts.poolPda,
          payerTokenAccount: adminAta,
          vault: accounts.vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc(),
      "RepaymentNotOpen",
    );
  });
});
