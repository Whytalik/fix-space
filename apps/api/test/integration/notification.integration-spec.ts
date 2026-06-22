import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HttpStatus, type INestApplication } from "@nestjs/common";
import supertest from "supertest";
import { cleanupIntegrationApp, setupIntegrationApp, getServer, uniqueEmail, uniqueUsername } from "../utils/integration-setup";

const INTEGRATION_NOTIFICATION_MARKER = "integration-notification-test";

describe("NotificationOperations (integration)", () => {
  let app: INestApplication;
  let agentA: ReturnType<typeof supertest.agent>;
  let agentB: ReturnType<typeof supertest.agent>;
  let accessTokenA: string;
  let accessTokenB: string;
  let userIdA: string;
  let notificationIdA: string;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agentA = setup.agent;
    agentB = supertest.agent(getServer(app) as Parameters<typeof supertest.agent>[0]);

    const emailA = uniqueEmail(`${INTEGRATION_NOTIFICATION_MARKER}-a`);
    const usernameA = uniqueUsername();
    const password = "Password123!";

    await agentA.post("/auth/register").send({ email: emailA, username: usernameA, password });
    const userA = await prisma.user.findUniqueOrThrow({ where: { email: emailA } });
    userIdA = userA.id;
    await prisma.user.update({ where: { id: userIdA }, data: { isVerified: true } });

    const loginResA = await agentA.post("/auth/login").send({ email: emailA, password });
    accessTokenA = loginResA.body.accessToken;

    const notifA = await prisma.notification.create({
      data: {
        userId: userIdA,
        type: "INFO",
        text: "User A System Notification",
        isRead: false,
      },
    });
    notificationIdA = notifA.id;

    const emailB = uniqueEmail(`${INTEGRATION_NOTIFICATION_MARKER}-b`);
    const usernameB = uniqueUsername();

    await agentB.post("/auth/register").send({ email: emailB, username: usernameB, password });
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: emailB } });
    await prisma.user.update({ where: { id: userB.id }, data: { isVerified: true } });

    const loginResB = await agentB.post("/auth/login").send({ email: emailB, password });
    accessTokenB = loginResB.body.accessToken;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_NOTIFICATION_MARKER);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("TC-NOTIF-012: should return 401 Unauthorized when requesting notifications list without token", async () => {
    const res = await supertest(getServer(app) as Parameters<typeof supertest>[0]).get("/notifications");
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it("TC-NOTIF-013: should return 404 Not Found when User B tries to mark User A's notification as read", async () => {
    const res = await agentB.patch(`/notifications/${notificationIdA}/read`).set("Authorization", `Bearer ${accessTokenB}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("TC-NOTIF-014: should return 404 Not Found when marking non-existent notification as read", async () => {
    const res = await agentA
      .patch("/notifications/00000000-0000-0000-0000-000000000000/read")
      .set("Authorization", `Bearer ${accessTokenA}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it("should successfully retrieve notifications for User A", async () => {
    const res = await agentA.get("/notifications").set("Authorization", `Bearer ${accessTokenA}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].text).toBe("User A System Notification");
  });

  it("should return unread count", async () => {
    const res = await agentA.get("/notifications/unread-count").set("Authorization", `Bearer ${accessTokenA}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.count).toBe(1);
  });

  it("should mark notification as read", async () => {
    const res = await agentA.patch(`/notifications/${notificationIdA}/read`).set("Authorization", `Bearer ${accessTokenA}`);

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.isRead).toBe(true);

    const countRes = await agentA.get("/notifications/unread-count").set("Authorization", `Bearer ${accessTokenA}`);
    expect(countRes.body.count).toBe(0);
  });

  it("should delete all notifications", async () => {
    const deleteRes = await agentA.delete("/notifications").set("Authorization", `Bearer ${accessTokenA}`);
    expect(deleteRes.status).toBe(HttpStatus.OK);

    const listRes = await agentA.get("/notifications").set("Authorization", `Bearer ${accessTokenA}`);
    expect(listRes.body).toHaveLength(0);
  });
});
