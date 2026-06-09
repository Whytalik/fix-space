"use client";

import { Pagination } from "@/components/ui/primitives/navigation/pagination";
import { useDatabaseContext } from "@/context/database-context";
import { useTranslations } from "next-intl";

export function DatabasePagination() {
  const { page, pageSize, total, setPage, setPageSize } = useDatabaseContext();
  const t = useTranslations("DatabaseTable");

  return (
    <div className="mt-3">
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        rowsPerPageLabel={t("rowsPerPage")}
        recordsOfLabel={(from, to, total) => t("recordsOf", { from, to, total })}
      />
    </div>
  );
}
