import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Record Content E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };
  let dbId: string;

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-content-${id}@example.com`,
      username: `contentuser${id}`,
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

  test("TC-CONT-032 / TC-CONT-033: Record Content UI lifecycle", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const sectionInput = page.locator(".animate-fade-up input.field-input");
    await expect(sectionInput).toBeVisible();
    await sectionInput.fill("E2E Content Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();

    const sectionHeader = page.getByRole("button", { name: "E2E Content Section" });
    await expect(sectionHeader).toBeVisible({ timeout: 10000 });
    await sectionHeader.click();

    const sectionRow = page.locator("div.group", { has: sectionHeader });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("E2E Content DB");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();

    await page.waitForURL(/\/database\/([a-f0-9-]+)\/edit$/, { timeout: 15000 });
    const url = page.url();
    const match = url.match(/\/database\/([a-f0-9-]+)\/edit$/);
    dbId = match?.[1] ?? "";

    const dbSidebarItem = page.locator("aside").getByText("E2E Content DB");
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
    await cellInput.fill("EURUSD Trade");
    await page.keyboard.press("Enter");

    const recordRow = page.locator("tr", { hasText: "EURUSD Trade" });
    await recordRow.hover();
    const openBtn = recordRow
      .locator("button:has(svg.lucide-expand), button:has(svg.lucide-arrow-up-right), button:has-text('Open'), button:has-text('Відкрити')")
      .first();
    if (await openBtn.isVisible()) {
      await openBtn.click();
    } else {
      await page.locator("td", { hasText: "EURUSD Trade" }).click();
    }

    const contentArea = page
      .locator(
        ".record-content-area, .content-editor, div[contenteditable='true'], textarea[placeholder*='content'], textarea[placeholder*='контент']",
      )
      .first();
    await expect(contentArea).toBeVisible({ timeout: 15000 });

    await contentArea.click();
    await page.keyboard.type("Тестовий текстовий блок");
    await page.keyboard.press("Enter");

    await page.keyboard.type("/checklist");
    await page.keyboard.press("Enter");

    await page.keyboard.type("Checklist Item 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Checklist Item 2");
    await page.keyboard.press("Escape");

    const checkbox = page.locator("input[type='checkbox'], div[role='checkbox']").first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
    }

    await page.waitForTimeout(1000);

    await page.reload({ waitUntil: "load" });

    await page.locator("td", { hasText: "EURUSD Trade" }).click();

    await expect(page.locator("text=Тестовий текстовий блок")).toBeVisible({ timeout: 10000 });
  });
});
