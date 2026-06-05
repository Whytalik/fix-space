import { type APIRequestContext, expect, test } from "@playwright/test";

const API = "http://localhost:3000";
const WEB = "http://localhost:3001";

const PRESET_DB_TITLES = [
  "Trading Journal",
  "Session Routine",
  "Routine Library",
  "Notes",
  "Mistakes",
  "Performance Review",
  "Accounts",
  "Operations",
  "Trading Systems",
] as const;

type PropertyDto = { name: string; type: string; config: Record<string, unknown> };
type TemplateDto = { name: string; isDefault: boolean };

async function seedViaApi(request: APIRequestContext, user: { email: string; username: string; password: string }) {
  const regRes = await request.post(`${API}/auth/register`, {
    data: user,
    headers: { "x-e2e-test": "true" },
  });
  if (!regRes.ok()) throw new Error(`Register failed (${regRes.status()}): ${await regRes.text()}`);

  const verifyRes = await request.post(`${API}/auth/dev/verify-user`, {
    data: { email: user.email },
    headers: { "x-e2e-test": "true" },
  });
  if (!verifyRes.ok()) throw new Error(`Verify failed (${verifyRes.status()}): ${await verifyRes.text()}`);
}

async function apiLogin(request: APIRequestContext, user: { email: string; password: string }): Promise<string> {
  const res = await request.post(`${API}/auth/login`, {
    data: { email: user.email, password: user.password },
    headers: { "x-e2e-test": "true" },
  });
  if (!res.ok()) throw new Error(`Login failed (${res.status()}): ${await res.text()}`);
  const body = (await res.json()) as { accessToken: string };
  return body.accessToken;
}

async function getDatabasesByTitle(request: APIRequestContext, token: string): Promise<Map<string, string>> {
  const spacesRes = await request.get(`${API}/spaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const spaces = (await spacesRes.json()) as Array<{ id: string; isDefault: boolean }>;
  const space = spaces.find((s) => s.isDefault) ?? spaces[0]!;

  const dbsRes = await request.get(`${API}/databases?spaceId=${space.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const databases = (await dbsRes.json()) as Array<{ id: string; title?: string; name: string }>;

  const map = new Map<string, string>();
  for (const db of databases) {
    map.set(db.title ?? db.name, db.id);
  }
  return map;
}

async function getProperties(request: APIRequestContext, token: string, dbId: string): Promise<PropertyDto[]> {
  const res = await request.get(`${API}/properties?databaseId=${dbId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) throw new Error(`GET /properties failed (${res.status()}): ${await res.text()}`);
  return (await res.json()) as PropertyDto[];
}

async function getTemplates(request: APIRequestContext, token: string, dbId: string): Promise<TemplateDto[]> {
  const res = await request.get(`${API}/templates?databaseId=${dbId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await res.json()) as TemplateDto[];
}

test.describe("TC-WS-001 / TC-DB-001: Workspace browser flow", () => {
  let testUser: { email: string; username: string; password: string };

  test.beforeEach(() => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    testUser = {
      email: `e2e-ws-${id}@example.com`,
      username: `wsuser${id}`,
      password: "Password123!",
    };
  });

  test("registration → verification → login → 9 preset databases in sidebar", async ({ page, request }) => {
    await page.goto(`${WEB}/en/register`);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/check your email|перевірте вашу пошту/i)).toBeVisible({ timeout: 15000 });

    const verifyRes = await request.post(`${API}/auth/dev/verify-user`, {
      data: { email: testUser.email },
      headers: { "x-e2e-test": "true" },
    });
    if (!verifyRes.ok()) {
      throw new Error(`Verification API failed (${verifyRes.status()}): ${await verifyRes.text()}`);
    }

    await page.goto(`${WEB}/en/login`);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /sign in|увійти/i }).click();
    await page.waitForURL(/\/en$/, { timeout: 10000 });

    const dbLinks = page.locator('a[href*="/database/"]');
    await expect(dbLinks.first()).toBeVisible({ timeout: 15000 });
    await expect(dbLinks).toHaveCount(9);

    for (const title of PRESET_DB_TITLES) {
      await expect(page.locator("aside").getByText(title)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Workspace API tests (shared user)", () => {
  let token: string;
  let dbsByTitle: Map<string, string>;

  test.beforeAll(async ({ request }) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const user = {
      email: `e2e-ws-api-${id}@example.com`,
      username: `wsapi${id}`,
      password: "Password123!",
    };
    await seedViaApi(request, user);
    token = await apiLogin(request, user);
    dbsByTitle = await getDatabasesByTitle(request, token);
  });

  test("TC-WS-024–031: all 9 preset databases initialised", async () => {
    expect(dbsByTitle.size).toBe(9);
    for (const title of PRESET_DB_TITLES) {
      expect(dbsByTitle.has(title), `Expected preset DB "${title}" to exist`).toBe(true);
    }
  });

  test("TC-WS-002: Trading Journal has correct properties including FORMULA types", async ({ request }) => {
    const tjId = dbsByTitle.get("Trading Journal");
    expect(tjId).toBeDefined();

    const properties = await getProperties(request, token, tjId!);
    const propNames = properties.map((p) => p.name);

    for (const name of ["Name", "Direction"]) {
      expect(propNames, `Expected property "${name}"`).toContain(name);
    }

    const formulaNames = properties.filter((p) => p.type === "FORMULA").map((p) => p.name);
    for (const name of ["Net P&L", "Risk %", "Actual R"]) {
      expect(formulaNames, `Expected FORMULA property "${name}"`).toContain(name);
    }
  });

  test("TC-DB-002: RELATION properties wired with correct relatedEntityId", async ({ request }) => {
    const tjId = dbsByTitle.get("Trading Journal")!;
    const accountsId = dbsByTitle.get("Accounts")!;
    const tradingSystemsId = dbsByTitle.get("Trading Systems")!;
    const sessionRoutineId = dbsByTitle.get("Session Routine")!;

    const tjProps = await getProperties(request, token, tjId);

    const accountRelation = tjProps.find((p) => p.type === "RELATION" && p.name === "Account");
    expect(accountRelation, "Trading Journal: Account RELATION property").toBeDefined();
    expect(accountRelation!.config["relatedEntityId"]).toBe(accountsId);

    const tsRelation = tjProps.find((p) => p.type === "RELATION" && p.name === "Trading System");
    expect(tsRelation, "Trading Journal: Trading System RELATION property").toBeDefined();
    expect(tsRelation!.config["relatedEntityId"]).toBe(tradingSystemsId);

    const srProps = await getProperties(request, token, sessionRoutineId);
    const tradesRelation = srProps.find((p) => p.type === "RELATION" && p.name === "Trades");
    expect(tradesRelation, "Session Routine: Trades RELATION property").toBeDefined();
    expect(tradesRelation!.config["relatedEntityId"]).toBe(tjId);
  });

  test("TC-WS-003: preset templates created for Trading Journal and Performance Review", async ({ request }) => {
    const tjTemplates = await getTemplates(request, token, dbsByTitle.get("Trading Journal")!);
    expect(tjTemplates.map((t) => t.name)).toContain("Default");

    const prTemplates = await getTemplates(request, token, dbsByTitle.get("Performance Review")!);
    const prNames = prTemplates.map((t) => t.name);
    expect(prNames).toContain("Weekly Review");
    expect(prNames).toContain("Monthly Review");
    expect(prNames).toContain("Quarterly Review");
    expect(prTemplates).toHaveLength(3);
  });
});
