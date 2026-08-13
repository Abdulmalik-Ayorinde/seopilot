import { getDb } from "./db";
import {
  calculateDataConfidence,
  calculateOpportunityScore,
  calculateRankingProbability,
  calculateTrafficUpside,
  OPPORTUNITY_IMPRESSIONS_MIN,
  OPPORTUNITY_POSITION_MAX,
  OPPORTUNITY_POSITION_MIN,
} from "./scoring";

export function identifyOpportunities(): number {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT id, position, impressions
       FROM synced_pages
       WHERE position >= ?
         AND position <= ?
         AND impressions >= ?`
    )
    .all(
      OPPORTUNITY_POSITION_MIN,
      OPPORTUNITY_POSITION_MAX,
      OPPORTUNITY_IMPRESSIONS_MIN
    ) as { id: number; position: number; impressions: number }[];

  const upsert = db.prepare(`
    INSERT OR REPLACE INTO seo_opportunities
      (synced_page_id, traffic_upside, ranking_probability, data_confidence, score, status)
    VALUES (?, ?, ?, ?, ?, 'identified')
  `);

  const insertMany = db.transaction(() => {
    for (const row of rows) {
      upsert.run(
        row.id,
        calculateTrafficUpside(row),
        calculateRankingProbability(row),
        calculateDataConfidence(row),
        calculateOpportunityScore(row)
      );
    }
  });

  insertMany();
  return rows.length;
}
