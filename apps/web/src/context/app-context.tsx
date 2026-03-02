"use client";

import { ApiError } from "@/lib/api/client";
import { getSpaces } from "@/lib/api/space";
import { getMe } from "@/lib/api/user";
import { clearCached, getCached, setCached } from "@/lib/cache";
import type { DatabaseResponseDto, SpaceResponseDto, UserResponseDto } from "@nucleus/domain";
import { createContext, useContext, useEffect, useState } from "react";

const CACHE_KEY_USER = "me";
const CACHE_KEY_SPACES = "spaces";

interface AppContextValue {
  user: UserResponseDto | null;
  space: SpaceResponseDto | null;
  spaces: SpaceResponseDto[];
  setSpace: (space: SpaceResponseDto) => void;
  updateDatabaseInSpace: (updated: DatabaseResponseDto) => void;
  clearSession: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue>({
  user: null,
  space: null,
  spaces: [],
  setSpace: () => {},
  updateDatabaseInSpace: () => {},
  clearSession: () => {},
  isLoading: true,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [space, setSpace] = useState<SpaceResponseDto | null>(null);
  const [spaces, setSpaces] = useState<SpaceResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    const cachedUser = getCached<UserResponseDto>(CACHE_KEY_USER);
    const cachedSpaces = getCached<SpaceResponseDto[]>(CACHE_KEY_SPACES);

    if (cachedUser && cachedSpaces) {
      setUser(cachedUser);
      setSpaces(cachedSpaces);
      setSpace(cachedSpaces[0] ?? null);
      setIsLoading(false);
      return;
    }

    Promise.all([getMe(), getSpaces()])
      .then(([userData, fetchedSpaces]) => {
        setUser(userData);
        setSpaces(fetchedSpaces);
        setSpace(fetchedSpaces[0] ?? null);
        localStorage.setItem("username", userData.username);
        setCached(CACHE_KEY_USER, userData);
        setCached(CACHE_KEY_SPACES, fetchedSpaces);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("username");
          clearCached(CACHE_KEY_USER, CACHE_KEY_SPACES);
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  function updateDatabaseInSpace(updated: DatabaseResponseDto) {
    const patch = (prev: SpaceResponseDto | null) => {
      if (!prev) return prev;
      const replaceDb = (db: DatabaseResponseDto) => (db.id === updated.id ? updated : db);
      return {
        ...prev,
        databases: prev.databases?.map(replaceDb) ?? [],
        sections: prev.sections?.map((s) => ({ ...s, databases: s.databases?.map(replaceDb) ?? [] })) ?? [],
      };
    };
    setSpace((prev) => patch(prev));
    setSpaces((prev) => prev.map((s) => patch(s) ?? s));
  }

  function clearSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    clearCached(CACHE_KEY_USER, CACHE_KEY_SPACES);
    setUser(null);
    setSpace(null);
    setSpaces([]);
  }

  return (
    <AppContext.Provider
      value={{
        user,
        space,
        spaces,
        setSpace,
        updateDatabaseInSpace,
        clearSession,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
