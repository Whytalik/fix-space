# End-to-End Development Workflow

Цей документ — **єдина точка входу** для розуміння повного процесу розробки FIX Space.
Він об'єднує методологію, Git-воркфлоу, розробку по шарах та тестування в один послідовний процес.

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

### Типові помилки

| Помилка                             | Наслідок                              | Як уникнути                                 |
| ----------------------------------- | ------------------------------------- | ------------------------------------------- |
| Тест тільки happy path              | Не виявляються edge cases             | Мінімум 3 кейси: positive/negative/boundary |
| Мокуєш те що тестуєш                | Тест завжди зелений, але код зламаний | Mock тільки зовнішні залежності             |
| Не оновлюєш Postman після зміни API | Колекція не відповідає коду           | Оновлення як частина DoD                    |
| Тестуєш тільки unit, ігноруєш e2e   | Модулі працюють окремо, але не разом  | `turbo test:e2e` після кожної фічі          |
| Кілька задач в In Progress          | Контекст-свічінг, затримки            | WIP Limit = 1 — суворо                      |

---

## 5. Claude Code Skills — де і коли задіювати

Кожна фіча проходить через такий набір CLI-команд. Порядок фіксований.

### Повна схема

```
Issue
  └─ /feature-guide <назва>      → docs/05-development/features/<slug>.md
       └─ git checkout -b feature/<name>
            └─ (реалізація шар за шаром — розділ 2)
                 └─ /analyse-changes     → впорядковані коміти з timestamps
                      └─ /check-release  → перевірка артефактів перед PR
                           └─ PR (squash merge → develop)
```

### Таблиця skills

| Коли                                     | Команда                                                | Що робить                                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Перед стартом будь-якої фічі**         | `/feature-guide <назва>`                               | Читає functional.md + architecture + існуючий код → генерує `docs/05-development/features/<slug>.md` з бізнес-правилами, DTO-специфікацією, тест-кейсами та commit messages |
| Перед будь-яким DTO у `packages/domain/` | Попросити Claude прочитати `check-domain`              | Перевіряє правила домен-пакету перед написанням                                                                                                                             |
| Перед будь-яким `.tsx` компонентом       | Попросити Claude прочитати `web-component-conventions` | Конвенції іменування, структури, стилів                                                                                                                                     |
| Перед ручним комітом                     | `/git-rules`                                           | Формат Conventional Commits + naming гілок                                                                                                                                  |
| **Коли всі шари готові**                 | `/analyse-changes`                                     | Читає всі змінені файли, групує в логічні коміти, розраховує timestamps за weighted-алгоритмом                                                                              |
| **Перед відкриттям PR**                  | `/check-release`                                       | Postman актуальний, test-cases оновлені, RTM не застарілий, жодного `console.log`, git format валідний                                                                      |

### Хуки (автоматично, не треба запускати вручну)

| Подія                        | Що відбувається                                                     |
| ---------------------------- | ------------------------------------------------------------------- |
| Edit будь-якого `.ts`/`.tsx` | `turbo lint` для відповідного пакету                                |
| Edit у `apps/web/**/*.ts(x)` | `pnpm check-types`                                                  |
| Edit у `packages/domain/**`  | Нагадування збілдити домен (`pnpm --filter @fixspace/domain build`) |
| Edit контролера або DTO      | Нагадування оновити Postman-колекцію                                |
| `git commit`                 | Guard блокує коміт якщо формат не Conventional Commits              |

### Порядок комітів (з `/analyse-changes`)

```
1. chore(db): ...          ← схема, міграції, deps
2. feat(domain/<m>): ...   ← DTO
3. feat(api/<m>): ...      ← NestJS service / controller / usecase
4. test(api/<m>): ...      ← spec файли
5. feat(web/<area>): ...   ← page + components
6. docs: ...               ← test-cases, RTM, Postman
```

---

## 7. Карта документації

| Документ                   | Для чого                                  | Коли читати                   |
| -------------------------- | ----------------------------------------- | ----------------------------- |
| **WORKFLOW.md** (цей файл) | Єдиний енд-ту-енд процес                  | Завжди — точка входу          |
| **METHODOLOGY.md**         | Теорія PMBoK 7 + Personal Kanban          | Для розуміння "чому так"      |
| **GIT-WORKFLOW.md**        | Детальний Git + Conventional Commits      | Перед роботою з гілками       |
| **feature-testing.md**     | Детальне тестування по шарах з прикладами | Під час написання тестів      |
| **overview.md**            | Теорія тестування (ISTQB)                 | Для диплома / розуміння основ |
| **strategy.md**            | План тестування всього проекту            | Перед початком тестування     |

---

## 8. Повний цикл однієї фічі (шпаргалка)

```bash
# 1. Взяти задачу → In Progress (Kanban)

# 2. Гілка
git checkout develop && git pull
git checkout -b feature/auth-registration

# 3. Реалізація по шарах (кожен шар = код + тест)
#    DTO  → DB  → Service  → Controller  → Page  → Components
#    EP   → check → unit   → unit+Postman → smoke → exploratory

# 4. Коміти (Conventional Commits)
git add .
git commit -m "feat(auth): add registration endpoint"
git commit -m "test(auth): add unit tests"

# 5. Push + PR
git push -u origin feature/auth-registration
gh pr create --title "feat(auth): user registration" \
  --label "feature,mod:auth,layer:api,layer:web" \
  --milestone "MVP Core"

# 6. DoD check → Merge
gh pr merge --squash --delete-branch

# 7. Cleanup
git checkout develop && git pull

# 8. Issue → Done, картка → Done
```
