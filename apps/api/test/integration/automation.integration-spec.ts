import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { AutomationTrigger, PropertyType } from "@fixspace/domain";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_AUTOMATION_MARKER = "integration-automation-test";

describe("AutomationOperations (integration)", () => {
  let app: INestApplication;
  let agentA: ReturnType<typeof supertest.agent>;
  let agentB: ReturnType<typeof supertest.agent>;
  let accessTokenA: string;
  let accessTokenB: string;
  let userIdA: string;
  let databaseId: string;
  let propStatusId: string;
  let propTargetId: string;
  let automationId: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agentA = setup.agent;
    agentB = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);

    const emailA = uniqueEmail(`${INTEGRATION_AUTOMATION_MARKER}-a`);
    const usernameA = uniqueUsername();
    const password = "Password123!";

    await agentA.post("/auth/register").send({ email: emailA, username: usernameA, password });
    const userA = await prisma.user.findUniqueOrThrow({ where: { email: emailA } });
    userIdA = userA.id;
    await prisma.user.update({ where: { id: userIdA }, data: { isVerified: true } });

    const loginResA = await agentA.post("/auth/login").send({ email: emailA, password });
    accessTokenA = loginResA.body.accessToken;

    const spacesResA = await agentA.get("/spaces").set("Authorization", `Bearer ${accessTokenA}`);
    const spaceIdA = spacesResA.body[0].id;

    const dbRes = await agentA.post("/databases").set("Authorization", `Bearer ${accessTokenA}`).send({
      spaceId: spaceIdA,
      name: "Automation DB",
      type: "notes",
    });
    expect(dbRes.status).toBe(HttpStatus.CREATED);
    databaseId = dbRes.body.id;

    const p1Res = await agentA.post("/properties").set("Authorization", `Bearer ${accessTokenA}`).send({
      databaseId,
      name: "Status",
      type: PropertyType.SELECT,
      position: 1,
    });
    propStatusId = p1Res.body.id;

    const p2Res = await agentA.post("/properties").set("Authorization", `Bearer ${accessTokenA}`).send({
      databaseId,
      name: "Result",
      type: PropertyType.TEXT,
      position: 2,
    });
    propTargetId = p2Res.body.id;

    const emailB = uniqueEmail(`${INTEGRATION_AUTOMATION_MARKER}-b`);
    const usernameB = uniqueUsername();

    await agentB.post("/auth/register").send({ email: emailB, username: usernameB, password });
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: emailB } });
    await prisma.user.update({ where: { id: userB.id }, data: { isVerified: true } });

    const loginResB = await agentB.post("/auth/login").send({ email: emailB, password });
    accessTokenB = loginResB.body.accessToken;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_AUTOMATION_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-AUTO-016: should return 401 Unauthorized when requesting automations without token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/automations")
      .query({ databaseId });
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-AUTO-017: should return 404 Not Found when User B requests User A's database automations", async () => {
    const res = await agentB.get("/automations").set("Authorization", `Bearer ${accessTokenB}`).query({ databaseId });
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-AUTO-018: should return 404 Not Found when requesting logs for a non-existent automation", async () => {
    const res = await agentA.get("/automations/00000000-0000-0000-0000-000000000000/logs").set("Authorization", `Bearer ${accessTokenA}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-AUTO-002: should successfully create a new automation", async () => {
    const res = await agentA
      .post("/automations")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .send({
        databaseId,
        name: "Auto Close Task",
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: {
          propertyId: propStatusId,
          condition: {
            type: "equals",
            value: "Closed",
          },
        },
        actions: [
          {
            type: "SET_FIELD_VALUE",
            propertyId: propTargetId,
            valueType: "FIXED",
            value: "Done",
          },
        ],
        active: true,
      });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("Auto Close Task");
    automationId = res.body.id;
  });

  it("TC-AUTO-003 / TC-AUTO-006: should execute SET_FIELD_VALUE action when ON_FIELD_CHANGE trigger condition is met", async () => {
    const recRes = await agentA.post("/records").set("Authorization", `Bearer ${accessTokenA}`).send({ databaseId });
    const recordId = recRes.body.id;

    const valsRes = await agentA.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessTokenA}`);

    const statusVal = valsRes.body.find((v: any) => v.propertyId === propStatusId);

    await agentA.patch(`/values/${statusVal.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ value: "Closed" });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedValsRes = await agentA.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessTokenA}`);

    const targetVal = updatedValsRes.body.find((v: any) => v.propertyId === propTargetId);
    expect(targetVal.value).toBe("Done");
  });

  it("TC-AUTO-012 / TC-AUTO-013: should ignore triggers when automation is deactivated and execute again when reactivated", async () => {
    const patchRes = await agentA
      .patch(`/automations/${automationId}`)
      .set("Authorization", `Bearer ${accessTokenA}`)
      .send({ active: false });
    expect(patchRes.status).toBe(HttpStatus.OK);
    expect(patchRes.body.active).toBe(false);

    const recRes = await agentA.post("/records").set("Authorization", `Bearer ${accessTokenA}`).send({ databaseId });
    const recordId = recRes.body.id;

    const valsRes = await agentA.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessTokenA}`);

    const statusVal = valsRes.body.find((v: any) => v.propertyId === propStatusId);

    await agentA.patch(`/values/${statusVal.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ value: "Closed" });

    await new Promise((resolve) => setTimeout(resolve, 500));

    let updatedValsRes = await agentA.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessTokenA}`);

    let targetVal = updatedValsRes.body.find((v: any) => v.propertyId === propTargetId);
    expect(targetVal.value).toBeNull();

    await agentA.patch(`/automations/${automationId}`).set("Authorization", `Bearer ${accessTokenA}`).send({ active: true });

    await agentA.patch(`/values/${statusVal.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ value: "Open" });

    await agentA.patch(`/values/${statusVal.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ value: "Closed" });

    await new Promise((resolve) => setTimeout(resolve, 500));

    updatedValsRes = await agentA.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessTokenA}`);

    targetVal = updatedValsRes.body.find((v: any) => v.propertyId === propTargetId);
    expect(targetVal.value).toBe("Done");
  });

  it("TC-AUTO-010: should return execution logs of the automation", async () => {
    const logsRes = await agentA.get(`/automations/${automationId}/logs`).set("Authorization", `Bearer ${accessTokenA}`);

    expect(logsRes.status).toBe(HttpStatus.OK);
    expect(logsRes.body.length).toBeGreaterThan(0);
    expect(logsRes.body[0].status).toBe("SUCCESS");
  });
});
