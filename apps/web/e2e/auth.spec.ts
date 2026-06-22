import { expect, test } from "@playwright/test";

test.describe("Authentication E2E", () => {
  let testUser: {
    email: string;
    username: string;
    password: string;
  };

  test.beforeAll(async ({ request }) => {
    for (let i = 0; i < 60; i++) {
      try {
        const res = await request.get("http://127.0.0.1:3000/health");
        if (res.ok()) return;
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error("API did not become ready within 60s");
  });

  test.beforeEach(({ page }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `test-${id}@example.com`,
      username: `user-${id}`,
      password: "Password123!",
    };

    page.on("console", (message) => {
      if (message.type() === "error") console.log(`BROWSER ERROR: ${message.text()}`);
    });
  });

  test("full registration and login flow", async ({ page, request }) => {
    await page.goto("/en/register", { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/check your email|перевірте вашу пошту/i)).toBeVisible({ timeout: 20000 });

    const verifyRes = await request.post("http://127.0.0.1:3000/auth/dev/verify-user", {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });

    if (!verifyRes.ok()) {
      const text = await verifyRes.text();
      throw new Error(`Verification API failed (${verifyRes.status()}): ${text}`);
    }

    await page.goto("/en/login", { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();

    await page.waitForURL(/\/en$/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/en$/);
  });

  test("negative registration: duplicate email", async ({ page, request }) => {
    await request.post("http://127.0.0.1:3000/auth/register", {
      data: testUser,
      headers: { "x-e2e-test": "true" },
    });
    await request.post("http://127.0.0.1:3000/auth/dev/verify-user", {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });

    await page.goto("/en/register", { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/username/i).fill(`${testUser.username}-new`);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.locator(".bg-error-bg")).toContainText(/exists|already|існує/i, { timeout: 10000 });
  });

  test("negative login: invalid password", async ({ page }) => {
    await page.goto("/en/login", { waitUntil: "load" });
    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByLabel(/password/i).fill("WrongPassword123!");
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();

    await expect(page.locator(".bg-error-bg")).toContainText(/invalid|credentials|невірні|unauthorized/i, { timeout: 10000 });
  });

  test("session management: persistence and refresh", async ({ page, request }) => {
    await request.post("http://127.0.0.1:3000/auth/register", {
      data: testUser,
      headers: { "x-e2e-test": "true" },
    });
    await request.post("http://127.0.0.1:3000/auth/dev/verify-user", {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });

    await page.goto("/en/login", { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();

    await page.waitForURL(/\/en$/, { timeout: 15000 });

    await page.reload({ waitUntil: "load" });
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("aside, nav, [role='navigation']").first()).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: testUser.username }).first().click();
    await page.getByRole("button", { name: /log out|вийти/i }).click();

    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test("email verification: error state and resend link", async ({ page, request }) => {
    await request.post("http://127.0.0.1:3000/auth/register", {
      data: testUser,
      headers: { "x-e2e-test": "true" },
    });

    await page.goto("/en/auth/verify?token=invalid-token-123", { waitUntil: "load" });

    await expect(page.getByText(/failed|не вдалася/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("heading", { name: /resend/i })).toBeVisible();

    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByRole("button", { name: /resend link|надіслати/i }).click();

    await expect(page.getByText(/sent|надіслано/i)).toBeVisible({ timeout: 10000 });
  });
});
