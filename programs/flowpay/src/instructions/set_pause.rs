use anchor_lang::prelude::*;

use crate::{constants::CONFIG_SEED, error::FlowPayError, state::PlatformConfig};

#[derive(Accounts)]
pub struct SetPause<'info> {
    pub admin: Signer<'info>,
    #[account(mut, seeds = [CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, PlatformConfig>,
}

pub fn handler(ctx: Context<SetPause>, paused: bool) -> Result<()> {
    require!(
        ctx.accounts.admin.key() == ctx.accounts.config.admin,
        FlowPayError::Unauthorized
    );
    ctx.accounts.config.paused = paused;
    Ok(())
}
