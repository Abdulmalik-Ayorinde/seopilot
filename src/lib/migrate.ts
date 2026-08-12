import { getDb } from "./db";

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS search_console_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_url TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS synced_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL REFERENCES search_console_properties(id),
      page_url TEXT NOT NULL,
      query TEXT NOT NULL,
      data_date TEXT NOT NULL DEFAULT '',
      position REAL NOT NULL,
      impressions INTEGER NOT NULL,
      clicks INTEGER NOT NULL,
      ctr REAL NOT NULL,
      synced_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const hasColumn = db
    .prepare(
      `SELECT COUNT(*) as c FROM pragma_table_info('synced_pages') WHERE name = 'data_date'`
    )
    .get() as { c: number };

  if (hasColumn.c === 0) {
    db.exec(`ALTER TABLE synced_pages ADD COLUMN data_date TEXT NOT NULL DEFAULT ''`);
  }

  // Drop/recreate index on every migration so column changes (like adding
  // data_date above) always realign the unique constraint. Instant for v1 scale.
  db.exec(`DROP INDEX IF EXISTS idx_synced_pages_unique`);

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_synced_pages_unique
    ON synced_pages(property_id, page_url, query, data_date)
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS pipeline_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger TEXT NOT NULL DEFAULT 'manual',
      status TEXT NOT NULL DEFAULT 'running',
      error_log TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    )
  `);
}

if (require.main === module) {
  runMigrations();
  console.log("Migrations complete.");
}
