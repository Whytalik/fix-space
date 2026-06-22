import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:3000";
const WEB = "http://127.0.0.1:3001";

test.describe("Import/Export E2E Tests", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-impexp-${id}@example.com`,
      username: `impexpuser${id}`,
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

  test("TC-IMP-011 / TC-IMP-012 / TC-IMP-004 / TC-IMP-008: Import and Export CSV E2E UI Flow", async ({ page }) => {
    await page.goto(`${WEB}/en/login`, { waitUntil: "load" });
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /^sign in$|^увійти$/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    await page.getByRole("button", { name: /Add section/i }).click();
    const sectionInput = page.locator(".animate-fade-up input.field-input");
    await expect(sectionInput).toBeVisible();
    await sectionInput.fill("Import Export Section");
    await page
      .locator(".animate-fade-up")
      .getByRole("button", { name: /^Add section$/i })
      .click();
    await expect(page.getByRole("button", { name: "Import Export Section" })).toBeVisible({ timeout: 10000 });

    const sectionRow = page.locator("div.group", { has: page.getByRole("button", { name: "Import Export Section" }) });
    await sectionRow.hover();
    await sectionRow.getByRole("button", { name: "Options" }).click();
    await page.locator(".bg-elevated").getByRole("button", { name: "Add database" }).click();

    const dbInput = page.locator(".animate-fade-up input.field-input");
    await expect(dbInput).toBeVisible();
    await dbInput.fill("Fruit Store DB");
    await page.locator(".animate-fade-up").getByRole("button", { name: "Create database" }).click();
    await page.waitForURL(/\/database\/([a-f0-9-]+)\/edit$/, { timeout: 15000 });
    const dbId = page.url().match(/\/database\/([a-f0-9-]+)\/edit$/)?.[1];

    await page.getByRole("button", { name: /Import & Export|Імпорт та Експорт/i }).click();

    const exportBtn = page.getByRole("button", { name: /Export CSV/i }).first();
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    const exportModal = page.locator("div.fixed.inset-0.z-50");
    await expect(exportModal).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await exportModal
      .getByRole("button", { name: /Export|Експортувати/i })
      .first()
      .click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".csv");
    await expect(exportModal).not.toBeVisible();

    const importBtn = page.getByRole("button", { name: /Import CSV/i }).first();
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    const importModal = page.locator("div.fixed.inset-0.z-50");
    await expect(importModal).toBeVisible();

    const csvContent = "Назва,Рейтинг\nApple,5\nBanana,4";
    await page.setInputFiles("input[type=file]", {
      name: "fruits.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent, "utf8"),
    });

    await expect(importModal.getByRole("heading", { name: /Map columns|Зіставлення колонок/i }).first()).toBeVisible({ timeout: 10000 });

    const mappingSelects = importModal.locator("select");
    await expect(mappingSelects.first()).toBeVisible();

    await mappingSelects.first().selectOption("__name__");

    await importModal.getByRole("button", { name: /Next|Далі/i }).click();

    await expect(importModal.getByRole("heading", { name: /Import summary|Підсумок імпорту/i }).first()).toBeVisible({ timeout: 10000 });

    await importModal.getByRole("button", { name: /Import/i }).click();

    await expect(importModal.getByText(/Import complete|Імпорт завершено/i)).toBeVisible({ timeout: 10000 });

    await importModal.getByRole("button", { name: /Done|Готово/i }).click();
    await expect(importModal).not.toBeVisible();

    await page.locator("aside").getByText("Fruit Store DB").click();
    await page.waitForURL(new RegExp(`/database/${dbId}$`), { timeout: 10000 });

    await expect(page.locator("td", { hasText: "Apple" })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("td", { hasText: "Banana" })).toBeVisible({ timeout: 10000 });
  });
});
