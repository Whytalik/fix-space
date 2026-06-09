import type { SectionResponseDto, SpaceResponseDto } from "@fixspace/domain";

type ApplyPatch = (patchFunction: (space: SpaceResponseDto) => SpaceResponseDto) => void;

export function createSectionMutations(applyPatch: ApplyPatch) {
  function reorderSections(reordered: SectionResponseDto[]) {
    applyPatch((prev) => ({ ...prev, sections: reordered }));
  }

  function removeSectionFromSpace(sectionId: string) {
    applyPatch((prev) => {
      const section = (prev.sections ?? []).find((sectionItem) => sectionItem.id === sectionId);
      const freedDbs = (section?.databases ?? []).map((db) => ({ ...db, sectionId: null }));
      return {
        ...prev,
        sections: (prev.sections ?? []).filter((sectionItem) => sectionItem.id !== sectionId),
        databases: [...(prev.databases ?? []), ...freedDbs],
      };
    });
  }

  function renameSectionInSpace(sectionId: string, name: string) {
    applyPatch((prev) => ({
      ...prev,
      sections: (prev.sections ?? []).map((section) => (section.id === sectionId ? { ...section, name } : section)),
    }));
  }

  return { reorderSections, removeSectionFromSpace, renameSectionInSpace };
}
