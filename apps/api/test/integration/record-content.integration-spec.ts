import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_RECORD_CONTENT_MARKER = "integration-rec-content-test";

describe("RecordContentOperations (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;
  let accessToken: string;
  let spaceId: string;
  let userId: string;
  let databaseId: string;
  let recordId: string;

  let otherAccessToken: string;
  let otherUserId: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;

    const email = uniqueEmail(INTEGRATION_RECORD_CONTENT_MARKER);
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
      name: "Content DB",
      type: "notes",
    });
    databaseId = dbRes.body.id;

    const recRes = await agent.post("/records").set("Authorization", `Bearer ${accessToken}`).send({ databaseId });
    recordId = recRes.body.id;

    const otherEmail = uniqueEmail(`${INTEGRATION_RECORD_CONTENT_MARKER}-other`);
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
    await cleanupIntegrationApp(app, INTEGRATION_RECORD_CONTENT_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-CONT-034: should fail to request a protected endpoint without auth token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0]).get(`/records/${recordId}/content`);
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-CONT-035: should fail to access record content of another user", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0])
      .get(`/records/${recordId}/content`)
      .set("Authorization", `Bearer ${otherAccessToken}`);
    expect(res.status).toBe(HttpStatus.FORBIDDEN);
  });

  it("TC-CONT-036: should fail to access content of a non-existent record", async () => {
    const res = await agent.get("/records/00000000-0000-0000-0000-000000000000/content").set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-CONT-001 / TC-CONT-004 / TC-CONT-005 / TC-CONT-008 / TC-CONT-009 / TC-CONT-020 / TC-CONT-021 / TC-CONT-025: should update and retrieve record content successfully with all block types", async () => {
    const contentPayload = {
      rows: [
        {
          id: "row-1",
          columns: [
            {
              id: "col-1",
              width: 0.5,
              children: [
                {
                  id: "heading-1",
                  type: "HEADING",
                  data: { level: 2, text: "My Custom Heading" },
                },
                {
                  id: "text-1",
                  type: "TEXT",
                  data: { text: "Some rich text: **bold**, *italic*", formatted: true },
                },
              ],
            },
            {
              id: "col-2",
              width: 0.5,
              children: [
                {
                  id: "checklist-1",
                  type: "CHECKLIST",
                  data: {
                    items: [
                      { id: "item-1", text: "Point A", checked: true },
                      { id: "item-2", text: "Point B", checked: false },
                    ],
                  },
                },
                {
                  id: "div-1",
                  type: "DIVIDER",
                  data: {},
                },
                {
                  id: "callout-1",
                  type: "CALLOUT",
                  data: { icon: "info", title: "Information Callout", color: "blue" },
                },
                {
                  id: "linked-view-1",
                  type: "LINKED_DATABASE",
                  data: { databaseId, filters: [{ propertyId: "name", operator: "contains", value: "EURUSD" }] },
                },
                {
                  id: "calc-1",
                  type: "TABLE",
                  data: { rows: [{ cells: ["Position Calculator Snapshot"] }] },
                },
              ],
            },
          ],
        },
      ],
    };

    const patchRes = await agent.patch(`/records/${recordId}/content`).set("Authorization", `Bearer ${accessToken}`).send({
      content: contentPayload,
    });

    expect(patchRes.status).toBe(HttpStatus.OK);
    expect(patchRes.body.content.rows.length).toBe(1);
    expect(patchRes.body.content.rows[0].columns.length).toBe(2);

    const getRes = await agent.get(`/records/${recordId}/content`).set("Authorization", `Bearer ${accessToken}`);

    expect(getRes.status).toBe(HttpStatus.OK);
    expect(getRes.body.content.rows[0].columns[0].children[0].type).toBe("HEADING");
    expect(getRes.body.content.rows[0].columns[0].children[1].data.text).toContain("rich text");
  });

  it("TC-CONT-019: should validate uploaded image mimetypes", async () => {
    const bmpBuffer = Buffer.from("BM...");
    const disallowedRes = await agent
      .post(`/records/${recordId}/content/images`)
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("image", bmpBuffer, { filename: "test.bmp", contentType: "image/bmp" });

    expect(disallowedRes.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
