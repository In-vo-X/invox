import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.invoiceMetadata.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.demoEventLog.deleteMany();

  const pools = await prisma.invoiceMetadata.createMany({
    data: [
      {
        poolId: "1",
        issuerName: "Manila Design Studio",
        issuerWallet: "issuer-demo-1",
        debtorName: "Acme Retail Group",
        invoiceNumber: "MDS-2026-001",
        invoiceFaceValue: 10000,
        advanceAmount: 9500,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        paymentTerms: "Net 60",
        description:
          "Completed brand design project with net-60 payment terms.",
        proofDocumentUrl: "https://example.com/proof/manila-design.pdf",
        riskScore: 78,
        riskGrade: "B",
        status: "Funding",
      },
      {
        poolId: "2",
        issuerName: "Jakarta Logistics Co.",
        issuerWallet: "issuer-demo-2",
        debtorName: "Pacific Foods Ltd.",
        invoiceNumber: "JLC-2026-019",
        invoiceFaceValue: 25000,
        advanceAmount: 23750,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        paymentTerms: "Net 45",
        description:
          "Completed logistics delivery invoice for a verified enterprise debtor.",
        proofDocumentUrl: "https://example.com/proof/jakarta-logistics.pdf",
        riskScore: 91,
        riskGrade: "A",
        status: "Advanced",
      },
      {
        poolId: "3",
        issuerName: "Cebu SaaS Agency",
        issuerWallet: "issuer-demo-3",
        debtorName: "Northstar Software",
        invoiceNumber: "CSA-2026-302",
        invoiceFaceValue: 5000,
        advanceAmount: 4800,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentTerms: "Net 30",
        description: "Monthly SaaS implementation invoice awaiting payment.",
        proofDocumentUrl: "https://example.com/proof/cebu-saas.pdf",
        riskScore: 74,
        riskGrade: "B",
        status: "Repaid",
      },
    ],
  });

  await prisma.demoEventLog.createMany({
    data: [
      { type: "seed", message: `Seeded ${pools.count} invoice metadata rows.` },
      {
        type: "tx",
        message: "Demo repayment recorded",
        txSig: "5msuT3...Flow1",
        poolId: "1",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
