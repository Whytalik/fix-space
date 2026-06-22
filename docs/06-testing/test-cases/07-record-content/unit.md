# Unit Tests: Record content

### [x] TC-CONT-U-001: RecordContentService.uploadImage — завантажує зображення та повертає URL

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-015             |
| **Issue**    | #24                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. `storageService.saveContentImage` повертає URL.
2. Викликати `service.uploadImage("r-1", file)`.

**Очікуваний результат:**

- `result.url` дорівнює збереженому URL.

---

### [x] TC-CONT-U-002: RecordContentService.findByRecordId — повертає порожній контент коли немає записів

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-014          |
| **Issue**    | #23             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `recordContentRepo.findByRecordId` повертає `null`.
2. Викликати `service.findByRecordId("r-1")`.

**Очікуваний результат:**

- `result.recordId === "r-1"`, `result.content === { rows: [] }`.

---

### [x] TC-CONT-U-003: RecordContentService.findByRecordId — повертає існуючий контент

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-014             |
| **Issue**    | #23                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `findByRecordId` повертає існуючу сутність.
2. Викликати `service.findByRecordId("r-1")`.

**Очікуваний результат:**

- `result.id === "rc-1"`.

---

### [x] TC-CONT-U-004: RecordContentService.update — створює контент і знімок коли немає існуючого

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-085          |
| **Issue**    | #112            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `findByRecordId` повертає `null` (перший виклик).
2. Викликати `service.update("r-1", { content: { rows: [] } })`.

**Очікуваний результат:**

- `recordContentRepo.create` викликається.
- `recordContentRepo.createSnapshot` викликається.

---

### [x] TC-CONT-U-005: RecordContentService.update — оновлює і створює знімок після 5-хвилинного інтервалу

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-085                  |
| **Issue**    | #112                    |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P1                      |

**Кроки:**

1. Останній знімок був 10 хвилин тому.
2. Викликати `service.update("r-1", { content: { rows: [] } })`.

**Очікуваний результат:**

- `createSnapshot` викликається.

---

### [x] TC-CONT-U-006: RecordContentService.update — не створює знімок в межах 5-хвилинного інтервалу

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-085                  |
| **Issue**    | #112                    |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P1                      |

**Кроки:**

1. Останній знімок був 1 хвилину тому.
2. Викликати `service.update("r-1", { content: { rows: [] } })`.

**Очікуваний результат:**

- `createSnapshot` не викликається.

---

### [x] TC-CONT-U-007: RecordContentService.update — видаляє найстаріший знімок коли досягнуто ліміт 50

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-085                  |
| **Issue**    | #112                    |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P1                      |

**Кроки:**

1. `countSnapshots` повертає `50`.
2. Викликати `service.update` з контентом при умові що останній знімок > 5 хв.

**Очікуваний результат:**

- `deleteOldestSnapshot` викликається перед `createSnapshot`.

---

### [x] TC-CONT-U-008: RecordContentService.update — примусово створює знімок при forceSnapshot=true

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-085          |
| **Issue**    | #112            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Кроки:**

1. Останній знімок 1 хвилину тому.
2. Викликати `service.update("r-1", { content: ..., forceSnapshot: true })`.

**Очікуваний результат:**

- `createSnapshot` викликається попри короткий інтервал.

---

### [x] TC-CONT-U-009: RecordContentService.getSnapshots — повертає порожній масив коли немає контенту

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-085          |
| **Issue**    | #112            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Кроки:**

1. `findByRecordId` повертає `null`.
2. Викликати `service.getSnapshots("r-1")`.

**Очікуваний результат:**

- `[]`.

---

### [x] TC-CONT-U-010: RecordContentService.getSnapshots — повертає список знімків

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-085             |
| **Issue**    | #112               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. `findByRecordId` повертає контент, `findSnapshotsByContentId` повертає масив з одним знімком.
2. Викликати `service.getSnapshots("r-1")`.

**Очікуваний результат:**

- `result.length === 1`, `result[0].id === "s-1"`.

---

### [x] TC-CONT-U-011: RecordContentService.restoreFromSnapshot — NotFoundException коли знімок не знайдено

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-085          |
| **Issue**    | #112            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `findSnapshotById` повертає `null`.
2. Викликати `service.restoreFromSnapshot("r-1", "s-999")`.

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-CONT-U-012: RecordContentService.restoreFromSnapshot — NotFoundException коли контент запису не знайдено

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-085          |
| **Issue**    | #112            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. Знімок знайдено, але `findByRecordId` повертає `null`.

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-CONT-U-013: RecordContentService.restoreFromSnapshot — NotFoundException коли знімок належить іншому контенту

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-085          |
| **Issue**    | #112            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `snapshot.recordContentId !== recordContent.id`.

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-CONT-U-014: RecordContentService.restoreFromSnapshot — відновлює контент зі знімка

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-085             |
| **Issue**    | #112               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Знімок та контент знайдено, `recordContentId` збігається.
2. Викликати `service.restoreFromSnapshot("r-1", "s-1")`.

**Очікуваний результат:**

- `update` викликається з контентом знімка.
- Новий знімок стану створюється.
