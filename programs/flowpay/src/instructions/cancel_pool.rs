use anchor_lang::prelude::*;

use crate::{
    constants::CONFIG_SEED,
    error::FlowPayError,
    state::{InvoicePool, PlatformConfig, PoolStatus},
};

#[derive(Accounts)]
pub struct CancelPool<'info> {
    pub authority: Signer<'info>,
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub pool: Account<'info, InvoicePool>,
}

pub fn handler(ctx: Context<CancelPool>) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);

    let pool = &mut ctx.accounts.pool;
    require!(
        pool.status == PoolStatus::Funding,
        FlowPayError::PoolNotFunding
    );
    require!(
        pool.funded_amount < pool.advance_amount,
        FlowPayError::FundingStillOpen
    );

    let authority_key = ctx.accounts.authority.key();
    require!(
        authority_key == ctx.accounts.config.admin || authority_key == pool.issuer,
        FlowPayError::Unauthorized
    );

    pool.status = PoolStatus::Cancelled;
    Ok(())
}
