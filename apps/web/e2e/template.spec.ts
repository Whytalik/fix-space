import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Templates E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-tmpl-${id}@example.com`,
      username: `tmpluser${id}`,
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

  test("TC-TMPL-016 / TC-TMPL-017: Template UI flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const sectionInput = page.locator(".animate-fade-up input.field-input");
    await expect(sectionInput).toBeVisible();
    await sectionInput.fill("E2E Templates Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();

    const sectionHeader = page.getByRole("button", { name: "E2E Templates Section" });
    await expect(sectionHeader).toBeVisible({ timeout: 10000 });
    await sectionHeader.click();

    const sectionRow = page.locator("div.group", { has: sectionHeader });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("E2E Templates DB");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();

    await page.waitForURL(/\/database\/([a-f0-9-]+)\/edit$/, { timeout: 15000 });

    await page.getByRole("button", { name: "Templates", exact: true }).click();

    const addTmplBtn = page
      .locator("button:has-text('Add template'), button:has-text('New template'), button:has-text('Додати шаблон')")
      .first();
    await expect(addTmplBtn).toBeVisible();
    await addTmplBtn.click();

    const tmplNameInput = page.locator(".animate-fade-up input.field-input");
    await expect(tmplNameInput).toBeVisible();
    await tmplNameInput.fill("Мій кастомний шаблон");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /Create|Створити|Save|Зберегти|Add|Додати/i })
      .first()
      .click();

    const tmplRow = page.locator("div.flex, tr", { hasText: "Мій кастомний шаблон" });
    await expect(tmplRow).toBeVisible({ timeout: 10000 });

    const deleteBtn = tmplRow.locator("button:has(svg.lucide-trash), button:has-text('Delete'), button:has-text('Видалити')").first();
    await deleteBtn.click();

    const confirmBtn = page
      .locator(
        ".animate-fade-up button:has-text('Confirm'), .animate-fade-up button:has-text('Delete'), .animate-fade-up button:has-text('Видалити')",
      )
      .first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    await expect(tmplRow).not.toBeVisible({ timeout: 10000 });
  });
});
