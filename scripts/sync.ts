import { runMigrations } from "../src/lib/migrate";
import { runSync } from "../src/lib/sync";

async function main() {
  process.loadEnvFile();
  runMigrations();

  const start = Date.now();

  try {
    const result = await runSync();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`Sync complete. ${result.rowsUpserted} rows upserted in ${elapsed}s`);
    console.log(`Run ID: ${result.runId}`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`Sync failed: ${message}`);
    process.exit(1);
  }
}

main();
