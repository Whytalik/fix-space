# Приклад реалізації фічі: Управління секціями

Покроковий приклад застосування [workflow.md](./workflow.md) до конкретної вимоги з [functional.md](../02-requirements/functional.md).

**Вимога:** §3 — Секції (create / rename / delete)
**Issue:** `feat: section management — create, rename, reorder, delete`
**Milestone:** `v0.1 — MVP Core`
**Branch:** `feature/section-management`

---

## Крок 1 — Взяти задачу з Backlog

Переміщуємо картку **Backlog → In Progress** на Kanban-дошці (GitHub Projects).

- WIP Limit = 1: більше нічого не чіпаємо
- Issue має: label `feature`, milestone `v0.1`, assignee

---

## Крок 2 — Створити гілку

```bash
git checkout develop
git pull origin develop
git checkout -b feature/section-management
```

---

## Крок 3 — Реалізація по шарах

### Шар 1: DTO

**Вимога → DTO:** секція має назву (обов'язково), іконку та колір (опціонально).

```typescript
// packages/domain/src/section/create-section.dto.ts
export class CreateSectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
```

**Тести (EP + BVA):**

```typescript
// packages/domain/src/section/test/create-section.dto.spec.ts
describe("CreateSectionDto", () => {
  it("validates valid name"); // ✓ happy path
  it("fails when name is empty string"); // BVA: 0 символів
  it("fails when name exceeds 50 characters"); // BVA: 51 символ
  it("passes when name is exactly 50 characters"); // BVA: 50 символів
  it("passes when icon and color are omitted"); // опціональні поля
  it("passes when icon and color are provided"); // повний об'єкт
});
```

---

### Шар 2: DB Schema

Модель вже визначена в `schema.prisma`:

```prisma
model Section {
  id        String     @id @default(uuid())
  spaceId   String
  name      String
  icon      String?
  color     String?
  position  Int
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  space     Space      @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  databases Database[] // onDelete: SetNull — ключове бізнес-правило §3
}
```

**Ручна перевірка:**

- [x] `turbo db:migrate:dev` виконався без помилок
- [x] Prisma Studio — таблиця `Section` відображається
- [x] Поле `sectionId` у `Database` — nullable (дозволяє SetNull)

---

### Шар 3: Service

**Ключове бізнес-правило з §3:** видалення секції не видаляє бази — їх `sectionId` стає `null`.
Це реалізується автоматично через `onDelete: SetNull` у схемі Prisma, але **тест має це підтвердити явно**.

```typescript
// apps/api/src/space/providers/section.service.ts
async createSection(spaceId: string, userId: string, dto: CreateSectionDto) {
  const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
  if (!space) throw new NotFoundException('Space not found');
  if (space.ownerId !== userId) throw new ForbiddenException();

  const existing = await this.prisma.section.findFirst({
    where: { spaceId, name: dto.name },
  });
  if (existing) throw new ConflictException('Section name already exists in this space');

  const count = await this.prisma.section.count({ where: { spaceId } });
  return this.prisma.section.create({
    data: { ...dto, spaceId, position: count },
  });
}

async deleteSection(id: string, userId: string) {
  const section = await this.prisma.section.findUnique({
    where: { id },
    include: { space: true },
  });
  if (!section) throw new NotFoundException();
  if (section.space.ownerId !== userId) throw new ForbiddenException();

  return this.prisma.section.delete({ where: { id } });
  // Prisma (SetNull) автоматично встановлює sectionId = null для всіх баз секції
}
```

**Тести (unit, white box, Jest + mocks):**

| Сценарій                                | Очікуваний результат                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Валідні дані                            | Секція створена, `position = кількість існуючих`                                      |
| Space не існує                          | `NotFoundException`                                                                   |
| Інший власник                           | `ForbiddenException`                                                                  |
| Дублікат назви в просторі               | `ConflictException`                                                                   |
| Видалення секції                        | Секція видалена; `prisma.database.updateMany` НЕ викликається (SetNull — на рівні БД) |
| **Ключовий тест:** бази після видалення | `sectionId` стає `null`; самі бази існують                                            |

```typescript
// apps/api/src/space/test/section.service.spec.ts
it("should set sectionId to null on databases after section delete", async () => {
  // Arrange: section with 2 databases
  // Act: deleteSection()
  // Assert: databases still exist, sectionId === null
});
```

---

### Шар 4: Controller

Операції з секціями проходять через `PATCH /spaces/:id` з тілом `SectionOperationDto` (тип операції + payload).

**Postman — чеклист (black box, EP + State Transition):**

| Запит                                               | Очікуваний статус | Перевірка                                               |
| --------------------------------------------------- | ----------------- | ------------------------------------------------------- |
| `PATCH /spaces/:id` — createSection, валідна назва  | `200`             | Секція є у відповіді                                    |
| `PATCH /spaces/:id` — createSection, порожня назва  | `400`             | Повідомлення про помилку                                |
| `PATCH /spaces/:id` — createSection, дублікат назви | `409`             | —                                                       |
| `PATCH /spaces/:id` — deleteSection                 | `200`             | Секції нема; бази простору присутні з `sectionId: null` |
| Будь-який запит без токена                          | `401`             | —                                                       |
| Запит з токеном іншого користувача                  | `403`             | —                                                       |

**State Transition: секція §3**

```
[неіснує] ──createSection──▶ [активна] ──deleteSection──▶ [видалена]
                                  │                              │
                             rename/reorder               бази: sectionId=null
```

---

### Шар 5: Page

Секції відображаються у сайдбарі.

**Smoke-тестування у браузері:**

- [x] Сайдбар відкривається без помилок у консолі
- [x] Нова секція з'являється одразу після створення (оптимістичне оновлення)
- [x] Після видалення секції: самі бази залишаються у сайдбарі в зоні "без секції"
- [x] Сторінка недоступна без авторизації (редирект на `/login`)

---

### Шар 6: Components

`SectionItem` — елемент сайдбару для однієї секції.

**Exploratory testing:**

- [x] Рендериться без іконки/кольору (дефолтний вигляд)
- [x] Рендериться з іконкою та кольором акценту
- [x] Згортання/розгортання: стан зберігається при перезавантаженні (Settings)
- [x] Порожня секція (без баз) — empty state відображається
- [x] Tab-навігація та aria-label на кнопці згортання

---

## Крок 4 — Коміти

```bash
git commit -m "feat(section): add CreateSectionDto and UpdateSectionDto"
git commit -m "test(section): add DTO boundary value tests"
git commit -m "feat(section): add section service with create/rename/delete"
git commit -m "test(section): add unit tests including SetNull business rule"
git commit -m "feat(section): add section operation handling in space controller"
git commit -m "test(section): add controller unit tests"
git commit -m "feat(web/sidebar): add SectionItem with collapse and drag support"
```

---

## Крок 5 — Push + Pull Request

```bash
git push -u origin feature/section-management

gh pr create \
  --title "feat(section): section management — create, rename, reorder, delete" \
  --label "feature,mod:section,layer:api,layer:web" \
  --milestone "v0.1 MVP Core"
```

PR автоматично отримає шаблон із чеклистом і лейбли `layer:api`, `layer:web` від labeler.

---

## Крок 6 — Definition of Done

- [x] Код написаний по всіх шарах
- [x] `turbo test` — 0 failed
- [x] `turbo lint` — 0 errors
- [x] **Ключове бізнес-правило підтверджено тестом:** видалення секції → бази залишаються з `sectionId = null`
- [x] Postman: всі операції з секціями пройшли
- [x] Postman-колекція оновлена (`docs/06-testing/postman/postman_collection.json`)
- [x] `docs/06-testing/test-cases/section.md` оновлено
- [x] RTM оновлено

---

## Крок 7 — Merge + Cleanup

```bash
gh pr merge --squash --delete-branch
git checkout develop && git pull
```

---

## Крок 8 — Move to Done

- Картка → **Done** на канбан-дошці
- Issue закривається автоматично через `Closes #N` у тілі PR

---

## Підсумок: вимога → тест

| Вимога (§3)                                         | Де покрито                         |
| --------------------------------------------------- | ---------------------------------- |
| Створення секції (назва обов'язкова, 1–50 символів) | DTO: BVA тести на межах            |
| Унікальність назви в просторі                       | Service: `ConflictException` тест  |
| Ізоляція власника                                   | Service: `ForbiddenException` тест |
| **Видалення → `sectionId` баз стає `null`**         | Service: явний тест SetNull        |
| Видалення → 200, бази існують                       | Postman: State Transition          |
| Сесійний стан згортання                             | Components: localStorage перевірка |
