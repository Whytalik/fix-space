import { API_BASE_URL } from "@/utils/constants";
import type { SpaceResponseDto } from "@fixspace/domain";
import { cookies } from "next/headers";

export async function getSpacesServer(): Promise<SpaceResponseDto[]> {
  const cookieStore = await cookies();

  if (!cookieStore.has("access_token")) return [];

  const cookieString = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  try {
    const res = await fetch(`${API_BASE_URL}/spaces`, {
      headers: {
        Cookie: cookieString,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (e) {
    console.error("Failed to fetch spaces on server", e);
    return [];
  }
}
