import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_SETTINGS_MARKER = "integration-settings-test";

describe("SettingsOperations (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;

    const email = uniqueEmail(INTEGRATION_SETTINGS_MARKER);
    const username = uniqueUsername();
    const password = "MyPass123!";

    await agent.post("/auth/register").send({ email, username, password });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });

    const loginRes = await agent.post("/auth/login").send({ email, password });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.settings.deleteMany({ where: { userId } });
    await cleanupIntegrationApp(app, INTEGRATION_SETTINGS_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("TC-SET-021: Unauthenticated access", () => {
    it("should return 401 when accessing settings without auth token", async () => {
      const res = await supertest(getServer(app) as Parameters<typeof supertest>[0]).get("/settings/database");
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it("should return 401 when updating settings without auth token", async () => {
      const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
        .patch("/settings/database")
        .send({ defaultDatabaseIcon: "icon:Test" });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("TC-SET-022: Category validation", () => {
    it("should return 400 for an invalid category", async () => {
      const res = await agent.get("/settings/invalid-category").set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("should return 400 for an invalid category on PATCH", async () => {
      const res = await agent.patch("/settings/invalid-category").set("Authorization", `Bearer ${accessToken}`).send({ someKey: "value" });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("TC-SET-023: Get settings by category", () => {
    it("should return default database settings when no overrides exist", async () => {
      const res = await agent.get("/settings/database").set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("defaultDatabaseIcon", "icon:Database");
    });

    it("should return default space settings when no overrides exist", async () => {
      const res = await agent.get("/settings/space").set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("defaultSpaceIcon", "icon:Box");
    });

    it("should return default user settings when no overrides exist", async () => {
      const res = await agent.get("/settings/user").set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("dateFormat", "DD/MM/YYYY");
      expect(res.body).toHaveProperty("timeFormat", "24h");
      expect(res.body).toHaveProperty("timezone", "UTC");
    });
  });

  describe("TC-SET-024: Update settings by category", () => {
    it("should update database icon and return merged settings", async () => {
      const res = await agent
        .patch("/settings/database")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ defaultDatabaseIcon: "icon:CustomDB" });
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("defaultDatabaseIcon", "icon:CustomDB");
    });

    it("should revert to default when updating with default value", async () => {
      await agent.patch("/settings/database").set("Authorization", `Bearer ${accessToken}`).send({ defaultDatabaseIcon: "icon:CustomDB" });

      const res = await agent
        .patch("/settings/database")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ defaultDatabaseIcon: "icon:Database" });
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("defaultDatabaseIcon", "icon:Database");
    });

    it("should update space icon", async () => {
      const res = await agent
        .patch("/settings/space")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ defaultSpaceIcon: "icon:CustomSpace" });
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("defaultSpaceIcon", "icon:CustomSpace");
    });

    it("should update user date format", async () => {
      const res = await agent.patch("/settings/user").set("Authorization", `Bearer ${accessToken}`).send({ dateFormat: "YYYY-MM-DD" });
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("dateFormat", "YYYY-MM-DD");
    });
  });

  describe("TC-SET-025: Persistence across requests", () => {
    it("should persist updated settings and return them on subsequent GET", async () => {
      await agent.patch("/settings/view").set("Authorization", `Bearer ${accessToken}`).send({ defaultViewIcon: "icon:PersistedView" });

      const res = await agent.get("/settings/view").set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty("defaultViewIcon", "icon:PersistedView");
    });
  });
});
