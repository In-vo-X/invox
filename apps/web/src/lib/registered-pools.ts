import { prisma } from "@/lib/prisma";
import type { PoolRecord } from "@/lib/mock-data";

function inferRiskGrade(score: number) {
  if (score >= 85) return "A" as const;
  if (score >= 70) return "B" as const;
  if (score >= 55) return "C" as const;
  return "D" as const;
}

export async function getRegisteredPools(): Promise<PoolRecord[]> {
  const rows = await prisma.invoiceMetadata.findMany({ orderBy: { createdAt: "desc" } });

  return rows.map((row, index) => ({
    id: row.poolId ?? row.id,
    name: row.poolName ?? `${row.issuerName} Invoice Pool`,
    category: row.category ?? "Custom",
    issuer: row.issuerName,
    originator: row.operatorName ?? row.issuerName,
    spv: `FlowPay SPV ${index + 20}`,
    debtor: row.debtorName,
    keyDebtorsLabel: row.debtorName,
    receivablesCount: row.receivablesCount ?? 1,
    legalAssetHash: `db-${(row.poolId ?? row.id).padEnd(18, "0")}`,
    servicingStatus: "Active",
    servicingUpdated: "Today",
    invoiceValue: row.invoiceFaceValue,
    advanceAmount: row.advanceAmount,
    fundedAmount: 0,
    repaidAmount: 0,
    claimableAmount: 0,
    grossYieldPct: row.estimatedYieldPct ?? 6.2,
    annualizedYieldPct: row.estimatedYieldPct ?? 6.2,
    onTimeRepaymentRate: row.onTimeRepaymentPct ?? 95,
    lateExposurePercent: row.lateExposurePct ?? 0,
    durationDays: row.avgDurationDays ?? 45,
    riskGrade: inferRiskGrade(row.riskScore),
    status: (row.status as PoolRecord["status"]) ?? "Funding",
    fundedPct: 0,
    operatorName: row.operatorName ?? row.issuerName,
    servicerName: row.operatorName ?? row.issuerName,
    description: row.description,
    strategy: row.description,
    assetType: "Invoice receivables",
    avgInvoiceSize: row.invoiceFaceValue / Math.max(row.receivablesCount ?? 1, 1),
    avgMaturityDays: row.avgDurationDays ?? 45,
    dueLabel: row.paymentTerms,
    txSig: "Pending registration",
    nextDistributionLabel: "Available after repayments are recorded",
    composition: {
      industryMix: [{ label: "Custom originator", percent: 100 }],
      payerConcentration: [{ label: row.debtorName, percent: 100 }],
      maturityBuckets: [{ label: row.paymentTerms, percent: 100 }],
    },
    repaymentEvents: [
      {
        date: row.createdAt.toISOString().slice(0, 10),
        type: "Pool registered",
        amount: 0,
        txSignature: "pending",
      },
    ],
    disclosures: [
      "Estimated yield is not guaranteed.",
      "Custom pool registration should still be reviewed by an operator before public participation.",
    ],
  }));
}
