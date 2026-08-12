import { getDb } from "./db";
import { fetchSearchAnalytics } from "./gsc";
import { getEnv } from "./env";

export async function runSync(): Promise<{ rowsUpserted: number; runId: number }> {
  const env = getEnv();
  const db = getDb();

  const run = db
    .prepare(
      `INSERT INTO pipeline_runs (trigger, status, started_at)
       VALUES ('manual', 'running', datetime('now'))`
    )
    .run();

  const runId = run.lastInsertRowid as number;

  try {
    db.prepare(
      `INSERT OR IGNORE INTO search_console_properties (property_url)
       VALUES (?)`
    ).run(env.GSC_PROPERTY_URL);

    const property = db
      .prepare(`SELECT id FROM search_console_properties WHERE property_url = ?`)
      .get(env.GSC_PROPERTY_URL) as { id: number };

    const rows = await fetchSearchAnalytics(90);

    const upsert = db.prepare(`
      INSERT OR REPLACE INTO synced_pages
        (property_id, page_url, query, data_date, position, impressions, clicks, ctr, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const insertMany = db.transaction(() => {
      for (const row of rows) {
        upsert.run(
          property.id,
          row.page,
          row.query,
          row.date,
          row.position,
          row.impressions,
          row.clicks,
          row.ctr
        );
      }
    });

    insertMany();

    db.prepare(
      `UPDATE pipeline_runs SET status = 'completed', completed_at = datetime('now') WHERE id = ?`
    ).run(runId);

    return { rowsUpserted: rows.length, runId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    db.prepare(
      `UPDATE pipeline_runs SET status = 'failed', error_log = ?, completed_at = datetime('now') WHERE id = ?`
    ).run(message, runId);

    throw error;
  }
}
