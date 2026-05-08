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
  {
    id: "4",
    issuer: "Bangkok Parts Supply",
    originator: "FlowPay Originator TH",
    spv: "FlowPay SPV Delta",
    debtor: "Siam Retail Network",
    legalAssetHash:
      "3333333333333333333333333333333333333333333333333333333333333333",
    servicingStatus: "Active",
    servicingUpdated: "Today",
    invoiceValue: 18000,
    advanceAmount: 17100,
    grossYieldPct: 5.26,
    annualizedYieldPct: 36.4,
    durationDays: 53,
    riskGrade: "A",
    status: "Funding",
    fundedPct: 81,
    description:
      "Manufacturing parts delivery invoice with repeat debtor payment history.",
    dueLabel: "53 days",
    txSig: "7Dkq21...Flow4",
  },
  {
    id: "5",
    issuer: "Ho Chi Minh Media Lab",
    originator: "FlowPay Originator VN",
    spv: "FlowPay SPV Epsilon",
    debtor: "Vertex Consumer Brands",
    legalAssetHash:
      "4444444444444444444444444444444444444444444444444444444444444444",
    servicingStatus: "Active",
    servicingUpdated: "Yesterday",
    invoiceValue: 14000,
    advanceAmount: 13200,
    grossYieldPct: 6.06,
    annualizedYieldPct: 44.1,
    durationDays: 50,
    riskGrade: "B",
    status: "Advanced",
    fundedPct: 100,
    description:
      "Campaign production invoice backed by an enterprise marketing budget.",
    dueLabel: "50 days",
    txSig: "2Lvn66...Flow5",
  },
  {
    id: "6",
    issuer: "Kuala Lumpur Freight Ops",
    originator: "FlowPay Originator MY",
    spv: "FlowPay SPV Zeta",
    debtor: "Peninsula Foods Group",
    legalAssetHash:
      "5555555555555555555555555555555555555555555555555555555555555555",
    servicingStatus: "Disputed",
    servicingUpdated: "Today",
    invoiceValue: 22000,
    advanceAmount: 20400,
    grossYieldPct: 7.84,
    annualizedYieldPct: 58.2,
    durationDays: 49,
    riskGrade: "C",
    status: "Funding",
    fundedPct: 52,
    description:
      "Cross-border logistics receivable with elevated servicing review requirements.",
    dueLabel: "49 days",
    txSig: "8Rmw44...Flow6",
  },
  {
    id: "7",
    issuer: "Seoul Device Assembly",
    originator: "FlowPay Originator KR",
    spv: "FlowPay SPV Eta",
    debtor: "Han River Commerce",
    legalAssetHash:
      "6666666666666666666666666666666666666666666666666666666666666666",
    servicingStatus: "Active",
    servicingUpdated: "4 hours ago",
    invoiceValue: 31000,
    advanceAmount: 29000,
    grossYieldPct: 4.83,
    annualizedYieldPct: 29.4,
    durationDays: 60,
    riskGrade: "A",
    status: "Funded",
    fundedPct: 100,
    description:
      "Consumer electronics assembly invoice with conservative yield and strong debtor profile.",
    dueLabel: "60 days",
    txSig: "6Spd10...Flow7",
  },
  {
    id: "8",
    issuer: "Taipei Cloud Services",
    originator: "FlowPay Originator TW",
    spv: "FlowPay SPV Theta",
    debtor: "Pacific Software Holdings",
    legalAssetHash:
      "7777777777777777777777777777777777777777777777777777777777777777",
    servicingStatus: "Active",
    servicingUpdated: "Today",
    invoiceValue: 9000,
    advanceAmount: 8550,
    grossYieldPct: 6.43,
    annualizedYieldPct: 47.6,
    durationDays: 49,
    riskGrade: "B",
    status: "Funding",
    fundedPct: 73,
    description:
      "Quarterly software implementation receivable with short duration and clean file package.",
    dueLabel: "49 days",
    txSig: "1Pfw88...Flow8",
  },
  {
    id: "9",
    issuer: "Manila Healthcare Supply",
    originator: "FlowPay Originator PH",
    spv: "FlowPay SPV Iota",
    debtor: "Island Medical Network",
    legalAssetHash:
      "8888888888888888888888888888888888888888888888888888888888888888",
    servicingStatus: "Active",
    servicingUpdated: "2 days ago",
    invoiceValue: 27000,
    advanceAmount: 25650,
    grossYieldPct: 5.26,
    annualizedYieldPct: 38.9,
    durationDays: 50,
    riskGrade: "A",
    status: "Advanced",
    fundedPct: 100,
    description:
      "Medical supply receivable with recurring institutional buyer relationship.",
    dueLabel: "50 days",
    txSig: "4Umz52...Flow9",
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

export type AlertNotification = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  tone: "info" | "success" | "warning";
  ctaLabel?: string;
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
    why: "This pool combines a top risk grade, verified enterprise counterparty context, and full funding progress, which makes the story easier to understand and monitor.",
    watchouts:
      "Yield is not the absolute highest, so it suits confidence-building more than return maximization.",
    poolId: "2",
    confidence: "92% match",
  },
  {
    title: "Optional satellite: Manila Design Studio",
    fit: "Good if you want a smaller, still-funding position",
    why: "The invoice size is moderate and the funding round is still open, which can help users learn how pool progress changes over time.",
    watchouts:
      "Risk grade B means you should review debtor quality and payment timing carefully before sizing up.",
    poolId: "1",
    confidence: "78% match",
  },
];

export const alertNotifications: AlertNotification[] = [
  {
    id: "alert-1",
    title: "Pool 2 reached full funding",
    body: "Jakarta Logistics Co. is now 100% funded. Review repayment timing and servicing updates before adding a similar position.",
    timeLabel: "2 min ago",
    tone: "success",
    ctaLabel: "Review pool",
  },
  {
    id: "alert-2",
    title: "New AI Assist match available",
    body: "A lower-risk invoice profile has been highlighted for cautious first-time investors based on your current guidance view.",
    timeLabel: "12 min ago",
    tone: "info",
    ctaLabel: "Open AI Assist",
  },
  {
    id: "alert-3",
    title: "Servicing watch on Pool 3",
    body: "Cebu SaaS Agency remains in an impaired servicing state. Treat it as a learning example, not a starter allocation.",
    timeLabel: "Today",
    tone: "warning",
    ctaLabel: "Check risk",
  },
];
