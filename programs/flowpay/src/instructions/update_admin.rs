use anchor_lang::prelude::*;

use crate::{
    constants::CONFIG_SEED, error::FlowPayError, events::PlatformAdminUpdated,
    state::PlatformConfig,
};

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    pub admin: Signer<'info>,
    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
}

pub fn handler(ctx: Context<UpdateAdmin>, new_admin: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.config;
    require!(
        ctx.accounts.admin.key() == config.admin,
        FlowPayError::Unauthorized
    );

    let previous_admin = config.admin;
    config.admin = new_admin;

    emit!(PlatformAdminUpdated {
        previous_admin,
        new_admin,
    });

    Ok(())
}
