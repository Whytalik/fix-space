# End-to-End Development Workflow

Цей документ — **єдина точка входу** для розуміння повного процесу розробки FIX Space.
Він об'єднує методологію, Git-воркфлоу, розробку по шарах та тестування в один послідовний процес.

---

## 0. Теорія: ключові поняття

### Backlog

Список **всіх задач**, які потрібно виконати в проекті. Упорядкований за пріоритетом — найважливіше зверху. Задача в backlog — це не деталізований план, а намір: "треба зробити X".

```
Backlog FIX Space:
  [Must] Створення Space
  [Must] Редагування Space
  [Must] Видалення Space
  [Should] Дублювання Space
  [Could] Експорт даних
  ...
```

### WIP Limit (Work In Progress Limit)

Максимальна кількість задач, які можна виконувати **одночасно**. У Personal Kanban для solo dev — WIP limit = 1.

**Навіщо:** переключення між задачами коштує часу і уваги. Одна задача від початку до кінця — швидше, ніж п'ять задач "в процесі".

### Milestone

Milestone (контрольна точка) — це **набір задач**, завершення яких формує робочу версію продукту. Не прив'язаний до конкретної дати як дедлайн — прив'язаний до набору функцій.

```
Milestone v0.1 — Auth + Space + Database (MVP)
Milestone v0.2 — Record + Property + PropertyValue
Milestone v1.0 — Template + View + Settings + Search
```

Milestone закривається коли всі його задачі у статусі Done і всі тести зелені.

### Definition of Done (DoD)

Чіткий список умов, при яких задача вважається **завершеною**. Без DoD — задача "майже готова" нескінченно.

### Канбан-дошка

Візуальне відображення стану роботи. Мінімальна структура для solo dev:

```
Backlog → In Progress → Done
```

Задача рухається зліва направо. В "In Progress" одночасно максимум 1 задача (WIP limit).

---

## 1. Загальна картина

```
Backlog ──▶ In Progress ──▶ Гілка ──▶ Шари (код + тест) ──▶ PR ──▶ Merge ──▶ Done
  │              │              │              │              │        │         │
  │              │              │              │              │        │         │
  ▼              ▼              ▼              ▼              ▼        ▼         ▼
GitHub       Kanban        GitHub Flow    feature-      GitHub      squash    Issue
Issue        дошка         branch         workflow      Flow        merge     closed
(WIP=1)
```

**Ключові принципи:**

- **WIP Limit = 1** — одна задача від початку до кінця, жодного паралелізму
- **Кожен шар тестується одразу** — не переходиш далі, поки тест не зелений
- **Conventional Commits** — commitlint блокує неправильні коміти
- **Squash merge** — історія `develop` залишається чистою

---

## 1.1. Дослідження та обґрунтування вибору Git-воркфлоу

### Що досліджували

Порівняно три основні Git-воркфлоу:

| Воркфлоу                                        | Джерело                                                                        | Рік  |
| ----------------------------------------------- | ------------------------------------------------------------------------------ | ---- |
| **Git Flow** (A successful Git branching model) | [nvie.com](https://nvie.com/posts/a-successful-git-branching-model/)           | 2010 |
| **GitHub Flow**                                 | [GitHub Docs](https://docs.github.com/en/get-started/using-github/github-flow) | 2024 |
| **Trunk-Based Development**                     | [Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows)       | 2024 |

Також враховано:

- **Conventional Commits** — специфікація форматів комітів ([conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/))
- **commitlint + husky** — індустріальний стандарт валідації комітів (18.5k зірок на GitHub)
- **GitHub Projects** — канбан-дошка з полями Priority, Status, Assignee
- Методологія проекту: **Hybrid PMBoK 7** (Predictive Planning + Personal Kanban, WIP=1)

### Чому не Git Flow (стара методологія)

Git Flow був популярним стандартом, але має фундаментальні проблеми для нашого контексту:

| Проблема                          | Пояснення                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Створений не для веб-додатків** | Git Flow писався для versioned software (десктоп, мобілки), де треба підтримувати v1.0, v1.1, v2.0 одночасно. FIX Space — веб-додаток з continuous delivery |
| **Автор сам відмовився**          | Vincent Driessen у 2020 додав примітку: _"If your team is doing continuous delivery, adopt a much simpler workflow like GitHub flow"_                       |
| **5 типів гілок замість 2**       | `master` + `develop` + `feature/*` + `release/*` + `hotfix/*` — для solo dev це занадто без користі                                                         |
| **Release-гілки — зайві**         | У Git Flow кожен реліз = окрема гілка з bugfix-ами. У нас — milestone + тег на `main`                                                                       |
| **Подвійні merge**                | Кожен release/hotfix merge-иться в `master` І в `develop` — більше конфліктів, більше ручної роботи                                                         |
| **Не сумісний з Kanban**          | Git Flow передбачає "release cycles". Personal Kanban — потік задач без циклів                                                                              |

### Чому обрали GitHub Flow

| Перевага                       | Чому це важливо для FIX Space                                    |
| ------------------------------ | ---------------------------------------------------------------- |
| **Одна гілка `main`**          | Завжди робочий стан, ніяких "develop vs master" плутанин         |
| **Кожна задача = своя гілка**  | Ізольована робота, чиста історія через squash merge              |
| **PR = code review + DoD**     | Чеклист тестування автоматично підставляється                    |
| **Auto-labels**                | GitHub сам вішає лейбли по змінених файлах                       |
| **Conventional Commits**       | commitlint блокує неправильні коміти — історія завжди читабельна |
| **Сумісний з Personal Kanban** | Backlog → In Progress → Done = feature branch → PR → merge       |
| **Теги замість release-гілок** | `git tag v0.1` коли milestone готовий — ніяких додаткових гілок  |

### Висновок

GitHub Flow + Conventional Commits + Personal Kanban = **мінімум процесу, максимум контролю**. Ідеально для solo dev, який працює ітеративно з чіткими milestone.

### Порівняння з Git Flow

|               | Git Flow                                                            | GitHub Flow (наш)             |
| ------------- | ------------------------------------------------------------------- | ----------------------------- |
| Гілок         | 5 типів (`master`, `develop`, `feature/*`, `release/*`, `hotfix/*`) | 2 (`main`, `feature/*`)       |
| Реліз         | release-гілка + merge в `master` + `develop`                        | тег на `develop`              |
| Hotfix        | `hotfix/*` з `master` → merge в обидві                              | `fix/*` з `develop` → PR      |
| Складність    | Висока (10+ кроків на реліз)                                        | Низька (4 кроки)              |
| Підходить для | Versioned software, multi-version support                           | Continuous delivery, web apps |
| Solo dev      | Overhead                                                            | Ідеально                      |

---

## 2. Крок за кроком: одна фіча від початку до кінця

### Крок 1 — Взяти задачу з Backlog

Перемісти картку з **Backlog** → **In Progress** на канбан-дошці (GitHub Projects).

**Правила:**

- WIP Limit = 1 — більше нічого не чіпаєш
- Priority визначає порядок: P0 → P1 → P2
- Issue вже має: лейбли, milestone, assignee

### Крок 2 — Створити гілку

```bash
git checkout develop
git pull origin develop
git checkout -b feature/auth-registration
```

**Назва гілки:**

| Тип                   | Формат            | Приклад                     |
| --------------------- | ----------------- | --------------------------- |
| Нова функціональність | `feature/<slug>`  | `feature/auth-registration` |
| Багфікс               | `fix/<slug>`      | `fix/auth-token-expiry`     |
| Рефакторинг           | `refactor/<slug>` | `refactor/auth-service`     |
| Документація          | `docs/<slug>`     | `docs/api-endpoints`        |

`<slug>` = lowercase, дефіси замість пробелів, без артиклів.

### Крок 3 — Реалізація по шарах (з тестуванням)

**Золоте правило:** кожен шар = код + тест одразу. Не переходиш до наступного шару, поки тест попереднього не зелений.

```
DTO → DB → Service → Controller → Page → Components
 │      │       │          │           │         │
 │      │       │          │           │         │
 ▼      ▼       ▼          ▼           ▼         ▼
EP     manual  unit       unit        smoke     exploratory
BVA    check   + mocks    + Postman   browser   browser
```

---

#### Шар 1: DTO (`packages/domain/src/<module>/`)

**Що:** DTO з `class-validator` декораторами (`@IsString`, `@IsEmail`, `@MinLength`).

**Тест:** модульний, білий ящик.

**Техніки:**

- **Equivalence Partitioning** — valid / invalid format / empty
- **Boundary Value Analysis** — `@MinLength(8)` → тестуй 7, 8, 9

**Файл:** `packages/domain/src/<module>/test/<dto>.spec.ts`

**Приклад:**

```typescript
it("should fail when password is 7 characters", async () => {
  const dto = new RegisterUserDto();
  dto.password = "short";
  await expect(validate(dto)).rejects.toThrow();
});
```

---

#### Шар 2: DB Schema (`packages/database/prisma/schema.prisma`)

**Що:** Prisma модель, зв'язки, індекси.

**Тест:** ручна перевірка.

**Чеклист:**

- [ ] `turbo db:migrate:dev` виконався без помилок
- [ ] Prisma Studio — нова таблиця/поле відображається
- [ ] Seed-скрипт оновлений (якщо потрібні тестові дані)

---

#### Шар 3: Service (`apps/api/src/<module>/<module>.service.ts`)

**Що:** бізнес-логіка в ізоляції (без реальної БД).

**Тест:** модульний, білий ящик, Jest з моками.

**Обов'язково покрити:**

- [ ] Happy path (позитивний сценарій)
- [ ] Ресурс не знайдений → `NotFoundException`
- [ ] Конфлікт (duplicate) → `ConflictException`
- [ ] Неавторизований доступ → `ForbiddenException`

**Запуск:**

```bash
pnpm --filter @fixspace/api test:watch
```

---

#### Шар 4: Controller (`apps/api/src/<module>/<module>.controller.ts`)

**Що (unit):** правильне делегування до service, HTTP-статуси.

**Що (Postman):** реальна поведінка ендпоінту через HTTP (black box).

**Техніки для Postman:**

- **Equivalence Partitioning** → valid body / missing field / wrong type
- **Error Guessing** → порожнє тіло, SQL-ін'єкції, дуже довгі рядки
- **State Transition** → create → get → update → delete

**Чеклист Postman:**

- [ ] HTTP статус відповідає (200, 201, 400, 401, 403, 404)
- [ ] Response body містить очікувані поля
- [ ] Без токена → 401
- [ ] З невалідними даними → 400 + опис помилки

---

#### Шар 5: Page (`apps/web/app/<route>/page.tsx`)

**Тест:** ручне smoke-тестування у браузері.

**Чеклист:**

- [ ] Сторінка відкривається без JS-помилок у консолі
- [ ] Дані завантажуються та відображаються коректно
- [ ] Форми надсилають запити (Network tab)
- [ ] Повідомлення про помилки відображаються
- [ ] Сторінка доступна тільки авторизованим

---

#### Шар 6: Components

**Тест:** ручне exploratory testing.

**Чеклист:**

- [ ] Компонент рендериться з мінімальними та максимальними даними
- [ ] Порожні стани (no data, loading, error)
- [ ] Адаптивність (різні розміри вікна)
- [ ] Tab-навігація, aria-attributes

---

### Крок 4 — Коміти

Кожен коміт — атомарна зміна. Формат: **Conventional Commits**.

```bash
git commit -m "feat(auth): add registration endpoint with DTO validation"
git commit -m "feat(auth): add email verification flow"
git commit -m "test(auth): add unit tests for auth service"
```

**Типи:**

| Тип        | Коли                                |
| ---------- | ----------------------------------- |
| `feat`     | нова функціональність               |
| `fix`      | багфікс                             |
| `refactor` | зміна структури без зміни поведінки |
| `chore`    | технічний борг, конфіг, deps        |
| `docs`     | документація                        |
| `test`     | тести                               |
| `ci`       | CI/CD                               |
| `style`    | форматування                        |
| `perf`     | оптимізація продуктивності          |
| `revert`   | скасування попереднього коміту      |

**Скоупи:**
`auth` · `workspace` · `database` · `property` · `record` · `view` · `template` · `content` · `formula` · `automation` · `statistics` · `settings` · `onboarding` · `notification` · `search` · `import-export` · `integration` · `section` · `api` · `web` · `deps`

**Commitlint** автоматично перевіряє. Неправильний коміт блокується:

```bash
git commit -m "fixed stuff"
# ✖ subject may not be empty [subject-empty]
# ✖ type may not be empty [type-empty]
```

### Крок 5 — Push + Pull Request

```bash
git push -u origin feature/auth-registration
gh pr create --title "feat(auth): user registration" --assignee "@me"
```

**PR автоматично отримає:**

- **Шаблон** з чеклистом тестування (`.github/pull_request_template.md`)
- **Лейбли** залежно від змінених файлів (`.github/labeler.yml`)
  - `apps/api/**/*` → `layer:api`
  - `apps/web/**/*` → `layer:web`
  - `packages/database/**/*` → `layer:db`

### Крок 6 — Definition of Done

Перевір чеклист у PR:

- [ ] Код написаний
- [ ] `turbo test` — 0 failed
- [ ] `turbo lint` — 0 errors
- [ ] Postman: ендпоінти працюють
- [ ] Postman-колекція оновлена (`docs/06-testing/postman/postman_collection.json`)
- [ ] `test-cases/<module>.md` оновлено
- [ ] RTM оновлено

### Крок 7 — Merge + Cleanup

```bash
gh pr merge --squash --delete-branch
git checkout develop
git pull origin develop
```

**Squash merge** — всі коміти фічі стають одним комітом в `develop`. Історія `develop` залишається чистою.

### Крок 8 — Move to Done

- Перемісти картку в **Done** на канбан-дошці
- Закрий Issue (автоматично через `Closes #N` в PR)

---

## 3. Завершення Milestone

Коли **всі задачі milestone** в **Done**:

```bash
# 1. Створити тег
git tag -a v0.1 -m "MVP Core: Auth + Workspace + Property + Record + View + Content"
git push origin v0.1

# 2. Запустити повний тест-сюіт
turbo test          # всі unit-тести
turbo test:e2e      # e2e тести (потребує Docker)

# 3. Оновити Postman-колекцію
# Postman → Export → Collection v2.1 → docs/06-testing/postman/postman_collection.json

# 4. Закрити milestone в GitHub
```

| Milestone               | Tag    | Що включає                                                                     |
| ----------------------- | ------ | ------------------------------------------------------------------------------ |
| v0.1 — MVP Core         | `v0.1` | Auth, Workspace, Property (12 типів), Record, View, Template, Content, Formula |
| v0.2 — Feature Complete | `v0.2` | Custom DB, Settings, Statistics, Search, CSV, Automation, Button               |
| v0.3 — Polished         | `v0.3` | Settings, Onboarding, Notification, Duplicate, Content blocks                  |
| v1.0 — Full Release     | `v1.0` | Integrations, Advanced blocks, Formula in view                                 |

---

## 3.1. Branch Protection (рекомендовано)

Для `main`:

- [ ] Require pull request before merging
- [ ] Require status checks to pass (`turbo test`, `turbo lint`)
- [ ] Require conversation resolution before merging
- [ ] Include administrators
- [ ] Allow squash merging only

Це запобігає прямому push в `develop` — тільки через PR.

---

## 3.2. CI/CD Pipeline та гілкова стратегія

_Детальний опис конвеєра CI/CD, умов запуску пайплайну та конфігурації середовищ знаходиться в [ci-cd.md](../07-deployment/ci-cd.md)._

---

## 4. Швидкий довідник

### Branch naming

| Issue Title                                   | Branch Name                   |
| --------------------------------------------- | ----------------------------- |
| User registration with email and password     | `feature/auth-registration`   |
| Table view: filter records by property values | `feature/view-filter-records` |
| Fix silent token refresh                      | `fix/auth-token-refresh`      |
| Update API documentation                      | `docs/api-endpoints`          |

### Зведена таблиця: шар → тип тесту → техніка → інструмент

| Шар                 | Тип тестування            | Техніка                   | Інструмент      |
| ------------------- | ------------------------- | ------------------------- | --------------- |
| DTO                 | Модульне (white box)      | EP, BVA                   | Jest            |
| DB Schema           | Ручна перевірка           | —                         | Prisma Studio   |
| Service             | Модульне (white box)      | EP, Error Guessing        | Jest + mocks    |
| Controller (unit)   | Модульне (white box)      | —                         | Jest + mocks    |
| Controller (manual) | Функціональне (black box) | EP, BVA, State Transition | Postman         |
| Full API            | Інтеграційне (gray box)   | State Transition          | Supertest (e2e) |
| Page                | Ручне smoke               | Exploratory               | Browser         |
| Components          | Ручне exploratory         | Error Guessing            | Browser         |

---
