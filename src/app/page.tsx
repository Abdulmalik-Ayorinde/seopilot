import { getSyncedPages } from "@/lib/db-read";
import SyncedTable from "@/components/dashboard/synced-table";

export default function Home() {
  const rows = getSyncedPages();

  return (
    <main className="flex-1 p-6 font-sans">
      <div className="">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          SeoPilot
        </h1>

        {rows.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">No data yet.</p>
            <p className="text-sm mt-1">
              Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">npm run sync</code> first.
            </p>
          </div>
        ) : (
          <SyncedTable rows={rows} />
        )}
      </div>
    </main>
  );
}
