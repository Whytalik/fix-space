# Unit Tests: Properties

### [ ] TC-PROP-U-001: TextHandler — validateValue та convertFrom

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `validateValue(null)` — рядок `null`
2. `validateValue("hello")` — валідний рядок
3. `convertFrom("  spaces  ")` — обрізка пробілів
4. `isEmpty(null)` та `isEmpty("")`

**Очікуваний результат:**

- `validateValue(null)` → valid (null дозволений)
- `convertFrom("  spaces  ")` → `"spaces"`
- `isEmpty(null)` → `true`, `isEmpty("")` → `true`, `isEmpty("x")` → `false`

---

---

### [ ] TC-PROP-U-002: NumberHandler — validateConfig формати та конвертація

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-010         |
| **Issue**    | #61            |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. `validateConfig({ format: "currency", decimalPlaces: 2 })` — валідний
2. `validateConfig({ format: "unknown" })` — невалідний формат
3. `validateConfig({ decimalPlaces: -1 })` — від'ємне значення
4. `convertFrom("3.14")` — рядок у число

**Очікуваний результат:**

- Валідний конфіг → без помилок
- `format: "unknown"` → помилка валідації
- `decimalPlaces: -1` → помилка валідації
- `convertFrom("3.14")` → `3.14` (number)

---

---

### [ ] TC-PROP-U-003: DateHandler — validateValue ISO 8601 та convertFrom

| Поле         | Значення          |
| ------------ | ----------------- |
| **US**       | US-010            |
| **Issue**    | #62               |
| **TS**       | —                 |
| **Метод**    | Unit (Jest)       |
| **Техніка**  | Equivalence Part. |
| **Priority** | P1                |

**Кроки:**

1. `validateValue("2024-01-15")` — валідна дата
2. `validateValue("not-a-date")` — невалідна
3. `validateValue(null)` — null дозволений
4. `convertFrom("2024-01-15T10:00:00Z")` → ISO рядок

**Очікуваний результат:**

- Валідна ISO дата → valid
- `"not-a-date"` → помилка
- `null` → valid (nullable)

---

---

### [ ] TC-PROP-U-004: CheckboxHandler — boolean семантика та isNull

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #63                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `validateValue(true)` та `validateValue(false)`
2. `validateValue(null)` — null як "не відмічено"
3. `isEmpty(null)` — семантика

**Очікуваний результат:**

- `true` та `false` → valid
- `null` → valid (інтерпретується як `false`)
- `isEmpty(null)` → `false` (null — це валідний unchecked стан)

---

---

### [ ] TC-PROP-U-005: SelectHandler — validateConfig options та filter operators

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #65             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `validateConfig({ options: [{ id: "1", label: "A" }] })` — валідний
2. `validateConfig({ options: [] })` — порожній список
3. `getFilterOperators()` — перевірити наявність IN та NOT_IN

**Очікуваний результат:**

- Конфіг з options → valid
- `getFilterOperators()` містить `FilterOperator.IN` та `FilterOperator.NOT_IN`

---

---

### [ ] TC-PROP-U-006: StatusHandler — три категорії та validateConfig

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #66                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `validateConfig` з опціями категорій `todo`, `in_progress`, `complete`
2. `validateConfig` без обов'язкової категорії → помилка
3. `getFilterOperators()` — наявність IN/NOT_IN

**Очікуваний результат:**

- Всі 3 категорії → valid
- Відсутня категорія → помилка валідації

---

---

### [ ] TC-PROP-U-007: RelationHandler — validateConfig relatedEntityId

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #67                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `validateConfig({ relatedEntityId: "uuid-123" })` — валідний
2. `validateConfig({})` — відсутній `relatedEntityId`
3. `getFilterOperators()` — наявність IN/NOT_IN

**Очікуваний результат:**

- З `relatedEntityId` → valid
- Без `relatedEntityId` → помилка (обов'язкове поле)

---

---

### [ ] TC-PROP-U-008: RatingHandler — maxStars межі та validateValue

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-010         |
| **Issue**    | #68            |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. `validateConfig({ maxStars: 5 })` — валідний
2. `validateConfig({ maxStars: 0 })` та `validateConfig({ maxStars: 11 })` — межі
3. `validateValue(3)` при `maxStars: 5` — в діапазоні
4. `validateValue(6)` при `maxStars: 5` — поза діапазоном

**Очікуваний результат:**

- `maxStars: 0` → помилка; `maxStars: 11` → помилка
- `validateValue(6)` при `maxStars: 5` → помилка

---

---

### [ ] TC-PROP-U-009: ProgressHandler — min, max, step та validateValue

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-010         |
| **Issue**    | #69            |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. `validateConfig({ min: 0, max: 100, step: 1 })` — валідний
2. `validateConfig({ min: 50, max: 10 })` — min > max
3. `validateValue(50)` в діапазоні `[0, 100]` → valid
4. `validateValue(101)` → поза діапазоном

**Очікуваний результат:**

- `min > max` → помилка
- `validateValue(101)` при `max: 100` → помилка

---

---

### [ ] TC-PROP-U-010: DurationHandler — секунди як ціле число

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #64                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `validateValue(3600)` — ціле число секунд
2. `validateValue(3.5)` — дробове → помилка
3. `validateValue(-1)` — від'ємне → помилка
4. `convertFrom("3600")` — рядок → number

**Очікуваний результат:**

- `3600` → valid; `3.5` та `-1` → помилка
- `convertFrom("3600")` → `3600` (integer)

---

---

### [ ] TC-PROP-U-011: FormulaHandler — read-only stub

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `validateValue(<будь-яке значення>)` — завжди valid (computed поле)
2. `isEmpty(<будь-яке значення>)` — завжди `false`

**Очікуваний результат:**

- `validateValue` не кидає помилок для жодного вхідного значення
- `isEmpty` → `false` (формула завжди вважається заповненою)

---

---

### [ ] TC-PROP-U-013: PropertyTypeRegistry — резолвить коректний хендлер для кожного типу

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Для кожного з 11 типів викликати `registry.getHandler(type)`
2. Перевірити що повернений об'єкт є інстансом відповідного Handler-класу
3. `registry.getHandler("UNKNOWN")` → `NotFoundException`

**Очікуваний результат:**

- `PropertyType.TEXT` → `TextHandler`, ..., `PropertyType.PROGRESS` → `ProgressHandler`
- Невідомий тип → `NotFoundException`

---

---

---

### [ ] TC-PROP-U-014: PropertyService.create — Створення властивості з правильними параметрами

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-011             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати `PropertyService.create()` з валідними параметрами.
2. Перевірити, що `PropertyRepository.create` викликається з правильними аргументами.
3. Перевірити повернення `PropertyResponseDto`.

**Очікуваний результат:**

- Властивість успішно створена та повернуто DTO.

---

---

### [ ] TC-PROP-U-015: PropertyService.findOne — Помилка у разі відсутності властивості

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | —               |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. Налаштувати `PropertyRepository.findOne` так, щоб він повертав `null`.
2. Викликати `PropertyService.findOne(id)`.
3. Перевірити, що викидається `NotFoundException`.

**Очікуваний результат:**

- Виклик призводить до викидання `NotFoundException`.

---

---

### [ ] TC-PROP-U-016: PropertyService — Відкат транзакції при виникненні помилки

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-011             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Налаштувати мок репозиторію або Prisma клієнта на успішне виконання першої частини транзакції (наприклад, створення запису).
2. Налаштувати мок репозиторію так, щоб наступний крок транзакції або супутня дія викликали виняток/помилку.
3. Викликати відповідний метод сервісу/usecase в транзакції.
4. Перевірити, що всі зміни, виконані в межах транзакції, відкочуються і помилка прокидається вище.

**Очікуваний результат:**

- Транзакція відміняється (rollback).
- Жодні проміжні зміни не зберігаються в базі даних.
- Метод прокидає відповідну помилку.

---

---

### [ ] TC-PROP-U-017: PropertyService — Обмеження доступу до ресурсу, який не належить користувачу

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | —               |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. Налаштувати мок репозиторію для повернення ресурсу, де `ownerId` відрізняється від ID поточного користувача.
2. Викликати метод сервісу для доступу або модифікації цього ресурсу від імені поточного користувача.
3. Перевірити, що метод викидає `ForbiddenException`.

**Очікуваний результат:**

- Метод повертає `ForbiddenException` та не виконує операцію.

---

---

### [ ] TC-PROP-U-018: PropertyService — Обробка помилки дублювання унікальних полів

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-011         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Error Guessing |
| **Priority** | P1             |

**Кроки:**

1. Налаштувати мок репозиторію для імітації порушення унікального обмеження у БД (наприклад, унікального імені чи email).
2. Викликати відповідний метод створення або оновлення сервісу.
3. Перевірити, що метод перехоплює помилку репозиторію та викидає `ConflictException`.

**Очікуваний результат:**

- Метод повертає `ConflictException` із повідомленням про помилку дублювання.
