import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_SPACE_MARKER = "integration-space-test";

describe("SpaceController (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    ({ app, agent } = await setupIntegrationApp());

    const email = uniqueEmail(INTEGRATION_SPACE_MARKER);
    const password = "Password123!";

    await agent.post("/auth/register").send({ email, username: uniqueUsername(), password });

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });

    const loginRes = await agent.post("/auth/login").send({ email, password });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_SPACE_MARKER);
  });

  describe("TC-WS-001: Automatic workspace creation", () => {
    it("should have created a workspace automatically after login", async () => {
      const res = await agent.get("/spaces").set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const defaultSpace = res.body.find((s: any) => s.isDefault);
      expect(defaultSpace).toBeDefined();
    });

    it("should have created preset databases in the default workspace", async () => {
      const spacesRes = await agent.get("/spaces").set("Authorization", `Bearer ${accessToken}`);
      const spaceId = spacesRes.body[0].id;

      const dbRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);

      expect(dbRes.status).toBe(HttpStatus.OK);
      const dbNames = dbRes.body.map((db: any) => db.name);

      const expectedNames = [
        "Trading Journal",
        "Session Routine",
        "Routine Library",
        "Mistakes",
        "Notes",
        "Accounts",
        "Operations",
        "Trading Systems",
        "Performance Review",
      ];

      for (const name of expectedNames) {
        expect(dbNames).toContain(name);
      }
    });
  });

  describe("TC-WS-004: Create new workspace", () => {
    it("should create a new workspace with preset databases", async () => {
      const res = await agent.post("/spaces").set("Authorization", `Bearer ${accessToken}`).send({ name: "My Second Workspace" });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.name).toBe("My Second Workspace");

      const spaceId = res.body.id;
      const dbRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);
      expect(dbRes.body.length).toBeGreaterThan(0);
    });
  });

  describe("TC-WS-005: Create workspace with invalid name", () => {
    it("should return 400 when name is empty", async () => {
      const res = await agent.post("/spaces").set("Authorization", `Bearer ${accessToken}`).send({ name: "" });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("TC-WS-007: Update workspace", () => {
    it("should rename the workspace", async () => {
      const createRes = await agent.post("/spaces").set("Authorization", `Bearer ${accessToken}`).send({ name: "To Be Renamed" });
      const spaceId = createRes.body.id;

      const updateRes = await agent
        .patch(`/spaces/${spaceId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Renamed Workspace" });

      expect(updateRes.status).toBe(HttpStatus.OK);
      expect(updateRes.body.name).toBe("Renamed Workspace");
    });
  });

  describe("TC-WS-009: Delete workspace", () => {
    it("should delete the workspace and its contents", async () => {
      const createRes = await agent.post("/spaces").set("Authorization", `Bearer ${accessToken}`).send({ name: "To Be Deleted" });
      const spaceId = createRes.body.id;

      const deleteRes = await agent.delete(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);

      expect(deleteRes.status).toBe(HttpStatus.OK);

      const getRes = await agent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);
      expect(getRes.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe("TC-WS-011: Security - access other user's workspace", () => {
    it("should return 403 when trying to access another user's workspace", async () => {
      const otherAgent = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);
      const otherEmail = uniqueEmail("other-user");
      const otherUsername = uniqueUsername();
      const password = "Password123!";

      await otherAgent.post("/auth/register").send({ email: otherEmail, username: otherUsername, password });
      await prisma.user.update({ where: { email: otherEmail }, data: { isVerified: true } });
      const otherLoginRes = await otherAgent.post("/auth/login").send({ email: otherEmail, password });
      const otherToken = otherLoginRes.body.accessToken;

      const createRes = await agent.post("/spaces").set("Authorization", `Bearer ${accessToken}`).send({ name: "Secret Workspace" });
      const spaceId = createRes.body.id;

      const getRes = await otherAgent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${otherToken}`);

      expect(getRes.status).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
