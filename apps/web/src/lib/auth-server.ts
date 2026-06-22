import { API_BASE_URL } from "@/utils/constants";
import type { UserResponseDto } from "@fixspace/domain";
import { cookies } from "next/headers";

export async function getMeServer(): Promise<UserResponseDto | null> {
  const cookieStore = await cookies();

  if (!cookieStore.has("access_token")) return null;

  const cookieString = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Cookie: cookieString,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}
