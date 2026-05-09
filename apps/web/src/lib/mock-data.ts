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
  name: string;
  category: string;
  issuer: string;
  originator: string;
  spv: string;
  debtor: string;
  keyDebtorsLabel: string;
  receivablesCount: number;
  legalAssetHash: string;
  servicingStatus: "Active" | "Disputed" | "Impaired";
  servicingUpdated: string;
  invoiceValue: number;
  advanceAmount: number;
  fundedAmount: number;
  repaidAmount: number;
  claimableAmount: number;
  grossYieldPct: number;
  annualizedYieldPct: number;
  onTimeRepaymentRate: number;
  lateExposurePercent: number;
  durationDays: number;
  riskGrade: RiskGrade;
  status: PoolStatus;
  fundedPct: number;
  operatorName: string;
  servicerName: string;
  description: string;
  strategy: string;
  assetType: string;
  avgInvoiceSize: number;
  avgMaturityDays: number;
  dueLabel: string;
  txSig: string;
  nextDistributionLabel: string;
  composition: {
    industryMix: Array<{ label: string; percent: number }>;
    payerConcentration: Array<{ label: string; percent: number }>;
    maturityBuckets: Array<{ label: string; percent: number }>;
  };
  repaymentEvents: Array<{
    date: string;
    type: string;
    amount: number;
    txSignature: string;
  }>;
  disclosures: string[];
};

export const demoPools: PoolRecord[] = [
  {
    id: "1",
    name: "Stable 30–60 Day Receivables Pool",
    category: "Short Duration",
    issuer: "Manila Design Studio",
    originator: "FlowPay Originator PH",
    spv: "FlowPay SPV Alpha",
    debtor: "Acme Retail Group",
    keyDebtorsLabel: "Acme Retail Group, Luzon Consumer Stores",
    receivablesCount: 14,
    legalAssetHash:
      "0707070707070707070707070707070707070707070707070707070707070707",
    servicingStatus: "Active",
    servicingUpdated: "Today",
    invoiceValue: 10000,
    advanceAmount: 9500,
    fundedAmount: 6080,
    repaidAmount: 0,
    claimableAmount: 0,
    grossYieldPct: 5.26,
    annualizedYieldPct: 32,
    onTimeRepaymentRate: 97.2,
    lateExposurePercent: 1.8,
    durationDays: 60,
    riskGrade: "B",
    status: "Funding",
    fundedPct: 64,
    operatorName: "FlowPay Originator PH",
    servicerName: "FlowPay Servicing PH",
    description:
      "A short-duration receivables pool backed by diversified service invoices from repeat business customers.",
    strategy: "Conservative short-duration working-capital pool for recurring business receivables.",
    assetType: "Trade receivables",
    avgInvoiceSize: 714,
    avgMaturityDays: 47,
    dueLabel: "60 days",
    txSig: "5msuT3...Flow1",
    nextDistributionLabel: "After first payer settlements clear",
    composition: {
      industryMix: [
        { label: "Creative services", percent: 45 },
        { label: "Retail support", percent: 35 },
        { label: "SME operations", percent: 20 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 24 },
        { label: "Second payer", percent: 18 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 20 },
        { label: "31–45 days", percent: 45 },
        { label: "46–60 days", percent: 35 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-12", type: "Pool opened", amount: 0, txSignature: "5msuT3...Flow1" },
      { date: "2026-05-14", type: "Participation received", amount: 6080, txSignature: "5msuT3...Fund1" },
    ],
    disclosures: [
      "Estimated yield is not guaranteed.",
      "Pool cashflows depend on underlying payer performance.",
      "Late payments may delay distributions.",
    ],
  },
  {
    id: "2",
    name: "SME Growth Receivables Pool",
    category: "Diversified",
    issuer: "Jakarta Logistics Co.",
    originator: "FlowPay Originator ID",
    spv: "FlowPay SPV Beta",
    debtor: "Pacific Foods Ltd.",
    keyDebtorsLabel: "Pacific Foods Ltd., Nusantara Retail Group",
    receivablesCount: 22,
    legalAssetHash:
      "1111111111111111111111111111111111111111111111111111111111111111",
    servicingStatus: "Active",
    servicingUpdated: "Yesterday",
    invoiceValue: 25000,
    advanceAmount: 23750,
    fundedAmount: 23750,
    repaidAmount: 11800,
    claimableAmount: 0,
    grossYieldPct: 5.26,
    annualizedYieldPct: 42.7,
    onTimeRepaymentRate: 98.1,
    lateExposurePercent: 0.9,
    durationDays: 45,
    riskGrade: "A",
    status: "Advanced",
    fundedPct: 100,
    operatorName: "FlowPay Originator ID",
    servicerName: "FlowPay Servicing ID",
    description:
      "A diversified SME receivables pool designed to smooth cash conversion cycles for logistics and supply-chain operators.",
    strategy: "Diversified SME financing with a focus on repeat payers and short-duration turnover.",
    assetType: "Diversified receivables",
    avgInvoiceSize: 1136,
    avgMaturityDays: 45,
    dueLabel: "45 days",
    txSig: "3KF9q2...Flow2",
    nextDistributionLabel: "Expected after next scheduled repayment batch",
    composition: {
      industryMix: [
        { label: "Logistics", percent: 50 },
        { label: "Food supply", percent: 30 },
        { label: "Trade services", percent: 20 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 28 },
        { label: "Second payer", percent: 17 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 15 },
        { label: "31–45 days", percent: 55 },
        { label: "46–60 days", percent: 30 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-10", type: "Funding completed", amount: 23750, txSignature: "3KF9q2...Fund2" },
      { date: "2026-05-11", type: "Advance released", amount: 23750, txSignature: "3KF9q2...Adv2" },
      { date: "2026-05-18", type: "Repayment received", amount: 11800, txSignature: "3KF9q2...Rep2" },
    ],
    disclosures: [
      "Estimated yield reflects projected payer timing, not guaranteed outcomes.",
      "Servicing and collections are handled by the pool operator.",
      "Participation may be limited by pool-specific eligibility rules.",
    ],
  },
  {
    id: "3",
    name: "High Yield Trade Receivables Pool",
    category: "Higher Yield",
    issuer: "Cebu SaaS Agency",
    originator: "FlowPay Originator PH",
    spv: "FlowPay SPV Gamma",
    debtor: "Northstar Software",
    keyDebtorsLabel: "Northstar Software, VisMin Services",
    receivablesCount: 9,
    legalAssetHash:
      "2222222222222222222222222222222222222222222222222222222222222222",
    servicingStatus: "Impaired",
    servicingUpdated: "3 days ago",
    invoiceValue: 5000,
    advanceAmount: 4800,
    fundedAmount: 4800,
    repaidAmount: 499,
    claimableAmount: 499,
    grossYieldPct: 4.17,
    annualizedYieldPct: 50.7,
    onTimeRepaymentRate: 84.5,
    lateExposurePercent: 12.4,
    durationDays: 30,
    riskGrade: "B",
    status: "Repaid",
    fundedPct: 100,
    operatorName: "FlowPay Originator PH",
    servicerName: "FlowPay Special Situations",
    description:
      "A higher-yield receivables pool with more concentrated payer exposure and more visible servicing risk.",
    strategy: "Higher-yield working-capital pool with tighter concentration and elevated servicing review.",
    assetType: "Trade receivables",
    avgInvoiceSize: 556,
    avgMaturityDays: 31,
    dueLabel: "30 days",
    txSig: "9HcP4w...Flow3",
    nextDistributionLabel: "Claimable now",
    composition: {
      industryMix: [
        { label: "Software services", percent: 65 },
        { label: "Business outsourcing", percent: 35 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 41 },
        { label: "Second payer", percent: 21 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 70 },
        { label: "31–45 days", percent: 30 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-07", type: "Funding completed", amount: 4800, txSignature: "9HcP4w...Fund3" },
      { date: "2026-05-09", type: "Advance released", amount: 4800, txSignature: "9HcP4w...Adv3" },
      { date: "2026-05-20", type: "Repayment received", amount: 499, txSignature: "9HcP4w...Rep3" },
    ],
    disclosures: [
      "Higher estimated yield usually comes with higher concentration and servicing risk.",
      "Late exposure may delay or reduce distributions.",
      "Review servicing updates before participating.",
    ],
  },
  {
    id: "4",
    name: "Regional Trade Receivables Pool",
    category: "Short Duration",
    issuer: "Bangkok Parts Supply",
    originator: "FlowPay Originator TH",
    spv: "FlowPay SPV Delta",
    debtor: "Siam Retail Network",
    keyDebtorsLabel: "Siam Retail Network, Chao Phraya Parts Co.",
    receivablesCount: 16,
    legalAssetHash:
      "3333333333333333333333333333333333333333333333333333333333333333",
    servicingStatus: "Active",
    servicingUpdated: "Today",
    invoiceValue: 18000,
    advanceAmount: 17100,
    fundedAmount: 13851,
    repaidAmount: 0,
    claimableAmount: 0,
    grossYieldPct: 5.26,
    annualizedYieldPct: 36.4,
    onTimeRepaymentRate: 96.4,
    lateExposurePercent: 2.3,
    durationDays: 53,
    riskGrade: "A",
    status: "Funding",
    fundedPct: 81,
    operatorName: "FlowPay Originator TH",
    servicerName: "FlowPay Servicing TH",
    description:
      "A regional trade receivables pool backed by repeat manufacturing and retail counterparties.",
    strategy: "Short-duration pool balancing manufacturing and retail payer cycles.",
    assetType: "Trade receivables",
    avgInvoiceSize: 1069,
    avgMaturityDays: 53,
    dueLabel: "53 days",
    txSig: "7Dkq21...Flow4",
    nextDistributionLabel: "After pool reaches funding target and first repayments arrive",
    composition: {
      industryMix: [
        { label: "Manufacturing", percent: 54 },
        { label: "Retail supply", percent: 31 },
        { label: "Distribution", percent: 15 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 26 },
        { label: "Second payer", percent: 16 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 12 },
        { label: "31–45 days", percent: 43 },
        { label: "46–60 days", percent: 45 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-15", type: "Pool opened", amount: 0, txSignature: "7Dkq21...Flow4" },
      { date: "2026-05-16", type: "Participation received", amount: 13851, txSignature: "7Dkq21...Fund4" },
    ],
    disclosures: [
      "Estimated yield depends on timely payer settlement.",
      "Pool participation is subject to operator servicing performance.",
    ],
  },
  {
    id: "5",
    name: "Media Services Receivables Pool",
    category: "Diversified",
    issuer: "Ho Chi Minh Media Lab",
    originator: "FlowPay Originator VN",
    spv: "FlowPay SPV Epsilon",
    debtor: "Vertex Consumer Brands",
    keyDebtorsLabel: "Vertex Consumer Brands, Mekong Retail Media",
    receivablesCount: 12,
    legalAssetHash:
      "4444444444444444444444444444444444444444444444444444444444444444",
    servicingStatus: "Active",
    servicingUpdated: "Yesterday",
    invoiceValue: 14000,
    advanceAmount: 13200,
    fundedAmount: 13200,
    repaidAmount: 0,
    claimableAmount: 0,
    grossYieldPct: 6.06,
    annualizedYieldPct: 44.1,
    onTimeRepaymentRate: 93.8,
    lateExposurePercent: 3.6,
    durationDays: 50,
    riskGrade: "B",
    status: "Advanced",
    fundedPct: 100,
    operatorName: "FlowPay Originator VN",
    servicerName: "FlowPay Servicing VN",
    description:
      "A media-services receivables pool supported by enterprise marketing counterparties.",
    strategy: "Diversified commercial receivables pool with moderate yield and short cycle times.",
    assetType: "Service receivables",
    avgInvoiceSize: 1100,
    avgMaturityDays: 50,
    dueLabel: "50 days",
    txSig: "2Lvn66...Flow5",
    nextDistributionLabel: "Expected after next payer remittance window",
    composition: {
      industryMix: [
        { label: "Media services", percent: 58 },
        { label: "Consumer brands", percent: 27 },
        { label: "Production support", percent: 15 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 23 },
        { label: "Second payer", percent: 19 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 18 },
        { label: "31–45 days", percent: 44 },
        { label: "46–60 days", percent: 38 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-09", type: "Funding completed", amount: 13200, txSignature: "2Lvn66...Fund5" },
      { date: "2026-05-10", type: "Advance released", amount: 13200, txSignature: "2Lvn66...Adv5" },
    ],
    disclosures: [
      "Estimated yield is not guaranteed.",
      "Pool servicing and collections are handled by the operator.",
    ],
  },
  {
    id: "6",
    name: "High Yield Trade Receivables Pool B",
    category: "Higher Yield",
    issuer: "Kuala Lumpur Freight Ops",
    originator: "FlowPay Originator MY",
    spv: "FlowPay SPV Zeta",
    debtor: "Peninsula Foods Group",
    keyDebtorsLabel: "Peninsula Foods Group, Malacca Exports",
    receivablesCount: 11,
    legalAssetHash:
      "5555555555555555555555555555555555555555555555555555555555555555",
    servicingStatus: "Disputed",
    servicingUpdated: "Today",
    invoiceValue: 22000,
    advanceAmount: 20400,
    fundedAmount: 10608,
    repaidAmount: 0,
    claimableAmount: 0,
    grossYieldPct: 7.84,
    annualizedYieldPct: 58.2,
    onTimeRepaymentRate: 81.5,
    lateExposurePercent: 15.8,
    durationDays: 49,
    riskGrade: "C",
    status: "Funding",
    fundedPct: 52,
    operatorName: "FlowPay Originator MY",
    servicerName: "FlowPay Special Situations",
    description:
      "A higher-yield trade receivables pool with elevated late-payment exposure and closer servicing oversight.",
    strategy: "Higher-yield pool for users willing to accept more servicing volatility.",
    assetType: "Trade receivables",
    avgInvoiceSize: 1855,
    avgMaturityDays: 49,
    dueLabel: "49 days",
    txSig: "8Rmw44...Flow6",
    nextDistributionLabel: "Dependent on next successful collections cycle",
    composition: {
      industryMix: [
        { label: "Logistics", percent: 62 },
        { label: "Food trade", percent: 21 },
        { label: "Export support", percent: 17 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 34 },
        { label: "Second payer", percent: 20 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 14 },
        { label: "31–45 days", percent: 36 },
        { label: "46–60 days", percent: 50 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-15", type: "Pool opened", amount: 0, txSignature: "8Rmw44...Flow6" },
    ],
    disclosures: [
      "Higher estimated yield reflects higher late exposure.",
      "Distribution timing may shift if collections are delayed.",
    ],
  },
  {
    id: "7",
    name: "Prime Electronics Receivables Pool",
    category: "Short Duration",
    issuer: "Seoul Device Assembly",
    originator: "FlowPay Originator KR",
    spv: "FlowPay SPV Eta",
    debtor: "Han River Commerce",
    keyDebtorsLabel: "Han River Commerce, Metro Device Retailers",
    receivablesCount: 19,
    legalAssetHash:
      "6666666666666666666666666666666666666666666666666666666666666666",
    servicingStatus: "Active",
    servicingUpdated: "4 hours ago",
    invoiceValue: 31000,
    advanceAmount: 29000,
    fundedAmount: 29000,
    repaidAmount: 0,
    claimableAmount: 0,
    grossYieldPct: 4.83,
    annualizedYieldPct: 29.4,
    onTimeRepaymentRate: 98.7,
    lateExposurePercent: 0.6,
    durationDays: 60,
    riskGrade: "A",
    status: "Funded",
    fundedPct: 100,
    operatorName: "FlowPay Originator KR",
    servicerName: "FlowPay Servicing KR",
    description:
      "A conservative receivables pool supported by stronger payer quality and lower late exposure.",
    strategy: "Lower-volatility pool emphasizing repayment consistency over headline yield.",
    assetType: "Trade receivables",
    avgInvoiceSize: 1526,
    avgMaturityDays: 60,
    dueLabel: "60 days",
    txSig: "6Spd10...Flow7",
    nextDistributionLabel: "Expected after post-advance repayment window",
    composition: {
      industryMix: [
        { label: "Electronics", percent: 63 },
        { label: "Retail distribution", percent: 24 },
        { label: "Assembly support", percent: 13 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 22 },
        { label: "Second payer", percent: 14 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 10 },
        { label: "31–45 days", percent: 25 },
        { label: "46–60 days", percent: 65 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-10", type: "Funding completed", amount: 29000, txSignature: "6Spd10...Fund7" },
    ],
    disclosures: [
      "Estimated yield is lower because the pool targets stronger payer quality.",
      "Repayment timing still depends on underlying payer performance.",
    ],
  },
  {
    id: "8",
    name: "Software Services Receivables Pool",
    category: "Diversified",
    issuer: "Taipei Cloud Services",
    originator: "FlowPay Originator TW",
    spv: "FlowPay SPV Theta",
    debtor: "Pacific Software Holdings",
    keyDebtorsLabel: "Pacific Software Holdings, Formosa Enterprise Tech",
    receivablesCount: 13,
    legalAssetHash:
      "7777777777777777777777777777777777777777777777777777777777777777",
    servicingStatus: "Active",
    servicingUpdated: "Today",
    invoiceValue: 9000,
    advanceAmount: 8550,
    fundedAmount: 6242,
    repaidAmount: 0,
    claimableAmount: 0,
    grossYieldPct: 6.43,
    annualizedYieldPct: 47.6,
    onTimeRepaymentRate: 91.6,
    lateExposurePercent: 4.5,
    durationDays: 49,
    riskGrade: "B",
    status: "Funding",
    fundedPct: 73,
    operatorName: "FlowPay Originator TW",
    servicerName: "FlowPay Servicing TW",
    description:
      "A diversified software-services receivables pool with shorter duration and moderate concentration risk.",
    strategy: "Short-duration service receivables pool designed for faster turnover.",
    assetType: "Service receivables",
    avgInvoiceSize: 658,
    avgMaturityDays: 49,
    dueLabel: "49 days",
    txSig: "1Pfw88...Flow8",
    nextDistributionLabel: "Expected after next servicing batch",
    composition: {
      industryMix: [
        { label: "Software services", percent: 59 },
        { label: "Implementation", percent: 27 },
        { label: "Managed support", percent: 14 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 25 },
        { label: "Second payer", percent: 18 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 18 },
        { label: "31–45 days", percent: 41 },
        { label: "46–60 days", percent: 41 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-13", type: "Pool opened", amount: 0, txSignature: "1Pfw88...Flow8" },
      { date: "2026-05-16", type: "Participation received", amount: 6242, txSignature: "1Pfw88...Fund8" },
    ],
    disclosures: [
      "Participation is subject to pool-specific eligibility and availability.",
      "Projected cashflow may shift with servicing updates.",
    ],
  },
  {
    id: "9",
    name: "Healthcare Supply Receivables Pool",
    category: "Short Duration",
    issuer: "Manila Healthcare Supply",
    originator: "FlowPay Originator PH",
    spv: "FlowPay SPV Iota",
    debtor: "Island Medical Network",
    keyDebtorsLabel: "Island Medical Network, Pacific Clinical Group",
    receivablesCount: 18,
    legalAssetHash:
      "8888888888888888888888888888888888888888888888888888888888888888",
    servicingStatus: "Active",
    servicingUpdated: "2 days ago",
    invoiceValue: 27000,
    advanceAmount: 25650,
    fundedAmount: 25650,
    repaidAmount: 6400,
    claimableAmount: 0,
    grossYieldPct: 5.26,
    annualizedYieldPct: 38.9,
    onTimeRepaymentRate: 97.8,
    lateExposurePercent: 1.2,
    durationDays: 50,
    riskGrade: "A",
    status: "Advanced",
    fundedPct: 100,
    operatorName: "FlowPay Originator PH",
    servicerName: "FlowPay Healthcare Servicing",
    description:
      "A healthcare receivables pool backed by recurring institutional payer relationships.",
    strategy: "Defensive short-duration pool focused on recurring healthcare payment cycles.",
    assetType: "Trade receivables",
    avgInvoiceSize: 1425,
    avgMaturityDays: 50,
    dueLabel: "50 days",
    txSig: "4Umz52...Flow9",
    nextDistributionLabel: "Expected after next scheduled healthcare payer settlement",
    composition: {
      industryMix: [
        { label: "Healthcare supply", percent: 61 },
        { label: "Clinical operations", percent: 24 },
        { label: "Distribution", percent: 15 },
      ],
      payerConcentration: [
        { label: "Top payer", percent: 27 },
        { label: "Second payer", percent: 17 },
      ],
      maturityBuckets: [
        { label: "0–30 days", percent: 14 },
        { label: "31–45 days", percent: 39 },
        { label: "46–60 days", percent: 47 },
      ],
    },
    repaymentEvents: [
      { date: "2026-05-11", type: "Funding completed", amount: 25650, txSignature: "4Umz52...Fund9" },
      { date: "2026-05-12", type: "Advance released", amount: 25650, txSignature: "4Umz52...Adv9" },
      { date: "2026-05-19", type: "Repayment received", amount: 6400, txSignature: "4Umz52...Rep9" },
    ],
    disclosures: [
      "Estimated yield is not guaranteed.",
      "Repayments depend on underlying payer performance and servicing outcomes.",
    ],
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
  read: boolean;
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
    note: "Short-duration receivable pools fit users who want frequent check-ins and faster liquidity cycles.",
  },
  {
    label: "Comfort zone",
    value: "Risk grade A-B",
    note: "Higher-grade pools reduce underwriting complexity for first-time users.",
  },
];

export const assistChecklist: AssistChecklistItem[] = [
  {
    title: "Start with the payer quality, not the yield",
    description:
      "A strong enterprise payer profile and clean repayment history matter more than the highest displayed return.",
  },
  {
    title: "Match duration to your cash needs",
    description:
      "Receivable pools are short-term, but funds are still locked until repayments or secondary exits happen.",
  },
  {
    title: "Use servicing signals as your risk shortcut",
    description:
      "Active servicing, recent updates, and fully documented legal hashes are simpler trust anchors for non-experts.",
  },
];

export const assistRecommendations: AssistRecommendation[] = [
  {
    title: "Core match: SME Growth Receivables Pool",
    fit: "Best fit for cautious first-time participants",
    why: "This pool combines a stronger risk grade, verified payer context, and full funding progress, which makes the repayment story easier to understand and monitor.",
    watchouts:
      "Yield is not the absolute highest, so it suits confidence-building more than return maximization.",
    poolId: "2",
    confidence: "92% match",
  },
  {
    title: "Optional satellite: Stable 30–60 Day Receivables Pool",
    fit: "Good if you want a smaller, still-funding position",
    why: "The pool size is moderate and the funding round is still open, which can help users learn how pool progress changes over time.",
    watchouts:
      "Risk grade B means you should review payer quality and payment timing carefully before sizing up.",
    poolId: "1",
    confidence: "78% match",
  },
];

export const alertNotifications: AlertNotification[] = [
  {
    id: "alert-1",
    title: "Pool 2 reached full funding",
    body: "The SME Growth Receivables Pool is now 100% funded. Review repayment timing and servicing updates before adding a similar position.",
    timeLabel: "2 min ago",
    tone: "success",
    read: true,
    ctaLabel: "Review pool",
  },
  {
    id: "alert-2",
    title: "New AI Assist match available",
    body: "A lower-risk receivable pool profile has been highlighted for cautious first-time participants based on your current guidance view.",
    timeLabel: "12 min ago",
    tone: "info",
    read: false,
    ctaLabel: "AI Assist",
  },
  {
    id: "alert-3",
    title: "Servicing watch on Pool 3",
    body: "The High Yield Trade Receivables Pool remains in an impaired servicing state. Treat it as a learning example, not a starter allocation.",
    timeLabel: "Today",
    tone: "warning",
    read: false,
    ctaLabel: "Check risk",
  },
];
