const ACCESS_TOKEN = "access_token";
const USERNAME = "username";
const LAST_SPACE_ID = "last_space_id";

export const storage = {
  getToken: (): string | null => (typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN) : null),
  setToken: (value: string) => localStorage.setItem(ACCESS_TOKEN, value),

  getUsername: (): string | null => localStorage.getItem(USERNAME),
  setUsername: (value: string) => localStorage.setItem(USERNAME, value),

  getLastSpaceId: (): string | null => localStorage.getItem(LAST_SPACE_ID),
  setLastSpaceId: (value: string) => localStorage.setItem(LAST_SPACE_ID, value),
  clearLastSpaceId: () => localStorage.removeItem(LAST_SPACE_ID),

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USERNAME);
  },
};
