use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

use crate::{
    constants::{CONFIG_SEED, MAX_FEE_BPS},
    error::FlowPayError,
    events::PlatformInitialized,
    state::PlatformConfig,
};

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = PlatformConfig::SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, PlatformConfig>,
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        constraint = treasury.mint == usdc_mint.key() @ FlowPayError::InvalidTreasury
    )]
    pub treasury: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePlatform>, fee_bps: u16) -> Result<()> {
    require!(fee_bps <= MAX_FEE_BPS, FlowPayError::FeeTooHigh);

    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.usdc_mint = ctx.accounts.usdc_mint.key();
    config.treasury = ctx.accounts.treasury.key();
    config.fee_bps = fee_bps;
    config.next_pool_id = 0;
    config.paused = false;
    config.bump = ctx.bumps.config;

    emit!(PlatformInitialized {
        admin: config.admin,
        usdc_mint: config.usdc_mint,
        treasury: config.treasury,
        fee_bps,
    });

    Ok(())
}
