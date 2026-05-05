use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{
    constants::{CONFIG_SEED, INVESTMENT_SEED},
    error::FlowPayError,
    state::{Investment, InvoicePool, PlatformConfig, PoolStatus},
};

#[derive(Accounts)]
pub struct Invest<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub pool: Account<'info, InvoicePool>,
    #[account(
        init_if_needed,
        payer = investor,
        space = Investment::SPACE,
        seeds = [INVESTMENT_SEED, pool.key().as_ref(), investor.key().as_ref()],
        bump
    )]
    pub investment: Account<'info, Investment>,
    #[account(
        mut,
        constraint = investor_token_account.owner == investor.key() @ FlowPayError::Unauthorized,
        constraint = investor_token_account.mint == pool.usdc_mint @ FlowPayError::InvalidUsdcMint
    )]
    pub investor_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = vault.key() == pool.vault @ FlowPayError::InvalidStatusTransition
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(address = pool.usdc_mint @ FlowPayError::InvalidUsdcMint)]
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Invest>, amount: u64) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);
    require!(amount > 0, FlowPayError::InvalidAmount);

    let pool = &mut ctx.accounts.pool;
    require!(
        pool.status == PoolStatus::Funding,
        FlowPayError::PoolNotFunding
    );

    let new_total = pool
        .funded_amount
        .checked_add(amount)
        .ok_or(FlowPayError::MathOverflow)?;
    require!(new_total <= pool.advance_amount, FlowPayError::OverFunding);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.investor_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.investor.to_account_info(),
            },
        ),
        amount,
    )?;

    let investment = &mut ctx.accounts.investment;
    if investment.amount == 0 {
        investment.pool = pool.key();
        investment.investor = ctx.accounts.investor.key();
        investment.amount = 0;
        investment.claimed_amount = 0;
        investment.created_ts = Clock::get()?.unix_timestamp;
        investment.bump = ctx.bumps.investment;
    }

    investment.amount = investment
        .amount
        .checked_add(amount)
        .ok_or(FlowPayError::MathOverflow)?;
    pool.funded_amount = new_total;

    if pool.funded_amount == pool.advance_amount {
        pool.status = PoolStatus::Funded;
    }

    Ok(())
}
