export type LegalAssetHash =
  | Uint8Array
  | readonly [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];

export type FlowPayPool = {
  poolId: bigint;
  issuer: string;
  originator: string;
  spv: string;
  usdcMint: string;
  vault: string;
  legalAssetHash: LegalAssetHash;
  invoiceFaceValue: bigint;
  advanceAmount: bigint;
  fundedAmount: bigint;
  repaidAmount: bigint;
  feeOwedAmount: bigint;
  feeCollectedAmount: bigint;
  claimedAmount: bigint;
  feeBps: number;
  dueTs: bigint;
  createdTs: bigint;
  status: string;
  riskScore: number;
  servicingStatus: number;
  servicingUpdatedTs: bigint;
  metadataUri: string;
};

export type CreatePoolParams = {
  issuer: string;
  originator: string;
  spv: string;
  invoiceFaceValue: bigint;
  advanceAmount: bigint;
  dueTs: bigint;
  riskScore: number;
  legalAssetHash: LegalAssetHash;
  metadataUri: string;
};

export type CreatePoolResult = {
  signature: string;
  poolId: bigint;
  pool: string;
};

export type InitializePlatformParams = {
  usdcMint: string;
  treasury: string;
  feeBps: number;
};

export type SetPauseParams = {
  paused: boolean;
};

export type UpdateAdminParams = {
  newAdmin: string;
};

export type UpdateTreasuryParams = {
  treasury: string;
};

export type UpdateFeeBpsParams = {
  newFeeBps: number;
};

export type UpdatePoolServicingParams = {
  poolId: bigint;
  riskScore: number;
  servicingStatus: number;
  metadataUri: string;
};

export type PoolActionParams = {
  poolId: bigint;
};

export type InvestParams = PoolActionParams & {
  investor: string;
  investorTokenAccount: string;
  amount: bigint;
};

export type RepayParams = PoolActionParams & {
  payerTokenAccount: string;
  amount: bigint;
};

export type ClaimParams = PoolActionParams & {
  investor: string;
  investorTokenAccount: string;
};

export type AdvanceToIssuerParams = PoolActionParams & {
  issuerTokenAccount: string;
};

export type CollectFeeParams = PoolActionParams & {
  treasury: string;
};

export type WithdrawCancelledParams = ClaimParams;
