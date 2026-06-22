import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { PropertyType } from "@fixspace/domain";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_PROPERTY_MARKER = "integration-property-test";

describe("PropertyOperations (integration)", () => {
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

    const email = uniqueEmail(INTEGRATION_PROPERTY_MARKER);
    const username = uniqueUsername();
    const password = "Password123!";

    await agent.post("/auth/register").send({ email, username, password });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });

    const loginRes = await agent.post("/auth/login").send({ email, password });
    accessToken = loginRes.body.accessToken;

    const spacesRes = await agent.get("/spaces").set("Authorization", `Bearer ${accessToken}`);
    spaceId = spacesRes.body[0]?.id;

    const dbRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "Property Test DB",
      type: "notes",
    });
    databaseId = dbRes.body.id;

    const otherEmail = uniqueEmail(`${INTEGRATION_PROPERTY_MARKER}-other`);
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
    await cleanupIntegrationApp(app, INTEGRATION_PROPERTY_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-PROP-028: should fail to request a protected endpoint without auth token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/properties")
      .query({ databaseId });
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-PROP-029: should fail to access property/database of another user", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/properties")
      .query({ databaseId })
      .set("Authorization", `Bearer ${otherAccessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-PROP-030: should fail to get a non-existent property", async () => {
    const res = await agent.get("/properties/00000000-0000-0000-0000-000000000000").set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-PROP-001: should create a TEXT property", async () => {
    const res = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Notes field",
      type: PropertyType.TEXT,
      position: 1,
    });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("Notes field");
    expect(res.body.type).toBe(PropertyType.TEXT);
  });

  it("TC-PROP-002: should create a NUMBER property", async () => {
    const res = await agent
      .post("/properties")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        name: "Price field",
        type: PropertyType.NUMBER,
        position: 2,
        config: { format: "currency", decimalPlaces: 2 },
      });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("Price field");
    expect(res.body.type).toBe(PropertyType.NUMBER);
    expect(res.body.config.format).toBe("currency");
    expect(res.body.config.decimalPlaces).toBe(2);
  });

  it("TC-PROP-003: should fail to create a property with a duplicate name", async () => {
    const res = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Price field",
      type: PropertyType.TEXT,
      position: 3,
    });

    expect(res.status).toBe(HttpStatus.CONFLICT);
  });

  it("TC-PROP-004: should edit property name", async () => {
    const createRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Old Name field",
      type: PropertyType.TEXT,
      position: 4,
    });
    const propId = createRes.body.id;

    const res = await agent.patch(`/properties/${propId}`).set("Authorization", `Bearer ${accessToken}`).send({
      name: "New Name field",
    });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.name).toBe("New Name field");
  });

  it("TC-PROP-005: should edit property type parameters (config)", async () => {
    const createRes = await agent
      .post("/properties")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        name: "Decimals field",
        type: PropertyType.NUMBER,
        position: 5,
        config: { decimalPlaces: 2 },
      });
    const propId = createRes.body.id;

    const res = await agent
      .patch(`/properties/${propId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        type: PropertyType.NUMBER,
        config: { decimalPlaces: 4 },
      });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.config.decimalPlaces).toBe(4);
  });

  it("TC-PROP-006: should fail to change type of a protected/system property", async () => {
    const getRes = await agent.get("/properties").query({ databaseId }).set("Authorization", `Bearer ${accessToken}`);

    const nameProp = getRes.body.find((p: any) => p.name === "Name");
    expect(nameProp).toBeDefined();

    const res = await agent.patch(`/properties/${nameProp.id}`).set("Authorization", `Bearer ${accessToken}`).send({
      type: PropertyType.NUMBER,
    });

    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-PROP-008: should fail to delete a protected/system property", async () => {
    const getRes = await agent.get("/properties").query({ databaseId }).set("Authorization", `Bearer ${accessToken}`);

    const nameProp = getRes.body.find((p: any) => p.name === "Name");

    const res = await agent.delete(`/properties/${nameProp.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-PROP-007 / TC-PROP-009: should delete a custom property and succeed", async () => {
    const createRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Temp field",
      type: PropertyType.TEXT,
      position: 6,
    });
    const propId = createRes.body.id;

    const deleteRes = await agent.delete(`/properties/${propId}`).set("Authorization", `Bearer ${accessToken}`);

    expect(deleteRes.status).toBe(HttpStatus.OK);

    const getRes = await agent.get(`/properties/${propId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(getRes.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-PROP-010 / TC-PROP-011: should change property position and preserve it", async () => {
    const createRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Positioned field",
      type: PropertyType.TEXT,
      position: 10,
    });
    const propId = createRes.body.id;

    const patchRes = await agent.patch(`/properties/${propId}`).set("Authorization", `Bearer ${accessToken}`).send({
      position: 0,
    });
    expect(patchRes.status).toBe(HttpStatus.OK);
    expect(patchRes.body.position).toBe(0);

    const getRes = await agent.get(`/properties/${propId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(getRes.body.position).toBe(0);
  });

  it("TC-PROP-014: should validate property value types when saving", async () => {
    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "My Record",
    });
    const recordId = recordRes.body.id;

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Strict Number",
      type: PropertyType.NUMBER,
      position: 15,
    });
    const propId = propRes.body.id;

    const valRes = await agent.post("/values").set("Authorization", `Bearer ${accessToken}`).send({
      recordId,
      propertyId: propId,
      value: "not-a-number",
    });

    expect(valRes.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("TC-PROP-015: should perform compatible conversion on type change", async () => {
    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Record for Compatible conversion",
    });
    const recordId = recordRes.body.id;

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Convertible field",
      type: PropertyType.TEXT,
      position: 20,
    });
    const propId = propRes.body.id;

    await agent.post("/values").set("Authorization", `Bearer ${accessToken}`).send({
      recordId,
      propertyId: propId,
      value: "123",
    });

    const patchRes = await agent.patch(`/properties/${propId}`).set("Authorization", `Bearer ${accessToken}`).send({
      type: PropertyType.NUMBER,
    });
    expect(patchRes.status).toBe(HttpStatus.OK);

    const valuesRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);
    const propValue = valuesRes.body.find((v: any) => v.propertyId === propId);
    expect(propValue.value).toBe(123);
  });

  it("TC-PROP-016: should perform default fallback conversion on incompatible type change", async () => {
    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Record for Incompatible conversion",
    });
    const recordId = recordRes.body.id;

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Inconvertible field",
      type: PropertyType.TEXT,
      position: 25,
    });
    const propId = propRes.body.id;

    await agent.post("/values").set("Authorization", `Bearer ${accessToken}`).send({
      recordId,
      propertyId: propId,
      value: "hello",
    });

    const patchRes = await agent.patch(`/properties/${propId}`).set("Authorization", `Bearer ${accessToken}`).send({
      type: PropertyType.NUMBER,
    });
    expect(patchRes.status).toBe(HttpStatus.OK);

    const valuesRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);
    const propValue = valuesRes.body.find((v: any) => v.propertyId === propId);
    expect(propValue.value).toBe(0);
  });

  it("TC-PROP-017: should fail to change type of system/protected property", async () => {
    const getRes = await agent.get("/properties").query({ databaseId }).set("Authorization", `Bearer ${accessToken}`);

    const nameProp = getRes.body.find((p: any) => p.name === "Name");

    const patchRes = await agent.patch(`/properties/${nameProp.id}`).set("Authorization", `Bearer ${accessToken}`).send({
      type: PropertyType.SELECT,
    });

    expect(patchRes.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-PROP-020 / TC-PROP-021: should duplicate property with copy prefix and not copy record values", async () => {
    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Record for Duplication",
    });
    const recordId = recordRes.body.id;

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Duplicatable field",
      type: PropertyType.TEXT,
      position: 30,
    });
    const propId = propRes.body.id;

    await agent.post("/values").set("Authorization", `Bearer ${accessToken}`).send({
      recordId,
      propertyId: propId,
      value: "Test Data",
    });

    const dupRes = await agent.post(`/properties/${propId}/duplicate`).set("Authorization", `Bearer ${accessToken}`);
    expect(dupRes.status).toBe(HttpStatus.CREATED);
    expect(dupRes.body.name).toBe("Duplicatable field (copy)");
    const dupPropId = dupRes.body.id;

    const valuesRes = await agent.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessToken}`);

    const dupValue = valuesRes.body.find((v: any) => v.propertyId === dupPropId);
    expect(dupValue.value).toBeNull();
  });

  it("TC-PROP-022 / TC-PROP-023: should create property group and set visibility configuration", async () => {
    const groupRes = await agent
      .post("/property-groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        name: "Financials",
        position: 1,
        visibility: { type: "Demo" },
      });

    expect(groupRes.status).toBe(HttpStatus.CREATED);
    expect(groupRes.body.name).toBe("Financials");
    expect(groupRes.body.visibility).toEqual({ type: "Demo" });
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_PROPERTY_MARKER);
  });
});
