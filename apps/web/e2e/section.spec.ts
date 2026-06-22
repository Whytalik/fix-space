import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Sections E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-section-${id}@example.com`,
      username: `secuser${id}`,
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

  test("TC-SEC-015 / TC-SEC-016 / TC-SEC-011 / TC-SEC-012: Full Section Lifecycle UI flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Add section/i }).click();

    const modalInput = page.locator(".animate-fade-up input.field-input");
    await expect(modalInput).toBeVisible();
    await modalInput.fill("Analytics and strategies");

    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();

    const sectionHeader = page.getByRole("button", { name: "Analytics and strategies" });
    await expect(sectionHeader).toBeVisible({ timeout: 10000 });

    const sectionRow = page.locator("div.group", { has: sectionHeader });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".min-w-36").waitFor({ state: "visible" });
    const boundingBox = await page.locator(".min-w-36").boundingBox();
    console.log("Dropdown box:", boundingBox);
    await page.locator(".min-w-36").getByRole("button", { name: "Edit" }).click();
    const editInput = page.locator(".animate-fade-up input.field-input");
    await expect(editInput).toBeVisible();
    await editInput.fill("Renamed Section");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Save changes" }).click();

    const renamedHeader = page.getByRole("button", { name: "Renamed Section" });
    await expect(renamedHeader).toBeVisible({ timeout: 10000 });

    await renamedHeader.click();

    const renamedRow = page.locator("div.group", { has: renamedHeader });
    await renamedRow.hover();
    await renamedRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".min-w-36").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("Section Database");

    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();

    await page.waitForURL(/\/database\/[a-f0-9-]+\/edit$/, { timeout: 15000 });

    const dbItem = page.locator("aside").getByText("Section Database");
    await expect(dbItem).toBeVisible({ timeout: 10000 });

    await renamedHeader.click();
    await expect(dbItem).not.toBeVisible();

    await page.reload({ waitUntil: "load" });
    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });
    const renamedHeaderReloaded = page.getByRole("button", { name: "Renamed Section" });
    await expect(renamedHeaderReloaded).toBeVisible();

    const dbItemReloaded = page.locator("aside").getByText("Section Database");
    await expect(dbItemReloaded).not.toBeVisible();

    await renamedHeaderReloaded.click();
    await expect(dbItemReloaded).toBeVisible({ timeout: 10000 });
  });
});
