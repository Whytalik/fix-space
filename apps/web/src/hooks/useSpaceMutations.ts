import { storage } from "@/lib/storage";
import type { SpaceResponseDto } from "@nucleus/domain";
import type { Dispatch } from "react";
import type { SpaceAction } from "@/types/space";

export function useSpaceMutations(
  dispatch: Dispatch<SpaceAction>,
  spaces: SpaceResponseDto[],
  currentSpaceId: string | null,
) {
  function setSpace(s: SpaceResponseDto) {
    storage.setLastSpaceId(s.id);
    dispatch({ type: "SET_CURRENT", spaceId: s.id });
  }

  function addSpace(newSpace: SpaceResponseDto) {
    storage.setLastSpaceId(newSpace.id);
    dispatch({ type: "ADD", space: newSpace });
  }

  function removeSpace(spaceId: string) {
    const fallback = currentSpaceId === spaceId ? (spaces.find((s) => s.id !== spaceId) ?? null) : null;
    if (currentSpaceId === spaceId) {
      if (fallback) storage.setLastSpaceId(fallback.id);
      else storage.clearLastSpaceId();
    }
    dispatch({ type: "REMOVE", spaceId, fallbackId: fallback?.id ?? null });
  }

  function updateSpaceInList(updated: SpaceResponseDto) {
    dispatch({ type: "UPDATE_IN_LIST", space: updated });
  }

  return { setSpace, addSpace, removeSpace, updateSpaceInList };
}
