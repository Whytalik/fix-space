import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Automations E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-auto-${id}@example.com`,
      username: `autouser${id}`,
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

  test("TC-AUTO-014 / TC-AUTO-015 / TC-AUTO-001: Automations E2E UI Flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    const journalSidebarLink = page.locator("aside").getByText(/Trading Journal/i);
    await expect(journalSidebarLink).toBeVisible({ timeout: 10000 });
    await journalSidebarLink.click();
    await page.waitForURL(/\/database\/([a-f0-9-]+)$/, { timeout: 10000 });
    const dbId = page.url().match(/\/database\/([a-f0-9-]+)$/)?.[1];

    await page.goto(`${WEB}/en/database/${dbId}/edit?tab=automations`, { waitUntil: "load" });

    await expect(page.getByRole("button", { name: /New automation|Нова автоматизація/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /New automation|Нова автоматизація/i }).click();

    const modal = page.locator("div.fixed.inset-0.z-50");
    await expect(modal).toBeVisible();

    const nameInput = modal.locator("input[placeholder*='name'], input.field-input").first();
    await expect(nameInput).toBeVisible();
    await nameInput.fill("Auto Mark Win");

    const triggerSelect = modal.locator("select").first();
    await expect(triggerSelect).toBeVisible();
    await triggerSelect.selectOption("ON_FIELD_CHANGE");

    const addActionBtn = modal.getByRole("button", { name: /Add action|Додати дію/i });
    await expect(addActionBtn).toBeVisible();
    await addActionBtn.click();

    const actionSelect = modal.locator("select").last();
    await expect(actionSelect).toBeVisible();

    const saveBtn = modal.getByRole("button", { name: /Create|Створити|Save|Зберегти/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });

    const newAutomationItem = page.getByText("Auto Mark Win");
    await expect(newAutomationItem).toBeVisible({ timeout: 10000 });

    const automationRow = page.locator("div.border.border-stroke.rounded-xl", { has: newAutomationItem });
    const toggleButton = automationRow.locator("button.relative.w-9.h-5");
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();
    await expect(toggleButton).toHaveClass(/bg-stroke/);

    await toggleButton.click();
    await expect(toggleButton).toHaveClass(/bg-accent/);
  });
});
