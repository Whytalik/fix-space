export const sectionsInclude = {
  sections: {
    orderBy: { position: "asc" as const },
    include: { databases: { orderBy: { position: "asc" as const } } },
  },
  databases: { orderBy: { position: "asc" as const } },
};
