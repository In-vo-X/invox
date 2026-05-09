use anchor_lang::prelude::*;

use crate::{
    constants::{CONFIG_SEED, MAX_FEE_BPS},
    error::FlowPayError,
    events::PlatformFeeBpsUpdated,
    state::PlatformConfig,
};

#[derive(Accounts)]
pub struct UpdateFeeBps<'info> {
    pub admin: Signer<'info>,
    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
}

pub fn handler(ctx: Context<UpdateFeeBps>, new_fee_bps: u16) -> Result<()> {
    require!(new_fee_bps <= MAX_FEE_BPS, FlowPayError::FeeTooHigh);

    let config = &mut ctx.accounts.config;
    require!(
        ctx.accounts.admin.key() == config.admin,
        FlowPayError::Unauthorized
    );

    let previous_fee_bps = config.fee_bps;
    config.fee_bps = new_fee_bps;

    emit!(PlatformFeeBpsUpdated {
        admin: ctx.accounts.admin.key(),
        previous_fee_bps,
        new_fee_bps,
    });

    Ok(())
}
