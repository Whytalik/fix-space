# Feature: Workspace — Auto-Initialize with 9 Preset Databases

## GitHub Issues

- **Issue:** #59 — [Workspace] Auto-initialize workspace with 9 preset databases on registration
- **Branch:** `feature/workspace-init`
- **Milestone:** v0.1 — MVP Core
- **Priority:** P0 (Must · Критична)

---

## User Stories & Критерії приймання (Acceptance Criteria)

**US-010** · Автоматична ініціалізація простору

> Як новий користувач, я хочу, щоб при реєстрації автоматично створювався workspace з 9 пресетними базами даних, щоб одразу мати готову структуру для ведення журналу.

- [ ] **Given** новий користувач завершує реєстрацію, **When** email підтверджений, **Then** workspace створений з 9 пресетними БД, кожна з коректними властивостями. · _Тест-кейси: [TC-WS-001](../../06-testing/test-cases/02-workspace.md#tc-ws-001-автоматичне-створення-workspace-при-реєстрації), [TC-WS-002](../../06-testing/test-cases/02-workspace.md#tc-ws-002-пресетні-бази-мають-коректні-властивості)_
- [ ] **Given** workspace ініціалізовано, **When** перевіряємо шаблони, **Then** кожна пресетна БД має щонайменше один системний шаблон (Trading Journal: «Quick Trade»; Session Routine: «Pre-Market Session»; тощо). · _Тест-кейс: [TC-WS-003](../../06-testing/test-cases/02-workspace.md#tc-ws-003-пресетні-шаблони-створені)_
- [ ] **Given** workspace ініціалізовано, **When** перевіряємо секції, **Then** стартові секції (Routine, Insight, Settings) створені з правильними назвами, іконками та кольорами.
- [ ] **Given** workspace ініціалізовано, **When** користувач відкриває сайдбар, **Then** пресетні БД позначені індикатором «системна» і недоступні для видалення.

**US-024** · Пресетні бази даних

> Як новий користувач, я хочу, щоб при ініціалізації workspace автоматично створювалися всі 9 пресетних баз даних, щоб одразу мати готову інфраструктуру для торгового журналу.

- [ ] **Given** ініціалізація завершена, **When** запит до `GET /spaces`, **Then** присутні всі 9 БД: Trading Journal, Session Routine, Routine Library, Notes, Mistakes, Accounts, Operations, Trading Systems, Performance Review. · _Тест-кейс: [TC-DB-001](../../06-testing/test-cases/04-databases.md#tc-db-001-пресетні-бази-при-ініціалізації)_
- [ ] **Given** ініціалізація завершена, **When** перевіряємо RELATION-властивості, **Then** зв'язки між БД коректні (Trading Journal → Accounts, Trading Systems; Session Routine → Trading Journal). · _Тест-кейс: [TC-DB-002](../../06-testing/test-cases/04-databases.md#tc-db-002-пресетні-звзки-між-базами)_
- [ ] **Given** ініціалізація завершена, **When** перевіряємо Routine Library, **Then** БД має повний набір властивостей і щонайменше один системний шаблон.
- [ ] **Given** ініціалізація завершена, **When** перевіряємо Performance Review, **Then** БД має повний набір властивостей і щонайменше один системний шаблон.

---

## Ключові бізнес-правила

- **Тригер:** Ініціалізація викликається одразу після першої верифікації email; повторна верифікація ініціалізацію не запускає.
- **Транзакція:** Процес виконується у 6 проходів: sections → databases → properties → seed records → RELATION values → templates. Збій будь-якого проходу відкатує весь space.
- **Пресет захист:** `isPreset: true` на Database — видалення таких БД заблоковано. `isProtected: true` на Property — тип і видалення заблоковані.
- **isLocked:** `Database.isLocked: true` заблоковує будь-які зміни структури (add/edit/delete property).
- **Ліміт просторів:** До 5 space на акаунт; `isDefault: true` space не видаляється.
- **Шаблони:** Перший шаблон у конфігурації має `isDefault: true` → автоматично застосовується при створенні запису.

---

## Підзадачі

- [x] **Шар 1 (DTO):** `CreateSpaceDto` — `packages/domain/src/space/dto/create-space.dto.ts`
- [x] **Шар 2 (DB Schema):** Моделі Space, Section, Database, Property, Template, Record у `packages/database/prisma/schema.prisma`
- [ ] **Шар 3 (Service):** `InitializeUserSpaceUseCase` + `InitializationConfigService` — `apps/api/src/modules/space/providers/`
- [ ] **Шар 3 (Config):** `initialization.config.ts` — конфігурація 9 БД — `apps/api/src/core/config/`
- [ ] **Шар 3 (Seeds):** `initialization.seeds.ts` — демо-записи для 7/9 БД — `apps/api/src/core/config/`
- [ ] **Шар 3 (Completion):** Routine Library та Performance Review — додати властивості, шаблони та seed-записи
- [ ] **Шар 4 (Web):** Відображення індикатора «системна» для пресетних БД у сайдбарі
- [ ] **Шар 5 (E2E Testing):** `apps/web/e2e/workspace-init.spec.ts` — перевірка структури після реєстрації
- [ ] **Docs & Testing:** Актуалізувати тест-кейси [02-workspace.md](../../06-testing/test-cases/02-workspace.md), [04-databases.md](../../06-testing/test-cases/04-databases.md) та Postman-колекцію.

---

## Технічний дизайн за шарами

### 1. Шар DTO & Валідація

- [x] `packages/domain/src/space/dto/create-space.dto.ts` — внутрішнє DTO для ініціалізації; user-facing DTO відсутній (виклик автоматичний).
  - **Ключові поля:** `name` (`@IsString`, `@MinLength(1)`, `@MaxLength(120)`), `icon` (`@IsString`, optional), `isDefault` (`@IsBoolean`, optional).

### 2. Шар DB Schema

- [x] **Space:** `id`, `name`, `icon`, `isDefault`, `isDemo`, `ownerId`, зв'язки із Section[], Database[].
- [x] **Section:** `id`, `name`, `key`, `icon`, `color`, `position`, `spaceId`.
- [x] **Database:** `id`, `name`, `icon`, `type` (preset key), `isPreset`, `isLocked`, `sectionId`, `spaceId`.
- [x] **Property:** `id`, `name`, `type` (TEXT | NUMBER | DATE | CHECKBOX | DURATION | SELECT | STATUS | RELATION | RATING | PROGRESS | FORMULA | BUTTON), `config` (JSON), `isRequired`, `isVisible`, `isProtected`, `position`, `databaseId`.
- [x] **Template:** `id`, `name`, `isDefault`, `namePattern`, `content`, `databaseId`, зв'язки із TemplatePropertyValue[].
- [x] **Record:** `id`, `name`, `icon`, `databaseId`, `deletedAt` (soft delete).

```prisma
// Ключові прапорці
model Database {
  isPreset Boolean @default(false)
  isLocked Boolean @default(false)
  type     String? // "trading-journal" | "daily-routine" | ...
}

model Property {
  isRequired  Boolean @default(false)
  isVisible   Boolean @default(true)
  isProtected Boolean @default(false)
}
```

### 3. Шар Service (API) — без нових ендпоінтів

- [ ] **`InitializeUserSpaceUseCase.initialize(userId, username)`** — `apps/api/src/modules/space/providers/initialize-user-space.usecase.ts`
  - Тригер: викликається з `AuthService.verifyEmail` при першій верифікації.
  - Використовує `spaceNameTemplate: "{{username}}'s Space"` з конфігурації.
  - При збої seed-проходу — відкатує весь space.
- [ ] **`InitializeUserSpaceUseCase.seedContent(spaceId, userId)`** — 6-pass алгоритм:
  1. Створити 3 секції (Routine, Insight, Settings) з конфігу.
  2. Створити 9 БД із прив'язкою до секцій за `sectionKey`.
  3. Створити властивості кожної БД; RELATION-посилання резолвяться за `relatedEntityType` → `databaseId`.
  4. Створити seed-записи із значеннями (крім RELATION).
  5. Резолвити RELATION-значення між записами за іменем.
  6. Створити 2 шаблони для кожної БД (перший — `isDefault: true`).
- [ ] **`InitializationConfigService`** — `apps/api/src/core/config/initialization-config.service.ts` — провайдер конфігурації.
- [ ] **`defaultInitializationConfig`** — `apps/api/src/core/config/initialization.config.ts` — TypeScript-конфіг 9 БД:

| База даних         | Секція   | Ключові властивості                                                                                                                                                                             |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trading Journal    | Routine  | Name, Date, Account (REL), Pair (SELECT), Session, Direction, Result, Gained RR, Entry Model, Entry Timeframe, Point A/B, Stop Loss, Delivery, Daily Routine (REL), Notes (REL), Mistakes (REL) |
| Session Routine    | Routine  | Name, Date, Account (REL), Pair, Session, Direction, Trading System (REL), Narrative, Outcome, Narrative Accurate (FORMULA), Execution (FORMULA), Trades (REL)                                  |
| Routine Library    | Routine  | _(потребує визначення)_                                                                                                                                                                         |
| Notes              | Insight  | Name, Date, Type (SELECT: Lesson/Rule/Observation/Strategy/Psychology), Topic, Date of Last Use (FORMULA), Used in Analysis, Used in Trades                                                     |
| Mistakes           | Insight  | Name, Date, Severity (STATUS), Type (SELECT), Topic, Date of Last Use (FORMULA), Used in Analysis, Used in Trades                                                                               |
| Performance Review | Insight  | _(потребує визначення)_                                                                                                                                                                         |
| Accounts           | Settings | Name, Started, Account Type (SELECT: Funded/Personal/Demo/Challenge), Status (STATUS), Starting Equity, Current Equity, Operations (REL)                                                        |
| Operations         | Settings | Name, Type (SELECT: Deposit/Withdrawal), Date, Account (REL), Amount                                                                                                                            |
| Trading Systems    | Settings | Name, Date                                                                                                                                                                                      |

- [ ] **`initialization.seeds.ts`** — `apps/api/src/core/config/initialization.seeds.ts` — демо-записи:
  - Trading Journal: 50 реалістичних торгових записів (EURUSD, XAUUSD; 2025-01–04).
  - Session Routine: 30 сесійних аналізів.
  - Notes: 20 торгових нотаток.
  - Mistakes: 15 помилок.
  - Accounts: 4 торгові рахунки (Funded, Personal, Demo, Challenge).
  - Operations: 20 операцій поповнення/виведення.
  - Trading Systems: 5 торгових систем (SMC, ICT, FVG+OB тощо).

### 4. Шар Pages & Components (Web)

- Ініціалізація відбувається повністю на сервері; окремих сторінок не потрібно.
- [ ] **Сайдбар:** Відображення індикатора «системна» поруч із назвою пресетної БД; відключення пункту «Видалити» для таких БД.

### 5. Шар E2E тестування (Web)

- [ ] **`apps/web/e2e/workspace-init.spec.ts`:**
  - Позитивний: Реєстрація → Верифікація → Логін → перевірка наявності 9 БД у сайдбарі.
  - Структурний: Перевірка RELATION-зв'язків через API після ініціалізації.

### 6. Документація API (Swagger & Postman)

- [ ] **Swagger:** Існуючий `GET /spaces` задокументований та повертає ініціалізований простір.
- [ ] **Postman:** Додати сценарій «Workspace initialization check» — POST register → POST verify → GET /spaces → перевірка 9 пресетних БД.

---

## Коміти

```bash
# 1. Схема БД та міграція
chore(db): add Space, Section, Database, Property, Template, Record models and migration
# 2. DTO (домен)
feat(domain/space): add CreateSpaceDto and SpaceResponseDto
# 3. Конфігурація ініціалізації
feat(api/space): add InitializationConfigService with 9 preset database config
# 4. UseCase та seed-дані
feat(api/space): add InitializeUserSpaceUseCase with 6-pass seeding algorithm
feat(api/space): add initialization.seeds.ts with demo trading records
# 5. Завершення Routine Library та Performance Review
feat(api/space): complete Routine Library and Performance Review config and seeds
# 6. Тести
test(api/space): add InitializeUserSpaceUseCase integration tests
# 7. Web — індикатор пресет БД
feat(web/space): add preset database indicator in sidebar
# 8. E2E
test(web/e2e): add workspace initialization playwright flow
# 9. Документація
docs(workspace): update test-cases, RTM, and Postman collection
```

---

## Definition of Done

- [ ] DB міграція застосована: Space, Section, Database, Property, Template, Record.
- [ ] 7/9 пресетних БД ініціалізуються з коректними властивостями, RELATION-зв'язками та шаблонами.
- [ ] Routine Library та Performance Review — повні властивості, шаблони, seed-записи.
- [ ] Пресетні БД захищені від видалення (`isPreset`) та відображають індикатор у Web UI.
- [ ] Integration tests підтверджують повноту ініціалізації (всі 9 БД, зв'язки, шаблони).
- [ ] E2E сценарій в Playwright проходить успішно для всіх підтримуваних браузерів.
- [ ] `turbo lint`, `turbo test`, `turbo build` проходять без помилок.
- [ ] Тест-кейси [02-workspace.md](../../06-testing/test-cases/02-workspace.md) та [04-databases.md](../../06-testing/test-cases/04-databases.md) актуалізовані.
- [ ] Матриця трасабельності вимог (RTM) оновлена.
