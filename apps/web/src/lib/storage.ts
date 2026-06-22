const USERNAME = "username";
const LAST_SPACE_ID = "last_space_id";

function setCookie(name: string, value: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const storage = {
  getUsername: (): string | null => localStorage.getItem(USERNAME),
  setUsername: (value: string) => localStorage.setItem(USERNAME, value),

  getLastSpaceId: (): string | null => (typeof window !== "undefined" ? localStorage.getItem(LAST_SPACE_ID) : null),
  setLastSpaceId: (value: string) => {
    localStorage.setItem(LAST_SPACE_ID, value);
    setCookie(LAST_SPACE_ID, value);
  },
  clearLastSpaceId: () => {
    localStorage.removeItem(LAST_SPACE_ID);
    removeCookie(LAST_SPACE_ID);
  },
};
