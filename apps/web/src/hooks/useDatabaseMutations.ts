import type { DatabaseResponseDto, SpaceResponseDto } from "@fixspace/domain";

type ApplyPatch = (fn: (s: SpaceResponseDto) => SpaceResponseDto) => void;

export function useDatabaseMutations(applyPatch: ApplyPatch, space: SpaceResponseDto | null) {
  function updateDatabaseInSpace(updated: DatabaseResponseDto) {
    applyPatch((prev) => {
      const replaceDb = (db: DatabaseResponseDto) => (db.id === updated.id ? updated : db);
      return {
        ...prev,
        databases: prev.databases?.map(replaceDb) ?? [],
        sections: prev.sections?.map((s) => ({ ...s, databases: s.databases?.map(replaceDb) ?? [] })) ?? [],
      };
    });
  }

  function reorderDatabasesInSection(sectionId: string | null, reordered: DatabaseResponseDto[]) {
    applyPatch((prev) => {
      if (sectionId === null) return { ...prev, databases: reordered };
      return {
        ...prev,
        sections: (prev.sections ?? []).map((s) => (s.id === sectionId ? { ...s, databases: reordered } : s)),
      };
    });
  }

  function moveDatabaseToSection(dbId: string, targetSectionId: string | null) {
    applyPatch((prev) => {
      let movedDb: DatabaseResponseDto | undefined;

      const newSections = (prev.sections ?? []).map((s) => ({
        ...s,
        databases: (s.databases ?? []).filter((d) => {
          if (d.id === dbId) {
            movedDb = d;
            return false;
          }
          return true;
        }),
      }));

      const newDatabases = (prev.databases ?? []).filter((d) => {
        if (d.id === dbId) {
          movedDb = d;
          return false;
        }
        return true;
      });

      if (!movedDb) return prev;
      const updatedDb = { ...movedDb, sectionId: targetSectionId ?? null };

      if (targetSectionId) {
        return {
          ...prev,
          sections: newSections.map((s) =>
            s.id === targetSectionId ? { ...s, databases: [...(s.databases ?? []), updatedDb] } : s,
          ),
          databases: newDatabases,
        };
      }

      return { ...prev, sections: newSections, databases: [...newDatabases, updatedDb] };
    });
  }

  function removeDatabaseFromSpace(databaseId: string): string | null {
    const sectionId = (space?.sections ?? []).find((s) => s.databases?.some((d) => d.id === databaseId))?.id ?? null;
    applyPatch((prev) => ({
      ...prev,
      databases: (prev.databases ?? []).filter((d) => d.id !== databaseId),
      sections: (prev.sections ?? []).map((s) => ({
        ...s,
        databases: (s.databases ?? []).filter((d) => d.id !== databaseId),
      })),
    }));
    return sectionId;
  }

  return { updateDatabaseInSpace, reorderDatabasesInSection, moveDatabaseToSection, removeDatabaseFromSpace };
}
