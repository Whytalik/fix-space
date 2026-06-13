import type { CustomReportDto, DatabaseStatBlockDto, TradingStatsResponseDto } from "@fixspace/domain";

import { apiFetch } from "./client";

export interface StatisticsQuery {
  spaceId?: string;
  from?: string;
  to?: string;
  compareFrom?: string;
  compareTo?: string;
}

function buildQuery(query: StatisticsQuery): string {
  const params = new URLSearchParams();
  if (query.spaceId) params.set("spaceId", query.spaceId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.compareFrom) params.set("compareFrom", query.compareFrom);
  if (query.compareTo) params.set("compareTo", query.compareTo);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function getTradingStats(query: StatisticsQuery = {}): Promise<TradingStatsResponseDto> {
  return apiFetch<TradingStatsResponseDto>(`/statistics/trading${buildQuery(query)}`);
}

export function getCustomStats(query: StatisticsQuery = {}): Promise<CustomReportDto[]> {
  return apiFetch<CustomReportDto[]>(`/statistics/custom${buildQuery(query)}`);
}

export function getKeyDatabasesOverview(query: StatisticsQuery = {}): Promise<DatabaseStatBlockDto[]> {
  return apiFetch<DatabaseStatBlockDto[]>(`/statistics/overview${buildQuery(query)}`);
}
