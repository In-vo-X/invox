import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(repoRoot, "target/idl/flowpay.json");
const targetPath = resolve(repoRoot, "packages/sdk/src/flowpay-idl.json");
const checkOnly = process.argv.includes("--check");

const readJson = async (path, label) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`${label} not found at ${path}. Run anchor build before syncing the IDL.`);
    }

    throw err;
  }
};
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

const source = stableJson(await readJson(sourcePath, "Generated FlowPay IDL"));

if (checkOnly) {
  const target = stableJson(await readJson(targetPath, "Checked-in FlowPay SDK IDL"));
  if (source !== target) {
    throw new Error("packages/sdk/src/flowpay-idl.json is out of sync with target/idl/flowpay.json");
  }
} else {
  await writeFile(targetPath, source);
}
