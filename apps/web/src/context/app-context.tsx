"use client";

import { useDatabaseMutations } from "@/hooks/useDatabaseMutations";
import { useSectionMutations } from "@/hooks/useSectionMutations";
import { useSpaceMutations } from "@/hooks/useSpaceMutations";
import { ApiError } from "@/lib/api/client";
import { getSpaces } from "@/lib/api/space";
import { getMe } from "@/lib/api/user";
import { clearCached, getCached, setCached } from "@/lib/cache";
import { storage } from "@/lib/storage";
import type { SpaceAction, SpaceState } from "@/types/space";
import { CACHE_KEY_SPACES, CACHE_KEY_USER } from "@/utils/constants";
import type { DatabaseResponseDto, SectionResponseDto, SpaceResponseDto, UserResponseDto } from "@fixspace/domain";
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

function spaceReducer(state: SpaceState, action: SpaceAction): SpaceState {
  switch (action.type) {
    case "INITIALIZE":
      return { spaces: action.spaces, currentSpaceId: action.currentSpaceId };
    case "SET_CURRENT":
      return { ...state, currentSpaceId: action.spaceId };
    case "ADD":
      return { spaces: [...state.spaces, action.space], currentSpaceId: action.space.id };
    case "REMOVE": {
      const spaces = state.spaces.filter((s) => s.id !== action.spaceId);
      const currentSpaceId = state.currentSpaceId === action.spaceId ? action.fallbackId : state.currentSpaceId;
      return { spaces, currentSpaceId };
    }
    case "UPDATE_IN_LIST":
      return { ...state, spaces: state.spaces.map((s) => (s.id === action.space.id ? action.space : s)) };
    case "PATCH":
      return { ...state, spaces: state.spaces.map((s) => action.fn(s)) };
    case "RESET":
      return { spaces: [], currentSpaceId: null };
  }
}

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
  moveDatabaseToSection: (dbId: string, targetSectionId: string | null) => void;
  removeSectionFromSpace: (sectionId: string) => void;
  renameSectionInSpace: (sectionId: string, name: string) => void;
  removeDatabaseFromSpace: (databaseId: string) => string | null;
  addDatabaseToSpace: (db: DatabaseResponseDto) => void;
  updateUser: (updated: UserResponseDto) => void;
  clearSession: () => void;
  isLoading: boolean;
  currentDatabaseId: string | null;
  setCurrentDatabaseId: (id: string | null) => void;
  currentRecordName: string | null;
  setCurrentRecordName: (name: string | null) => void;
  currentRecordIcon: string | null;
  setCurrentRecordIcon: (icon: string | null) => void;
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
  currentRecordName: null,
  setCurrentRecordName: () => {},
  currentRecordIcon: null,
  setCurrentRecordIcon: () => {},
});

function resolveInitialSpaceId(list: SpaceResponseDto[]): string | null {
  const lastId = storage.getLastSpaceId();
  return (lastId && list.some((s) => s.id === lastId) ? lastId : null) ?? list[0]?.id ?? null;
}

export function AppProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: UserResponseDto | null;
}) {
  const [user, setUser] = useState<UserResponseDto | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDatabaseId, setCurrentDatabaseId] = useState<string | null>(null);
  const [currentRecordName, setCurrentRecordName] = useState<string | null>(null);
  const [currentRecordIcon, setCurrentRecordIcon] = useState<string | null>(null);
  const [{ spaces, currentSpaceId }, dispatch] = useReducer(spaceReducer, {
    spaces: [],
    currentSpaceId: null,
  });

  const space = useMemo(() => spaces.find((s) => s.id === currentSpaceId) ?? null, [spaces, currentSpaceId]);
  const databases = useMemo(
    () => [...(space?.databases ?? []), ...(space?.sections ?? []).flatMap((s) => s.databases ?? [])],
    [space],
  );

  function applyPatch(fn: (s: SpaceResponseDto) => SpaceResponseDto) {
    dispatch({ type: "PATCH", fn });
  }

  const { setSpace, addSpace, removeSpace, updateSpaceInList } = useSpaceMutations(dispatch, spaces, currentSpaceId);
  const { updateDatabaseInSpace, reorderDatabasesInSection, moveDatabaseToSection, removeDatabaseFromSpace } =
    useDatabaseMutations(applyPatch, space);
  const { reorderSections, removeSectionFromSpace, renameSectionInSpace } = useSectionMutations(applyPatch);

  useEffect(() => {
    if (spaces.length > 0) setCached(CACHE_KEY_SPACES, spaces);
  }, [spaces]);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const cachedUser = getCached<UserResponseDto>(CACHE_KEY_USER);
    const cachedSpaces = getCached<SpaceResponseDto[]>(CACHE_KEY_SPACES);

    if (cachedUser && cachedSpaces) {
      setUser(cachedUser);
      dispatch({ type: "INITIALIZE", spaces: cachedSpaces, currentSpaceId: resolveInitialSpaceId(cachedSpaces) });
      setIsLoading(false);
      return;
    }

    Promise.all([getMe(), getSpaces()])
      .then(([userData, fetchedSpaces]) => {
        setUser(userData);
        dispatch({ type: "INITIALIZE", spaces: fetchedSpaces, currentSpaceId: resolveInitialSpaceId(fetchedSpaces) });
        storage.setUsername(userData.username);
        setCached(CACHE_KEY_USER, userData);
        setCached(CACHE_KEY_SPACES, fetchedSpaces);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          storage.clearAuth();
          clearCached(CACHE_KEY_USER, CACHE_KEY_SPACES);
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  function addDatabaseToSpace(db: DatabaseResponseDto) {
    applyPatch((s) => {
      if (db.sectionId) {
        return {
          ...s,
          sections: (s.sections ?? []).map((sec) =>
            sec.id === db.sectionId ? { ...sec, databases: [...(sec.databases ?? []), db] } : sec,
          ),
        };
      }
      return { ...s, databases: [...(s.databases ?? []), db] };
    });
  }

  function updateUser(updated: UserResponseDto) {
    setUser(updated);
    setCached(CACHE_KEY_USER, updated);
    storage.setUsername(updated.username);
  }

  function clearSession() {
    storage.clearAuth();
    storage.clearLastSpaceId();
    clearCached(CACHE_KEY_USER, CACHE_KEY_SPACES);
    setUser(null);
    dispatch({ type: "RESET" });
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
        currentRecordName,
        setCurrentRecordName,
        currentRecordIcon,
        setCurrentRecordIcon,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
