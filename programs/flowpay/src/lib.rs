pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("EjfVxrCATPwhbEKEcMAamkZaMabRaYStprDmAFu5TQFB");

#[program]
pub mod flowpay {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        fee_bps: u16,
    ) -> Result<()> {
        initialize_platform::handler(ctx, fee_bps)
    }

    pub fn create_pool(
        ctx: Context<CreatePool>,
        invoice_face_value: u64,
        advance_amount: u64,
        due_ts: i64,
        risk_score: u8,
        metadata_uri: String,
    ) -> Result<()> {
        create_pool::handler(
            ctx,
            invoice_face_value,
            advance_amount,
            due_ts,
            risk_score,
            metadata_uri,
        )
    }

    pub fn invest(ctx: Context<Invest>, amount: u64) -> Result<()> {
        invest::handler(ctx, amount)
    }

    pub fn cancel_pool(ctx: Context<CancelPool>) -> Result<()> {
        cancel_pool::handler(ctx)
    }

    pub fn withdraw_cancelled(ctx: Context<WithdrawCancelled>) -> Result<()> {
        withdraw_cancelled::handler(ctx)
    }

    pub fn advance_to_issuer(ctx: Context<AdvanceToIssuer>) -> Result<()> {
        advance_to_issuer::handler(ctx)
    }

    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        repay::handler(ctx, amount)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        claim::handler(ctx)
    }

    pub fn collect_fee(ctx: Context<CollectFee>) -> Result<()> {
        collect_fee::handler(ctx)
    }

    pub fn mark_defaulted(ctx: Context<MarkDefaulted>) -> Result<()> {
        mark_defaulted::handler(ctx)
    }

    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        set_pause::handler(ctx, paused)
    }
}
