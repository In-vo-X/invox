use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    constants::CONFIG_SEED,
    error::FlowPayError,
    events::FeeCollected,
    state::{InvoicePool, PlatformConfig, PoolStatus},
    VAULT_AUTHORITY_SEED,
};

#[derive(Accounts)]
pub struct CollectFee<'info> {
    pub authority: Signer<'info>,
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub pool: Account<'info, InvoicePool>,
    #[account(mut, constraint = vault.key() == pool.vault @ FlowPayError::InvalidStatusTransition)]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA signer derived from the pool seeds and used only as token authority.
    #[account(
        seeds = [VAULT_AUTHORITY_SEED, pool.key().as_ref()],
        bump = pool.vault_authority_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = treasury.key() == config.treasury @ FlowPayError::InvalidTreasury,
        constraint = treasury.mint == pool.usdc_mint @ FlowPayError::InvalidTreasury
    )]
    pub treasury: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<CollectFee>) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);
    require!(
        ctx.accounts.authority.key() == ctx.accounts.config.admin,
        FlowPayError::Unauthorized
    );

    let pool = &mut ctx.accounts.pool;
    require!(
        matches!(
            pool.status,
            PoolStatus::PartiallyRepaid
                | PoolStatus::Repaid
                | PoolStatus::Closed
                | PoolStatus::Defaulted
        ),
        FlowPayError::PoolNotRepaid
    );

    let fee_to_collect = pool
        .fee_owed_amount
        .checked_sub(pool.fee_collected_amount)
        .ok_or(FlowPayError::MathOverflow)?;
    require!(fee_to_collect > 0, FlowPayError::NothingToCollect);

    let pool_key = pool.key();
    let signer_seeds: &[&[&[u8]]] = &[&[
        VAULT_AUTHORITY_SEED,
        pool_key.as_ref(),
        &[pool.vault_authority_bump],
    ]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        fee_to_collect,
    )?;

    pool.fee_collected_amount = pool
        .fee_collected_amount
        .checked_add(fee_to_collect)
        .ok_or(FlowPayError::MathOverflow)?;

    emit!(FeeCollected {
        pool: pool_key,
        pool_id: pool.pool_id,
        authority: ctx.accounts.authority.key(),
        amount: fee_to_collect,
        fee_collected_amount: pool.fee_collected_amount,
    });

    Ok(())
}
