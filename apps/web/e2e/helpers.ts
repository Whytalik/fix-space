import { type APIRequestContext } from "@playwright/test";

export async function waitForApi(request: APIRequestContext) {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await request.get("http://127.0.0.1:3000/health");
      if (res.ok()) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("API did not become ready within 60s");
}
