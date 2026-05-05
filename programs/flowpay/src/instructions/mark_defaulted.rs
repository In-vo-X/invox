use anchor_lang::prelude::*;

use crate::{
    constants::CONFIG_SEED,
    error::FlowPayError,
    state::{InvoicePool, PlatformConfig, PoolStatus},
};

#[derive(Accounts)]
pub struct MarkDefaulted<'info> {
    pub authority: Signer<'info>,
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub pool: Account<'info, InvoicePool>,
}

pub fn handler(ctx: Context<MarkDefaulted>) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);

    let pool = &mut ctx.accounts.pool;
    require!(
        ctx.accounts.authority.key() == ctx.accounts.config.admin
            || ctx.accounts.authority.key() == pool.originator,
        FlowPayError::Unauthorized
    );
    require!(
        matches!(pool.status, PoolStatus::Advanced | PoolStatus::PartiallyRepaid),
        FlowPayError::InvalidStatusTransition
    );
    require!(Clock::get()?.unix_timestamp > pool.due_ts, FlowPayError::DefaultNotReached);

    pool.status = PoolStatus::Defaulted;
    Ok(())
}
