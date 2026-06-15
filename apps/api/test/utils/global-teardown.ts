import type { INestApplication } from "@nestjs/common";

export default async function globalTeardown() {
  const app = (global as unknown as Record<string, unknown>)["__integrationApp__"] as INestApplication | undefined;
  if (app) {
    await app.close();
  }
}
