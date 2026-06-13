"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus, RefreshCw, Trash2, AlertCircle, CheckCircle, Clock, LineChart, Info } from "lucide-react";
import { Button } from "@/components/ui/primitives/actions/button";
import { useAppContext } from "@/context/app-context";
import { deleteIntegrationConnection, getIntegrationConnections } from "@/lib/api/integration-connection";
import { queryKeys } from "@/lib/api/query-keys";
import { ConnectIntegrationModal } from "./connect-integration-modal";
import { IntegrationTradesModal } from "./integration-trades-modal";
import { Mt5InfoModal } from "./mt5-info-modal";
import { INTEGRATION_METADATA, type IntegrationConnectionResponseDto, IntegrationService, SERVICE_LIMITS } from "@fixspace/domain";

const SERVICE_GROUPS = Object.values(INTEGRATION_METADATA);

export function IntegrationSettings() {
  const t = useTranslations("IntegrationSettingsComp");
  const queryClient = useQueryClient();
  const { spaces } = useAppContext();

  const [modalService, setModalService] = useState<IntegrationService | null>(null);
  const [reconnectTarget, setReconnectTarget] = useState<IntegrationConnectionResponseDto | null>(null);
  const [tradesTarget, setTradesTarget] = useState<IntegrationConnectionResponseDto | null>(null);
  const [infoTarget, setInfoTarget] = useState<IntegrationConnectionResponseDto | null>(null);

  const { data: connections = [], isPending } = useQuery({
    queryKey: queryKeys.integrationConnections.all(),
    queryFn: getIntegrationConnections,
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some((c) => c.status === "PENDING");
      return hasPending ? 2000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIntegrationConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.integrationConnections.all() }),
  });

  if (isPending) {
    return <div className="flex items-center justify-center py-16 text-sm text-ink-muted">{t("loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {SERVICE_GROUPS.map(({ service, label, descriptionKey }) => {
        const serviceConnections = connections.filter((c) => c.service === service);
        const limit = SERVICE_LIMITS[service];
        const canAdd =
          limit === undefined || spaces.some((space) => serviceConnections.filter((c) => c.spaceId === space.id).length < limit);

        return (
          <div key={service} className="rounded-2xl border border-stroke bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">{label}</h3>
                <p className="mt-0.5 text-xs text-ink-secondary">{t(descriptionKey)}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={13} />}
                disabled={!canAdd}
                onClick={() => setModalService(service)}
              >
                {t("add")}
              </Button>
            </div>

            {serviceConnections.length > 0 && (
              <ul className="mt-4 space-y-2">
                {serviceConnections.map((conn) => (
                  <li
                    key={conn.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-stroke bg-elevated px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon status={conn.status} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-ink">{conn.name}</span>
                          <span className="rounded bg-hover px-1.5 py-0.5 type-hint font-semibold shrink-0">
                            {conn.space?.name ?? t("noSpace")}
                          </span>
                        </div>
                        <p className="truncate text-xs text-ink-muted mt-0.5">
                          {conn.lastSyncAt ? t("lastSync", { date: formatDate(conn.lastSyncAt) }) : t("neverSynced")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {conn.service === IntegrationService.METATRADER5 && (
                        <button
                          type="button"
                          onClick={() => setInfoTarget(conn)}
                          className="rounded-lg p-1.5 text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          title={t("viewInfo", { fallback: "Connection Info" })}
                        >
                          <Info size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setTradesTarget(conn)}
                        className="rounded-lg p-1.5 text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        title={t("viewTrades")}
                      >
                        <LineChart size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setReconnectTarget(conn)}
                        className="rounded-lg p-1.5 text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        title={t("reconnect")}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(conn.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg p-1.5 text-ink-muted transition-colors duration-150 hover:bg-error-bg hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                        title={t("disconnect")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {serviceConnections.length === 0 && <p className="mt-4 text-xs text-ink-muted">{t("noConnections")}</p>}

            {limit !== undefined && <p className="mt-2 text-xs text-ink-muted">{t("connectionLimitInfo", { max: limit })}</p>}
          </div>
        );
      })}

      {modalService && <ConnectIntegrationModal isOpen onClose={() => setModalService(null)} service={modalService} />}

      {reconnectTarget && (
        <ConnectIntegrationModal
          isOpen
          onClose={() => setReconnectTarget(null)}
          service={reconnectTarget.service}
          existing={reconnectTarget}
        />
      )}

      {tradesTarget && <IntegrationTradesModal connection={tradesTarget} onClose={() => setTradesTarget(null)} />}

      {infoTarget && <Mt5InfoModal isOpen onClose={() => setInfoTarget(null)} connection={infoTarget} />}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "ACTIVE") return <CheckCircle size={14} className="shrink-0 text-success" />;
  if (status === "ERROR") return <AlertCircle size={14} className="shrink-0 text-error" />;
  if (status === "PENDING") return <RefreshCw size={14} className="shrink-0 text-accent animate-spin" />;
  return <Clock size={14} className="shrink-0 text-ink-muted" />;
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
}
