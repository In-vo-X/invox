import { demoPools } from "../apps/web/src/lib/mock-data";

for (const pool of demoPools) {
  console.log(`${pool.id}: ${pool.issuer} -> ${pool.debtor} (${pool.status})`);
}
