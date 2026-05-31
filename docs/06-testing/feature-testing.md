# Воркфлоу тестування при розробці фічі

> Цей документ описує як тестування інтегрується в кожний шар розробки.  
> Базується на послідовній розробці по шарах: DTO → DB → Service → Controller → Page → Components

---

## Загальний принцип

Кожен шар розробки має свій рівень тестування.  
Не переходиш до наступного шару — поки тест попереднього не зелений.

```
DTO             →  unit-тест валідаторів (class-validator)
DB Schema       →  перевірка міграції + seed-дані
Service         →  unit-тест з моками (Jest, white box)
Controller      →  unit-тест + ручне тестування в Postman (black box)
Page            →  ручний smoke-тест у браузері
Components      →  ручний exploratory test + чекліст
─────────────────────────────────────────────────────
Feature done    →  оновити Postman колекцію + test-cases/<module>.md + RTM
```

---

## Шар 1: DTO (`packages/domain/src/<module>/`)

**Що тестується:** коректність валідаційних декораторів (`@IsString`, `@IsEmail`, `@MinLength` тощо).

**Тип тестування:** модульне, білий ящик.

**Техніки тест-дизайну:**

- **Equivalence Partitioning** — розбий кожне поле на класи:
  - valid: правильний формат
  - invalid format: неправильний тип/формат
  - empty/missing: порожнє або відсутнє
- **Boundary Value Analysis** — для числових та рядкових полів:
  - `@MinLength(8)` → тестуй 7, 8, 9 символів
  - `@Max(100)` → тестуй 99, 100, 101

**Файл тесту:** `packages/domain/src/<module>/test/<dto>.spec.ts`

**Приклад тест-кейсів для `RegisterUserDto`:**

| TC-ID      | Input               | Expected          | Техніка            |
| ---------- | ------------------- | ----------------- | ------------------ |
| TC-DTO-001 | валідні дані        | passes validation | EP (valid class)   |
| TC-DTO-002 | email без `@`       | fails: IsEmail    | EP (invalid class) |
| TC-DTO-003 | password 7 символів | fails: MinLength  | BVA (min-1)        |
| TC-DTO-004 | password 8 символів | passes            | BVA (min)          |
| TC-DTO-005 | відсутній username  | fails: IsNotEmpty | EP (empty class)   |

---

## Шар 2: DB Schema (`packages/database/prisma/schema.prisma`)

**Що тестується:** міграція застосована без помилок, схема відповідає моделі.

**Тип тестування:** ручна перевірка (немає окремого тест-файлу).

**Чеклист для DB-шару:**

- [ ] `turbo db:migrate:dev` виконався без помилок
- [ ] `pnpm --filter @fixspace/database studio` — нова таблиця/поле відображається в Prisma Studio
- [ ] Seed-скрипт оновлений якщо потрібні нові тестові дані

---

## Шар 3: Service (`apps/api/src/<module>/<module>.service.ts`)

**Що тестується:** бізнес-логіка в ізоляції (без реальної БД).

**Тип тестування:** модульне, білий ящик.

**Структура unit-тесту:**

```typescript
describe("SpaceService", () => {
  let service: SpaceService;

  // Мок-репозиторій — замість реального Prisma
  const mockRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SpaceService,
        { provide: SpaceRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get(SpaceService);
  });

  afterEach(() => jest.clearAllMocks());

  it("should create a space", async () => {
    mockRepo.create.mockResolvedValue({ id: "1", name: "My Space" });
    const result = await service.create({ name: "My Space" }, "user-1");
    expect(result.name).toBe("My Space");
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "My Space" }),
    );
  });

  it("should throw NotFoundException when space not found", async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.findById("invalid-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
```

**Що обов'язково покрити:**

- [ ] Happy path (основний позитивний сценарій)
- [ ] Ресурс не знайдений → `NotFoundException`
- [ ] Конфлікт (duplicate) → `ConflictException`
- [ ] Неавторизований доступ → `ForbiddenException`

**Запуск:**

```bash
pnpm --filter @fixspace/api test:watch
```

---

## Шар 4: Controller (`apps/api/src/<module>/<module>.controller.ts`)

**Що тестується (unit):** правильне делегування до service, HTTP-статуси.

**Що тестується (Postman):** реальна поведінка ендпоінту через HTTP (black box).

### 4a. Unit-тест контролера

```typescript
describe("SpaceController", () => {
  let controller: SpaceController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [{ provide: SpaceService, useValue: mockService }],
    }).compile();
    controller = module.get(SpaceController);
  });

  it("POST /spaces → should call service.create", async () => {
    const dto = { name: "My Space" };
    const req = { user: { id: "user-1" } };
    mockService.create.mockResolvedValue({ id: "1", ...dto });

    const result = await controller.create(dto, req as any);
    expect(mockService.create).toHaveBeenCalledWith(dto, "user-1");
    expect(result.name).toBe("My Space");
  });
});
```

### 4b. Ручне тестування в Postman (обов'язково після кожного нового ендпоінту)

```
1. Переконайся що API запущено: turbo dev --filter=@fixspace/api
2. Відкрий Postman → колекція FIX Space
3. Знайди або додай новий запит
4. Виконай та перевір:
   ✓ HTTP статус відповідає очікуваному (200, 201, 400, 401, 403, 404)
   ✓ Response body містить очікувані поля
   ✓ Без токена → 401
   ✓ З невалідними даними → 400 + опис помилки
5. Якщо ендпоінт новий → додай запит до колекції та експортуй
```

**Техніки чорного ящика для Postman:**

- **Equivalence Partitioning** → тестуй: valid body / missing required field / wrong type
- **Error Guessing** → порожнє тіло, SQL-ін'єкції в параметрах, дуже довгі рядки
- **State Transition** → послідовність запитів: create → get → update → delete

---

## Шар 5: Page (`apps/web/app/<route>/page.tsx`) & Feature Forms

**Тип тестування:** ручний smoke-тест + автоматизований Playwright E2E.

Для повноцінних сторінок та великих форм (наприклад, `LoginForm`, `RegisterForm`) ми не пишемо модульні тести Jest, оскільки вони мають занадто багато залежностей від оточення Next.js та API. Натомість їхня працездатність гарантується наскрізними тестами Playwright.

**Чеклист для ручного тестування сторінки під час розробки:**

- [ ] Сторінка відкривається без JS-помилок у консолі розробника.
- [ ] Дані завантажуються та відображаються коректно в усіх полях.
- [ ] Форми надсилають правильні HTTP-запити (перевіряється в Network tab).
- [ ] Повідомлення про помилки валідації та API відображаються коректно.
- [ ] Захищені сторінки недоступні без авторизації (перенаправлення на `/login`).

---

## Шар 6: UI Primitives (Компоненти)

### 6a. Автоматизоване модульне тестування (Jest + React Testing Library)

**Що тестується:** Загальні перевикористовувані примітиви інтерфейсу (`src/components/ui/primitives/*`).

**Тип тестування:** модульне, чорний ящик.

**Приклад тесту компонента `Button`:**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/primitives/actions/button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Що обов'язково покрити у примітивах:**

- [ ] Компонент рендериться без помилок з дефолтними props.
- [ ] Кастомний `className` успішно зливається з дефолтними класами Tailwind.
- [ ] Інтерактивність (натискання клавіш, кліки, фокус) працює коректно, викликаючи відповідні обробники.
- [ ] Різні візуальні стани (`disabled`, `loading`, `variants`, `sizes`) рендеряться правильно.

**Запуск:**

```bash
pnpm --filter @fixspace/web test:watch
```

### 6b. Ручне exploratory testing для UI

**Що перевіряти в браузері:**

- [ ] Адаптивність (як компонент поводиться на мобільних пристроях, планшетах, десктопах).
- [ ] Доступність (відповідність вимогам ARIA, підтримка клавіатурної навігації `Tab`, фокус-кільця).
- [ ] Крайові стани (відображення дуже довгих текстів, порожніх станів).

---

## Після завершення фічі: оновлення документації

Ці кроки виконуються один раз після того як всі шари готові та протестовані.

### Крок 1: Оновити Postman-колекцію

```
1. Переконайся що всі нові ендпоінти є в колекції
2. Postman → Export → Collection v2.1
3. Зберегти як docs/06-testing/postman/postman_collection.json
4. Commit: docs(postman): sync collection with <module> changes
```

### Крок 2: Оновити test-cases

Додай рядки до `docs/06-testing/test-cases/<module>.md` для нових тест-кейсів фічі.

```markdown
| TC-SPACE-001 | Space | Створення простору з валідним ім'ям | POST /spaces → 201 | Pass | EP |
| TC-SPACE-002 | Space | Створення без авторизації | POST /spaces без токена → 401 | Pass | Black Box |
```

### Крок 3: Оновити RTM

Додай рядки до `docs/06-testing/rtm.md`, пов'яжи нові вимоги з тест-кейсами.

### Крок 4: Оновити чекліст

Додай нові пункти в `docs/06-testing/checklist.md` для нового функціоналу.

### Крок 5: Запустити повний тест-сюіт

```bash
turbo test          # всі unit-тести (API + Web)
turbo test:e2e      # e2e (потребує запущеного Docker)
```

---

## Зведена таблиця: шар → тип тесту → техніка → інструмент

| Шар                 | Тип тестування            | Техніка                   | Інструмент      |
| ------------------- | ------------------------- | ------------------------- | --------------- |
| DTO                 | Модульне (white box)      | EP, BVA                   | Jest            |
| Service             | Модульне (white box)      | EP, Error Guessing        | Jest            |
| Controller (unit)   | Модульне (white box)      | —                         | Jest            |
| Controller (manual) | Функціональне (black box) | EP, BVA, State Transition | Postman         |
| Full API            | Інтеграційне (gray box)   | State Transition          | Supertest (e2e) |
| Performance         | Навантажувальне           | —                         | JMeter          |
| Page                | Ручне smoke               | Exploratory               | Browser         |
| Components (auto)   | Модульне (black box)      | Rendering, Events         | Jest + RTL      |
| Components (manual) | Ручне exploratory         | Error Guessing            | Browser         |

---

## Типові помилки

| Помилка                             | Наслідок                              | Як уникнути                                  |
| ----------------------------------- | ------------------------------------- | -------------------------------------------- |
| Тест тільки happy path              | Не виявляються edge cases             | Мінімум 3 кейси: positive/negative/boundary  |
| Мокуєш те що тестуєш                | Тест завжди зелений, але код зламаний | Mock тільки зовнішні залежності              |
| Не оновлюєш Postman після зміни API | Колекція не відповідає коду           | Оновлення як частина Definition of Done      |
| Тестуєш тільки unit, ігноруєш e2e   | Модулі працюють окремо, але не разом  | Запускати `turbo test:e2e` після кожної фічі |
