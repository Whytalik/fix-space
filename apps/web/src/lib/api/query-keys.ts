export const queryKeys = {
  user: {
    me: () => ["user", "me"] as const,
  },
  spaces: {
    all: () => ["spaces"] as const,
    detail: (id: string) => ["spaces", id] as const,
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
};
