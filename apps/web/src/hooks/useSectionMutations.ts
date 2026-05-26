import type { SectionResponseDto, SpaceResponseDto } from "@fixspace/domain";

type ApplyPatch = (fn: (s: SpaceResponseDto) => SpaceResponseDto) => void;

export function useSectionMutations(applyPatch: ApplyPatch) {
  function reorderSections(reordered: SectionResponseDto[]) {
    applyPatch((prev) => ({ ...prev, sections: reordered }));
  }

  function removeSectionFromSpace(sectionId: string) {
    applyPatch((prev) => {
      const section = (prev.sections ?? []).find((s) => s.id === sectionId);
      const freedDbs = (section?.databases ?? []).map((d) => ({ ...d, sectionId: null }));
      return {
        ...prev,
        sections: (prev.sections ?? []).filter((s) => s.id !== sectionId),
        databases: [...(prev.databases ?? []), ...freedDbs],
      };
    });
  }

  function renameSectionInSpace(sectionId: string, name: string) {
    applyPatch((prev) => ({
      ...prev,
      sections: (prev.sections ?? []).map((s) => (s.id === sectionId ? { ...s, name } : s)),
    }));
  }

  return { reorderSections, removeSectionFromSpace, renameSectionInSpace };
}
