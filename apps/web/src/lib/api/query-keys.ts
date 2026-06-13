export const queryKeys = {
  user: {
    me: () => ["user", "me"] as const,
  },
  spaces: {
    all: () => ["spaces"] as const,
    detail: (id: string) => ["spaces", id] as const,
    dashboard: (id: string) => ["spaces", id, "dashboard"] as const,
  },
  databases: {
    all: (spaceId: string) => ["databases", { spaceId }] as const,
    detail: (id: string) => ["databases", id] as const,
  },
  records: {
    all: (databaseId: string) => ["records", databaseId] as const,
    detail: (databaseId: string, id: string) => ["records", databaseId, id] as const,
  },
  properties: {
    all: (databaseId: string) => ["properties", databaseId] as const,
  },
  views: {
    all: (databaseId: string) => ["views", databaseId] as const,
  },
  templates: {
    all: (databaseId: string) => ["templates", databaseId] as const,
    detail: (id: string) => ["templates", "detail", id] as const,
    values: (templateId: string) => ["templates", "values", templateId] as const,
  },
  integrationConnections: {
    all: () => ["integrationConnections"] as const,
    detail: (id: string) => ["integrationConnections", id] as const,
    trades: (id: string, startDate: string, endDate: string) => ["integrationConnections", id, "trades", startDate, endDate] as const,
  },
  statistics: {
    trading: (from?: string, to?: string, compareFrom?: string, compareTo?: string) =>
      ["statistics", "trading", { from, to, compareFrom, compareTo }] as const,
    custom: (from?: string, to?: string) => ["statistics", "custom", { from, to }] as const,
    overview: (spaceId?: string, from?: string, to?: string, compareFrom?: string, compareTo?: string) =>
      ["statistics", "overview", { spaceId, from, to, compareFrom, compareTo }] as const,
  },
};
