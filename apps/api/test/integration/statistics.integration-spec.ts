import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { PropertyType } from "@fixspace/domain";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_STATISTICS_MARKER = "integration-statistics-test";

describe("StatisticsOperations (integration)", () => {
  let app: INestApplication;
  let agentA: ReturnType<typeof supertest.agent>;
  let agentB: ReturnType<typeof supertest.agent>;
  let accessTokenA: string;
  let accessTokenB: string;
  let userIdA: string;
  let userIdB: string;
  let spaceIdA: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agentA = setup.agent;
    agentB = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);

    const emailA = uniqueEmail(`${INTEGRATION_STATISTICS_MARKER}-a`);
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

    const emailB = uniqueEmail(`${INTEGRATION_STATISTICS_MARKER}-b`);
    const usernameB = uniqueUsername();

    await agentB.post("/auth/register").send({ email: emailB, username: usernameB, password });
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: emailB } });
    userIdB = userB.id;
    await prisma.user.update({ where: { id: userIdB }, data: { isVerified: true } });

    const loginResB = await agentB.post("/auth/login").send({ email: emailB, password });
    accessTokenB = loginResB.body.accessToken;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_STATISTICS_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-STAT-014: should return 401 Unauthorized when requesting statistics without token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0]).get("/statistics/trading");
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("should return empty metrics if trading journal database is not created", async () => {
    await prisma.database.deleteMany({
      where: { space: { ownerId: userIdA }, type: "trading-journal" },
    });

    const res = await agentA.get("/statistics/trading").set("Authorization", `Bearer ${accessTokenA}`);
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.metrics.totalTrades).toBe(0);
    expect(res.body.equityCurve).toHaveLength(0);
    expect(res.body.breakdowns).toHaveLength(0);
  });

  it("TC-STAT-001 / TC-STAT-002 / TC-STAT-003 / TC-STAT-008 / TC-STAT-009: should calculate trading metrics and breakdowns correctly", async () => {
    const dbRes = await agentA.post("/databases").set("Authorization", `Bearer ${accessTokenA}`).send({
      spaceId: spaceIdA,
      name: "Trading Journal",
      type: "trading-journal",
    });
    expect(dbRes.status).toBe(HttpStatus.CREATED);
    const databaseId = dbRes.body.id;

    const dbDetails = await prisma.database.findUniqueOrThrow({
      where: { id: databaseId },
      include: { properties: true },
    });

    let exitDateProp = dbDetails.properties.find((p) => p.integrationKey === "exitDate");
    let netPnlProp = dbDetails.properties.find((p) => p.name === "Net P&L");
    let outcomeProp = dbDetails.properties.find((p) => p.integrationKey === "outcome");

    if (!exitDateProp) {
      const propRes = await agentA.post("/properties").set("Authorization", `Bearer ${accessTokenA}`).send({
        databaseId,
        name: "Exit Date",
        type: PropertyType.DATE,
        integrationKey: "exitDate",
        position: 1,
      });
      exitDateProp = propRes.body;
    }
    if (!netPnlProp) {
      const propRes = await agentA.post("/properties").set("Authorization", `Bearer ${accessTokenA}`).send({
        databaseId,
        name: "Net P&L",
        type: PropertyType.NUMBER,
        position: 2,
      });
      netPnlProp = propRes.body;
    }
    if (!outcomeProp) {
      const propRes = await agentA.post("/properties").set("Authorization", `Bearer ${accessTokenA}`).send({
        databaseId,
        name: "Outcome",
        type: PropertyType.SELECT,
        integrationKey: "outcome",
        position: 3,
      });
      outcomeProp = propRes.body;
    }

    const directionPropRes = await agentA.post("/properties").set("Authorization", `Bearer ${accessTokenA}`).send({
      databaseId,
      name: "Direction",
      type: PropertyType.SELECT,
      position: 4,
    });
    const directionProp = directionPropRes.body;

    const mockTrades = [
      { pnl: 200, outcome: "Win", dir: "Buy" },
      { pnl: 200, outcome: "Win", dir: "Buy" },
      { pnl: 200, outcome: "Win", dir: "Buy" },
      { pnl: 200, outcome: "Win", dir: "Buy" },
      { pnl: 200, outcome: "Win", dir: "Buy" },
      { pnl: -100, outcome: "Loss", dir: "Buy" },
      { pnl: 200, outcome: "Win", dir: "Sell" },
      { pnl: 200, outcome: "Win", dir: "Sell" },
      { pnl: -100, outcome: "Loss", dir: "Sell" },
      { pnl: -100, outcome: "Loss", dir: "Sell" },
    ];

    for (const t of mockTrades) {
      const recRes = await agentA.post("/records").set("Authorization", `Bearer ${accessTokenA}`).send({ databaseId });
      const recordId = recRes.body.id;

      const valsRes = await agentA.get("/values").query({ recordId }).set("Authorization", `Bearer ${accessTokenA}`);

      const exitDateVal = valsRes.body.find((v: any) => v.propertyId === exitDateProp!.id);
      const netPnlVal = valsRes.body.find((v: any) => v.propertyId === netPnlProp!.id);
      const outcomeVal = valsRes.body.find((v: any) => v.propertyId === outcomeProp!.id);
      const directionVal = valsRes.body.find((v: any) => v.propertyId === directionProp.id);

      await agentA
        .patch(`/values/${exitDateVal.id}`)
        .set("Authorization", `Bearer ${accessTokenA}`)
        .send({ value: new Date().toISOString() });

      await agentA.patch(`/values/${netPnlVal.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ value: t.pnl });

      await agentA.patch(`/values/${outcomeVal.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ value: t.outcome });

      await agentA.patch(`/values/${directionVal.id}`).set("Authorization", `Bearer ${accessTokenA}`).send({ value: t.dir });
    }

    const statsRes = await agentA.get("/statistics/trading").set("Authorization", `Bearer ${accessTokenA}`);
    expect(statsRes.status).toBe(HttpStatus.OK);

    const { metrics, equityCurve, breakdowns } = statsRes.body;
    expect(metrics.totalTrades).toBe(10);

    expect(metrics.winRate).toBe(0.7);

    expect(metrics.profitFactor).toBeCloseTo(4.67, 1);

    expect(metrics.totalPnl).toBe(1100);

    expect(equityCurve).toHaveLength(10);
    expect(equityCurve[equityCurve.length - 1].value).toBe(1100);

    const directionBreakdown = breakdowns.find((b: any) => b.propertyName === "Direction");
    expect(directionBreakdown).toBeDefined();

    const buyStats = directionBreakdown.items.find((i: any) => i.label === "Buy");
    expect(buyStats).toBeDefined();
    expect(buyStats.count).toBe(6);
    expect(buyStats.winRate).toBeCloseTo(0.833, 3);

    const sellStats = directionBreakdown.items.find((i: any) => i.label === "Sell");
    expect(sellStats).toBeDefined();
    expect(sellStats.count).toBe(4);
    expect(sellStats.winRate).toBe(0.5);
  });

  it("TC-STAT-015: User B should not see User A's statistics", async () => {
    await prisma.database.deleteMany({
      where: { space: { ownerId: userIdB }, type: "trading-journal" },
    });

    const res = await agentB.get("/statistics/trading").set("Authorization", `Bearer ${accessTokenB}`);
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.metrics.totalTrades).toBe(0);
  });
});
