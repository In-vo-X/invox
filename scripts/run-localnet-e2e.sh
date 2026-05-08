#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
cleanup() {
  cp "$TMP_DIR/Anchor.toml" "$ROOT_DIR/Anchor.toml"
  cp "$TMP_DIR/lib.rs" "$ROOT_DIR/programs/flowpay/src/lib.rs"
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cp "$ROOT_DIR/Anchor.toml" "$TMP_DIR/Anchor.toml"
cp "$ROOT_DIR/programs/flowpay/src/lib.rs" "$TMP_DIR/lib.rs"

cd "$ROOT_DIR"

anchor keys sync
anchor build

solana-keygen new --no-bip39-passphrase -o /tmp/invox-local-id.json -f >/dev/null
pkill -f solana-test-validator || true
nohup solana-test-validator --reset >/tmp/invox-validator.log 2>&1 < /dev/null &
sleep 10

solana config set --url localhost --keypair /tmp/invox-local-id.json >/dev/null
solana airdrop 20 >/dev/null
solana program deploy --program-id target/deploy/flowpay-keypair.json target/deploy/flowpay.so --url localhost --keypair /tmp/invox-local-id.json >/tmp/invox-deploy.log

node scripts/localnet-e2e.mjs
