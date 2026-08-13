import { getDb } from "./db";

export interface SyncedPageRow {
  id: number;
  page_url: string;
  query: string;
  data_date: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
  synced_at: string;
  traffic_upside: number | null;
  ranking_probability: number | null;
  data_confidence: number | null;
  score: number | null;
}

export function getSyncedPages(propertyUrl?: string): SyncedPageRow[] {
  const db = getDb();

  if (propertyUrl) {
    return db
      .prepare(
        `SELECT sp.id, sp.page_url, sp.query, sp.data_date, sp.position,
                sp.impressions, sp.clicks, sp.ctr, sp.synced_at,
                o.traffic_upside, o.ranking_probability, o.data_confidence, o.score
         FROM synced_pages sp
         JOIN search_console_properties scp ON scp.id = sp.property_id
         LEFT JOIN seo_opportunities o ON o.synced_page_id = sp.id
         WHERE scp.property_url = ?
         ORDER BY sp.data_date DESC, sp.impressions DESC`
      )
      .all(propertyUrl) as SyncedPageRow[];
  }

  return db
    .prepare(
      `SELECT sp.id, sp.page_url, sp.query, sp.data_date, sp.position,
              sp.impressions, sp.clicks, sp.ctr, sp.synced_at,
              o.traffic_upside, o.ranking_probability, o.data_confidence, o.score
       FROM synced_pages sp
       LEFT JOIN seo_opportunities o ON o.synced_page_id = sp.id
       ORDER BY sp.data_date DESC, sp.impressions DESC`
    )
    .all() as SyncedPageRow[];
}

export function getSyncedPagesWithScores(): SyncedPageRow[] {
  return getSyncedPages();
}
