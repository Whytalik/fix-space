"use client";

import { DatabaseHeader } from "./_components/database-header";
import { DatabaseTable } from "./_components/database-table";
import { Button } from "@/components/ui/primitives/actions/button";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useDatabaseContext } from "@/context/database-context";
import { useTranslations } from "next-intl";

export default function DatabasePage() {
  const { properties, records, isLoading, error, refresh } = useDatabaseContext();
  const t = useTranslations("DatabasePage");

  return (
    <div className="flex-1 overflow-y-auto scrollbar px-8 py-10 animate-fade-up">
      <DatabaseHeader />

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <p className="text-error text-sm">{error}</p>
          <Button variant="secondary" size="sm" onClick={refresh}>
            {t("retry")}
          </Button>
        </div>
      ) : (
        <div>
          <DatabaseTable properties={properties} records={records} />
        </div>
      )}
    </div>
  );
}
