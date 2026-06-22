import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { FilterLogic, PropertyType } from "@fixspace/domain";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_VIEW_MARKER = "integration-view-test";

describe("ViewOperations (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let spaceId: string;
  let userId: string;
  let databaseId: string;

  let otherAccessToken: string;
  let otherUserId: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;

    const email = uniqueEmail(INTEGRATION_VIEW_MARKER);
    const username = uniqueUsername();
    const password = "Password123!";

    await agent.post("/auth/register").send({ email, username, password });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });

    const loginRes = await agent.post("/auth/login").send({ email, password });
    accessToken = loginRes.body.accessToken;

    const spacesRes = await agent.get("/spaces").set("Authorization", `Bearer ${accessToken}`);
    spaceId = spacesRes.body[0].id;

    const dbRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "View Test DB",
      type: "notes",
    });
    databaseId = dbRes.body.id;

    const otherEmail = uniqueEmail(`${INTEGRATION_VIEW_MARKER}-other`);
    const otherUsername = uniqueUsername();
    await agent.post("/auth/register").send({ email: otherEmail, username: otherUsername, password });
    const otherUser = await prisma.user.findUniqueOrThrow({ where: { email: otherEmail } });
    otherUserId = otherUser.id;
    await prisma.user.update({ where: { id: otherUserId }, data: { isVerified: true } });

    const otherLoginRes = await agent.post("/auth/login").send({ email: otherEmail, password });
    otherAccessToken = otherLoginRes.body.accessToken;

    await agent.post("/auth/login").send({ email, password });
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_VIEW_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-VIEW-031: should fail to request a protected endpoint without auth token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0]).get(`/databases/${databaseId}/views`);
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-VIEW-032: should fail to access view of another user", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get(`/databases/${databaseId}/views`)
      .set("Authorization", `Bearer ${otherAccessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-VIEW-033: should fail to get a non-existent view", async () => {
    const res = await agent.get("/views/00000000-0000-0000-0000-000000000000").set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-VIEW-023: should create a new view for a database", async () => {
    const res = await agent.post(`/databases/${databaseId}/views`).set("Authorization", `Bearer ${accessToken}`).send({
      name: "My custom table view",
    });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("My custom table view");
  });

  it("TC-VIEW-004: should not affect record retrieval data when columns are hidden", async () => {
    const viewRes = await agent
      .post(`/databases/${databaseId}/views`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Hidden Col View",
        hiddenColumns: ["name"],
      });
    expect(viewRes.status).toBe(HttpStatus.CREATED);

    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Secret Item" });
    const recordId = recordRes.body.id;

    const recsRes = await agent.get("/records").query({ databaseId }).set("Authorization", `Bearer ${accessToken}`);

    const record = recsRes.body.find((r: any) => r.id === recordId);
    expect(record).toBeDefined();
    expect(record.name).toBe("Secret Item");
  });

  it("TC-VIEW-025: should fail to change filters of a locked view", async () => {
    const viewRes = await agent.post(`/databases/${databaseId}/views`).set("Authorization", `Bearer ${accessToken}`).send({
      name: "To Lock View",
    });
    const viewId = viewRes.body.id;

    const lockRes = await agent.patch(`/views/${viewId}`).set("Authorization", `Bearer ${accessToken}`).send({
      isLocked: true,
    });
    expect(lockRes.status).toBe(HttpStatus.OK);
    expect(lockRes.body.isLocked).toBe(true);

    const filterRes = await agent
      .patch(`/views/${viewId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        filters: [{ propertyId: "name", operator: "equals", value: "Locked" }],
      });

    expect(filterRes.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-VIEW-027 / TC-VIEW-028: should filter records using AND/OR logic", async () => {
    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Asset",
      type: PropertyType.TEXT,
      position: 1,
    });
    const propId = propRes.body.id;

    const record1 = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Trade 1" });
    const record2 = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Trade 2" });
    const record3 = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Trade 3" });

    const getValues = async (recordId: string) => {
      const v = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);
      return v.body.find((x: any) => x.propertyId === propId);
    };

    const value1 = await getValues(record1.body.id);
    await agent.patch(`/values/${value1.id}`).set("Authorization", `Bearer ${accessToken}`).send({ value: "EURUSD" });

    const value2 = await getValues(record2.body.id);
    await agent.patch(`/values/${value2.id}`).set("Authorization", `Bearer ${accessToken}`).send({ value: "GBPUSD" });

    const value3 = await getValues(record3.body.id);
    await agent.patch(`/values/${value3.id}`).set("Authorization", `Bearer ${accessToken}`).send({ value: "EURUSD" });

    const andFilters = [
      { propertyId: "name", operator: "contains", value: "Trade" },
      { propertyId: propId, operator: "equals", value: "EURUSD" },
    ];

    const andRes = await agent
      .get("/records")
      .query({
        databaseId,
        filters: JSON.stringify(andFilters),
        filterLogic: FilterLogic.AND,
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(andRes.status).toBe(HttpStatus.OK);
    const ids = andRes.body.map((r: any) => r.id);
    expect(ids).toContain(record1.body.id);
    expect(ids).toContain(record3.body.id);
    expect(ids).not.toContain(record2.body.id);

    const orFilters = [
      { propertyId: propId, operator: "equals", value: "GBPUSD" },
      { propertyId: "name", operator: "equals", value: "Trade 3" },
    ];

    const orRes = await agent
      .get("/records")
      .query({
        databaseId,
        filters: JSON.stringify(orFilters),
        filterLogic: FilterLogic.OR,
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(orRes.status).toBe(HttpStatus.OK);
    const orIds = orRes.body.map((r: any) => r.id);
    expect(orIds).toContain(record2.body.id);
    expect(orIds).toContain(record3.body.id);
    expect(orIds).not.toContain(record1.body.id);
  });
});
