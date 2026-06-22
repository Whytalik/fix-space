import { API_BASE_URL } from "@/utils/constants";

export class ApiError extends Error {
  public readonly messages: string[];

  constructor(
    public readonly status: number,
    messages: string | string[],
  ) {
    const list = Array.isArray(messages) ? messages : [messages];
    super(list[0]);
    this.name = "ApiError";
    this.messages = list;
  }
}

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  noRedirect?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, noRedirect = false } = options;

  const isFormData = body instanceof FormData;

  const serializeBody = () => (body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body));

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: serializeBody(),
  });

  if (res.status === 401 && path !== "/auth/refresh" && path !== "/auth/login") {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      const retryRes = await fetch(`${API_BASE_URL}${path}`, {
        method,
        credentials: "include",
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...headers,
        },
        body: serializeBody(),
      });
      const retryData = await retryRes.json().catch(() => ({}));
      if (!retryRes.ok) {
        const messages = Array.isArray(retryData.message) ? retryData.message : [retryData.message ?? "Something went wrong"];
        throw new ApiError(retryRes.status, messages);
      }
      return retryData as T;
    }

    if (!noRedirect) redirectToLogin();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const messages = Array.isArray(data.message) ? data.message : [data.message ?? "Something went wrong"];
    throw new ApiError(res.status, messages);
  }

  return data as T;
}

export function parseApiError(error: unknown): string {
  if (error instanceof ApiError) return error.messages[0] ?? "Something went wrong. Please try again.";
  return "Something went wrong. Please try again.";
}

export function parseApiErrors(error: unknown): string[] {
  if (error instanceof ApiError) return error.messages;
  return ["Something went wrong. Please try again."];
}
