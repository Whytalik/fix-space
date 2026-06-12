"use client";

import { createDatabaseMutations } from "@/utils/db/db-mutations";
import { createSectionMutations } from "@/utils/db/section-mutations";
import { API_BASE_URL } from "@/utils/constants";
import { storage } from "@/lib/storage";
import { useUserQuery } from "@/hooks/api/use-user-query";
import { useSpacesQuery } from "@/hooks/api/use-spaces-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import type { DatabaseResponseDto, SectionResponseDto, SpaceResponseDto, UserResponseDto } from "@fixspace/domain";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AppContextValue {
  user: UserResponseDto | null;
  space: SpaceResponseDto | null;
  spaces: SpaceResponseDto[];
  databases: DatabaseResponseDto[];
  setSpace: (space: SpaceResponseDto) => void;
  addSpace: (space: SpaceResponseDto) => void;
  removeSpace: (spaceId: string) => void;
  updateSpaceInList: (updated: SpaceResponseDto) => void;
  updateDatabaseInSpace: (updated: DatabaseResponseDto) => void;
  reorderSections: (reordered: SectionResponseDto[]) => void;
  reorderDatabasesInSection: (sectionId: string | null, reordered: DatabaseResponseDto[]) => void;
  moveDatabaseToSection: (databaseId: string, targetSectionId: string | null) => void;
  removeSectionFromSpace: (sectionId: string) => void;
  renameSectionInSpace: (sectionId: string, name: string) => void;
  removeDatabaseFromSpace: (databaseId: string) => string | null;
  addDatabaseToSpace: (db: DatabaseResponseDto) => void;
  updateUser: (updated: UserResponseDto) => void;
  clearSession: () => void;
  isLoading: boolean;
  currentDatabaseId: string | null;
  setCurrentDatabaseId: (id: string | null) => void;
}

const AppContext = createContext<AppContextValue>({
  user: null,
  space: null,
  spaces: [],
  databases: [],
  setSpace: () => {},
  addSpace: () => {},
  removeSpace: () => {},
  updateSpaceInList: () => {},
  updateDatabaseInSpace: () => {},
  reorderSections: () => {},
  reorderDatabasesInSection: () => {},
  moveDatabaseToSection: () => {},
  removeSectionFromSpace: () => {},
  renameSectionInSpace: () => {},
  removeDatabaseFromSpace: () => null,
  addDatabaseToSpace: () => {},
  updateUser: () => {},
  clearSession: () => {},
  isLoading: true,
  currentDatabaseId: null,
  setCurrentDatabaseId: () => {},
});

function resolveInitialSpaceId(list: SpaceResponseDto[]): string | null {
  const lastId = storage.getLastSpaceId();
  return (lastId && list.some((space) => space.id === lastId) ? lastId : null) ?? list[0]?.id ?? null;
}

export function AppProvider({
  children,
  initialUser = null,
  initialSpaces = [],
  initialSpaceId = null,
}: {
  children: React.ReactNode;
  initialUser?: UserResponseDto | null;
  initialSpaces?: SpaceResponseDto[];
  initialSpaceId?: string | null;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;
    params.delete("token");
    const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
    fetch(`${API_BASE_URL}/auth/set-session`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token }),
    }).then((res) => {
      if (res.ok) queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    });
  }, [queryClient]);

  const { data: user = null, isLoading: isUserLoading } = useUserQuery({
    initialData: initialUser || undefined,
    enabled: true,
  });

  const { data: spaces = initialSpaces, isLoading: isSpacesLoading } = useSpacesQuery({
    initialData: initialSpaces && initialSpaces.length > 0 ? initialSpaces : undefined,
    enabled: !!user,
  });

  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(initialSpaceId);
  const [currentDatabaseId, setCurrentDatabaseId] = useState<string | null>(null);

  const space = useMemo(() => spaces.find((s) => s.id === currentSpaceId) ?? null, [spaces, currentSpaceId]);
  const databases = useMemo(
    () => [...(space?.databases ?? []), ...(space?.sections ?? []).flatMap((section) => section.databases ?? [])],
    [space],
  );

  const isLoading = isUserLoading || (!!user && isSpacesLoading && spaces.length === 0);

  useEffect(() => {
    if (spaces.length > 0) {
      if (!currentSpaceId || !spaces.some((space) => space.id === currentSpaceId)) {
        setCurrentSpaceId(resolveInitialSpaceId(spaces));
      }
    } else {
      setCurrentSpaceId(null);
    }
  }, [spaces, currentSpaceId]);

  function applyPatch(patchFn: (space: SpaceResponseDto) => SpaceResponseDto) {
    queryClient.setQueryData<SpaceResponseDto[]>(queryKeys.spaces.all(), (previous) => {
      if (!previous) return [];
      return previous.map((space) => (space.id === currentSpaceId ? patchFn(space) : space));
    });
  }

  const { updateDatabaseInSpace, reorderDatabasesInSection, moveDatabaseToSection, removeDatabaseFromSpace } = createDatabaseMutations(
    applyPatch,
    space,
  );
  const { reorderSections, removeSectionFromSpace, renameSectionInSpace } = createSectionMutations(applyPatch);

  function setSpace(space: SpaceResponseDto) {
    storage.setLastSpaceId(space.id);
    setCurrentSpaceId(space.id);
  }

  function addSpace(newSpace: SpaceResponseDto) {
    storage.setLastSpaceId(newSpace.id);
    setCurrentSpaceId(newSpace.id);
    queryClient.setQueryData<SpaceResponseDto[]>(queryKeys.spaces.all(), (previous) => {
      if (!previous) return [newSpace];
      return [...previous, newSpace];
    });
  }

  function removeSpace(spaceId: string) {
    const fallback = currentSpaceId === spaceId ? (spaces.find((space) => space.id !== spaceId) ?? null) : null;
    if (currentSpaceId === spaceId) {
      if (fallback) storage.setLastSpaceId(fallback.id);
      else storage.clearLastSpaceId();
      setCurrentSpaceId(fallback?.id ?? null);
    }
    queryClient.setQueryData<SpaceResponseDto[]>(queryKeys.spaces.all(), (previous) => {
      if (!previous) return [];
      return previous.filter((space) => space.id !== spaceId);
    });
  }

  function updateSpaceInList(updated: SpaceResponseDto) {
    queryClient.setQueryData<SpaceResponseDto[]>(queryKeys.spaces.all(), (previous) => {
      if (!previous) return [];
      return previous.map((space) => (space.id === updated.id ? updated : space));
    });
  }

  function addDatabaseToSpace(db: DatabaseResponseDto) {
    applyPatch((space) => {
      if (db.sectionId) {
        return {
          ...space,
          sections: (space.sections ?? []).map((section) =>
            section.id === db.sectionId ? { ...section, databases: [...(section.databases ?? []), db] } : section,
          ),
        };
      }
      return { ...space, databases: [...(space.databases ?? []), db] };
    });
  }

  function updateUser(updated: UserResponseDto) {
    queryClient.setQueryData(queryKeys.user.me(), updated);
    storage.setUsername(updated.username);
  }

  function clearSession() {
    storage.clearLastSpaceId();
    queryClient.clear();
    setCurrentSpaceId(null);
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        space,
        spaces,
        databases,
        setSpace,
        addSpace,
        removeSpace,
        updateSpaceInList,
        updateDatabaseInSpace,
        reorderSections,
        reorderDatabasesInSection,
        moveDatabaseToSection,
        removeSectionFromSpace,
        renameSectionInSpace,
        removeDatabaseFromSpace,
        addDatabaseToSpace,
        updateUser,
        clearSession,
        isLoading,
        currentDatabaseId,
        setCurrentDatabaseId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
