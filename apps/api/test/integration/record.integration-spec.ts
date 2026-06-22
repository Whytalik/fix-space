import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { PropertyType } from "@fixspace/domain";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_RECORD_MARKER = "integration-record-test";

describe("RecordOperations (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let spaceId: string;
  let userId: string;
  let databaseId: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;

    const email = uniqueEmail(INTEGRATION_RECORD_MARKER);
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
      name: "Record Test DB",
      type: "notes",
    });
    databaseId = dbRes.body.id;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_RECORD_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-REC-032: should fail to request a protected endpoint without auth token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/records")
      .query({ databaseId });
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-REC-033: should fail to get a non-existent record", async () => {
    const res = await agent.get("/records/00000000-0000-0000-0000-000000000000").set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-REC-004: should create a default/empty record", async () => {
    const res = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
    });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("Untitled");
  });

  it("TC-REC-005: should fail to create a record in a non-existent database", async () => {
    const res = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId: "00000000-0000-0000-0000-000000000000",
    });

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-REC-001 / TC-REC-002 / TC-REC-003: should create record from template with tokens, values, and content structure", async () => {
    const templateRes = await agent
      .post("/templates")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        name: "Test Template",
        namePattern: "Trade {{today}} #{{count}}",
        content: {
          rows: [
            { id: "row1", type: "header", value: "Pre-session" },
            { id: "row2", type: "text", value: "Notes here" },
          ],
        },
      });
    expect(templateRes.status).toBe(HttpStatus.CREATED);
    const templateId = templateRes.body.id;

    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      templateId,
    });
    expect(recordRes.status).toBe(HttpStatus.CREATED);
    const recordId = recordRes.body.id;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    const expectedName = `Trade ${day}.${month}.${year} #2`;
    expect(recordRes.body.name).toBe(expectedName);

    const contentRes = await agent.get(`/records/${recordId}/content`).set("Authorization", `Bearer ${accessToken}`);
    expect(contentRes.status).toBe(HttpStatus.OK);
    expect(contentRes.body.content.rows).toBeDefined();
    expect(contentRes.body.content.rows[0].value).toBe("Pre-session");
  });

  it("TC-REC-006: should rename record name", async () => {
    const createRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    const recordId = createRes.body.id;

    const updateRes = await agent.patch(`/records/${recordId}`).set("Authorization", `Bearer ${accessToken}`).send({
      name: "New Record Name",
    });

    expect(updateRes.status).toBe(HttpStatus.OK);
    expect(updateRes.body.name).toBe("New Record Name");
  });

  it("TC-REC-007: should change record icon", async () => {
    const createRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    const recordId = createRes.body.id;

    const updateRes = await agent.patch(`/records/${recordId}`).set("Authorization", `Bearer ${accessToken}`).send({
      icon: "🔥",
    });

    expect(updateRes.status).toBe(HttpStatus.OK);
    expect(updateRes.body.icon).toBe("🔥");
  });

  it("TC-REC-008: should update value of a property on a record", async () => {
    const createRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    const recordId = createRes.body.id;

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Record Field TEXT",
      type: PropertyType.TEXT,
      position: 1,
    });
    const propId = propRes.body.id;

    const valuesRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);

    const valueEntry = valuesRes.body.find((v: any) => v.propertyId === propId);
    expect(valueEntry).toBeDefined();

    const valUpdateRes = await agent.patch(`/values/${valueEntry.id}`).set("Authorization", `Bearer ${accessToken}`).send({
      value: "Updated value",
    });

    expect(valUpdateRes.status).toBe(HttpStatus.OK);
    expect(valUpdateRes.body.value).toBe("Updated value");
  });

  it("TC-REC-009: should fail to validate value when saving wrong type", async () => {
    const createRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    const recordId = createRes.body.id;

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Record Field NUMBER",
      type: PropertyType.NUMBER,
      position: 2,
    });
    const propId = propRes.body.id;

    const valuesRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);

    const valueEntry = valuesRes.body.find((v: any) => v.propertyId === propId);

    const valUpdateRes = await agent.patch(`/values/${valueEntry.id}`).set("Authorization", `Bearer ${accessToken}`).send({
      value: "not-a-number",
    });

    expect(valUpdateRes.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("TC-REC-011: should delete record successfully", async () => {
    const createRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    const recordId = createRes.body.id;

    const delRes = await agent.delete(`/records/${recordId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(delRes.status).toBe(HttpStatus.OK);

    const findRes = await agent.get(`/records/${recordId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(findRes.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-REC-012: should leave relation field value when target record is deleted (broken relation)", async () => {
    const recARes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Record A" });
    const recBRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Record B" });
    const recAId = recARes.body.id;
    const recBId = recBRes.body.id;

    const propRes = await agent
      .post("/properties")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        name: "Relation field",
        type: PropertyType.RELATION,
        position: 3,
        config: { relatedEntityId: databaseId, multiple: false },
      });
    const propId = propRes.body.id;

    const valuesRes = await agent.get("/values").query({ recordId: recAId }).set("Authorization", `Bearer ${accessToken}`);
    const valueEntry = valuesRes.body.find((v: any) => v.propertyId === propId);

    await agent.patch(`/values/${valueEntry.id}`).set("Authorization", `Bearer ${accessToken}`).send({
      value: recBId,
    });

    await agent.delete(`/records/${recBId}`).set("Authorization", `Bearer ${accessToken}`);

    const recAValueRes = await agent.get(`/values/${valueEntry.id}`).set("Authorization", `Bearer ${accessToken}`);
    expect(recAValueRes.body.value).toBe(recBId);
  });

  it("TC-REC-014 / TC-REC-015: should duplicate record values but NOT content area", async () => {
    const createRes = await agent
      .post("/records")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ databaseId, name: "Source Record" });
    const recordId = createRes.body.id;

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Dup check field",
      type: PropertyType.TEXT,
      position: 4,
    });
    const propId = propRes.body.id;

    const valuesRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);
    const valueEntry = valuesRes.body.find((v: any) => v.propertyId === propId);

    await agent.patch(`/values/${valueEntry.id}`).set("Authorization", `Bearer ${accessToken}`).send({ value: "Duplicate me" });

    await agent
      .patch(`/records/${recordId}/content`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: {
          rows: [{ id: "r1", type: "text", value: "Secret code" }],
        },
      });

    const dupRes = await agent.post(`/records/${recordId}/duplicate`).set("Authorization", `Bearer ${accessToken}`);
    expect(dupRes.status).toBe(HttpStatus.CREATED);
    expect(dupRes.body.name).toBe("Source Record (Copy)");
    const copyId = dupRes.body.id;

    const copyValuesRes = await agent.get("/values").query({ recordId: copyId }).set("Authorization", `Bearer ${accessToken}`);
    const copyValEntry = copyValuesRes.body.find((v: any) => v.propertyId === propId);
    expect(copyValEntry.value).toBe("Duplicate me");

    const copyContentRes = await agent.get(`/records/${copyId}/content`).set("Authorization", `Bearer ${accessToken}`);
    expect(copyContentRes.body.content).toEqual({ rows: [] });
  });
});
