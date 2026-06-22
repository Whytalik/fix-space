import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Properties E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };
  let dbId: string;

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-prop-${id}@example.com`,
      username: `propuser${id}`,
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

  test("TC-PROP-026 / TC-PROP-027 / TC-PROP-012 / TC-PROP-013: Properties UI flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const sectionInput = page.locator(".animate-fade-up input.field-input");
    await expect(sectionInput).toBeVisible();
    await sectionInput.fill("E2E Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();

    const sectionHeader = page.getByRole("button", { name: "E2E Section" });
    await expect(sectionHeader).toBeVisible({ timeout: 10000 });
    await sectionHeader.click();

    const sectionRow = page.locator("div.group", { has: sectionHeader });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("E2E Database");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();

    await page.waitForURL(/\/database\/([a-f0-9-]+)\/edit$/, { timeout: 15000 });
    const url = page.url();
    const match = url.match(/\/database\/([a-f0-9-]+)\/edit$/);
    dbId = match?.[1] ?? "";

    const dbSidebarItem = page.locator("aside").getByText("E2E Database");
    await expect(dbSidebarItem).toBeVisible();
    await dbSidebarItem.click();
    await page.waitForURL(new RegExp(`/database/${dbId}$`), { timeout: 10000 });

    const nameColumn = page.locator("th", { hasText: "Name" });
    await expect(nameColumn).toBeVisible();

    const addPropBtn = page.locator("button.add-property-column-btn, button:has(svg.lucide-plus), th button").first();
    await expect(addPropBtn).toBeVisible();
    await addPropBtn.click();

    const propNameInput = page
      .locator(".animate-fade-up input[placeholder*='Property name'], .animate-fade-up input.field-input, input[placeholder*='назва']")
      .first();
    await expect(propNameInput).toBeVisible();
    await propNameInput.fill("Об'єм угоди");

    const propTypeSelect = page.locator("select, button[role='combobox']").first();
    await propTypeSelect.click();
    await page.keyboard.press("n");
    await page.keyboard.press("Enter");

    const savePropBtn = page.locator("button:has-text('Save'), button:has-text('Create'), button:has-text('Зберегти')").first();
    if (await savePropBtn.isVisible()) {
      await savePropBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }

    const newCol = page.locator("th", { hasText: "Об'єм угоди" });
    await expect(newCol).toBeVisible({ timeout: 10000 });

    await page.goto(`${WEB}/en/database/${dbId}/edit`, { waitUntil: "load" });

    const propRow = page.locator("div.flex, tr", { hasText: "Об'єм угоди" });
    await expect(propRow).toBeVisible();

    const deleteBtn = propRow.locator("button:has(svg.lucide-trash), button:has-text('Delete'), button:has-text('Видалити')").first();
    await deleteBtn.click();

    const confirmBtn = page
      .locator(
        ".animate-fade-up button:has-text('Confirm'), .animate-fade-up button:has-text('Delete'), .animate-fade-up button:has-text('Видалити')",
      )
      .first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    await expect(propRow).not.toBeVisible({ timeout: 10000 });

    await page.goto(`${WEB}/en/database/${dbId}`, { waitUntil: "load" });
    await expect(page.locator("th", { hasText: "Об'єм угоди" })).not.toBeVisible();
  });
});
