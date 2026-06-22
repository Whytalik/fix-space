import { prisma } from "@fixspace/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import supertest from "supertest";
import {
  cleanupIntegrationApp,
  clearSharedMailCalls,
  getServer,
  getSharedMailCalls,
  setupIntegrationApp,
  uniqueEmail,
  uniqueUsername,
} from "../utils/integration-setup";

const INTEGRATION_AUTH_MARKER = "integration-auth-test";

describe("AuthController (integration)", () => {
  let app: INestApplication;
  let agent: ReturnType<typeof supertest.agent>;

  beforeAll(async () => {
    const setup = await setupIntegrationApp();
    app = setup.app;
    agent = setup.agent;
  });

  afterAll(async () => {
    await cleanupIntegrationApp(app, INTEGRATION_AUTH_MARKER);
  });

  beforeEach(async () => {
    await clearSharedMailCalls();
  });

  async function registerAndVerify(email: string, username: string, password: string): Promise<void> {
    await agent.post("/auth/register").send({ email, username, password });
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
  }

  function extractRefreshCookie(setCookieHeader: string | string[]): string {
    if (!setCookieHeader) return "";
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const entry = cookies.find((c) => c && typeof c === "string" && c.startsWith("refresh_token="));
    return entry ? entry.split(";")[0]! : "";
  }

  describe("POST /auth/register", () => {
    it("should return 201 with success message on valid input", async () => {
      const res = await agent
        .post("/auth/register")
        .send({ email: uniqueEmail(INTEGRATION_AUTH_MARKER), username: uniqueUsername(), password: "Password123!" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 409 if email is already taken", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await agent.post("/auth/register").send({ email, username: uniqueUsername(), password: "Password123!" });

      const res = await agent.post("/auth/register").send({ email, username: uniqueUsername(), password: "Password123!" });

      expect(res.status).toBe(409);
    });

    it("should return 409 if username is already taken", async () => {
      const username = uniqueUsername();
      await agent.post("/auth/register").send({ email: uniqueEmail(INTEGRATION_AUTH_MARKER), username, password: "Password123!" });

      const res = await agent
        .post("/auth/register")
        .send({ email: uniqueEmail(INTEGRATION_AUTH_MARKER), username, password: "Password123!" });

      expect(res.status).toBe(409);
    });

    it("should return 400 if email is invalid", async () => {
      const res = await agent.post("/auth/register").send({ email: "not-an-email", username: uniqueUsername(), password: "Password123!" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if password is too weak", async () => {
      const res = await agent
        .post("/auth/register")
        .send({ email: uniqueEmail(INTEGRATION_AUTH_MARKER), username: uniqueUsername(), password: "weak" });

      expect(res.status).toBe(400);
    });

    it("should call mailService.sendVerificationEmail once on success", async () => {
      await agent
        .post("/auth/register")
        .send({ email: uniqueEmail(INTEGRATION_AUTH_MARKER), username: uniqueUsername(), password: "Password123!" });

      const calls = await getSharedMailCalls("sendVerificationEmail");
      expect(calls).toHaveLength(1);
    });
  });

  describe("POST /auth/verify", () => {
    it("should return 200 with a valid token", async () => {
      await agent
        .post("/auth/register")
        .send({ email: uniqueEmail(INTEGRATION_AUTH_MARKER), username: uniqueUsername(), password: "Password123!" });

      const verifyCalls = await getSharedMailCalls("sendVerificationEmail");
      const rawToken = verifyCalls[0]?.args[2] as string;

      const res = await agent.post("/auth/verify").send({ token: rawToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 400 if token is invalid", async () => {
      const res = await agent.post("/auth/verify").send({ token: "completely-invalid-token" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should return 200 with accessToken in body and set refresh_token cookie", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(email, uniqueUsername(), "Password123!");

      const res = await agent.post("/auth/login").send({ email, password: "Password123!" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies.some((c) => c.startsWith("refresh_token="))).toBe(true);
    });

    it("should return 401 if user does not exist", async () => {
      const res = await agent.post("/auth/login").send({ email: "ghost@nowhere.example.com", password: "Password123!" });

      expect(res.status).toBe(401);
    });

    it("should return 401 if password is incorrect", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(email, uniqueUsername(), "Password123!");

      const res = await agent.post("/auth/login").send({ email, password: "WrongPassword1!" });

      expect(res.status).toBe(401);
    });

    it("should return 401 if email is not verified", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await agent.post("/auth/register").send({ email, username: uniqueUsername(), password: "Password123!" });

      const res = await agent.post("/auth/login").send({ email, password: "Password123!" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should return 200 with new accessToken when cookie is valid", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(email, uniqueUsername(), "Password123!");

      const loginRes = await agent.post("/auth/login").send({ email, password: "Password123!" });
      const refreshCookie = extractRefreshCookie(loginRes.headers["set-cookie"] as unknown as string[]);

      const res = await agent.post("/auth/refresh").set("Cookie", refreshCookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
    });

    it("should return 401 if no refresh_token cookie is provided", async () => {
      const res = await supertest(getServer(app) as Parameters<typeof supertest>[0]).post("/auth/refresh");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("should return 200 with valid JWT and clear auth cookies", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(email, uniqueUsername(), "Password123!");

      const loginRes = await agent.post("/auth/login").send({ email, password: "Password123!" });
      const accessToken = loginRes.body.accessToken as string;
      const refreshCookie = extractRefreshCookie(loginRes.headers["set-cookie"] as unknown as string[]);

      const res = await agent.post("/auth/logout").set("Authorization", `Bearer ${accessToken}`).set("Cookie", refreshCookie);

      expect(res.status).toBe(200);
    });

    it("should return 401 without Authorization header", async () => {
      const res = await agent.post("/auth/logout");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should return 200 when user exists", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(email, uniqueUsername(), "Password123!");

      const res = await agent.post("/auth/forgot-password").send({ email });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 200 even when user does not exist (security)", async () => {
      const res = await agent.post("/auth/forgot-password").send({ email: "nobody@nowhere.example.com" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should call sendPasswordResetEmail only when user exists", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(email, uniqueUsername(), "Password123!");

      await agent.post("/auth/forgot-password").send({ email });
      const callsBefore = await getSharedMailCalls("sendPasswordResetEmail");
      expect(callsBefore).toHaveLength(1);

      await clearSharedMailCalls();

      await agent.post("/auth/forgot-password").send({ email: "nobody2@nowhere.example.com" });
      const callsAfter = await getSharedMailCalls("sendPasswordResetEmail");
      expect(callsAfter).toHaveLength(0);
    });
  });

  describe("POST /auth/reset-password", () => {
    let sharedEmail: string;
    let sharedToken: string;

    beforeAll(async () => {
      sharedEmail = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(sharedEmail, uniqueUsername(), "Password123!");
      await clearSharedMailCalls();
      await agent.post("/auth/forgot-password").send({ email: sharedEmail });
      const resetCalls = await getSharedMailCalls("sendPasswordResetEmail");
      sharedToken = resetCalls[0]?.args[1] as string;
    });

    it("should reset password successfully with valid token", async () => {
      const res = await agent.post("/auth/reset-password").send({ token: sharedToken, newPassword: "NewPassword456!" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });

    it("should allow login with new password after reset", async () => {
      const loginRes = await agent.post("/auth/login").send({ email: sharedEmail, password: "NewPassword456!" });
      expect(loginRes.status).toBe(200);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await agent.post("/auth/reset-password").send({ token: "invalid-reset-token", newPassword: "NewPassword456!" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if new password is too weak", async () => {
      const email = uniqueEmail(INTEGRATION_AUTH_MARKER);
      await registerAndVerify(email, uniqueUsername(), "Password123!");

      await clearSharedMailCalls();
      await agent.post("/auth/forgot-password").send({ email });
      const weakPassCalls = await getSharedMailCalls("sendPasswordResetEmail");
      const token = weakPassCalls[0]?.args[1] as string;

      const res = await agent.post("/auth/reset-password").send({ token, newPassword: "weak" });

      expect(res.status).toBe(400);
    });
  });
});
