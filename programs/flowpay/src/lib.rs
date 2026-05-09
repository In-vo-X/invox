pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use events::*;
pub(crate) use instructions::{
    __client_accounts_advance_to_issuer, __client_accounts_cancel_pool, __client_accounts_claim,
    __client_accounts_collect_fee, __client_accounts_create_pool,
    __client_accounts_initialize_platform, __client_accounts_invest,
    __client_accounts_mark_defaulted, __client_accounts_repay, __client_accounts_set_pause,
    __client_accounts_update_admin, __client_accounts_update_fee_bps,
    __client_accounts_update_pool_servicing, __client_accounts_update_treasury,
    __client_accounts_withdraw_cancelled,
};
pub use instructions::{
    AdvanceToIssuer, CancelPool, Claim, CollectFee, CreatePool, InitializePlatform, Invest,
    MarkDefaulted, Repay, SetPause, UpdateAdmin, UpdateFeeBps, UpdatePoolServicing, UpdateTreasury,
    WithdrawCancelled,
};
pub use state::*;

declare_id!("EjfVxrCATPwhbEKEcMAamkZaMabRaYStprDmAFu5TQFB");

#[program]
pub mod flowpay {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>, fee_bps: u16) -> Result<()> {
        instructions::initialize_platform::handler(ctx, fee_bps)
    }

    pub fn create_pool(
        ctx: Context<CreatePool>,
        invoice_face_value: u64,
        advance_amount: u64,
        due_ts: i64,
        risk_score: u8,
        legal_asset_hash: [u8; 32],
        metadata_uri: String,
    ) -> Result<()> {
        instructions::create_pool::handler(
            ctx,
            invoice_face_value,
            advance_amount,
            due_ts,
            risk_score,
            legal_asset_hash,
            metadata_uri,
        )
    }

    pub fn update_pool_servicing(
        ctx: Context<UpdatePoolServicing>,
        risk_score: u8,
        servicing_status: u8,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::update_pool_servicing::handler(
            ctx,
            risk_score,
            servicing_status,
            metadata_uri,
        )
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        instructions::invest::handler(ctx, amount)
    }

    pub fn cancel_pool(ctx: Context<CancelPool>) -> Result<()> {
        instructions::cancel_pool::handler(ctx)
    }

    pub fn withdraw_cancelled(ctx: Context<WithdrawCancelled>) -> Result<()> {
        instructions::withdraw_cancelled::handler(ctx)
    }

    pub fn advance_to_issuer(ctx: Context<AdvanceToIssuer>) -> Result<()> {
        instructions::advance_to_issuer::handler(ctx)
    }

    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        instructions::repay::handler(ctx, amount)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        instructions::claim::handler(ctx)
    }

    pub fn collect_fee(ctx: Context<CollectFee>) -> Result<()> {
        instructions::collect_fee::handler(ctx)
    }

    pub fn mark_defaulted(ctx: Context<MarkDefaulted>) -> Result<()> {
        instructions::mark_defaulted::handler(ctx)
    }

    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        instructions::set_pause::handler(ctx, paused)
    }

    pub fn update_admin(ctx: Context<UpdateAdmin>, new_admin: Pubkey) -> Result<()> {
        instructions::update_admin::handler(ctx, new_admin)
    }

    pub fn update_treasury(ctx: Context<UpdateTreasury>) -> Result<()> {
        instructions::update_treasury::handler(ctx)
    }

    pub fn update_fee_bps(ctx: Context<UpdateFeeBps>, new_fee_bps: u16) -> Result<()> {
        instructions::update_fee_bps::handler(ctx, new_fee_bps)
    }
}
