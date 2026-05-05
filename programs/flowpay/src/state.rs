use anchor_lang::prelude::*;

use crate::constants::MAX_METADATA_URI_LEN;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
#[borsh(use_discriminant = true)]
#[repr(u8)]
pub enum PoolStatus {
    Funding = 0,
    Funded = 1,
    Advanced = 2,
    PartiallyRepaid = 3,
    Repaid = 4,
    Closed = 5,
    Cancelled = 6,
    Defaulted = 7,
}

impl PoolStatus {
    pub const LEN: usize = 1;
}

#[account]
pub struct PlatformConfig {
    pub admin: Pubkey,
    pub usdc_mint: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
    pub next_pool_id: u64,
    pub paused: bool,
    pub bump: u8,
}

impl PlatformConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 2 + 8 + 1 + 1;
}

#[account]
pub struct InvoicePool {
    pub pool_id: u64,
    pub issuer: Pubkey,
    pub originator: Pubkey,
    pub spv: Pubkey,
    pub usdc_mint: Pubkey,
    pub vault: Pubkey,
    pub legal_asset_hash: [u8; 32],
    pub invoice_face_value: u64,
    pub advance_amount: u64,
    pub funded_amount: u64,
    pub repaid_amount: u64,
    pub fee_owed_amount: u64,
    pub fee_collected_amount: u64,
    pub claimed_amount: u64,
    pub fee_bps: u16,
    pub due_ts: i64,
    pub created_ts: i64,
    pub status: PoolStatus,
    pub risk_score: u8,
    pub servicing_status: u8,
    pub servicing_updated_ts: i64,
    pub metadata_uri: String,
    pub bump: u8,
    pub vault_authority_bump: u8,
}

impl InvoicePool {
    pub const SPACE: usize = 8
        + 8
        + 32
        + 32
        + 32
        + 32
        + 32
        + 32
        + 8
        + 8
        + 8
        + 8
        + 8
        + 8
        + 8
        + 2
        + 8
        + 8
        + PoolStatus::LEN
        + 1
        + 1
        + 8
        + 4
        + MAX_METADATA_URI_LEN
        + 1
        + 1;

    pub fn is_repayment_open(&self) -> bool {
        matches!(
            self.status,
            PoolStatus::Advanced | PoolStatus::PartiallyRepaid | PoolStatus::Defaulted
        )
    }

    pub fn net_repaid_amount(&self) -> Result<u64> {
        self.repaid_amount
            .checked_sub(self.fee_owed_amount)
            .ok_or(crate::error::FlowPayError::MathOverflow.into())
    }
}

#[account]
pub struct Investment {
    pub pool: Pubkey,
    pub investor: Pubkey,
    pub amount: u64,
    pub claimed_amount: u64,
    pub created_ts: i64,
    pub bump: u8,
}

impl Investment {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1;
}
