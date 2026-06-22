import { expect, test, type Page } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Settings E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-settings-${id}@example.com`,
      username: `setuser${id}`,
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

  async function loginAndOpenSettings(page: Page) {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });
    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: testUser.username }).first().click();
    const dropdown = page.locator(".bg-elevated, [role='menu']").first();
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    await dropdown.getByRole("button", { name: /^Settings$|^Налаштування$/i }).click();

    const modal = page.locator("div.fixed.inset-0.z-50");
    await expect(modal).toBeVisible({ timeout: 5000 });
    return modal;
  }

  test("TC-SET-019 / TC-SET-020: should open and close settings modal", async ({ page }) => {
    const modal = await loginAndOpenSettings(page);

    await expect(modal).toBeVisible();

    await modal
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first()
      .click();
    await expect(modal).not.toBeVisible();
  });

  test("TC-SET-011: should switch between light and dark theme", async ({ page }) => {
    const modal = await loginAndOpenSettings(page);

    await modal
      .locator("nav")
      .getByRole("button", { name: /Appearance|Зовнішній вигляд/i })
      .click();

    await modal.getByRole("button", { name: /Dark|Темна/i }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await modal.getByRole("button", { name: /Light|Світла/i }).click();
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("TC-SET-012: should switch language and update UI", async ({ page }) => {
    const modal = await loginAndOpenSettings(page);

    await modal
      .locator("nav")
      .getByRole("button", { name: /Appearance|Зовнішній вигляд/i })
      .click();

    await modal.getByRole("button", { name: /🇺🇦 Українська/i }).click();
    await page.waitForURL(/\/uk/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/uk/);
    await expect(modal.locator("h1").first()).toContainText(/Зовнішній вигляд/i);

    await modal.getByRole("button", { name: /🇺🇸 English/i }).click();
    await page.waitForURL(/\/en/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/en/);
    await expect(modal.locator("h1").first()).toContainText(/Appearance/i);
  });

  test("TC-SET-013: should update profile username and persist after reload", async ({ page }) => {
    const modal = await loginAndOpenSettings(page);

    await modal
      .locator("nav")
      .getByRole("button", { name: /Profile|Профіль/i })
      .click();

    const usernameInput = modal.locator("input#username");
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill("Updated Profile Name");

    await modal.getByRole("button", { name: /Save changes|Зберегти зміни/i }).click();
    await expect(modal.getByText(/Profile updated successfully|Профіль успішно оновлено/i)).toBeVisible({ timeout: 10000 });

    await modal
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first()
      .click();
    await expect(modal).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Updated Profile Name" }).first()).toBeVisible({ timeout: 10000 });

    await page.reload({ waitUntil: "load" });
    await expect(page.getByRole("button", { name: "Updated Profile Name" }).first()).toBeVisible({ timeout: 15000 });
  });

  test("TC-SET-017: should persist date/time settings across sessions", async ({ page }) => {
    await loginAndOpenSettings(page);

    const modal = page.locator("div.fixed.inset-0.z-50");

    await modal
      .locator("nav")
      .getByRole("button", { name: /Profile|Профіль/i })
      .click();
    await modal.getByRole("button", { name: /Date & Time|Дата та час/i }).click();

    const dateFormatSelect = modal.locator("select");
    await expect(dateFormatSelect).toBeVisible();
    await dateFormatSelect.selectOption("DD/MM/YYYY");

    await modal.getByRole("button", { name: /Save changes|Зберегти зміни/i }).click();
    await expect(modal.getByText(/Profile updated successfully|Профіль успішно оновлено/i)).toBeVisible({ timeout: 10000 });

    await modal.getByRole("button", { name: /Security|Безпека/i }).click();
    await expect(modal.getByRole("heading", { name: /Active sessions|Активні сесії/i })).toBeVisible();
    const currentSessionLabel = modal.getByText(/Current|Поточна/i);
    await expect(currentSessionLabel).toBeVisible({ timeout: 10000 });
  });
});
