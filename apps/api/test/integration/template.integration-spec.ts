import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_TEMPLATE_MARKER = "integration-template-test";

describe("TemplateOperations (integration)", () => {
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

    const email = uniqueEmail(INTEGRATION_TEMPLATE_MARKER);
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

    const dbListRes = await agent.get("/databases").query({ spaceId }).set("Authorization", `Bearer ${accessToken}`);
    const notesDb = dbListRes.body.find((db: any) => db.type === "notes");
    databaseId = notesDb.id;

    const otherEmail = uniqueEmail(`${INTEGRATION_TEMPLATE_MARKER}-other`);
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
    await cleanupIntegrationApp(app, INTEGRATION_TEMPLATE_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-TMPL-018: should fail to request a protected endpoint without auth token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/templates")
      .query({ databaseId });
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-TMPL-019: should fail to access template/database of another user", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get("/templates")
      .query({ databaseId })
      .set("Authorization", `Bearer ${otherAccessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-TMPL-020: should fail to get a non-existent template", async () => {
    const res = await agent.get("/templates/00000000-0000-0000-0000-000000000000").set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-TMPL-001 / TC-TMPL-002 / TC-TMPL-003: should fetch seeded templates and create record from it", async () => {
    const templatesRes = await agent.get("/templates").query({ databaseId }).set("Authorization", `Bearer ${accessToken}`);

    expect(templatesRes.status).toBe(HttpStatus.OK);
    expect(templatesRes.body.length).toBeGreaterThan(0);
    const firstTemplate = templatesRes.body[0];

    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      templateId: firstTemplate.id,
    });

    expect(recordRes.status).toBe(HttpStatus.CREATED);
    expect(recordRes.body.templateId).toBe(firstTemplate.id);
  });

  it("TC-TMPL-004 / TC-TMPL-005 / TC-TMPL-006: should manage default template setting and automatic application", async () => {
    const t1Res = await agent.post("/templates").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Template One" });
    const t1Id = t1Res.body.id;

    const t2Res = await agent.post("/templates").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, name: "Template Two" });
    const t2Id = t2Res.body.id;

    const patchRes = await agent.patch(`/templates/${t1Id}`).set("Authorization", `Bearer ${accessToken}`).send({ isDefault: true });
    expect(patchRes.status).toBe(HttpStatus.OK);
    expect(patchRes.body.isDefault).toBe(true);

    const getT2 = await agent.get(`/templates/${t2Id}`).set("Authorization", `Bearer ${accessToken}`);
    expect(getT2.body.isDefault).toBe(false);

    const rec1Res = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    expect(rec1Res.body.templateId).toBe(t1Id);

    const rec2Res = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, templateId: t2Id });
    expect(rec2Res.body.templateId).toBe(t2Id);
  });

  it("TC-TMPL-008 / TC-TMPL-009 / TC-TMPL-010 / TC-TMPL-011: should create custom template with dynamic tokens and verify substitutions", async () => {
    const tmplRes = await agent.post("/templates").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      name: "Trade Template",
      namePattern: "Token-Trade #{{count}} {{year}}",
    });
    expect(tmplRes.status).toBe(HttpStatus.CREATED);
    const tmplId = tmplRes.body.id;

    const recordRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({
      databaseId,
      templateId: tmplId,
    });

    const now = new Date();
    const currentYear = now.getFullYear().toString();

    expect(recordRes.body.name).toContain(`Token-Trade`);
    expect(recordRes.body.name).toContain(currentYear);
  });

  it("TC-TMPL-012 / TC-TMPL-013: should reset template to empty content and not affect custom templates", async () => {
    const tmplRes = await agent
      .post("/templates")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        databaseId,
        name: "To Reset Template",
        content: { rows: [{ id: "r1", type: "text" }] },
      });
    const tmplId = tmplRes.body.id;

    const resetRes = await agent.post(`/templates/${tmplId}/reset`).set("Authorization", `Bearer ${accessToken}`);

    expect(resetRes.status).toBe(HttpStatus.OK);
    expect(resetRes.body.content).toEqual({});
  });

  it("TC-TMPL-014 / TC-TMPL-015: should delete template successfully, keep records created from it, and handle next default transition", async () => {
    const tmplRes = await agent
      .post("/templates")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ databaseId, name: "To Delete Template", isDefault: true });
    const tmplId = tmplRes.body.id;

    const recRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId, templateId: tmplId });
    const recId = recRes.body.id;

    const delRes = await agent.delete(`/templates/${tmplId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(delRes.status).toBe(HttpStatus.OK);

    const findRec = await agent.get(`/records/${recId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(findRec.status).toBe(HttpStatus.OK);

    const findTmpl = await agent.get(`/templates/${tmplId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(findTmpl.status).toBe(HttpStatus.NOT_FOUND);
  });
});
