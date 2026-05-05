use anchor_lang::prelude::*;

use crate::{
    constants::{CONFIG_SEED, MAX_METADATA_URI_LEN, MAX_SERVICING_STATUS},
    error::FlowPayError,
    state::{InvoicePool, PlatformConfig, PoolStatus},
};

#[derive(Accounts)]
pub struct UpdatePoolServicing<'info> {
    pub authority: Signer<'info>,
    #[account(seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub pool: Account<'info, InvoicePool>,
}

pub fn handler(
    ctx: Context<UpdatePoolServicing>,
    risk_score: u8,
    servicing_status: u8,
    metadata_uri: String,
) -> Result<()> {
    require!(!ctx.accounts.config.paused, FlowPayError::PlatformPaused);
    require!(risk_score <= 100, FlowPayError::InvalidRiskScore);
    require!(
        servicing_status <= MAX_SERVICING_STATUS,
        FlowPayError::InvalidServicingStatus
    );
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        FlowPayError::InvalidMetadataUri
    );

    let pool = &mut ctx.accounts.pool;
    require!(
        ctx.accounts.authority.key() == ctx.accounts.config.admin
            || ctx.accounts.authority.key() == pool.originator,
        FlowPayError::Unauthorized
    );
    require!(
        !matches!(pool.status, PoolStatus::Closed | PoolStatus::Cancelled),
        FlowPayError::InvalidStatusTransition
    );

    pool.risk_score = risk_score;
    pool.servicing_status = servicing_status;
    pool.servicing_updated_ts = Clock::get()?.unix_timestamp;
    pool.metadata_uri = metadata_uri;

    Ok(())
}
