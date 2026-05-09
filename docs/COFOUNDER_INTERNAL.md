# InvoX Internal Cofounder Brief

## 1. What this product is

InvoX is a Solana-based invoice cashflow investing platform. The product keeps legal invoice ownership and operational documentation off-chain, while moving funding, issuer advances, repayments, and investor claims onto Solana. The goal is not to turn invoices into a speculative token product, but to turn a hard-to-access structured finance workflow into a more transparent, trackable, and user-friendly investment rail.

At a high level, InvoX converts unpaid invoices into short-duration, yield-bearing opportunities that can be evaluated, funded, advanced, repaid, and claimed through a combination of off-chain metadata and on-chain settlement logic.

---

## 2. The problem we are solving

Traditional invoice financing is operationally real and often economically attractive, but it is not accessible to normal digital investors. The market is fragmented, opaque, and built around institutional/operator workflows rather than investor-facing UX.

The main pain points are:

1. **Information asymmetry** — users cannot easily tell who pays, when cashflows are due, why yield is high, or what the real risk drivers are.
2. **Low accessibility** — invoice financing is mostly originator-, factor-, and institution-driven, not consumer-investor-friendly.
3. **No clean investment UX** — users see documents and process, not understandable positions and comparable opportunities.
4. **Opaque settlement state** — it is difficult to track how much has been funded, advanced, repaid, or claimed in a structured, real-time way.

InvoX addresses these gaps by separating legal/off-chain truth from settlement/on-chain truth, while exposing the latter in a cleaner product experience.

---

## 3. Product thesis

The thesis is simple:

> Real-world invoice cashflows can be made significantly more transparent and understandable if funding, advancement, repayment, and claiming are formalized as programmable on-chain actions, while the legal invoice package remains off-chain.

In practice, this means users do not need to understand a full factoring contract or structured receivables workflow to participate. They need to understand:

- invoice value
- advance target
- expected gross yield
- annualized yield
- status
- repayment / claim progress
- key counterparties
- servicing and risk updates

That is the product abstraction layer we are building.

---

## 4. Product surfaces

### 4.1 Landing page

Purpose:

- define what the product is
- explain the Solana angle in user language
- push users toward marketplace exploration and AI Assist

Current messaging emphasizes:

- unpaid invoices → on-chain cashflows
- faster settlement, lower cost, transparent tracking on Solana

### 4.2 Marketplace

Purpose:

- surface available invoice opportunities
- make comparisons easy
- separate simple discovery from expanded exploration

Current structure:

- `/marketplace`: core market view
- `/marketplace/more`: expanded invoice discovery board

Displayed data includes:

- invoice value
- advance target
- gross yield
- annualized yield
- risk grade
- funding progress
- counterparty labels
- servicing state

### 4.3 Pool detail

Purpose:

- become the transactional hub for a single invoice pool

This page currently supports:

- pool metrics and counterparty view
- legal asset hash display
- recent tx signature display
- invest panel
- claim panel
- admin action panel

The pool detail page is the current core transaction surface.

### 4.4 Portfolio

Purpose:

- make positions understandable as a modern DeFi-style portfolio

Current structure includes:

- portfolio KPIs
- claimable now
- blended yield
- allocation by invoice
- cashflow status
- position cards
- simplified table summary

### 4.5 AI Assist

Purpose:

- help non-expert users reason about invoice finance
- provide a recommendation and education layer rather than just a list of pools

This is strategically important because invoice finance is not inherently self-explanatory to mainstream users.

---

## 5. Why Solana matters here

We are not using Solana because “it is crypto.” We are using Solana because the product depends on:

1. **Fast state transitions** — invest, advance, repay, claim should be prompt and inspectable.
2. **Low transaction costs** — small, frequent cashflow movements become impractical if fees are high.
3. **Programmable accounting** — fee logic, claim logic, funding status, and default state transitions can be enforced in code.
4. **Transparency** — users and operators can see exact action flows rather than trusting a black-box ledger.

This makes Solana not the product itself, but the settlement engine under the product.

---

## 6. Protocol model

On-chain source of truth lives in `programs/flowpay`.

### 6.1 Core accounts

#### PlatformConfig

Contains:

- admin
- USDC mint
- treasury
- fee basis points
- next pool id
- paused flag

This is the top-level protocol config and governance state.

#### InvoicePool

Contains:

- pool id
- issuer
- originator
- SPV
- USDC mint
- vault
- legal asset hash
- invoice face value
- advance amount
- funded amount
- repaid amount
- fee owed amount
- fee collected amount
- claimed amount
- fee basis points snapshot
- due timestamp
- created timestamp
- status
- risk score
- servicing status
- servicing updated timestamp
- metadata URI

This is the main structured finance state container.

#### Investment

Contains:

- pool
- investor
- amount
- claimed amount
- created timestamp

This is the user-level position state.

### 6.2 Core instructions

The protocol currently includes:

- initialize_platform
- create_pool
- invest
- advance_to_issuer
- repay
- claim
- collect_fee
- cancel_pool
- withdraw_cancelled
- mark_defaulted
- update_pool_servicing
- set_pause

This is a serious protocol surface already, not just a mock contract.

---

## 7. Frontend and app architecture

### 7.1 Frontend stack

- Next.js App Router
- TypeScript
- Tailwind-based premium light dashboard styling
- Solana wallet adapter
- Anchor client bridge

### 7.2 SDK layer

Located in `packages/sdk`.

Responsibilities:

- derive PDAs
- wrap program calls
- expose createPool / invest / advance / repay / claim / servicing / default flows

### 7.3 Metadata layer

Located in `apps/web/prisma`.

This is not the money ledger. It is used for:

- invoice metadata
- risk metadata
- demo indexing
- demo read models

Balances and settlement truth remain on-chain.

---

## 8. Current implementation status

### 8.1 Product/UI status

Implemented:

- landing page
- marketplace and expanded invoice board
- AI Assist
- redesigned portfolio dashboard
- topbar search
- alerts panel
- branding updates

### 8.2 Pool action wiring status

Implemented in web app:

- Invest
- Claim
- Advance to issuer
- Repay from originator
- Update servicing
- Mark defaulted

These are no longer placeholder buttons; they are wired to actual on-chain method calls.

### 8.3 Localnet verification status

We successfully:

- installed Solana CLI / validator / keygen locally
- built the Anchor program
- deployed the program to localnet
- minted mock USDC
- created a test pool
- executed invest → advance → repay → claim in a real local chain environment

This is a major milestone because it proves the action flow is not merely mock-UI deep.

---

## 9. What still blocks “true product-level complete” status

### 9.1 Devnet deployment is not yet live

The originally referenced program id was not deployed on devnet when we tested. That means the product cannot yet be called “live on Devnet” from the current app configuration without additional deployment work.

### 9.2 Claim bookkeeping needs precise verification and likely hardening

In localnet execution, actual token movements occurred successfully, but state aggregation needs rigorous confirmation, especially around:

- pool.claimed_amount
- final status transition to Closed
- post-claim aggregate accounting

This is the most important technical caveat left in the protocol flow.

### 9.3 Chain-driven reads are not fully dominant yet

Some UI pages still rely partly on curated mock/read-model data, even though action wiring now exists.

### 9.4 Admin affordance UX can improve

Admin actions are protected by on-chain authority rules, but the UI could do more up front to communicate which wallet roles are allowed to perform which action.

---

## 10. Business model

### 10.1 Protocol fee on repayment

The clearest built-in revenue line is protocol fee capture on repayments.

Protocol state already tracks:

- fee owed
- fee collected

This means a repayment-based fee model is structurally native to the protocol.

### 10.2 Operator / originator tooling

Beyond the protocol itself, we can offer operator-facing value through:

- pool creation workflow
- servicing status updates
- risk metadata management
- monitoring / audit surfaces

This turns part of InvoX into structured finance operations tooling.

### 10.3 Premium intelligence layer

AI Assist can evolve into a monetizable product layer through:

- better pool selection support
- anomaly alerts
- risk interpretation
- tailored investor guidance

### 10.4 B2B2C path

Rather than only being a retail app, InvoX can also be a platform rail for:

- originators
- invoice finance operators
- fintech partners
- embedded RWA wrappers

This may in fact be the stronger early GTM path.

---

## 11. Strategic positioning options

We need to choose what we are actually building:

### Option A — Retail invoice investment app

Pros:

- clearer consumer narrative
- visible investor product

Cons:

- stronger regulatory burden
- harder trust challenge
- more distribution-heavy

### Option B — Infrastructure + operator rail

Pros:

- closer to current protocol structure
- easier to justify with real originator workflows
- less dependent on instant retail scale

Cons:

- less emotionally compelling demo for mainstream users

### Option C — Hybrid

Build operator-facing rails first, but preserve investor-facing UX as the eventual front end.

This is likely the most realistic route.

---

## 12. Risk register

### 12.1 Legal / regulatory

Open questions already recorded in `docs/AMBIGUITIES.md` include:

- issuer vs originator identity relationship
- SPV requirements
- legal asset hash definition
- jurisdiction-specific enforceability and collections
- investor eligibility / whitelist rules

### 12.2 Cashflow policy ambiguity

Still unresolved:

- partial claim policy
- default recovery handling
- fee treatment on recoveries
- dust handling

### 12.3 Product scope ambiguity

Still open:

- one pool = one invoice vs receivables bundle
- whether servicing changes should pause investment automatically
- whether AI risk updates need verification signatures

### 12.4 Deferred implementation

Deferred items include:

- whitelist checks
- originator registry
- admin / treasury rotation
- tranches
- reserve buffers / insurance
- x402 paid verification agents

---

## 13. Recommended near-term roadmap

### Phase 1 — Close the transaction correctness gap

- fully confirm claim bookkeeping correctness
- build reproducible localnet E2E verification
- run repeated scenario tests until deterministic

### Phase 2 — Live environment readiness

- deploy a real devnet program
- update app configuration to target live program
- run devnet smoke tests with real wallets

### Phase 3 — Read-model integrity

- reduce mock dependency in portfolio and marketplace
- fetch more state from chain directly
- clarify where Prisma is metadata only vs state source

### Phase 4 — Product and compliance strategy

- choose target GTM (retail vs operator vs hybrid)
- resolve legal structure assumptions
- define investor eligibility model

---

## 14. Internal conclusion

InvoX is no longer just a UI concept. It is now a partially-realized on-chain invoice finance product with real transaction rails.

The biggest remaining question is no longer “can this work technically?”

The answer to that is increasingly **yes**.

The bigger questions now are:

- can the claim/repayment bookkeeping be made fully deterministic?
- what exact legal/operational shape will the product take?
- are we building for retail users first, or for operators first?

Our strongest near-term position is:

> **InvoX is a Solana-based invoice cashflow protocol and product layer that turns opaque invoice finance workflows into transparent, programmable, investor-readable cashflow rails.**
