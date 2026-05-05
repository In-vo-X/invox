# FlowPay PRD

## Product
FlowPay is a Solana-based on-chain invoice cashflow protocol that lets investors fund short-duration invoice pools with USDC, advance working capital to issuers, and claim principal plus yield after repayment.

## Core MVP
- Wallet connection
- Mock USDC faucet
- Invoice pool creation
- Marketplace and pool detail views
- Invest, advance, repay, claim flows
- Portfolio and admin surfaces
- Prisma-backed metadata and risk summaries
- TypeScript SDK and Anchor tests

## On-chain model
- `PlatformConfig` PDA
- `InvoicePool` PDA
- `Investment` PDA
- Pool vault ATA owned by PDA authority
- Claim-based distribution after repayment

## Contract MVP scope
- Legal invoice ownership, assignment agreements, KYC/KYB, debtor collection, and enforcement remain off-chain.
- On-chain state records issuer, originator, SPV wallet, immutable legal asset hash, risk score, servicing status, and metadata URI.
- Investors fund an invoice cashflow pool with USDC; the originator or admin advances funds to the issuer after full funding.
- Repayments can be posted by the admin or originator. Investor claims are pro-rata against net repaid cash after the protocol fee snapshot.
- Platform fee bps is snapshotted per pool at creation so later config changes cannot alter existing pool economics.
- Servicing updates are disclosure-only. They can update risk score, servicing status, and metadata URI, but cannot mutate face value, advance amount, due date, investor balances, or fee terms.

## Lifecycle
```text
Funding -> Funded -> Advanced -> PartiallyRepaid -> Repaid -> Closed
       \-> Cancelled -> Closed
Advanced/PartiallyRepaid -> Defaulted -> claims/recoveries continue
```

## Servicing status
- `0`: active
- `1`: disputed
- `2`: impaired

## UX direction
- Light premium fintech dashboard
- Left sidebar, topbar, KPI cards, soft gradients
- RWA-first trust language instead of crypto-native trading language

## Disclaimer
This repository is a hackathon MVP for Devnet or Localnet and does not represent a regulated securities offering or legal claim to real-world invoices.
