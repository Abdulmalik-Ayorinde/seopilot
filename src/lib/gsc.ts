import { google, webmasters_v3 } from "googleapis";
import { readFileSync } from "node:fs";
import { getEnv } from "./env";

interface SearchAnalyticsRow {
  page: string;
  query: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

function getAuthClient() {
  const env = getEnv();

  const keyJson = JSON.parse(readFileSync(env.GSC_SERVICE_ACCOUNT_KEY, "utf-8"));

  return new google.auth.JWT({
    email: env.GSC_SERVICE_ACCOUNT_EMAIL,
    key: keyJson.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
}

function extractRows(response: webmasters_v3.Schema$SearchAnalyticsQueryResponse): SearchAnalyticsRow[] {
  if (!response.rows) return [];

  return response.rows.map((row) => ({
    page: row.keys?.[0] ?? "",
    query: row.keys?.[1] ?? "",
    position: row.position ?? 0,
    impressions: row.impressions ?? 0,
    clicks: row.clicks ?? 0,
    ctr: row.ctr ?? 0,
  }));
}

export async function fetchSearchAnalytics(days: number): Promise<SearchAnalyticsRow[]> {
  const env = getEnv();
  const auth = getAuthClient();

  const webmasters = google.webmasters({ version: "v3", auth });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const requestBody: webmasters_v3.Schema$SearchAnalyticsQueryRequest = {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    dimensions: ["page", "query"],
    rowLimit: 25000,
    startRow: 0,
  };

  let allRows: SearchAnalyticsRow[] = [];

  do {
    requestBody.startRow = allRows.length;

    const response = await webmasters.searchanalytics.query({
      siteUrl: env.GSC_PROPERTY_URL,
      requestBody,
    });

    const rows = extractRows(response.data);
    allRows.push(...rows);

    if (!response.data.rows || response.data.rows.length < (requestBody.rowLimit ?? 25000)) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  } while (true);

  return allRows;
}
