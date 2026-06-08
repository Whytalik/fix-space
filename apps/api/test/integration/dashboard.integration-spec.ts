import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import type supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_MARKER = "integration-dashboard-test";

describe("DashboardController (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let _user: { id: string; email: string };
  let accessToken: string;
  let spaceId: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;

    const email = uniqueEmail(INTEGRATION_MARKER);
    const password = "Password123!";

    await agent.post("/auth/register").send({ email, username: uniqueUsername(), password });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    const loginRes = await agent.post("/auth/login").send({ email, password });
    accessToken = loginRes.body.accessToken;
    _user = await prisma.user.findUniqueOrThrow({ where: { email } });

    const spaceRes = await agent.post("/spaces").set("Authorization", `Bearer ${accessToken}`).send({ name: "Test Space" });
    spaceId = spaceRes.body.id;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_MARKER);
  });

  describe("GET /spaces/:id/dashboard", () => {
    it("should return 200 and dashboard data", async () => {
      const res = await agent.get(`/spaces/${spaceId}/dashboard`).set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("marketSessions");
      expect(res.body).toHaveProperty("dailyWorkflow");
      expect(res.body).toHaveProperty("todayItems");
      expect(res.body).toHaveProperty("overviewCharts");
    });
  });
});
