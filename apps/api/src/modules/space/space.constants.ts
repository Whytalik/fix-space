export const sectionsInclude = {
  sections: {
    orderBy: { position: "asc" as const },
    include: { databases: { orderBy: { createdAt: "asc" as const } } },
  },
  databases: { orderBy: { createdAt: "asc" as const } },
};
