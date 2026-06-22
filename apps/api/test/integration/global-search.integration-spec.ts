import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_SEARCH_MARKER = "integration-search-test";

describe("GlobalSearchOperations (integration)", () => {
  let app: INestApplication;
  let agentA: ReturnType<typeof supertest.agent>;
  let agentB: ReturnType<typeof supertest.agent>;
  let accessTokenA: string;
  let accessTokenB: string;
  let userIdA: string;
  let spaceIdA: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agentA = setup.agent;
    agentB = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);

    const emailA = uniqueEmail(`${INTEGRATION_SEARCH_MARKER}-a`);
    const usernameA = uniqueUsername();
    const password = "Password123!";

    await agentA.post("/auth/register").send({ email: emailA, username: usernameA, password });
    const userA = await prisma.user.findUniqueOrThrow({ where: { email: emailA } });
    userIdA = userA.id;
    await prisma.user.update({ where: { id: userIdA }, data: { isVerified: true } });

    const loginResA = await agentA.post("/auth/login").send({ email: emailA, password });
    accessTokenA = loginResA.body.accessToken;

    const spacesResA = await agentA.get("/spaces").set("Authorization", `Bearer ${accessTokenA}`);
    spaceIdA = spacesResA.body[0].id;

    const emailB = uniqueEmail(`${INTEGRATION_SEARCH_MARKER}-b`);
    const usernameB = uniqueUsername();

    await agentB.post("/auth/register").send({ email: emailB, username: usernameB, password });
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: emailB } });
    await prisma.user.update({ where: { id: userB.id }, data: { isVerified: true } });

    const loginResB = await agentB.post("/auth/login").send({ email: emailB, password });
    accessTokenB = loginResB.body.accessToken;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_SEARCH_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-SEARCH-008: should return 401 Unauthorized when requesting search without token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/records/search")
      .query({ spaceId: spaceIdA, q: "test" });
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-SEARCH-009: should return 404 Not Found when attempting to search on another user's space", async () => {
    const res = await agentB.get("/records/search").set("Authorization", `Bearer ${accessTokenB}`).query({ spaceId: spaceIdA, q: "test" });
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-SEARCH-010: should return 404 Not Found when searching on a non-existent space", async () => {
    const res = await agentA
      .get("/records/search")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .query({ spaceId: "00000000-0000-0000-0000-000000000000", q: "test" });
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("should return matching records inside the space when searching with valid query", async () => {
    const dbRes = await agentA.post("/databases").set("Authorization", `Bearer ${accessTokenA}`).send({
      spaceId: spaceIdA,
      name: "Search DB",
      type: "notes",
    });
    expect(dbRes.status).toBe(HttpStatus.CREATED);
    const databaseId = dbRes.body.id;

    const rec1 = await agentA.post("/records").set("Authorization", `Bearer ${accessTokenA}`).send({ databaseId });
    await agentA.patch(`/records/${rec1.body.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ name: "Apple pie recipe" });

    const rec2 = await agentA.post("/records").set("Authorization", `Bearer ${accessTokenA}`).send({ databaseId });
    await agentA.patch(`/records/${rec2.body.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ name: "Banana split recipe" });

    const searchRes = await agentA
      .get("/records/search")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .query({ spaceId: spaceIdA, q: "Apple" });

    expect(searchRes.status).toBe(HttpStatus.OK);
    expect(searchRes.body).toHaveLength(1);
    expect(searchRes.body[0].name).toBe("Apple pie recipe");
  });
});
