# FlowPay

FlowPay is a Solana hackathon MVP for on-chain invoice cashflow investing. It keeps legal invoice ownership off-chain while moving funding, issuer advances, repayments, and investor claims onto Solana.

## Stack
- Anchor
- Solana SPL Token
- Next.js
- Prisma SQLite
- TypeScript SDK

## Local setup
```bash
pnpm install
anchor build
pnpm --dir apps/web prisma:generate
pnpm --dir apps/web prisma:push
pnpm --dir apps/web prisma:seed
```

## Test
```bash
anchor test --validator legacy
```

## Web
```bash
pnpm --dir apps/web dev
```

## Notes
- Program ID: `EjfVxrCATPwhbEKEcMAamkZaMabRaYStprDmAFu5TQFB`
- Wallet provider defaults to Solana Devnet in the web app.
- Prisma stores metadata and demo indexing only; balances and claims remain on-chain.
