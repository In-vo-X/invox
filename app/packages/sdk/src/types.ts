export type FlowPayPool = {
  poolId: bigint;
  issuer: string;
  originator: string;
  invoiceFaceValue: bigint;
  advanceAmount: bigint;
  fundedAmount: bigint;
  repaidAmount: bigint;
  claimedAmount: bigint;
  dueTs: bigint;
  riskScore: number;
  metadataUri: string;
};

export type CreatePoolParams = {
  invoiceFaceValue: bigint;
  advanceAmount: bigint;
  dueTs: bigint;
  riskScore: number;
  metadataUri: string;
};
