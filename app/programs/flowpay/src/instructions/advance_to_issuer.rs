use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    constants::CONFIG_SEED,
    error::FlowPayError,
    state::{InvoicePool, PlatformConfig, PoolStatus},
    VAULT_AUTHORITY_SEED,
};

#[derive(Accounts)]
pub struct AdvanceToIssuer<'info> {
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
        constraint = issuer_token_account.owner == pool.issuer @ FlowPayError::Unauthorized,
        constraint = issuer_token_account.mint == pool.usdc_mint @ FlowPayError::InvalidUsdcMint
    )]
    pub issuer_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<AdvanceToIssuer>) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);

    let pool = &mut ctx.accounts.pool;
    require!(pool.status == PoolStatus::Funded, FlowPayError::PoolNotFunded);
    require!(
        ctx.accounts.authority.key() == ctx.accounts.config.admin
            || ctx.accounts.authority.key() == pool.originator,
        FlowPayError::Unauthorized
    );

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
                to: ctx.accounts.issuer_token_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        pool.advance_amount,
    )?;

    pool.status = PoolStatus::Advanced;
    Ok(())
}
