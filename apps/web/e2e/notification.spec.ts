import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Notifications E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };
  let accessToken: string;
  let spaceId: string;

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-notif-${id}@example.com`,
      username: `notifuser${id}`,
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

    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: testUser.email, password: testUser.password },
      headers: { "x-e2e-test": "true" },
    });
    if (!loginRes.ok()) throw new Error(`API Login failed: ${await loginRes.text()}`);
    const loginData = await loginRes.json();
    accessToken = loginData.accessToken;

    const spacesRes = await request.get(`${API}/spaces`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-e2e-test": "true",
      },
    });
    if (!spacesRes.ok()) throw new Error(`Failed to get spaces: ${await spacesRes.text()}`);
    const spaces = await spacesRes.json();
    spaceId = spaces[0].id;
  });

  test("TC-NOTIF-004 / TC-NOTIF-005 / TC-NOTIF-006 / TC-NOTIF-008 / TC-NOTIF-009 / TC-NOTIF-010 / TC-NOTIF-011: Notification E2E UI Flow", async ({
    page,
    request,
  }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    const bellBtn = page.getByRole("button", { name: /Notifications/i });
    await expect(bellBtn).toBeVisible();

    const badge = bellBtn.locator("span");
    await expect(badge).not.toBeVisible();

    await bellBtn.click();
    const modal = page.locator("div.fixed.inset-0.z-50");
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/No new notifications|Немає нових сповіщень/i)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    for (let i = 1; i <= 3; i++) {
      const createRes = await request.post(`${API}/integration-connections`, {
        data: {
          spaceId,
          service: "METATRADER5",
          name: `MT5 Integration E2E ${i}`,
          credentials: {
            login: `login${i}`,
            password: `password${i}`,
            server: `server${i}`,
          },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-e2e-test": "true",
        },
      });
      if (!createRes.ok()) throw new Error(`Failed to create connection ${i}: ${await createRes.text()}`);
    }

    await page.reload({ waitUntil: "load" });
    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    const newBadge = page.getByRole("button", { name: /Notifications/i }).locator("span");
    await expect(newBadge).toBeVisible({ timeout: 10000 });
    await expect(newBadge).toHaveText("3");

    await page.getByRole("button", { name: /Notifications/i }).click();
    await expect(modal).toBeVisible();

    const items = modal.locator("button[type='button']").filter({ hasText: /Integration/i });
    await expect(items).toHaveCount(3);

    await items.first().click();

    await expect(modal).not.toBeVisible();
    const settingsModal = page.locator("div.fixed.inset-0.z-50");
    await expect(settingsModal).toBeVisible();
    await expect(settingsModal.locator("h1").first()).toContainText(/Integrations|Інтеграції/i);

    await settingsModal
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first()
      .click();
    await expect(settingsModal).not.toBeVisible();

    await page.reload({ waitUntil: "load" });
    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    const badgeAfterClick = page.getByRole("button", { name: /Notifications/i }).locator("span");
    await expect(badgeAfterClick).toBeVisible({ timeout: 10000 });
    await expect(badgeAfterClick).toHaveText("2");

    await page.getByRole("button", { name: /Notifications/i }).click();
    await expect(modal).toBeVisible();

    const markAllBtn = modal.getByRole("button", { name: /Mark all as read|Позначити всі як прочитані/i });
    await expect(markAllBtn).toBeVisible();
    await markAllBtn.click();

    await expect(markAllBtn).toBeDisabled();

    const clearAllBtn = modal.getByRole("button", { name: /Clear all|Очистити все/i });
    await expect(clearAllBtn).toBeVisible();
    await clearAllBtn.click();

    await expect(modal.getByText(/No new notifications|Немає нових сповіщень/i)).toBeVisible({ timeout: 10000 });

    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();

    const finalBadge = page.getByRole("button", { name: /Notifications/i }).locator("span");
    await expect(finalBadge).not.toBeVisible();
  });
});
