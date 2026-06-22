import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_SECTION_MARKER = "integration-section-test";

describe("SectionOperations (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let spaceId: string;
  let userId: string;

  beforeAll(async () => {
    ({ app, agent } = await setupIntegrationApp());

    const email = uniqueEmail(INTEGRATION_SECTION_MARKER);
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
    await cleanupIntegrationApp(app, INTEGRATION_SECTION_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-SEC-001: should create a section", async () => {
    const res = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "CREATE",
            create: { name: "Trading", icon: "📊", color: "blue" },
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.OK);
    const sections = res.body.sections;
    const tradingSection = sections.find((s: any) => s.name === "Trading");
    expect(tradingSection).toBeDefined();
    expect(tradingSection.icon).toBe("📊");
    expect(tradingSection.color).toBe("blue");
  });

  it("TC-SEC-002: should fail to create a section with an empty name", async () => {
    const res = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "CREATE",
            create: { name: "" },
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("TC-SEC-003: should fail to create a duplicate section name in the same space", async () => {
    const res = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "CREATE",
            create: { name: "Trading" },
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.CONFLICT);
  });

  it("TC-SEC-004: should rename a section", async () => {
    const spaceRes = await agent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);
    const tradingSection = spaceRes.body.sections.find((s: any) => s.name === "Trading");
    expect(tradingSection).toBeDefined();

    const res = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "UPDATE",
            id: tradingSection.id,
            update: { name: "Active Trading" },
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.OK);
    const updatedSection = res.body.sections.find((s: any) => s.id === tradingSection.id);
    expect(updatedSection.name).toBe("Active Trading");
  });

  it("TC-SEC-005: should fail to rename a section to an empty name", async () => {
    const spaceRes = await agent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);
    const section = spaceRes.body.sections.find((s: any) => s.name === "Active Trading");
    expect(section).toBeDefined();

    const res = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "UPDATE",
            id: section.id,
            update: { name: "" },
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it("TC-SEC-006: should delete an empty section", async () => {
    const createRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "CREATE",
            create: { name: "To Be Deleted" },
          },
        ],
      });
    const sectionToDelete = createRes.body.sections.find((s: any) => s.name === "To Be Deleted");
    expect(sectionToDelete).toBeDefined();

    const deleteRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "DELETE",
            id: sectionToDelete.id,
          },
        ],
      });

    expect(deleteRes.status).toBe(HttpStatus.OK);
    const deletedSection = deleteRes.body.sections.find((s: any) => s.id === sectionToDelete.id);
    expect(deletedSection).toBeUndefined();
  });

  it("TC-SEC-007: should delete a section containing databases and set their sectionId to null", async () => {
    const createSecRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "CREATE",
            create: { name: "SecWithDb" },
          },
        ],
      });
    const section = createSecRes.body.sections.find((s: any) => s.name === "SecWithDb");
    expect(section).toBeDefined();

    const createDbRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      sectionId: section.id,
      name: "test-db-in-section",
      type: "trading-journal",
    });
    expect(createDbRes.status).toBe(HttpStatus.CREATED);
    const dbId = createDbRes.body.id;
    expect(createDbRes.body.sectionId).toBe(section.id);

    const deleteSecRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "DELETE",
            id: section.id,
          },
        ],
      });
    expect(deleteSecRes.status).toBe(HttpStatus.OK);

    const getDbRes = await agent.get(`/databases/${dbId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(getDbRes.status).toBe(HttpStatus.OK);
    expect(getDbRes.body.sectionId).toBeNull();
  });

  it("TC-SEC-008: should fail to delete another user's section", async () => {
    const otherAgent = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);
    const otherEmail = uniqueEmail("other-user-sec");
    const otherUsername = uniqueUsername();
    const password = "Password123!";

    await otherAgent.post("/auth/register").send({ email: otherEmail, username: otherUsername, password });
    const otherUser = await prisma.user.findUniqueOrThrow({ where: { email: otherEmail } });
    await prisma.user.update({ where: { id: otherUser.id }, data: { isVerified: true } });
    const otherLoginRes = await otherAgent.post("/auth/login").send({ email: otherEmail, password });
    const otherToken = otherLoginRes.body.accessToken;

    const spaceRes = await agent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);
    const section = spaceRes.body.sections.find((s: any) => s.name === "Active Trading");
    expect(section).toBeDefined();

    const res = await otherAgent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        sectionOperations: [
          {
            operation: "DELETE",
            id: section.id,
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-SEC-009: should reorder sections", async () => {
    const createRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          { operation: "CREATE", create: { name: "Sec A", position: 0 } },
          { operation: "CREATE", create: { name: "Sec B", position: 1 } },
          { operation: "CREATE", create: { name: "Sec C", position: 2 } },
        ],
      });
    expect(createRes.status).toBe(HttpStatus.OK);

    const spaceRes = await agent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);
    const secA = spaceRes.body.sections.find((s: any) => s.name === "Sec A");
    const secB = spaceRes.body.sections.find((s: any) => s.name === "Sec B");
    const secC = spaceRes.body.sections.find((s: any) => s.name === "Sec C");

    expect(secA).toBeDefined();
    expect(secB).toBeDefined();
    expect(secC).toBeDefined();

    const reorderRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          { operation: "UPDATE", id: secC.id, update: { position: 0 } },
          { operation: "UPDATE", id: secA.id, update: { position: 1 } },
          { operation: "UPDATE", id: secB.id, update: { position: 2 } },
        ],
      });
    expect(reorderRes.status).toBe(HttpStatus.OK);

    const orderedSections = reorderRes.body.sections.filter((s: any) => s.name === "Sec A" || s.name === "Sec B" || s.name === "Sec C");
    expect(orderedSections[0].name).toBe("Sec C");
    expect(orderedSections[1].name).toBe("Sec A");
    expect(orderedSections[2].name).toBe("Sec B");
  });

  it("TC-SEC-010: should persist reordered sections order", async () => {
    const spaceRes = await agent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);
    const orderedSections = spaceRes.body.sections.filter((s: any) => s.name === "Sec A" || s.name === "Sec B" || s.name === "Sec C");
    expect(orderedSections[0].name).toBe("Sec C");
    expect(orderedSections[1].name).toBe("Sec A");
    expect(orderedSections[2].name).toBe("Sec B");
  });

  it("TC-SEC-013: should move a database between sections", async () => {
    const createSecRes = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          { operation: "CREATE", create: { name: "Trading Sec" } },
          { operation: "CREATE", create: { name: "Analytics Sec" } },
        ],
      });
    expect(createSecRes.status).toBe(HttpStatus.OK);

    const tradingSec = createSecRes.body.sections.find((s: any) => s.name === "Trading Sec");
    const analyticsSec = createSecRes.body.sections.find((s: any) => s.name === "Analytics Sec");
    expect(tradingSec).toBeDefined();
    expect(analyticsSec).toBeDefined();

    const createDbRes = await agent.post("/databases").set("Authorization", `Bearer ${accessToken}`).send({
      spaceId,
      sectionId: tradingSec.id,
      name: "db-to-move",
      type: "trading-journal",
    });
    expect(createDbRes.status).toBe(HttpStatus.CREATED);
    const dbId = createDbRes.body.id;

    const updateDbRes = await agent.patch(`/databases/${dbId}`).set("Authorization", `Bearer ${accessToken}`).send({
      sectionId: analyticsSec.id,
    });
    expect(updateDbRes.status).toBe(HttpStatus.OK);
    expect(updateDbRes.body.sectionId).toBe(analyticsSec.id);
  });

  it("TC-SEC-014: should keep database details intact after moving between sections", async () => {
    const spaceRes = await agent.get(`/spaces/${spaceId}`).set("Authorization", `Bearer ${accessToken}`);
    const movedDb = spaceRes.body.databases.find((d: any) => d.name === "db-to-move");
    expect(movedDb).toBeDefined();

    const dbDetailsRes = await agent.get(`/databases/${movedDb.id}`).set("Authorization", `Bearer ${accessToken}`);
    expect(dbDetailsRes.status).toBe(HttpStatus.OK);
    expect(dbDetailsRes.body.name).toBe("db-to-move");
  });

  it("TC-SEC-017: should return 401 Unauthorized when requesting space updates without authorization header", async () => {
    const res = await supertest(process.env.INTEGRATION_SERVER_URL ?? (app.getHttpServer() as Parameters<typeof supertest>[0]))
      .patch(`/spaces/${spaceId}`)
      .send({
        sectionOperations: [
          {
            operation: "CREATE",
            create: { name: "Unauthorized" },
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-SEC-018: should return 404 Not Found when trying to update a section that does not exist", async () => {
    const nonExistentSectionId = "a0a0a0a0-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    const res = await agent
      .patch(`/spaces/${spaceId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        sectionOperations: [
          {
            operation: "UPDATE",
            id: nonExistentSectionId,
            update: { name: "Nonexistent" },
          },
        ],
      });

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });
});
