import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { IntegrationService } from "@fixspace/domain";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";
import { IntegrationConnectionService } from "../../src/modules/integration-connection/integration-connection.service";

const INTEGRATION_TEST_MARKER = "integration-connection-test";

describe("IntegrationConnectionOperations (integration)", () => {
  let app: INestApplication;
  let agent: supertest.Agent;
  let accessTokenA: string;
  let accessTokenB: string;
  let userIdA: string;
  let spaceIdA: string;
  let connectionIdA: string;
  let originalServerUrl: string | undefined;

  beforeAll(async () => {
    originalServerUrl = process.env.INTEGRATION_SERVER_URL;
    delete process.env.INTEGRATION_SERVER_URL;

    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;

    const connectionService = app.get(IntegrationConnectionService);
    jest.spyOn(connectionService as any, "deployAsync").mockResolvedValue(undefined);
    jest.spyOn(connectionService, "triggerSync").mockResolvedValue({ trades: [], errors: [] });

    const emailA = uniqueEmail(`${INTEGRATION_TEST_MARKER}-a`);
    const usernameA = uniqueUsername();
    const password = "Password123!";

    await agent.post("/auth/register").send({ email: emailA, username: usernameA, password });
    const userA = await prisma.user.findUniqueOrThrow({ where: { email: emailA } });
    userIdA = userA.id;
    await prisma.user.update({ where: { id: userIdA }, data: { isVerified: true } });

    const loginResA = await agent.post("/auth/login").send({ email: emailA, password });
    accessTokenA = loginResA.body.accessToken;

    await prisma.space.create({
      data: {
        ownerId: userIdA,
        name: "Space A",
        isDefault: true,
      },
    });
    const spaceA = await prisma.space.findFirstOrThrow({ where: { ownerId: userIdA } });
    spaceIdA = spaceA.id;

    const emailB = uniqueEmail(`${INTEGRATION_TEST_MARKER}-b`);
    const usernameB = uniqueUsername();

    await agent.post("/auth/register").send({ email: emailB, username: usernameB, password });
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: emailB } });
    await prisma.user.update({ where: { id: userB.id }, data: { isVerified: true } });

    const loginResB = await agent.post("/auth/login").send({ email: emailB, password });
    accessTokenB = loginResB.body.accessToken;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_TEST_MARKER);
    if (originalServerUrl !== undefined) {
      process.env.INTEGRATION_SERVER_URL = originalServerUrl;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-INT-017: should return 401 Unauthorized when requesting connection list without token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0]).get("/integration-connections");
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-INT-019: should return 404 Not Found when requesting non-existent connection", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/integration-connections/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${accessTokenA}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-INT-007: should successfully connect MetaTrader 5", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .post("/integration-connections")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .send({
        spaceId: spaceIdA,
        service: IntegrationService.METATRADER5,
        name: "My MT5 Account",
        credentials: {
          service: IntegrationService.METATRADER5,
          login: "123456",
          password: "password123",
          server: "MetaQuotes-Demo",
        },
      });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("My MT5 Account");
    expect(res.body.service).toBe(IntegrationService.METATRADER5);
    expect(res.body.id).toBeDefined();
    connectionIdA = res.body.id;
  });

  it("TC-INT-001: should successfully connect Binance", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .post("/integration-connections")
      .set("Authorization", `Bearer ${accessTokenA}`)
      .send({
        spaceId: spaceIdA,
        service: IntegrationService.BINANCE,
        name: "My Binance Account",
        credentials: {
          service: IntegrationService.BINANCE,
          apiKey: "testApiKey",
          apiSecret: "testApiSecret",
        },
      });

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.name).toBe("My Binance Account");
    expect(res.body.service).toBe(IntegrationService.BINANCE);
  });

  it("TC-INT-014: should return list of connections with status", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/integration-connections")
      .set("Authorization", `Bearer ${accessTokenA}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    const metaTrader5Connection = res.body.find((c: any) => c.service === IntegrationService.METATRADER5);
    expect(metaTrader5Connection).toBeDefined();
    expect(metaTrader5Connection.status).toBeDefined();
  });

  it("TC-INT-018: should return 403 Forbidden or 404 Not Found when User B tries to access User A's connection", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get(`/integration-connections/${connectionIdA}`)
      .set("Authorization", `Bearer ${accessTokenB}`);

    expect([HttpStatus.FORBIDDEN, HttpStatus.NOT_FOUND]).toContain(res.status);
  });

  it("TC-INT-012: should successfully update/reconnect integration credentials", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .patch(`/integration-connections/${connectionIdA}`)
      .set("Authorization", `Bearer ${accessTokenA}`)
      .send({
        name: "Updated MT5 Account Name",
        credentials: {
          service: IntegrationService.METATRADER5,
          login: "654321",
          password: "newpassword123",
          server: "MetaQuotes-Demo-2",
        },
      });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.name).toBe("Updated MT5 Account Name");
  });

  it("should successfully trigger a sync", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .post(`/integration-connections/${connectionIdA}/sync`)
      .set("Authorization", `Bearer ${accessTokenA}`)
      .send({});

    expect(res.status).toBe(HttpStatus.OK);
  });

  it("TC-INT-013: should successfully delete integration connection", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .delete(`/integration-connections/${connectionIdA}`)
      .set("Authorization", `Bearer ${accessTokenA}`);

    expect(res.status).toBe(HttpStatus.NO_CONTENT);

    const checkRes = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get(`/integration-connections/${connectionIdA}`)
      .set("Authorization", `Bearer ${accessTokenA}`);
    expect(checkRes.status).toBe(HttpStatus.NOT_FOUND);
  });
});
