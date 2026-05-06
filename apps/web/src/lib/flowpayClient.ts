import { AnchorProvider, Program } from "@anchor-lang/core";
import type { Idl } from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import idl from "../../../../packages/sdk/src/flowpay-idl.json";
import { FLOWPAY_PROGRAM_ID } from "@/lib/constants";

export function createFlowPayProgram(
  provider: AnchorProvider,
  programId: PublicKey = FLOWPAY_PROGRAM_ID,
) {
  const flowPayIdl = { ...idl, address: programId.toBase58() } as Idl;
  return new Program(flowPayIdl, provider);
}
