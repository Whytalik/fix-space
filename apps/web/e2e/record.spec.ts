import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Records E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };
  let dbId: string;

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-rec-${id}@example.com`,
      username: `recuser${id}`,
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

  test("TC-REC-029 / TC-REC-030 / TC-REC-031: Records UI lifecycle", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const sectionInput = page.locator(".animate-fade-up input.field-input");
    await expect(sectionInput).toBeVisible();
    await sectionInput.fill("E2E Records Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();

    const sectionHeader = page.getByRole("button", { name: "E2E Records Section" });
    await expect(sectionHeader).toBeVisible({ timeout: 10000 });
    await sectionHeader.click();

    const sectionRow = page.locator("div.group", { has: sectionHeader });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("E2E Records DB");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();

    await page.waitForURL(/\/database\/([a-f0-9-]+)\/edit$/, { timeout: 15000 });
    const url = page.url();
    const match = url.match(/\/database\/([a-f0-9-]+)\/edit$/);
    dbId = match?.[1] ?? "";

    const dbSidebarItem = page.locator("aside").getByText("E2E Records DB");
    await expect(dbSidebarItem).toBeVisible();
    await dbSidebarItem.click();
    await page.waitForURL(new RegExp(`/database/${dbId}$`), { timeout: 10000 });

    const addRecordBtn = page
      .locator("button:has-text('Add Item'), button:has-text('Add record'), button:has-text('New record'), button:has-text('Додати запис')")
      .first();
    await expect(addRecordBtn).toBeVisible();
    await addRecordBtn.click();

    await page.waitForTimeout(500);
    const firstCell = page.locator("td").first();
    await expect(firstCell).toBeVisible();
    await firstCell.dblclick();

    const cellInput = page.locator("td input, input.cell-editor-input, input.field-input").first();
    await expect(cellInput).toBeVisible();
    await cellInput.fill("Купівля EURUSD");
    await page.keyboard.press("Enter");

    await expect(page.locator("td", { hasText: "Купівля EURUSD" })).toBeVisible({ timeout: 10000 });

    await addRecordBtn.click();
    const secondCell = page.locator("td").nth(2);
    await secondCell.dblclick();
    const secondCellInput = page.locator("td input, input.cell-editor-input, input.field-input").first();
    await expect(secondCellInput).toBeVisible();
    await secondCellInput.fill("Продаж GBPUSD");
    await page.keyboard.press("Enter");
    await expect(page.locator("td", { hasText: "Продаж GBPUSD" })).toBeVisible({ timeout: 10000 });

    const filterBtn = page.locator("button:has-text('Filter'), button:has-text('Фільтр')").first();
    await filterBtn.click();

    const addConditionBtn = page.locator("button:has-text('Add filter'), button:has-text('Додати фільтр')").first();
    await addConditionBtn.click();

    const filterInput = page.locator("input[placeholder*='Value'], input[placeholder*='Значення']").first();
    await filterInput.fill("Купівля");
    await page.keyboard.press("Enter");

    await expect(page.locator("td", { hasText: "Купівля EURUSD" })).toBeVisible();
    await expect(page.locator("td", { hasText: "Продаж GBPUSD" })).not.toBeVisible();

    const clearFilterBtn = page.locator("button:has-text('Clear'), button:has-text('Очистити')").first();
    await clearFilterBtn.click();

    await expect(page.locator("td", { hasText: "Купівля EURUSD" })).toBeVisible();
    await expect(page.locator("td", { hasText: "Продаж GBPUSD" })).toBeVisible();

    const recordRow = page.locator("tr", { hasText: "Продаж GBPUSD" });
    await recordRow.hover();

    const moreBtn = recordRow
      .locator("button:has(svg.lucide-more-horizontal), button:has(svg.lucide-more-vertical), button.more-options-btn")
      .first();
    await moreBtn.click();

    const deleteMenuBtn = page.locator(".bg-elevated button:has-text('Delete'), .bg-elevated button:has-text('Видалити')").first();
    await deleteMenuBtn.click();

    const confirmBtn = page
      .locator(
        ".animate-fade-up button:has-text('Confirm'), .animate-fade-up button:has-text('Delete'), .animate-fade-up button:has-text('Видалити')",
      )
      .first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    await expect(recordRow).not.toBeVisible({ timeout: 10000 });
  });
});
