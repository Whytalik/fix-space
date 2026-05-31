# Feature: <Назва фічі>

## GitHub Issues

- **Issue:** #N — [Назва issue](https://github.com/Whytalik/fix-space/issues/N)
- **Branch:** `feature/<slug>`
- **Milestone:** vX.X
- **Priority:** P0 / P1 / P2

---

## User Stories & Критерії приймання (Acceptance Criteria)

> [!TIP]
> Кожен критерії приймання (Acceptance Criteria) бажано зв'язувати із відповідним тест-кейсом з папки `docs/06-testing/test-cases/` для кращої простежуваності (traceability) покриття вимог тестами.

**US-XXX** · [Назва історії]

> Як [роль], я хочу [дія], щоб [ціль].

- [ ] **Given** [початковий стан], **When** [дія користувача], **Then** [результат]. · _Тест-кейс: [TC-MOD-001](../../06-testing/test-cases/module.md#tc-mod-001-назва-тесту)_
- [ ] ...

---

## Ключові бізнес-правила

> З `docs/02-requirements/functional.md` §X.X — найважливіші правила логіки.

- [Правило 1]
- [Правило 2]

---

## Підзадачі

- [ ] **Шар 1 (DTO):** Створити DTO `packages/domain/src/<module>/dto/...`
- [ ] **Шар 2 (DB Schema):** Додати моделі в `packages/database/prisma/schema.prisma`
- [ ] **Шар 3 (Service / UseCase):** Реалізувати логіку в `apps/api/src/<module>/...`
- [ ] **Шар 4 (Controller):** Створити ендпоінти в `apps/api/src/<module>/...`
- [ ] **Шар 5 (Page):** Додати сторінку в `apps/web/src/app/[locale]/...`
- [ ] **Шар 6 (Components):** Додати компоненти в `apps/web/.../_components/...`
- [ ] **Шар 7 (E2E Testing):** Додати Playwright тести в `apps/web/e2e/...`
- [ ] **Docs & Testing:** Оновити тест-кейси [test-cases/\<module\>.md](../../06-testing/test-cases/) та Postman-колекцію.

---

## Технічний дизайн за шарами

### 1. Шар DTO & Валідація

- [ ] `packages/domain/src/<module>/dto/<name>.dto.ts` — [Призначення DTO].
  - [ ] **Ключові поля:** `поле` (тип, валідація), `поле` (тип, валідація).

### 2. Шар DB Schema

- [ ] **Моделі:** [Опис нових моделей та зв'язків у schema.prisma].

```prisma
// Короткий опис або фрагмент схеми
```

### 3. Шар Service & Controller (API)

- [ ] **Service:** `apps/api/src/<module>/...` — [Ключові методи сервісу та бізнес-логіка].
- [ ] **Controller:** `apps/api/src/<module>/...`
  - [ ] `[HTTP_METHOD] /endpoint` (Public / Auth) — [Опис ендпоінту].

### 4. Шар Pages & Components (Web)

- [ ] **Pages:** `apps/web/src/app/[locale]/...` — [Опис сторінки та її призначення].
- [ ] **Components:** `apps/web/.../_components/...` — [Опис компонентів та їхніх станів].

### 5. Шар E2E тестування (Web)

- [ ] **Сценарії (apps/web/e2e/<name>.spec.ts):** [Опис ключових сценаріїв користувача для автоматизації].

### 6. Документація API (Swagger & Postman)

- [ ] **Swagger (OpenAPI):** Ендпоінти декоровані для автоматичної генерації схем та описів у `/api/docs`.
- [ ] **Postman:** Сценарії запитів (валідація, успіх, помилки) додано та оновлено в колекції `docs/06-testing/postman/postman_collection.json`.

---

## Коміти

Формат: **Conventional Commits** з точним порядком розробки по шарах:

```bash
# 1. Схема БД та міграція
chore(db): add <Model> model and migration
# 2. DTO (домен)
feat(domain/<scope>): add <Name>Dto
# 3. Бізнес-логіка (API)
feat(api/<scope>): add <Module>Service.<method>
# 4. Тести бізнес-логіки
test(api/<scope>): add <module>.service spec
# 5. Ендпоінти (API)
feat(api/<scope>): add <HTTP_METHOD> /<endpoint> endpoint
# 6. Клієнтська логіка та сторінки (Web)
feat(web/<scope>): add <page/component>
# 7. E2E Тести (Web)
test(web/e2e): add <scope> playwright flows
# 8. Документація та тести
docs(<scope>): update test-cases, RTM, and Postman collection
```

---

## Definition of Done

- [ ] DTO написаний і валідація протестована.
- [ ] DB міграція застосована та перевірена в Prisma Studio.
- [ ] Service/UseCase написаний і протестований unit-тестами.
- [ ] Controller написаний і протестований, ендпоінти перевірені в Postman (колекція оновлена).
- [ ] UI-сторінки та компоненти перевірені (smoke + exploratory).
- [ ] E2E сценарії в Playwright проходять успішно для всіх підтримуваних браузерів.
- [ ] `turbo lint`, `turbo test`, `turbo test:e2e`, `turbo build` виконуються без помилок.
- [ ] Тест-кейси [test-cases/\<module\>.md](../../06-testing/test-cases/) актуалізовані.
- [ ] Матриця трасабельності вимог (RTM) оновлена.
