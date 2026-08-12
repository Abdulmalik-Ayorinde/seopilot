import Database from "better-sqlite3";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "seopilot.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return db;
}

export function getDbPath(): string {
  return DB_PATH;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
