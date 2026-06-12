"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CheckSquare, Square, Download, ChevronDown, ChevronUp, Loader2, ArrowRight } from "lucide-react";
import { DateInput } from "@/components/ui/primitives/inputs/date-input";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { TemplatePickerModal } from "@/app/[locale]/(dashboard)/database/[id]/_components/template-picker-modal";
import { previewIntegrationTrades, importIntegrationTrades } from "@/lib/api/integration-connection";
import { parseApiError } from "@/lib/api/client";
import { getTemplates } from "@/lib/api/template";
import { queryKeys } from "@/lib/api/query-keys";
import type { IntegrationTradeDto, IntegrationConnectionResponseDto } from "@fixspace/domain";

interface IntegrationTradesModalProps {
  connection: IntegrationConnectionResponseDto;
  onClose: () => void;
}

function toLocalInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toISO(dateStr: string, endOfDay = false): string {
  const date = new Date(dateStr);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
}

const PRESETS = [7, 30, 90, 180] as const;

export function IntegrationTradesModal({ connection, onClose }: IntegrationTradesModalProps) {
  const t = useTranslations("IntegrationTradesModal");
  const queryClient = useQueryClient();

  const today = new Date();
  const maxDays = 180;
  const minStartDate = new Date(today);
  minStartDate.setDate(minStartDate.getDate() - (maxDays + 1));

  const [endDate, setEndDate] = useState(toLocalInputDate(today));
  const [startDate, setStartDate] = useState(() => {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return toLocalInputDate(thirtyDaysAgo);
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(30);

  const canFetch = Boolean(startDate && endDate && startDate <= endDate && new Date(startDate) >= minStartDate);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.integrationConnections.trades(connection.id, startDate, endDate),
    queryFn: () =>
      previewIntegrationTrades(connection.id, {
        startDate: toISO(startDate, false),
        endDate: toISO(endDate, true),
      }),
    enabled: canFetch,
    staleTime: 30_000,
  });

  const trades = data?.trades ?? [];
  const journalDatabaseId = data?.journalDatabaseId ?? null;
  const importable = trades.filter((trade) => !trade.alreadyImported);

  const { data: templates = [] } = useQuery({
    queryKey: queryKeys.templates.all(journalDatabaseId ?? ""),
    queryFn: () => getTemplates(journalDatabaseId!),
    enabled: Boolean(journalDatabaseId),
  });

  const importMutation = useMutation({
    mutationFn: (templateId: string | null) =>
      importIntegrationTrades(connection.id, {
        sourcePositionIds: Array.from(selected),
        startDate: toISO(startDate, false),
        endDate: toISO(endDate, true),
        templateId,
      }),
    onSuccess: () => {
      setShowTemplatePicker(false);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: queryKeys.integrationConnections.trades(connection.id, startDate, endDate) });
      if (journalDatabaseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.records.all(journalDatabaseId) });
      }
    },
  });

  function applyPreset(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(toLocalInputDate(start));
    setEndDate(toLocalInputDate(end));
    setSelected(new Set());
    setActivePreset(days);
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === importable.length && importable.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(importable.map((trade) => trade.sourcePositionId)));
    }
  }

  const allImportableSelected = importable.length > 0 && selected.size === importable.length;

  return (
    <>
      <ModalShell isOpen onClose={onClose} title={t("title", { name: connection.name })} size="xl">
        <div className="flex flex-col gap-4 px-5 pb-5 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-label text-ink-secondary shrink-0">{t("dateFrom")}</span>
            <div className="w-36">
              <DateInput
                value={startDate}
                min={toLocalInputDate(minStartDate)}
                max={endDate}
                onChange={(v) => {
                  setStartDate(v);
                  setSelected(new Set());
                  setActivePreset(null);
                }}
                size="sm"
              />
            </div>
            <ArrowRight size={12} className="text-ink-muted shrink-0" />
            <span className="type-label text-ink-secondary shrink-0">{t("dateTo")}</span>
            <div className="w-36">
              <DateInput
                value={endDate}
                min={startDate}
                max={toLocalInputDate(today)}
                onChange={(v) => {
                  setEndDate(v);
                  setSelected(new Set());
                  setActivePreset(null);
                }}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-1 ml-auto">
              {PRESETS.map((days) => {
                const isActive = activePreset === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => applyPreset(days)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isActive
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-stroke bg-elevated text-ink-secondary hover:border-accent hover:bg-accent/5 hover:text-accent"
                    }`}
                  >
                    {t("preset", { days })}
                  </button>
                );
              })}
            </div>
          </div>

          {isFetching && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
              <Loader2 size={16} className="animate-spin" />
              {t("loading")}
            </div>
          )}

          {!isFetching && isError && <p className="py-8 text-center text-sm text-error">{parseApiError(error) || t("error")}</p>}

          {!isFetching && !isError && canFetch && trades.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">{t("empty")}</p>
          )}

          {!isFetching && !isError && trades.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-stroke">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-stroke bg-elevated">
                    <th className="w-10 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={toggleAll}
                        title={allImportableSelected ? t("deselectAll") : t("selectAll")}
                        className="text-ink-muted hover:text-ink transition-colors duration-150"
                        disabled={importable.length === 0}
                      >
                        {allImportableSelected ? <CheckSquare size={15} className="text-accent" /> : <Square size={15} />}
                      </button>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium text-ink-secondary">{t("colSymbol")}</th>
                    <th className="px-3 py-2.5 text-left font-medium text-ink-secondary">{t("colDirection")}</th>
                    <th className="px-3 py-2.5 text-right font-medium text-ink-secondary">{t("colNetPnL")}</th>
                    <th className="px-3 py-2.5 text-left font-medium text-ink-secondary">{t("colCloseTime")}</th>
                    <th className="w-8 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <TradeRow
                      key={trade.sourcePositionId}
                      trade={trade}
                      isSelected={selected.has(trade.sourcePositionId)}
                      isExpanded={expandedId === trade.sourcePositionId}
                      onToggleSelect={() => toggleOne(trade.sourcePositionId)}
                      onToggleExpand={() => setExpandedId((prev) => (prev === trade.sourcePositionId ? null : trade.sourcePositionId))}
                      t={t}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selected.size > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3">
              <span className="text-sm font-medium text-ink">{t("selectedCount", { count: selected.size })}</span>
              <Button
                size="sm"
                leftIcon={<Download size={13} />}
                onClick={() => setShowTemplatePicker(true)}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending ? t("importing") : t("addToJournal", { count: selected.size })}
              </Button>
            </div>
          )}
        </div>
      </ModalShell>

      {showTemplatePicker && (
        <TemplatePickerModal
          templates={templates}
          onSelect={(templateId) => importMutation.mutate(templateId)}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </>
  );
}

interface TradeRowProps {
  trade: IntegrationTradeDto;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  t: ReturnType<typeof useTranslations<"IntegrationTradesModal">>;
}

function TradeRow({ trade, isSelected, isExpanded, onToggleSelect, onToggleExpand, t }: TradeRowProps) {
  const pnlPositive = trade.netPnL > 0;
  const pnlNegative = trade.netPnL < 0;

  return (
    <>
      <tr
        className={`border-b border-stroke transition-colors duration-150 ${
          trade.alreadyImported ? "opacity-50" : "hover:bg-surface-hover"
        } ${isSelected ? "bg-accent/5" : ""}`}
      >
        <td className="px-3 py-2.5">
          <button
            type="button"
            onClick={onToggleSelect}
            disabled={trade.alreadyImported}
            title={isSelected ? t("deselect") : t("select")}
            className="text-ink-muted hover:text-ink transition-colors duration-150 disabled:cursor-not-allowed"
          >
            {isSelected ? <CheckSquare size={15} className="text-accent" /> : <Square size={15} />}
          </button>
        </td>
        <td className="px-3 py-2.5 font-medium text-ink">
          {trade.symbol}
          {trade.alreadyImported && (
            <span className="ml-2 rounded px-1 py-0.5 type-nav-label bg-surface border border-stroke">{t("alreadyImported")}</span>
          )}
        </td>
        <td className="px-3 py-2.5 text-ink-secondary">{trade.direction === "BUY" ? "Long" : "Short"}</td>
        <td
          className={`px-3 py-2.5 text-right font-medium tabular-nums ${
            pnlPositive ? "text-success" : pnlNegative ? "text-error" : "text-ink-secondary"
          }`}
        >
          {pnlPositive ? "+" : ""}
          {trade.netPnL.toFixed(2)} {trade.currency}
        </td>
        <td className="px-3 py-2.5 text-ink-muted text-xs">
          {new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(new Date(trade.closeTime))}
        </td>
        <td className="px-3 py-2.5">
          <button
            type="button"
            onClick={onToggleExpand}
            title={isExpanded ? t("collapse") : t("expand")}
            className="text-ink-muted hover:text-ink transition-colors duration-150"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-stroke bg-elevated">
          <td colSpan={6} className="px-4 pb-3 pt-2">
            <TradeDetails trade={trade} t={t} />
          </td>
        </tr>
      )}
    </>
  );
}

function TradeDetails({ trade, t }: { trade: IntegrationTradeDto; t: ReturnType<typeof useTranslations<"IntegrationTradesModal">> }) {
  const formatPrice = (price: number) => price.toFixed(5);
  const formatDetailDate = (dateStr: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(dateStr));

  const fields = [
    { label: t("detailEntry"), value: formatPrice(trade.entryPrice) },
    { label: t("detailExit"), value: formatPrice(trade.exitPrice) },
    { label: t("detailQty"), value: String(trade.quantity) },
    { label: t("detailGross"), value: `${trade.grossPnL.toFixed(2)} ${trade.currency}` },
    { label: t("detailFees"), value: `${trade.fees.toFixed(2)} ${trade.currency}` },
    { label: t("detailNet"), value: `${trade.netPnL.toFixed(2)} ${trade.currency}` },
    { label: t("detailSL"), value: trade.stopLoss ? formatPrice(trade.stopLoss) : "—" },
    { label: t("detailTP"), value: trade.takeProfit ? formatPrice(trade.takeProfit) : "—" },
    { label: t("detailOpen"), value: formatDetailDate(trade.openTime) },
    { label: t("detailClose"), value: formatDetailDate(trade.closeTime) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
      {fields.map(({ label, value }) => (
        <div key={label}>
          <dt className="type-nav-label">{label}</dt>
          <dd className="text-xs text-ink tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
