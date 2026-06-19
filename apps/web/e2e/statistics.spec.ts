import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Statistics E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-stats-${id}@example.com`,
      username: `statsuser${id}`,
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

  test("TC-STAT-012 / TC-STAT-013 / TC-STAT-004 / TC-STAT-006: Statistics E2E UI Flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page
      .locator("aside")
      .getByRole("link", { name: /Statistics|Статистика/i })
      .click();
    await page.waitForURL(/\/en\/statistics$/, { timeout: 10000 });

    await expect(page.getByRole("heading", { name: /Statistics/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /Week|Тиждень/i }).click();
    await page.getByRole("button", { name: /Month|Місяць/i }).click();
    await page.getByRole("button", { name: /All|Всі/i }).click();

    const compareBtn = page.getByRole("button", { name: /Compare|Порівняти/i });
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

    await expect(compareBtn).toHaveClass(/bg-accent/);

    await compareBtn.click();
    await expect(compareBtn).not.toHaveClass(/bg-accent/);

    const customizeBtn = page.getByRole("button", { name: /Customize|Налаштувати/i });
    await expect(customizeBtn).toBeVisible();
    await customizeBtn.click();

    const modal = page.locator("div.fixed.inset-0.z-50");
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("heading", { name: /Customize|Налаштувати/i }).first()).toBeVisible();

    await modal
      .getByRole("button")
      .filter({ has: page.locator("svg") })
      .first()
      .click();
    await expect(modal).not.toBeVisible();
  });
});
