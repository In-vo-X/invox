use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::{
    constants::CONFIG_SEED, error::FlowPayError, events::PlatformTreasuryUpdated,
    state::PlatformConfig,
};

#[derive(Accounts)]
pub struct UpdateTreasury<'info> {
    pub admin: Signer<'info>,
    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
    #[account(constraint = treasury.mint == config.usdc_mint @ FlowPayError::InvalidTreasury)]
    pub treasury: Account<'info, TokenAccount>,
}

pub fn handler(ctx: Context<UpdateTreasury>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    require!(
        ctx.accounts.admin.key() == config.admin,
        FlowPayError::Unauthorized
    );

    let previous_treasury = config.treasury;
    config.treasury = ctx.accounts.treasury.key();

    emit!(PlatformTreasuryUpdated {
        admin: ctx.accounts.admin.key(),
        previous_treasury,
        new_treasury: config.treasury,
    });

    Ok(())
}
