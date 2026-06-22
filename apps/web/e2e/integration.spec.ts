import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Integrations E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-int-${id}@example.com`,
      username: `intuser${id}`,
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

  test("TC-INT-015 / TC-INT-016: Integration Management UI Flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: testUser.username }).first().click();
    await page
      .locator("header")
      .getByRole("button", { name: /settings|налаштування/i })
      .click();

    const settingsModal = page.locator("div.fixed.inset-0.z-50");
    await expect(settingsModal).toBeVisible();

    await settingsModal
      .locator("nav")
      .getByRole("button", { name: /Integrations|Інтеграції/i })
      .click();

    await expect(settingsModal.locator("h1").first()).toContainText(/Integrations|Інтеграції/i);

    await expect(settingsModal.getByText(/Binance/i).first()).toBeVisible();
    await expect(settingsModal.getByText(/MetaTrader 5/i).first()).toBeVisible();

    const binanceSection = settingsModal.locator("div.rounded-2xl", { hasText: "Binance" });
    await binanceSection
      .getByRole("button", { name: /Add|Додати/i })
      .first()
      .click();

    const connectModal = page.locator("div.fixed.inset-0.z-50").last();
    await expect(connectModal).toBeVisible();

    await connectModal.locator("input#conn-name").fill("My E2E Binance Account");
    await connectModal.locator("input#apiKey").fill("e2e-api-key-test-value-123");
    await connectModal.locator("input#apiSecret").fill("e2e-api-secret-test-value-456");

    await connectModal.getByRole("button", { name: /Connect|Підключити/i }).click();

    await expect(connectModal).not.toBeVisible({ timeout: 10000 });

    const connectionItem = binanceSection.locator("li", { hasText: "My E2E Binance Account" });
    await expect(connectionItem).toBeVisible({ timeout: 10000 });

    const trashBtn = connectionItem
      .locator("button")
      .filter({ has: page.locator("svg") })
      .last();
    await expect(trashBtn).toBeVisible();
    await trashBtn.click();

    await expect(connectionItem).not.toBeVisible({ timeout: 10000 });
  });
});
