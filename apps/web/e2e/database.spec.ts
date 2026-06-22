import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Databases E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-db-${id}@example.com`,
      username: `dbuser${id}`,
      password: "Password123!",
    };

    const regRes = await request.post(`${API}/auth/register`, {
      data: testUser,
      headers: { "x-e2e-test": "true" },
    });
    if (!regRes.ok()) throw new Error(`Register failed: ${await regRes.text()}`);

    const verifyRes = await request.post(`${API}/auth/dev/verify-user`, {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });
    if (!verifyRes.ok()) throw new Error(`Verify failed: ${await verifyRes.text()}`);
  });

  test("TC-DB-022 / TC-DB-023: Custom Database Lifecycle UI flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const modalInput = page.locator(".animate-fade-up input.field-input");
    await expect(modalInput).toBeVisible();
    await modalInput.fill("Trading Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();

    const sectionHeader = page.getByRole("button", { name: "Trading Section" });
    await expect(sectionHeader).toBeVisible({ timeout: 10000 });

    await sectionHeader.click();

    const sectionRow = page.locator("div.group", { has: sectionHeader });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("Мій торговий щоденник");

    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();

    await page.waitForURL(/\/database\/[a-f0-9-]+\/edit$/, { timeout: 15000 });

    const dbItem = page.locator("aside").getByText("Мій торговий щоденник");
    await expect(dbItem).toBeVisible({ timeout: 10000 });

    await expect(page.locator("h1.type-page-title")).toHaveText("Мій торговий щоденник");

    const titleInput = page.locator('input[placeholder="e.g. Trading Journal"]');
    await expect(titleInput).toBeVisible();
    await titleInput.clear();
    await titleInput.fill("Оновлений щоденник");

    await page.locator("h1.type-page-title").click();

    await expect(page.locator("h1.type-page-title")).toHaveText("Оновлений щоденник", { timeout: 10000 });

    const updatedDbItem = page.locator("aside").getByText("Оновлений щоденник");
    await expect(updatedDbItem).toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: "load" });
    await expect(page.locator("h1.type-page-title")).toHaveText("Оновлений щоденник", { timeout: 10000 });
    await expect(page.locator("aside").getByText("Оновлений щоденник")).toBeVisible();
  });
});
