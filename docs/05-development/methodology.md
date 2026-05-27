# Методологія: Hybrid PMBoK 7 — Predictive Planning + Personal Kanban

Проект FIX Space використовує гібридну методологію:

- **Predictive фаза** — повне планування до старту розробки (SRS, архітектура, тест-стратегія)
- **Adaptive фаза** — ітераційне виконання через Personal Kanban

---

## Теорія: ключові поняття

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

DoD для FIX Space:

- [ ] Реалізовано (код написаний)
- [ ] Unit-тести зелені (`turbo test`)
- [ ] Перевірено в Postman
- [ ] Postman-колекція оновлена
- [ ] `test-cases/<module>.md` оновлено

### Канбан-дошка

Візуальне відображення стану роботи. Мінімальна структура для solo dev:

```
Backlog → In Progress → Done
```

Задача рухається зліва направо. В "In Progress" одночасно максимум 1 задача (WIP limit).

---

## Приклад: фіча "Створення Space" від початку до кінця

### Крок 1 — Задача у Backlog

У GitHub Issues створюєш Issue:

```
Title: feat(space): create space endpoint
Labels: feature, v0.1
Milestone: v0.1 MVP
```

Дошка виглядає так:

```
Backlog              In Progress    Done
───────────────      ───────────    ────
Створення Space  ←
Редагування Space
Видалення Space
```

---

### Крок 2 — Беремо в роботу

Переміщуєш картку в "In Progress". Більше нічого не чіпаєш.

```
Backlog              In Progress         Done
───────────────      ────────────────    ────
Редагування Space    Створення Space ←
Видалення Space
```

---

### Крок 3 — Виконання по шарах

```
1. DTO
   packages/domain/src/space/dto/create-space.dto.ts
   → @IsString(), @MinLength(1), @MaxLength(50)

2. DB
   packages/database/prisma/schema.prisma
   → model Space { ... }
   → turbo db:migrate:dev

3. Service
   apps/api/src/space/space.service.ts → createSpace()
   apps/api/src/space/test/space.service.spec.ts → unit-тест ✓

4. Controller
   apps/api/src/space/space.controller.ts → POST /spaces
   apps/api/src/space/test/space.controller.spec.ts → unit-тест ✓
   → перевірити в Postman: POST http://localhost:3000/spaces

5. UI
   apps/web/app/spaces/page.tsx
   → smoke-тест у браузері ✓
```

---

### Крок 4 — Definition of Done

Перевіряєш чеклист:

- [x] Код написаний
- [x] `turbo test` — 0 failed
- [x] Postman: POST /spaces → 201 ✓
- [x] Колекція експортована в `docs/06-testing/postman/postman_collection.json`
- [x] `docs/06-testing/test-cases/02-workspace.md` — додано TC-WS-001, TC-WS-002

---

### Крок 5 — Done

Закриваєш Issue, картка переїжджає в Done.

```
Backlog              In Progress    Done
───────────────      ───────────    ──────────────────
Редагування Space    —              Створення Space ✓
Видалення Space
```

Беремо наступну задачу з Backlog.

---

### Крок 6 — Milestone закривається

Коли всі задачі v0.1 в Done:

```
v0.1 MVP — 100% ██████████
  ✓ Створення Space
  ✓ Редагування Space
  ✓ Видалення Space
  ✓ Дублювання Space
```

```bash
git tag v0.1
turbo test        # всі тести зелені
turbo test:e2e    # e2e зелені
```

---

## Інструменти та налаштування

Детальний гайд: `development/tools-setup.md`
