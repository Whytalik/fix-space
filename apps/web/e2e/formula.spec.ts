import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Formulas E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-formula-${id}@example.com`,
      username: `formuser${id}`,
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

  test("TC-FORM-011 / TC-FORM-003: Formula E2E UI Flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    const journalSidebarLink = page.locator("aside").getByText(/Trading Journal/i);
    await expect(journalSidebarLink).toBeVisible({ timeout: 10000 });
    await journalSidebarLink.click();

    await page.waitForURL(/\/database\/[a-f0-9-]+$/, { timeout: 10000 });

    const netPnlCell = page.locator("td").getByText("-24.98").first();
    await expect(netPnlCell).toBeVisible({ timeout: 10000 });

    await netPnlCell.dblclick();

    const cellInput = netPnlCell.locator("input");
    await expect(cellInput).not.toBeVisible();

    const feesCell = page.locator("td").getByText("25").first();
    await expect(feesCell).toBeVisible();

    await feesCell.dblclick();

    const feesInput = page.locator("td input, input.cell-editor-input, input.field-input").first();
    await expect(feesInput).toBeVisible();

    await feesInput.fill("10");
    await page.keyboard.press("Enter");

    await expect(page.locator("td").getByText("10").first()).toBeVisible({ timeout: 10000 });

    const updatedNetPnlCell = page.locator("td").getByText("-9.98").first();
    await expect(updatedNetPnlCell).toBeVisible({ timeout: 10000 });
  });
});
