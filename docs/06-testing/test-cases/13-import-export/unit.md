# Unit Tests: Import export

### [x] TC-IMP-U-001: ExportCsvUseCase.execute — NotFoundException коли база не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-029          |
| **Issue**    | #50             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `repo.findDatabaseByOwner` повертає `null`.
2. Викликати `useCase.execute("db-1", "u-1")`.

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-IMP-U-002: ExportCsvUseCase.execute — повертає CSV буфер і filename

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-029             |
| **Issue**    | #50                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. База знайдена, є властивості і записи.
2. Викликати `useCase.execute("db-1", "u-1")`.

**Очікуваний результат:**

- `result.csv` — `Buffer`, `result.filename` відповідає шаблону `*_export_YYYY-MM-DD.csv`.

---

### [x] TC-IMP-U-003: ExportCsvUseCase.execute — виключає FORMULA та RELATION властивості

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-029          |
| **Issue**    | #50             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. Властивості включають `TEXT`, `FORMULA`, `RELATION`.
2. Виконати експорт.

**Очікуваний результат:**

- CSV містить заголовок `Notes`, але не `Formula` і не `Relation`.

---

### [x] TC-IMP-U-004: ExportCsvUseCase.execute — фільтрує за propertyIds коли передано

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-029             |
| **Issue**    | #50                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Передати `{ propertyIds: ["p-text"] }`.

**Очікуваний результат:**

- CSV містить лише стовпець `Notes`.

---

### [x] TC-IMP-U-005: ExportCsvUseCase.execute — включає мета-поля (Name, Created At, Updated At) за замовчуванням

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-029             |
| **Issue**    | #50                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Виконати експорт без `includeMetaFields`.

**Очікуваний результат:**

- CSV заголовок містить `Name`, `Created At`, `Updated At`.

---

### [x] TC-IMP-U-006: ExportCsvUseCase.execute — прибирає мета-поля коли includeMetaFields=false

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-029          |
| **Issue**    | #50             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Кроки:**

1. Передати `{ includeMetaFields: false }`.

**Очікуваний результат:**

- CSV не містить `Created At`, `Updated At`.

---

### [x] TC-IMP-U-007: ExportCsvUseCase.execute — надсилає INFO сповіщення після експорту

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-029             |
| **Issue**    | #50                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Виконати успішний експорт.

**Очікуваний результат:**

- `notificationService.create` викликається з `NotificationType.INFO`.
