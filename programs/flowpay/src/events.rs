use anchor_lang::prelude::*;

#[event]
pub struct PlatformInitialized {
    pub admin: Pubkey,
    pub usdc_mint: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
}

#[event]
pub struct PoolCreated {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub issuer: Pubkey,
    pub originator: Pubkey,
    pub spv: Pubkey,
    pub legal_asset_hash: [u8; 32],
    pub invoice_face_value: u64,
    pub advance_amount: u64,
    pub due_ts: i64,
    pub risk_score: u8,
    pub metadata_uri: String,
    pub fee_bps: u16,
}

#[event]
pub struct PoolServicingUpdated {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub authority: Pubkey,
    pub risk_score: u8,
    pub servicing_status: u8,
    pub metadata_uri: String,
    pub updated_ts: i64,
}

#[event]
pub struct Invested {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub investor: Pubkey,
    pub amount: u64,
    pub funded_amount: u64,
    pub status: u8,
}

#[event]
pub struct AdvancedToIssuer {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub authority: Pubkey,
    pub issuer: Pubkey,
    pub amount: u64,
}

#[event]
pub struct Repaid {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub payer: Pubkey,
    pub amount: u64,
    pub fee_amount: u64,
    pub repaid_amount: u64,
    pub status: u8,
}

#[event]
pub struct Claimed {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub investor: Pubkey,
    pub amount: u64,
    pub claimed_amount: u64,
    pub status: u8,
}

#[event]
pub struct FeeCollected {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub authority: Pubkey,
    pub amount: u64,
    pub fee_collected_amount: u64,
}

#[event]
pub struct PoolCancelled {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub authority: Pubkey,
    pub funded_amount: u64,
}

#[event]
pub struct CancelledInvestmentWithdrawn {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub investor: Pubkey,
    pub amount: u64,
    pub claimed_amount: u64,
    pub status: u8,
}

#[event]
pub struct PoolDefaulted {
    pub pool: Pubkey,
    pub pool_id: u64,
    pub authority: Pubkey,
    pub due_ts: i64,
}

#[event]
pub struct PlatformPauseSet {
    pub admin: Pubkey,
    pub paused: bool,
}

#[event]
pub struct PlatformAdminUpdated {
    pub previous_admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct PlatformTreasuryUpdated {
    pub admin: Pubkey,
    pub previous_treasury: Pubkey,
    pub new_treasury: Pubkey,
}

#[event]
pub struct PlatformFeeBpsUpdated {
    pub admin: Pubkey,
    pub previous_fee_bps: u16,
    pub new_fee_bps: u16,
}
