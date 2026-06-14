# Unit Tests: Records

### [x] TC-PROPVAL-U-001: PropertyValueService.create — NotFoundException коли запис не знайдено

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. `recordRepo.findByIdWithOwner` повертає `null`.
2. Викликати `service.create("r-1", { propertyId: "p-1", value: "x" }, "u-1")`.

**Очікуваний результат:**

- Викидається `NotFoundException`.
- `propertyRepo.findById` не викликається.

---

### [x] TC-PROPVAL-U-002: PropertyValueService.create — NotFoundException коли властивість не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException` коли `propertyRepo.findById` повертає `null`.

---

### [x] TC-PROPVAL-U-003: PropertyValueService.create — ConflictException коли властивість з іншої бази

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ConflictException` коли `property.databaseId !== record.databaseId`.

---

### [x] TC-PROPVAL-U-004: PropertyValueService.create — BadRequestException коли значення невалідне

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `BadRequestException` коли `handler.validateValue` повертає помилки.

---

### [x] TC-PROPVAL-U-005: PropertyValueService.create — створює значення та емітує automation event

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-011             |
| **Issue**    | #63                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- `pvRepo.upsert` викликається, повертається `PropertyValueResponseDto`.
- `eventEmitter.emitAsync("automation.fieldChanged", ...)` викликається.

---

### [x] TC-PROPVAL-U-006: PropertyValueService.create — пропускає automation event при skipAutomations=true

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Очікуваний результат:**

- `eventEmitter.emitAsync` не викликається.

---

### [x] TC-PROPVAL-U-007: PropertyValueService.findAll — повертає всі DTO для запису

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-011             |
| **Issue**    | #63                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Очікуваний результат:**

- `pvRepo.findAllByRecord` викликається, повертається масив DTO.

---

### [x] TC-PROPVAL-U-008: PropertyValueService.findOne — NotFoundException коли не знайдено

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROPVAL-U-009: PropertyValueService.findOne — повертає DTO

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-011             |
| **Issue**    | #63                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Очікуваний результат:**

- Повертається `PropertyValueResponseDto`.

---

### [x] TC-PROPVAL-U-010: PropertyValueService.update — NotFoundException коли значення не знайдено

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROPVAL-U-011: PropertyValueService.update — BadRequestException коли нове значення невалідне

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `BadRequestException`.

---

### [x] TC-PROPVAL-U-012: PropertyValueService.update — оновлює значення і тригерить recalculate

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-011             |
| **Issue**    | #63                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- `formulaRecalculator.recalculate` викликається.

---

### [x] TC-PROPVAL-U-013: PropertyValueService.update — емітує automation event коли userId передано

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Очікуваний результат:**

- `eventEmitter.emitAsync` викликається з `userId`.

---

### [x] TC-PROPVAL-U-014: PropertyValueService.update — не емітує event коли userId відсутній

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Очікуваний результат:**

- `eventEmitter.emitAsync` не викликається.

---

### [x] TC-PROPVAL-U-015: PropertyValueService.remove — NotFoundException коли не знайдено

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-011          |
| **Issue**    | #63             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROPVAL-U-016: PropertyValueService.remove — видаляє значення і тригерить recalculate

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-011             |
| **Issue**    | #63                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- `pvRepo.delete` викликається, `formulaRecalculator.recalculate` викликається.
