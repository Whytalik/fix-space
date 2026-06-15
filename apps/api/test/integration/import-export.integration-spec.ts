import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_IMPORT_EXPORT_MARKER = "integration-import-export-test";

describe("ImportExportOperations (integration)", () => {
  let app: INestApplication;
  let agentA: ReturnType<typeof supertest.agent>;
  let agentB: ReturnType<typeof supertest.agent>;
  let accessTokenA: string;
  let accessTokenB: string;
  let userIdA: string;
  let databaseIdA: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agentA = setup.agent;
    agentB = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);

    const emailA = uniqueEmail(`${INTEGRATION_IMPORT_EXPORT_MARKER}-a`);
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
      name: "Import Export DB",
      type: "notes",
    });
    expect(dbRes.status).toBe(HttpStatus.CREATED);
    databaseIdA = dbRes.body.id;

    const emailB = uniqueEmail(`${INTEGRATION_IMPORT_EXPORT_MARKER}-b`);
    const usernameB = uniqueUsername();

    await agentB.post("/auth/register").send({ email: emailB, username: usernameB, password });
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: emailB } });
    await prisma.user.update({ where: { id: userB.id }, data: { isVerified: true } });

    const loginResB = await agentB.post("/auth/login").send({ email: emailB, password });
    accessTokenB = loginResB.body.accessToken;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_IMPORT_EXPORT_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-IMP-013: should return 401 Unauthorized when requesting preview without token", async () => {
    const csvBuffer = Buffer.from("Name,Age\nAlice,30\nBob,25");
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .post("/import-export/preview")
      .attach("file", csvBuffer, { filename: "test.csv", contentType: "text/csv" })
      .field("databaseId", databaseIdA);

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-IMP-014: should return 404 Not Found when trying to preview using another user's database", async () => {
    const csvBuffer = Buffer.from("Name,Age\nAlice,30\nBob,25");
    const res = await agentB
      .post("/import-export/preview")
      .set("Authorization", `Bearer ${accessTokenB}`)
      .attach("file", csvBuffer, { filename: "test.csv", contentType: "text/csv" })
      .field("databaseId", databaseIdA);

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-IMP-015: should return 404 Not Found when previewing on a non-existent database", async () => {
    const csvBuffer = Buffer.from("Name,Age\nAlice,30\nBob,25");
    const res = await agentA
      .post("/import-export/preview")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .attach("file", csvBuffer, { filename: "test.csv", contentType: "text/csv" })
      .field("databaseId", "00000000-0000-0000-0000-000000000000");

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-IMP-001 / TC-IMP-002: should preview and parse valid UTF-8 CSV file", async () => {
    const csvBuffer = Buffer.from("Назва,Оцінка\nЯблуко,10\nБанан,8", "utf8");
    const res = await agentA
      .post("/import-export/preview")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .attach("file", csvBuffer, { filename: "test.csv", contentType: "text/csv" })
      .field("databaseId", databaseIdA);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.columns).toEqual(["Назва", "Оцінка"]);
    expect(res.body.totalRows).toBe(2);
    expect(res.body.previewRows[0]["Назва"]).toBe("Яблуко");
  });

  it("TC-IMP-005: should validate and import CSV records ignoring unmapped columns", async () => {
    const csvBuffer = Buffer.from("Назва,Незіставлена\nЯблуко,так\nБанан,ні", "utf8");
    const mapping = JSON.stringify({
      Назва: "__name__",
    });

    const valRes = await agentA
      .post("/import-export/validate")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .attach("file", csvBuffer, { filename: "test.csv", contentType: "text/csv" })
      .field("databaseId", databaseIdA)
      .field("mapping", mapping);

    expect(valRes.status).toBe(HttpStatus.OK);
    expect(valRes.body.validRows).toBe(2);
    expect(valRes.body.skippedRows).toHaveLength(0);

    const impRes = await agentA
      .post("/import-export/import")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .attach("file", csvBuffer, { filename: "test.csv", contentType: "text/csv" })
      .field("databaseId", databaseIdA)
      .field("mapping", mapping);

    expect(impRes.status).toBe(HttpStatus.OK);
    expect(impRes.body.imported).toBe(2);

    const records = await prisma.record.findMany({
      where: { databaseId: databaseIdA },
    });
    expect(records).toHaveLength(2);
    const names = records.map((r) => r.name);
    expect(names).toContain("Яблуко");
    expect(names).toContain("Банан");
  });

  it("TC-IMP-006: should export database records as a CSV file containing correct properties", async () => {
    const exportRes = await agentA
      .get("/import-export/export")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .query({ databaseId: databaseIdA });

    expect(exportRes.status).toBe(HttpStatus.OK);
    expect(exportRes.headers["content-type"]).toContain("text/csv");
    expect(exportRes.text).toContain("Name");
    expect(exportRes.text).toContain("Яблуко");
    expect(exportRes.text).toContain("Банан");
  });
});
