export type PoolStatus =
  | "Funding"
  | "Funded"
  | "Advanced"
  | "PartiallyRepaid"
  | "Repaid"
  | "Defaulted";
export type RiskGrade = "A" | "B" | "C" | "D";

export type PoolRecord = {
  id: string;
  issuer: string;
  originator: string;
  spv: string;
  debtor: string;
  legalAssetHash: string;
  servicingStatus: "Active" | "Disputed" | "Impaired";
  servicingUpdated: string;
  invoiceValue: number;
  advanceAmount: number;
  grossYieldPct: number;
  annualizedYieldPct: number;
  durationDays: number;
  riskGrade: RiskGrade;
  status: PoolStatus;
  fundedPct: number;
  description: string;
  dueLabel: string;
  txSig: string;
};

export const demoPools: PoolRecord[] = [
  {
    id: "1",
    issuer: "Manila Design Studio",
    originator: "FlowPay Originator PH",
    spv: "FlowPay SPV Alpha",
    debtor: "Acme Retail Group",
    legalAssetHash:
      "0707070707070707070707070707070707070707070707070707070707070707",
    servicingStatus: "Active",
    servicingUpdated: "Today",
    invoiceValue: 10000,
    advanceAmount: 9500,
    grossYieldPct: 5.26,
    annualizedYieldPct: 32,
    durationDays: 60,
    riskGrade: "B",
    status: "Funding",
    fundedPct: 64,
    description: "Completed brand design project with net-60 payment terms.",
    dueLabel: "60 days",
    txSig: "5msuT3...Flow1",
  },
  {
    id: "2",
    issuer: "Jakarta Logistics Co.",
    originator: "FlowPay Originator ID",
    spv: "FlowPay SPV Beta",
    debtor: "Pacific Foods Ltd.",
    legalAssetHash:
      "1111111111111111111111111111111111111111111111111111111111111111",
    servicingStatus: "Active",
    servicingUpdated: "Yesterday",
    invoiceValue: 25000,
    advanceAmount: 23750,
    grossYieldPct: 5.26,
    annualizedYieldPct: 42.7,
    durationDays: 45,
    riskGrade: "A",
    status: "Advanced",
    fundedPct: 100,
    description:
      "Completed logistics delivery invoice for a verified enterprise debtor.",
    dueLabel: "45 days",
    txSig: "3KF9q2...Flow2",
  },
  {
    id: "3",
    issuer: "Cebu SaaS Agency",
    originator: "FlowPay Originator PH",
    spv: "FlowPay SPV Gamma",
    debtor: "Northstar Software",
    legalAssetHash:
      "2222222222222222222222222222222222222222222222222222222222222222",
    servicingStatus: "Impaired",
    servicingUpdated: "3 days ago",
    invoiceValue: 5000,
    advanceAmount: 4800,
    grossYieldPct: 4.17,
    annualizedYieldPct: 50.7,
    durationDays: 30,
    riskGrade: "B",
    status: "Repaid",
    fundedPct: 100,
    description: "Monthly SaaS implementation invoice awaiting payment.",
    dueLabel: "30 days",
    txSig: "9HcP4w...Flow3",
  },
];

export const portfolioRows = [
  {
    pool: "Manila Design Studio",
    invested: 950,
    claimable: 0,
    claimed: 0,
    status: "Funding" as PoolStatus,
  },
  {
    pool: "Jakarta Logistics Co.",
    invested: 2375,
    claimable: 0,
    claimed: 0,
    status: "Advanced" as PoolStatus,
  },
  {
    pool: "Cebu SaaS Agency",
    invested: 480,
    claimable: 499,
    claimed: 0,
    status: "Repaid" as PoolStatus,
  },
];

export type AssistProfile = {
  label: string;
  value: string;
  note: string;
};

export type AssistChecklistItem = {
  title: string;
  description: string;
};

export type AssistRecommendation = {
  title: string;
  fit: string;
  why: string;
  watchouts: string;
  poolId: string;
  confidence: string;
};

export const assistProfiles: AssistProfile[] = [
  {
    label: "Investor style",
    value: "Balanced income seeker",
    note: "Prefers steady repayment visibility over aggressive yield chasing.",
  },
  {
    label: "Suggested hold period",
    value: "30-60 days",
    note: "Short-duration invoice pools fit users who want frequent check-ins and faster liquidity cycles.",
  },
  {
    label: "Comfort zone",
    value: "Risk grade A-B",
    note: "Higher-grade pools reduce underwriting complexity for first-time users.",
  },
];

export const assistChecklist: AssistChecklistItem[] = [
  {
    title: "Start with the debtor, not the yield",
    description:
      "A strong enterprise debtor and clean payment history matter more than the highest displayed return.",
  },
  {
    title: "Match duration to your cash needs",
    description:
      "Invoice pools are short-term, but funds are still locked until repayments or secondary exits happen.",
  },
  {
    title: "Use servicing signals as your risk shortcut",
    description:
      "Active servicing, recent updates, and fully documented legal hashes are simpler trust anchors for non-experts.",
  },
];

export const assistRecommendations: AssistRecommendation[] = [
  {
    title: "Core match: Jakarta Logistics Co.",
    fit: "Best fit for cautious first-time investors",
    why:
      "This pool combines a top risk grade, verified enterprise counterparty context, and full funding progress, which makes the story easier to understand and monitor.",
    watchouts:
      "Yield is not the absolute highest, so it suits confidence-building more than return maximization.",
    poolId: "2",
    confidence: "92% match",
  },
  {
    title: "Optional satellite: Manila Design Studio",
    fit: "Good if you want a smaller, still-funding position",
    why:
      "The invoice size is moderate and the funding round is still open, which can help users learn how pool progress changes over time.",
    watchouts:
      "Risk grade B means you should review debtor quality and payment timing carefully before sizing up.",
    poolId: "1",
    confidence: "78% match",
  },
];
