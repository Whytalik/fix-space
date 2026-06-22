import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Global Search E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-search-${id}@example.com`,
      username: `searchuser${id}`,
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

  test("TC-SEARCH-001 / TC-SEARCH-002 / TC-SEARCH-003 / TC-SEARCH-005 / TC-SEARCH-006 / TC-SEARCH-007: Search E2E UI Flow", async ({
    page,
  }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const sectionInput = page.locator(".animate-fade-up input.field-input");
    await expect(sectionInput).toBeVisible();
    await sectionInput.fill("Search E2E Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();
    await expect(page.getByRole("button", { name: "Search E2E Section" })).toBeVisible({ timeout: 10000 });

    const sectionRow = page.locator("div.group", { has: page.getByRole("button", { name: "Search E2E Section" }) });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("Recipes Database");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();
    await page.waitForURL(/\/database\/([a-f0-9-]+)\/edit$/, { timeout: 15000 });
    const dbId = page.url().match(/\/database\/([a-f0-9-]+)\/edit$/)?.[1];

    await page.locator("aside").getByText("Recipes Database").click();
    await page.waitForURL(new RegExp(`/database/${dbId}$`), { timeout: 10000 });

    const addRecordBtn = page
      .locator("button:has-text('Add Item'), button:has-text('Add record'), button:has-text('New record'), button:has-text('Додати запис')")
      .first();
    await expect(addRecordBtn).toBeVisible();
    await addRecordBtn.click();

    const firstCell = page.locator("td").first();
    await expect(firstCell).toBeVisible();
    await firstCell.dblclick();

    const cellInput = page.locator("td input, input.cell-editor-input, input.field-input").first();
    await expect(cellInput).toBeVisible();
    await cellInput.fill("Banana split recipe");
    await page.keyboard.press("Enter");

    await expect(page.locator("td", { hasText: "Banana split recipe" })).toBeVisible({ timeout: 10000 });

    await page.keyboard.press("Control+k");
    const modal = page.locator("div.fixed.inset-0.z-50");
    await expect(modal).toBeVisible({ timeout: 10000 });

    const searchInput = modal.locator("input");
    await expect(searchInput).toBeFocused();

    await searchInput.fill("B");
    await expect(modal.getByText(/At least 2 characters|Щонайменше 2 символи/i)).toBeVisible();

    await searchInput.fill("Banana");
    const groupHeader = modal.getByText(/Recipes Database/i);
    await expect(groupHeader).toBeVisible({ timeout: 10000 });

    const resultItem = modal.getByRole("button").filter({ hasText: "Banana split recipe" });
    await expect(resultItem).toBeVisible();

    await expect(resultItem.locator("mark")).toHaveText(/Banana/i);

    await resultItem.click();

    await expect(modal).not.toBeVisible();

    await expect(page).toHaveURL(new RegExp(`/database/${dbId}$`));
  });
});
