export type PoolStatus = "Funding" | "Funded" | "Advanced" | "PartiallyRepaid" | "Repaid" | "Defaulted";
export type RiskGrade = "A" | "B" | "C" | "D";

export type PoolRecord = {
  id: string;
  issuer: string;
  debtor: string;
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
    debtor: "Acme Retail Group",
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
    debtor: "Pacific Foods Ltd.",
    invoiceValue: 25000,
    advanceAmount: 23750,
    grossYieldPct: 5.26,
    annualizedYieldPct: 42.7,
    durationDays: 45,
    riskGrade: "A",
    status: "Advanced",
    fundedPct: 100,
    description: "Completed logistics delivery invoice for a verified enterprise debtor.",
    dueLabel: "45 days",
    txSig: "3KF9q2...Flow2",
  },
  {
    id: "3",
    issuer: "Cebu SaaS Agency",
    debtor: "Northstar Software",
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
  { pool: "Manila Design Studio", invested: 950, claimable: 0, claimed: 0, status: "Funding" as PoolStatus },
  { pool: "Jakarta Logistics Co.", invested: 2375, claimable: 0, claimed: 0, status: "Advanced" as PoolStatus },
  { pool: "Cebu SaaS Agency", invested: 480, claimable: 499, claimed: 0, status: "Repaid" as PoolStatus },
];
