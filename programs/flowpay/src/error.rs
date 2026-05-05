use anchor_lang::prelude::*;

#[error_code]
pub enum FlowPayError {
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Platform is paused")]
    PlatformPaused,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid due date")]
    InvalidDueDate,
    #[msg("Invalid risk score")]
    InvalidRiskScore,
    #[msg("Pool is not in funding state")]
    PoolNotFunding,
    #[msg("Pool is not fully funded")]
    PoolNotFunded,
    #[msg("Pool is not in advanced state")]
    PoolNotAdvanced,
    #[msg("Pool is not repaid")]
    PoolNotRepaid,
    #[msg("Pool is already cancelled")]
    AlreadyCancelled,
    #[msg("Over funding is not allowed")]
    OverFunding,
    #[msg("Nothing to claim")]
    NothingToClaim,
    #[msg("Nothing to collect")]
    NothingToCollect,
    #[msg("Invalid status transition")]
    InvalidStatusTransition,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Metadata URI is too long")]
    InvalidMetadataUri,
    #[msg("Fee basis points exceed the maximum")]
    FeeTooHigh,
    #[msg("Invalid treasury token account")]
    InvalidTreasury,
    #[msg("Invalid USDC mint")]
    InvalidUsdcMint,
    #[msg("Funding must be incomplete to cancel")]
    FundingStillOpen,
    #[msg("Default conditions are not met")]
    DefaultNotReached,
}
