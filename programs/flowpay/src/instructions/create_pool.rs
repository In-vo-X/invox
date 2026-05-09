use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    constants::{
        CONFIG_SEED, MAX_METADATA_URI_LEN, POOL_SEED, SERVICING_STATUS_ACTIVE, VAULT_AUTHORITY_SEED,
    },
    error::FlowPayError,
    events::PoolCreated,
    state::{InvoicePool, PlatformConfig, PoolStatus},
};

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Used only as a stored identity key; no data is read from this account.
    pub issuer: UncheckedAccount<'info>,
    /// CHECK: Used only as a stored identity key; no data is read from this account.
    pub originator: UncheckedAccount<'info>,
    /// CHECK: Used only as a stored identity key; no data is read from this account.
    pub spv: UncheckedAccount<'info>,
    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(
        init,
        payer = authority,
        space = InvoicePool::SPACE,
        seeds = [POOL_SEED, &config.next_pool_id.to_le_bytes()],
        bump
    )]
    pub pool: Account<'info, InvoicePool>,
    /// CHECK: PDA signer derived from the pool seeds and used only as token authority.
    #[account(seeds = [VAULT_AUTHORITY_SEED, pool.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = authority,
        associated_token::mint = usdc_mint,
        associated_token::authority = vault_authority
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(address = config.usdc_mint @ FlowPayError::InvalidUsdcMint)]
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreatePool>,
    invoice_face_value: u64,
    advance_amount: u64,
    due_ts: i64,
    risk_score: u8,
    legal_asset_hash: [u8; 32],
    metadata_uri: String,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    require!(!config.paused, FlowPayError::PlatformPaused);
    require!(
        invoice_face_value > advance_amount,
        FlowPayError::InvalidAmount
    );
    require!(advance_amount > 0, FlowPayError::InvalidAmount);
    require!(risk_score <= 100, FlowPayError::InvalidRiskScore);
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        FlowPayError::InvalidMetadataUri
    );

    let authority_key = ctx.accounts.authority.key();
    let issuer_key = ctx.accounts.issuer.key();
    let originator_key = ctx.accounts.originator.key();
    require!(
        authority_key == issuer_key
            || authority_key == originator_key
            || authority_key == config.admin,
        FlowPayError::Unauthorized
    );

    let now = Clock::get()?.unix_timestamp;
    require!(due_ts > now, FlowPayError::InvalidDueDate);

    let pool = &mut ctx.accounts.pool;
    pool.pool_id = config.next_pool_id;
    pool.issuer = issuer_key;
    pool.originator = originator_key;
    pool.spv = ctx.accounts.spv.key();
    pool.usdc_mint = ctx.accounts.usdc_mint.key();
    pool.vault = ctx.accounts.vault.key();
    pool.legal_asset_hash = legal_asset_hash;
    pool.invoice_face_value = invoice_face_value;
    pool.advance_amount = advance_amount;
    pool.funded_amount = 0;
    pool.repaid_amount = 0;
    pool.fee_owed_amount = 0;
    pool.fee_collected_amount = 0;
    pool.claimed_amount = 0;
    pool.fee_bps = config.fee_bps;
    pool.due_ts = due_ts;
    pool.created_ts = now;
    pool.status = PoolStatus::Funding;
    pool.risk_score = risk_score;
    pool.servicing_status = SERVICING_STATUS_ACTIVE;
    pool.servicing_updated_ts = now;
    pool.metadata_uri = metadata_uri;
    pool.bump = ctx.bumps.pool;
    pool.vault_authority_bump = ctx.bumps.vault_authority;

    config.next_pool_id = config
        .next_pool_id
        .checked_add(1)
        .ok_or(FlowPayError::MathOverflow)?;

    emit!(PoolCreated {
        pool: pool.key(),
        pool_id: pool.pool_id,
        issuer: pool.issuer,
        originator: pool.originator,
        spv: pool.spv,
        legal_asset_hash: pool.legal_asset_hash,
        invoice_face_value: pool.invoice_face_value,
        advance_amount: pool.advance_amount,
        due_ts: pool.due_ts,
        risk_score: pool.risk_score,
        metadata_uri: pool.metadata_uri.clone(),
        fee_bps: pool.fee_bps,
    });

    Ok(())
}
