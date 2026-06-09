"use client";

import { PALETTE_COLOR_VALUES, PropertyType } from "@fixspace/domain/enums";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { CellValue } from "./cell-value";
import { PropertyHint } from "./properties/ui/property-hint";
import { PropertyIcon } from "./properties/ui/property-icon";
import { useDatabaseContext } from "@/context/database-context";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { Button } from "@/components/ui/primitives/actions/button";
import { deleteRecord, duplicateRecord } from "@/lib/api/record";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileText, Copy, Trash2, ChevronDown } from "lucide-react";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { SummaryCell } from "./summary-cell";
import { useState, useMemo } from "react";
import { cn } from "@/utils/ui/cn";

interface DatabaseTableProps {
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
}

export function DatabaseTable({ properties, records }: DatabaseTableProps) {
  const t = useTranslations("DatabaseTable");
  const router = useRouter();
  const { relatedRecordsMap, invalidateRecords, activeView, wrapCells, groupedRecords, groupColors, hiddenGroups } = useDatabaseContext();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const hiddenColumns = useMemo(() => new Set(activeView?.hiddenColumns || []), [activeView]);
  const columnWidths = useMemo(() => activeView?.columnWidths || {}, [activeView]);

  const visibleProperties = useMemo(() => {
    return [...properties].filter((p) => !hiddenColumns.has(p.id)).sort((a, b) => a.position - b.position);
  }, [properties, hiddenColumns]);

  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id));
  const someSelected = selectedIds.size > 0;

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(records.map((r) => r.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleDuplicate() {
    const [id] = selectedIds;
    if (!id) return;
    try {
      setIsDuplicating(true);
      await duplicateRecord(id);
      invalidateRecords();
      setSelectedIds(new Set());
    } finally {
      setIsDuplicating(false);
    }
  }

  function toggleCollapse(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleDeleteConfirmed() {
    try {
      setIsDeleting(true);
      await Promise.all([...selectedIds].map(deleteRecord));
      invalidateRecords();
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }

  function renderRecordRow(record: RecordResponseDto) {
    return (
      <tr
        key={record.id}
        onClick={() => router.push(`/record/${record.id}`)}
        className="border-b border-stroke-subtle last:border-b-0 transition-colors duration-150 hover:bg-hover cursor-pointer group"
      >
        <td
          className="px-3 py-2 border-r border-b border-stroke-subtle bg-canvas group-hover:bg-hover transition-colors duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckboxInput checked={selectedIds.has(record.id)} onChange={(checked) => toggleOne(record.id, checked)} />
        </td>
        {visibleProperties.map((prop, index) => {
          const propertyValue = record.values?.find((recordValue) => recordValue.propertyId === prop.id);
          const isPrimary = prop.position === 0;

          const rawValue = propertyValue?.value || (isPrimary ? record.name : undefined);
          const value = isPrimary ? rawValue || t("untitled") : rawValue;

          const relatedDbId =
            prop.type === PropertyType.RELATION ? (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId : undefined;

          return (
            <td
              key={prop.id}
              className={cn(
                "px-3 py-2 align-middle border-b border-stroke-subtle last:border-r-0",
                index > 0 && "border-r border-stroke-subtle",
                index === 0 &&
                  "sticky left-0 z-20 bg-canvas group-hover:bg-hover transition-colors duration-150 shadow-[inset_-1px_0_0_0_var(--color-stroke-subtle)] bg-opacity-100 group-hover:bg-opacity-100",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  isPrimary && "font-semibold text-ink",
                  wrapCells ? "break-words whitespace-normal" : "truncate whitespace-nowrap",
                )}
              >
                {isPrimary && (
                  <span className="text-ink-muted shrink-0">
                    {record.icon ? <IconDisplay value={record.icon} size={14} /> : <FileText size={14} />}
                  </span>
                )}
                <CellValue
                  value={value}
                  type={prop.type}
                  config={prop.config}
                  relatedRecords={relatedDbId ? relatedRecordsMap[relatedDbId] : undefined}
                  className={wrapCells ? "break-words whitespace-normal" : "truncate"}
                />
              </div>
            </td>
          );
        })}
      </tr>
    );
  }

  if (properties.length === 0) {
    return <div className="flex items-center justify-center h-40 text-ink-secondary text-sm">{t("noProperties")}</div>;
  }

  const visibleGroups = groupedRecords?.filter((g) => !hiddenGroups.has(g.key)) ?? null;
  const totalVisibleRecords = visibleGroups ? visibleGroups.reduce((sum, g) => sum + g.records.length, 0) : records.length;

  return (
    <div className="flex flex-col gap-3">
      {someSelected && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-stroke bg-surface">
          <span className="text-sm text-ink-secondary flex-1">{t("selected", { count: selectedIds.size })}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDuplicate}
            loading={isDuplicating}
            disabled={selectedIds.size !== 1 || isDuplicating}
            className="flex items-center gap-1.5"
          >
            <Copy size={13} />
            {t("duplicate")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            {t("delete")}
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-stroke overflow-hidden shadow-sm bg-canvas">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
            <colgroup>
              <col className="w-10" />
              {visibleProperties.map((prop) => (
                <col key={prop.id} style={{ width: columnWidths[prop.id] ? `${columnWidths[prop.id]}px` : "200px" }} />
              ))}
            </colgroup>
            <thead>
              <tr className="sticky top-0 z-30 bg-surface border-b border-stroke">
                <th className="px-3 py-2.5 border-r border-b border-stroke bg-surface" onClick={(e) => e.stopPropagation()}>
                  <CheckboxInput checked={allSelected} onChange={toggleAll} />
                </th>
                {visibleProperties.map((prop, index) => (
                  <th
                    key={prop.id}
                    className={cn(
                      "px-3 py-2.5 text-left whitespace-nowrap border-b border-stroke last:border-r-0 font-medium transition-colors duration-150",
                      index > 0 && "border-r border-stroke",
                      index === 0 && "sticky left-0 z-30 bg-surface shadow-[inset_-1px_0_0_0_var(--color-stroke)] bg-opacity-100",
                    )}
                  >
                    <span className="flex items-center gap-2 type-field-label">
                      <span className="text-ink-muted shrink-0">
                        <PropertyIcon type={prop.type} />
                      </span>
                      <span className="truncate">{prop.name}</span>
                      {prop.hint && <PropertyHint hint={prop.hint} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleGroups ? (
                visibleGroups.length === 0 ? (
                  <tr>
                    <td colSpan={visibleProperties.length + 1} className="px-4 py-16 text-center text-ink-muted bg-canvas">
                      {t("noRecords")}
                    </td>
                  </tr>
                ) : (
                  visibleGroups.flatMap((groupEntry, groupIndex) => {
                    const color = groupColors[groupEntry.key] ?? PALETTE_COLOR_VALUES[groupIndex % PALETTE_COLOR_VALUES.length];
                    const isCollapsed = collapsedGroups.has(groupEntry.key);
                    return [
                      <tr key={`group-header-${groupEntry.key}`} className="bg-surface/60">
                        <td colSpan={visibleProperties.length + 1} className="px-3 py-2 border-b border-stroke">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleCollapse(groupEntry.key)}
                              className="p-0.5 rounded hover:bg-hover transition-colors duration-150 text-ink-muted hover:text-ink shrink-0"
                            >
                              <ChevronDown size={14} className={cn("transition-transform duration-150", isCollapsed && "-rotate-90")} />
                            </button>
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-sm font-semibold text-ink-secondary">{groupEntry.label}</span>
                            <span className="text-xs font-medium text-ink-muted bg-surface px-1.5 py-0.5 rounded-md border border-stroke">
                              {groupEntry.records.length}
                            </span>
                          </div>
                        </td>
                      </tr>,
                      ...(!isCollapsed ? groupEntry.records.map(renderRecordRow) : []),
                      ...(!isCollapsed
                        ? [
                            <tr key={`group-summary-${groupEntry.key}`} className="border-t border-stroke">
                              <td className="bg-surface border-r border-stroke h-10" />
                              {visibleProperties.map((prop, index) => (
                                <td
                                  key={prop.id}
                                  className={cn(
                                    "px-1 py-1 last:border-r-0 h-10 bg-surface/30",
                                    index > 0 && "border-r border-stroke",
                                    index === 0 &&
                                      "sticky left-0 z-20 bg-surface shadow-[inset_-1px_0_0_0_var(--color-stroke)] bg-opacity-100",
                                  )}
                                >
                                  <SummaryCell
                                    propertyId={prop.id}
                                    type={prop.type as PropertyType}
                                    isPrimary={prop.position === 0}
                                    records={groupEntry.records}
                                  />
                                </td>
                              ))}
                            </tr>,
                          ]
                        : []),
                    ];
                  })
                )
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={visibleProperties.length + 1} className="px-4 py-16 text-center text-ink-muted bg-canvas">
                    {t("noRecords")}
                  </td>
                </tr>
              ) : (
                records.map(renderRecordRow)
              )}
            </tbody>
            {!visibleGroups && totalVisibleRecords > 0 && (
              <tfoot className="border-t-2 border-stroke bg-surface/30">
                <tr>
                  <td className="bg-surface border-r border-stroke h-10" />
                  {visibleProperties.map((prop, index) => (
                    <td
                      key={prop.id}
                      className={cn(
                        "px-1 py-1 last:border-r-0 h-10",
                        index > 0 && "border-r border-stroke",
                        index === 0 && "sticky left-0 z-20 bg-surface shadow-[inset_-1px_0_0_0_var(--color-stroke)] bg-opacity-100",
                      )}
                    >
                      <SummaryCell propertyId={prop.id} type={prop.type as PropertyType} isPrimary={prop.position === 0} />
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title={t("deleteRecords")}
          description={t("deleteRecordsDesc", { count: selectedIds.size })}
          confirmLabel={isDeleting ? t("deleting") : t("delete")}
          variant="danger"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
