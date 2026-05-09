use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    constants::{BPS_DENOMINATOR, CONFIG_SEED},
    error::FlowPayError,
    events::Repaid,
    state::{InvoicePool, PlatformConfig},
};

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub pool: Account<'info, InvoicePool>,
    #[account(
        mut,
        constraint = payer_token_account.owner == authority.key() @ FlowPayError::Unauthorized,
        constraint = payer_token_account.mint == pool.usdc_mint @ FlowPayError::InvalidUsdcMint
    )]
    pub payer_token_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = vault.key() == pool.vault @ FlowPayError::InvalidStatusTransition)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Repay>, amount: u64) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);
    require!(amount > 0, FlowPayError::InvalidAmount);

    let pool = &mut ctx.accounts.pool;
    require!(pool.is_repayment_open(), FlowPayError::RepaymentNotOpen);
    require!(
        ctx.accounts.authority.key() == ctx.accounts.config.admin
            || ctx.accounts.authority.key() == pool.originator,
        FlowPayError::Unauthorized
    );

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.payer_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
    )?;

    let fee = (u128::from(amount) * u128::from(pool.fee_bps))
        .checked_div(u128::from(BPS_DENOMINATOR))
        .ok_or(FlowPayError::MathOverflow)? as u64;

    pool.repaid_amount = pool
        .repaid_amount
        .checked_add(amount)
        .ok_or(FlowPayError::MathOverflow)?;
    pool.fee_owed_amount = pool
        .fee_owed_amount
        .checked_add(fee)
        .ok_or(FlowPayError::MathOverflow)?;

    pool.status = pool
        .status
        .after_repayment(pool.repaid_amount, pool.invoice_face_value);

    emit!(Repaid {
        pool: pool.key(),
        pool_id: pool.pool_id,
        payer: ctx.accounts.authority.key(),
        amount,
        fee_amount: fee,
        repaid_amount: pool.repaid_amount,
        status: pool.status as u8,
    });

    Ok(())
}
