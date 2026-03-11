"use client";

import { DatabaseHeader } from "@/components/database/database-header";
import { DatabaseTable } from "@/components/database/database-table";
import { Button } from "@/components/ui/primitives/button";
import { Sidebar } from "@/components/navigation/sidebar/sidebar";
import { useDatabaseContext } from "@/context/database-context";

export default function DatabasePage() {
  const { database, properties, records, isLoading, error, refresh } = useDatabaseContext();

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-10">
        <DatabaseHeader />

        {isLoading ? null : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <p className="text-error text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        ) : (
          <DatabaseTable
            databaseId={database?.id ?? ""}
            properties={properties}
            records={records}
            onRefresh={refresh}
          />
        )}
      </main>
    </div>
  );
}
