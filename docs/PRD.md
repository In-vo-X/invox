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

## UX direction
- Light premium fintech dashboard
- Left sidebar, topbar, KPI cards, soft gradients
- RWA-first trust language instead of crypto-native trading language

## Disclaimer
This repository is a hackathon MVP for Devnet or Localnet and does not represent a regulated securities offering or legal claim to real-world invoices.
