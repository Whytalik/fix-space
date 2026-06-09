import type { Prisma } from "@fixspace/database";
import { ViewResponseDto } from "@fixspace/domain";

export function toViewResponseDto(view: Prisma.ViewGetPayload<Record<string, never>> | Record<string, unknown>): ViewResponseDto {
  const v = view as any;
  const config = (v.config as any) ?? {};

  return new ViewResponseDto({
    id: v.id,
    databaseId: v.databaseId,
    name: v.name,
    icon: v.icon ?? null,
    isLocked: v.isLocked,
    pageSize: v.pageSize,
    recordLimit: v.recordLimit,
    useDefaultTemplate: v.useDefaultTemplate,
    defaultTemplateId: v.defaultTemplateId,
    groupBy: v.groupBy,
    hiddenColumns: v.hiddenColumns,
    columnWidths: (v.columnWidths as any) ?? {},
    textWrap: v.textWrap,
    relativeDates: config.relativeDates ?? false,
    searchQuery: v.searchQuery,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    filters: (v.filters as any) ?? [],
    filterLogic: (v.filterLogic as any) ?? "AND",
    sort: (v.sort as any) ?? [],
    columnSummaries: config.columnSummaries ?? {},
    groupColors: config.groupColors ?? {},
    hiddenGroups: config.hiddenGroups ?? [],
  });
}
