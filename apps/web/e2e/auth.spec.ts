import { expect, test } from "@playwright/test";

test.describe("Authentication E2E", () => {
  let testUser: {
    email: string;
    username: string;
    password: string;
  };

  test.beforeEach(() => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `test-${id}@example.com`,
      username: `user-${id}`,
      password: "Password123!",
    };
  });

  test("full registration and login flow", async ({ page, request }) => {
    await page.goto("http://localhost:3001/en/register");
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/check your email|перевірте вашу пошту/i)).toBeVisible({ timeout: 15000 });

    const verifyRes = await request.post("http://localhost:3000/auth/dev/verify-user", {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });

    if (!verifyRes.ok()) {
      const text = await verifyRes.text();
      throw new Error(`Verification API failed (${verifyRes.status()}): ${text}`);
    }

    await page.goto("http://localhost:3001/en/login");
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /sign in|увійти/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/en$/);
  });

  test("negative registration: duplicate email", async ({ page, request }) => {
    await request.post("http://localhost:3000/auth/register", {
      data: testUser,
      headers: { "x-e2e-test": "true" },
    });
    await request.post("http://localhost:3000/auth/dev/verify-user", {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });

    await page.goto("http://localhost:3001/en/register");
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/username/i).fill(`${testUser.username}-new`);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.locator(".bg-error-bg")).toContainText(/exists|already|існує/i, { timeout: 10000 });
  });

  test("negative login: invalid password", async ({ page }) => {
    await page.goto("http://localhost:3001/en/login");
    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByLabel(/password/i).fill("WrongPassword123!");
    await page.getByRole("button", { name: /sign in|увійти/i }).click();

    await expect(page.locator(".bg-error-bg")).toContainText(/invalid|credentials|невірні|unauthorized/i);
  });

  test("session management: persistence and refresh", async ({ page, request }) => {
    await request.post("http://localhost:3000/auth/register", {
      data: testUser,
      headers: { "x-e2e-test": "true" },
    });
    await request.post("http://localhost:3000/auth/dev/verify-user", {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });

    await page.goto("http://localhost:3001/en/login");
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /sign in|увійти/i }).click();

    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await page.reload();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("aside")).toBeVisible();

    await page.getByRole("button", { name: testUser.username }).first().click();
    await page.getByRole("button", { name: /log out|вийти/i }).click();

    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test("email verification: error state and resend link", async ({ page, request }) => {
    await request.post("http://localhost:3000/auth/register", {
      data: testUser,
      headers: { "x-e2e-test": "true" },
    });

    await page.goto("http://localhost:3001/en/auth/verify?token=invalid-token-123");

    await expect(page.getByText(/failed|не вдалася/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /resend/i })).toBeVisible();

    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByRole("button", { name: /resend link|надіслати/i }).click();

    await expect(page.getByText(/sent|надіслано/i)).toBeVisible();
  });
});
