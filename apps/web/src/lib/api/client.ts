import { API_BASE_URL } from '@/utils/constants';

export class ApiError extends Error {
  public readonly messages: string[];

  constructor(
    public readonly status: number,
    messages: string | string[],
  ) {
    const list = Array.isArray(messages) ? messages : [messages];
    super(list[0]);
    this.name = 'ApiError';
    this.messages = list;
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const messages = Array.isArray(data.message) ? data.message : [data.message ?? 'Something went wrong'];
    throw new ApiError(res.status, messages);
  }

  return data as T;
}
