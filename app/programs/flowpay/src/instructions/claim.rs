use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    constants::{CONFIG_SEED, INVESTMENT_SEED},
    error::FlowPayError,
    state::{Investment, InvoicePool, PlatformConfig, PoolStatus},
    VAULT_AUTHORITY_SEED,
};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub pool: Account<'info, InvoicePool>,
    #[account(
        mut,
        seeds = [INVESTMENT_SEED, pool.key().as_ref(), investor.key().as_ref()],
        bump = investment.bump,
        constraint = investment.investor == investor.key() @ FlowPayError::Unauthorized,
        constraint = investment.pool == pool.key() @ FlowPayError::Unauthorized
    )]
    pub investment: Account<'info, Investment>,
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
        constraint = investor_token_account.owner == investor.key() @ FlowPayError::Unauthorized,
        constraint = investor_token_account.mint == pool.usdc_mint @ FlowPayError::InvalidUsdcMint
    )]
    pub investor_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Claim>) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);

    let pool = &mut ctx.accounts.pool;
    require!(
        matches!(
            pool.status,
            PoolStatus::PartiallyRepaid | PoolStatus::Repaid | PoolStatus::Defaulted
        ),
        FlowPayError::PoolNotRepaid
    );

    let net_repaid = pool.net_repaid_amount()?;
    let investment = &mut ctx.accounts.investment;

    let entitlement_u128 = u128::from(net_repaid)
        .checked_mul(u128::from(investment.amount))
        .ok_or(FlowPayError::MathOverflow)?
        .checked_div(u128::from(pool.advance_amount))
        .ok_or(FlowPayError::MathOverflow)?;
    let entitlement = u64::try_from(entitlement_u128).map_err(|_| FlowPayError::MathOverflow)?;
    let claimable = entitlement
        .checked_sub(investment.claimed_amount)
        .ok_or(FlowPayError::MathOverflow)?;
    require!(claimable > 0, FlowPayError::NothingToClaim);

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
                to: ctx.accounts.investor_token_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        claimable,
    )?;

    investment.claimed_amount = investment
        .claimed_amount
        .checked_add(claimable)
        .ok_or(FlowPayError::MathOverflow)?;
    pool.claimed_amount = pool
        .claimed_amount
        .checked_add(claimable)
        .ok_or(FlowPayError::MathOverflow)?;

    if pool.status == PoolStatus::Repaid && pool.claimed_amount >= net_repaid {
        pool.status = PoolStatus::Closed;
    }

    Ok(())
}
