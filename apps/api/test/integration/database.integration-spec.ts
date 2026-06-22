import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_DATABASE_MARKER = "integration-database-test";

describe("DatabaseOperations (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let spaceId: string;
  let userId: string;

  beforeAll(async () => {
    ({ app, agent } = await setupIntegrationApp());

    const email = uniqueEmail(INTEGRATION_DATABASE_MARKER);
    const password = "Password123!";

    await agent.post("/auth/register").send({ email, username: uniqueUsername(), password });

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });

    const loginRes = await agent.post("/auth/login").send({ email, password });
    accessToken = loginRes.body.accessToken;

    const spacesRes = await agent.get("/spaces").set("Authorization", `Bearer ${accessToken}`);
    spaceId = spacesRes.body[0].id;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_DATABASE_MARKER);
  });

  it("TC-DB-026: should get list of databases in space", async () => {
    const res = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("TC-DB-027: should get a single database by ID", async () => {
    const dbsRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);
    const firstDb = dbsRes.body[0];
    expect(firstDb).toBeDefined();

    const res = await agent.get(`/databases/${firstDb.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.id).toBe(firstDb.id);
    expect(res.body).toHaveProperty("name");
  });

  it("TC-DB-003: should create a custom database", async () => {
    const res = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "My Custom DB",
      type: "notes",
    });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("My Custom DB");
    expect(res.body.isKey).toBe(false);
  });

  it("TC-DB-004: should fail to create a database with empty name", async () => {
    const res = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "",
      type: "notes",
    });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("TC-DB-005: should fail to create a duplicate database name in the same space", async () => {
    const res = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "My Custom DB",
      type: "notes",
    });

    expect(res.status).toBe(HttpStatus.CONFLICT);
  });

  it("TC-DB-006: should rename a database", async () => {
    const createRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "Old Name DB",
      type: "notes",
    });
    expect(createRes.status).toBe(HttpStatus.CREATED);
    const dbId = createRes.body.id;

    const res = await agent.patch(`/databases/${dbId}`).set("Authorization", `Bearer ${accessToken}`).send({
      name: "New Name DB",
    });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.name).toBe("New Name DB");
  });

  it("TC-DB-007: should fail to rename to a duplicate database name in the same space", async () => {
    const dbsRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);

    const dbToRename = dbsRes.body.find((db: any) => db.name === "New Name DB");
    expect(dbToRename).toBeDefined();

    const res = await agent.patch(`/databases/${dbToRename.id}`).set("Authorization", `Bearer ${accessToken}`).send({
      name: "My Custom DB",
    });

    expect(res.status).toBe(HttpStatus.CONFLICT);
  });

  it("TC-DB-011: should lock database structure and prevent modifying properties", async () => {
    const createRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "To Be Locked DB",
      type: "notes",
    });
    expect(createRes.status).toBe(HttpStatus.CREATED);
    const dbId = createRes.body.id;

    const lockRes = await agent.patch(`/databases/${dbId}`).set("Authorization", `Bearer ${accessToken}`).send({
      isLocked: true,
    });
    expect(lockRes.status).toBe(HttpStatus.OK);
    expect(lockRes.body.isLocked).toBe(true);

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId: dbId,
      name: "Extra Info",
      type: "TEXT",
      position: 1,
    });

    expect(propRes.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-DB-012: should allow inserting records in a locked database", async () => {
    const dbsRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);
    const lockedDb = dbsRes.body.find((db: any) => db.name === "To Be Locked DB");
    expect(lockedDb).toBeDefined();
    expect(lockedDb.isLocked).toBe(true);

    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId: lockedDb.id,
      name: "Test record in locked DB",
    });

    expect(recordRes.status).toBe(HttpStatus.CREATED);
  });

  it("TC-DB-013: should unlock database structure and allow property modifications", async () => {
    const dbsRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);
    const lockedDb = dbsRes.body.find((db: any) => db.name === "To Be Locked DB");
    expect(lockedDb).toBeDefined();

    const unlockRes = await agent.patch(`/databases/${lockedDb.id}`).set("Authorization", `Bearer ${accessToken}`).send({
      isLocked: false,
    });
    expect(unlockRes.status).toBe(HttpStatus.OK);
    expect(unlockRes.body.isLocked).toBe(false);

    const propRes = await agent.post("/properties").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId: lockedDb.id,
      name: "Unlocked Info",
      type: "TEXT",
      position: 1,
    });

    expect(propRes.status).toBe(HttpStatus.CREATED);
  });

  it("TC-DB-014 / TC-DB-015 / TC-DB-016: should duplicate a database with properties in the same section", async () => {
    const secRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [{ operation: "CREATE", create: { name: "Dup Section" } }],
      });
    const section = secRes.body.sections.find((s: any) => s.name === "Dup Section");
    expect(section).toBeDefined();

    const createDbRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      sectionId: section.id,
      name: "Original DB",
      type: "notes",
    });
    expect(createDbRes.status).toBe(HttpStatus.CREATED);
    const dbId = createDbRes.body.id;

    const dupRes = await agent.post(`/databases/${dbId}/duplicate`).set("Authorization", `Bearer ${accessToken}`).send({
      includeProperties: true,
      includeTemplates: true,
      includeRecords: false,
    });

    expect(dupRes.status).toBe(HttpStatus.CREATED);
    expect(dupRes.body.name).toContain("(Copy)");
    expect(dupRes.body.sectionId).toBe(section.id);
  });

  it("TC-DB-008: should delete a custom database", async () => {
    const createRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "To Be Deleted Custom DB",
      type: "notes",
    });
    const dbId = createRes.body.id;

    const res = await agent.delete(`/databases/${dbId}`).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(HttpStatus.OK);

    const getRes = await agent.get(`/databases/${dbId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(getRes.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-DB-009: should fail to delete a key preset database but allow deleting a non-key preset database", async () => {
    const dbsRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);

    const tradingJournal = dbsRes.body.find((db: any) => db.name === "Trading Journal");
    expect(tradingJournal).toBeDefined();
    expect(tradingJournal.isKey).toBe(true);

    const failDeleteRes = await agent.delete(`/databases/${tradingJournal.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(failDeleteRes.status).toBe(HttpStatus.BAD_REQUEST);

    const routineLibrary = dbsRes.body.find((db: any) => db.name === "Routine Library");
    expect(routineLibrary).toBeDefined();
    expect(routineLibrary.isKey).toBe(false);

    const successDeleteRes = await agent.delete(`/databases/${routineLibrary.id}`).set("Authorization", `Bearer ${accessToken}`);

    expect(successDeleteRes.status).toBe(HttpStatus.OK);
  });

  it("TC-DB-010: should fail to delete another user's database", async () => {
    const otherAgent = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);
    const otherEmail = uniqueEmail("other-user-db");
    const otherUsername = uniqueUsername();
    const password = "Password123!";

    await otherAgent.post("/auth/register").send({ email: otherEmail, username: otherUsername, password });
    const otherUser = await prisma.user.findUniqueOrThrow({ where: { email: otherEmail } });
    await prisma.user.update({ where: { id: otherUser.id }, data: { isVerified: true } });
    const otherLoginRes = await otherAgent.post("/auth/login").send({ email: otherEmail, password });
    const otherToken = otherLoginRes.body.accessToken;

    const createRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      name: "Secret User A DB",
      type: "notes",
    });
    const dbId = createRes.body.id;

    const res = await otherAgent.delete(`/databases/${dbId}`).set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-DB-024: should return 401 Unauthorized when requesting database actions without authorization header", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/databases")
      .query({ spaceId });

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-DB-025: should return 404 Not Found when trying to access a non-existent database ID", async () => {
    const nonExistentDbId = "a0a0a0a0-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    const res = await agent.get(`/databases/${nonExistentDbId}`).set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });
});
