# FlowPay Ambiguity Register

These items are intentionally documented instead of blocking the MVP implementation.

## Legal and operations

- Whether `issuer` and `originator` may be the same wallet in production.
- Whether `spv` is mandatory for every pool or optional for demo-only pools.
- Exact contents of `legal_asset_hash`: invoice hash, assignment agreement hash, servicing agreement hash, or combined bundle hash.
- Jurisdiction-specific claim, assignment, KYC, investor eligibility, and collection process.

## Cashflow policy

- Whether partial investor claims should remain enabled before full repayment.
- Whether defaulted pools should keep accepting recovery repayments indefinitely.
- Whether protocol fees should be collected from defaulted partial recoveries or only after full repayment.
- Whether dust remaining after integer pro-rata claims should go to treasury, issuer, or remain in the vault.

## Product scope

- Whether one pool always maps to one invoice or may represent a small receivables bundle.
- Whether risk updates are purely disclosure or should pause new investment automatically.
- Whether AI risk analysis should be signed by an off-chain verifier before metadata is accepted.

## Deferred implementation

- Investor whitelist and jurisdiction checks.
- Originator registry and role rotation.
- Admin/treasury update instructions.
- Tranches, reserve buffers, insurance, or junior first-loss positions.
- x402-paid verification agents.
