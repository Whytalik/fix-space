import type { DatabaseResponseDto, SpaceResponseDto } from "@fixspace/domain";

type ApplyPatch = (patchFunction: (space: SpaceResponseDto) => SpaceResponseDto) => void;

export function useDatabaseMutations(applyPatch: ApplyPatch, space: SpaceResponseDto | null) {
  function updateDatabaseInSpace(updated: DatabaseResponseDto) {
    applyPatch((prev) => {
      const replaceDb = (database: DatabaseResponseDto) => (database.id === updated.id ? updated : database);
      return {
        ...prev,
        databases: prev.databases?.map(replaceDb) ?? [],
        sections: prev.sections?.map((section) => ({ ...section, databases: section.databases?.map(replaceDb) ?? [] })) ?? [],
      };
    });
  }

  function reorderDatabasesInSection(sectionId: string | null, reordered: DatabaseResponseDto[]) {
    applyPatch((prev) => {
      if (sectionId === null) return { ...prev, databases: reordered };
      return {
        ...prev,
        sections: (prev.sections ?? []).map((section) => (section.id === sectionId ? { ...section, databases: reordered } : section)),
      };
    });
  }

  function moveDatabaseToSection(dbId: string, targetSectionId: string | null) {
    applyPatch((prev) => {
      let movedDb: DatabaseResponseDto | undefined;

      const newSections = (prev.sections ?? []).map((section) => ({
        ...section,
        databases: (section.databases ?? []).filter((database) => {
          if (database.id === dbId) {
            movedDb = database;
            return false;
          }
          return true;
        }),
      }));

      const newDatabases = (prev.databases ?? []).filter((database) => {
        if (database.id === dbId) {
          movedDb = database;
          return false;
        }
        return true;
      });

      if (!movedDb) return prev;
      const updatedDb = { ...movedDb, sectionId: targetSectionId ?? null };

      if (targetSectionId) {
        return {
          ...prev,
          sections: newSections.map((section) =>
            section.id === targetSectionId ? { ...section, databases: [...(section.databases ?? []), updatedDb] } : section,
          ),
          databases: newDatabases,
        };
      }

      return { ...prev, sections: newSections, databases: [...newDatabases, updatedDb] };
    });
  }

  function removeDatabaseFromSpace(databaseId: string): string | null {
    const sectionId =
      (space?.sections ?? []).find((section) => section.databases?.some((database) => database.id === databaseId))?.id ?? null;
    applyPatch((prev) => ({
      ...prev,
      databases: (prev.databases ?? []).filter((database) => database.id !== databaseId),
      sections: (prev.sections ?? []).map((section) => ({
        ...section,
        databases: (section.databases ?? []).filter((database) => database.id !== databaseId),
      })),
    }));
    return sectionId;
  }

  return { updateDatabaseInSpace, reorderDatabasesInSection, moveDatabaseToSection, removeDatabaseFromSpace };
}
