import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { PropertyType, toFieldKey } from "@fixspace/domain";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_FORMULA_MARKER = "integration-formula-test";

describe("FormulaOperations (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let databaseId: string;
  let propNumber1Id: string;
  let propNumber2Id: string;
  let propFormulaId: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;

    const email = uniqueEmail(INTEGRATION_FORMULA_MARKER);
    const username = uniqueUsername();
    const password = "Password123!";

    await agent.post("/auth/register").send({ email, username, password });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });

    const loginRes = await agent.post("/auth/login").send({ email, password });
    accessToken = loginRes.body.accessToken;

    const spacesRes = await agent.get("/spaces").set("Authorization", `Bearer ${accessToken}`);
    const spaceId = spacesRes.body[0].id;

    const dbRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "Formula Test DB",
      type: "notes",
    });
    databaseId = dbRes.body.id;

    const p1Res = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Commissions",
      type: PropertyType.NUMBER,
      position: 1,
    });
    propNumber1Id = p1Res.body.id;

    const p2Res = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Fees",
      type: PropertyType.NUMBER,
      position: 2,
    });
    propNumber2Id = p2Res.body.id;

    const key1 = toFieldKey(propNumber1Id);
    const key2 = toFieldKey(propNumber2Id);

    const fRes = await agent
      .post("/properties")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        name: "Total Cost",
        type: PropertyType.FORMULA,
        position: 3,
        config: {
          type: "CUSTOM",
          expression: `${key1} + ${key2}`,
          resultType: PropertyType.NUMBER,
        },
      });
    propFormulaId = fRes.body.id;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_FORMULA_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-FORM-013: should return 401 Unauthorized when requesting preview formula without token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .post("/properties/preview-formula")
      .send({
        databaseId,
        config: {
          type: "CUSTOM",
          expression: "10 + 20",
          resultType: PropertyType.NUMBER,
        },
      });
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-FORM-001: should automatically compute formula property value", async () => {
    const recRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    const recordId = recRes.body.id;

    const valsRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);

    const commVal = valsRes.body.find((v: any) => v.propertyId === propNumber1Id);
    const feesVal = valsRes.body.find((v: any) => v.propertyId === propNumber2Id);

    await agent.patch(`/values/${commVal.id}`).set("Authorization", `Bearer ${accessToken}`).send({ value: 15 });

    await agent.patch(`/values/${feesVal.id}`).set("Authorization", `Bearer ${accessToken}`).send({ value: 5 });

    const updatedValsRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);

    const totalCostVal = updatedValsRes.body.find((v: any) => v.propertyId === propFormulaId);
    expect(totalCostVal.value).toBe(20);
  });

  it("TC-FORM-002: should automatically recalculate formula when a dependent field value changes", async () => {
    const records = await prisma.record.findMany({ where: { databaseId } });
    const recordId = records[0].id;

    const valsRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);

    const commVal = valsRes.body.find((v: any) => v.propertyId === propNumber1Id);

    await agent.patch(`/values/${commVal.id}`).set("Authorization", `Bearer ${accessToken}`).send({ value: 45 });

    const updatedValsRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);

    const totalCostVal = updatedValsRes.body.find((v: any) => v.propertyId === propFormulaId);
    expect(totalCostVal.value).toBe(50);
  });

  it("should successfully preview formula for a database", async () => {
    const res = await agent
      .post("/properties/preview-formula")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        config: {
          type: "CUSTOM",
          expression: "50 * 2",
          resultType: PropertyType.NUMBER,
        },
      });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.result).toBe(100);
    expect(res.body.isSample).toBe(false);
  });
});
