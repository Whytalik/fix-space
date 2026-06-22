import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Views E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };
  let dbId: string;

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-view-${id}@example.com`,
      username: `viewuser${id}`,
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

  test("TC-VIEW-029 / TC-VIEW-030: Views E2E UI Flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const sectionInput = page.locator(".animate-fade-up input.field-input");
    await expect(sectionInput).toBeVisible();
    await sectionInput.fill("E2E Views Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();

    const sectionHeader = page.getByRole("button", { name: "E2E Views Section" });
    await expect(sectionHeader).toBeVisible({ timeout: 10000 });
    await sectionHeader.click();

    const sectionRow = page.locator("div.group", { has: sectionHeader });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("E2E Views DB");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();

    await page.waitForURL(/\/database\/([a-f0-9-]+)\/edit$/, { timeout: 15000 });
    const url = page.url();
    const match = url.match(/\/database\/([a-f0-9-]+)\/edit$/);
    dbId = match?.[1] ?? "";

    const dbSidebarItem = page.locator("aside").getByText("E2E Views DB");
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
    await expect(firstCell).toBeVisible({ timeout: 5000 });
    await firstCell.dblclick();
    const cellInput = page.locator("td input, input.cell-editor-input, input.field-input").first();
    await cellInput.fill("Apple Trade");
    await page.keyboard.press("Enter");

    await addRecordBtn.click();
    const secondCell = page.locator("td").nth(2);
    await secondCell.dblclick();
    const secondCellInput = page.locator("td input, input.cell-editor-input, input.field-input").first();
    await secondCellInput.fill("Banana Trade");
    await page.keyboard.press("Enter");

    const addViewBtn = page.locator("button:has-text('Add view'), button:has(svg.lucide-plus), button:has-text('+')").first();
    await addViewBtn.click();

    const viewNameInput = page.locator(".animate-fade-up input.field-input, input[placeholder*='View name']").first();
    await expect(viewNameInput).toBeVisible();
    await viewNameInput.fill("Канбан");

    const boardOption = page.locator("button:has-text('Board'), button:has-text('Канбан'), select option[value='board']").first();
    await boardOption.click();

    const saveViewBtn = page.locator(".animate-fade-up button:has-text('Create'), .animate-fade-up button:has-text('Створити')").first();
    await saveViewBtn.click();

    const kanbanBoard = page.locator(".kanban-board, .board-view, div:has-text('No Status')").first();
    await expect(kanbanBoard).toBeVisible({ timeout: 10000 });

    await addViewBtn.click();
    await viewNameInput.fill("Галерея");
    const galleryOption = page.locator("button:has-text('Gallery'), button:has-text('Галерея'), select option[value='gallery']").first();
    await galleryOption.click();
    await saveViewBtn.click();

    const galleryGrid = page.locator(".gallery-view, .gallery-grid").first();
    await expect(galleryGrid).toBeVisible({ timeout: 10000 });

    const tableViewTab = page.locator("button:has-text('Table'), button:has-text('Таблиця')").first();
    await tableViewTab.click();
    await expect(page.locator("table, .table-view")).toBeVisible({ timeout: 10000 });

    const sortBtn = page.locator("button:has-text('Sort'), button:has-text('Сортування')").first();
    await sortBtn.click();

    const addSortBtn = page.locator("button:has-text('Add sort'), button:has-text('Додати сортування')").first();
    await addSortBtn.click();

    const sortFieldSelect = page.locator("select.sort-field-select").first();
    if (await sortFieldSelect.isVisible()) {
      await sortFieldSelect.selectOption("name");
    }

    const sortDirSelect = page.locator("select.sort-direction-select").first();
    if (await sortDirSelect.isVisible()) {
      await sortDirSelect.selectOption("desc");
    }

    await page.keyboard.press("Enter");

    const firstRowText = await page.locator("td").first().innerText();
    expect(firstRowText).toContain("Banana Trade");
  });
});
