# Unit Tests: Properties

### [x] TC-PROP-U-019: PropertyService.create — NotFoundException коли база не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROP-U-020: PropertyService.create — ForbiddenException коли база заблокована

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROP-U-021: PropertyService.create — ConflictException коли ім'я вже зайняте

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ConflictException`.

---

### [x] TC-PROP-U-022: PropertyService.create — BadRequestException при невалідній конфігурації

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `BadRequestException`.

---

### [x] TC-PROP-U-023: PropertyService.create — успішно створює властивість

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- Повертається `PropertyResponseDto` з коректним `id`.

---

### [x] TC-PROP-U-024: PropertyService.findAll — виставляє isBroken=true для розбитих relation

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Очікуваний результат:**

- `config.isBroken === true` коли `databaseRepo.exists` повертає `false`.

---

### [x] TC-PROP-U-025: PropertyService.findOne — NotFoundException коли властивість не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROP-U-026: PropertyService.findOne — повертає DTO

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Очікуваний результат:**

- Повертається `PropertyResponseDto`.

---

### [x] TC-PROP-U-027: PropertyService.update — NotFoundException коли властивість не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROP-U-028: PropertyService.update — ForbiddenException коли база заблокована

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROP-U-029: PropertyService.update — ForbiddenException при перейменуванні Name

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROP-U-030: PropertyService.update — ConflictException коли нова назва зайнята

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ConflictException`.

---

### [x] TC-PROP-U-031: PropertyService.update — оновлює і повертає DTO

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- Повертається оновлений `PropertyResponseDto`.

---

### [x] TC-PROP-U-032: PropertyService.remove — NotFoundException коли властивість не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROP-U-033: PropertyService.remove — ForbiddenException при видаленні Name

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROP-U-034: PropertyService.remove — ForbiddenException при видаленні isProtected

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROP-U-035: PropertyService.remove — видаляє властивість

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- `propertyRepo.delete("p-1")` викликається.

---

### [x] TC-PROP-U-036: PropertyService.previewFormula — обчислює і повертає результат

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-034             |
| **Issue**    | #66                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Очікуваний результат:**

- `formulaEngine.evaluate` викликається, `result.result === 42`.

---

### [x] TC-PROP-U-037: PropertyService.duplicate — NotFoundException коли властивість не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROP-U-038: PropertyService.duplicate — ForbiddenException коли база заблокована

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROP-U-039: PropertyService.duplicate — створює копію з суфіксом '(copy)'

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Очікуваний результат:**

- `propertyRepo.create` викликається з `name: "Status (copy)"`.

---

## PropertyGroupService

### [x] TC-PROPG-U-001: PropertyGroupService.findAllByDatabase — NotFoundException коли база не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROPG-U-002: PropertyGroupService.findAllByDatabase — повертає всі групи

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Очікуваний результат:**

- Масив з одним `PropertyGroupResponseDto`.

---

### [x] TC-PROPG-U-003: PropertyGroupService.create — NotFoundException коли база не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROPG-U-004: PropertyGroupService.create — ForbiddenException коли база заблокована

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROPG-U-005: PropertyGroupService.create — створює та повертає групу

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- `groupRepo.create` викликається, повертається `PropertyGroupResponseDto`.

---

### [x] TC-PROPG-U-006: PropertyGroupService.update — NotFoundException коли група не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROPG-U-007: PropertyGroupService.update — ForbiddenException коли не власник бази

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROPG-U-008: PropertyGroupService.update — ForbiddenException коли база заблокована

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROPG-U-009: PropertyGroupService.update — оновлює та повертає групу

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний результат:**

- `groupRepo.update` викликається, повертається оновлений `PropertyGroupResponseDto`.

---

### [x] TC-PROPG-U-010: PropertyGroupService.remove — NotFoundException коли група не знайдена

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `NotFoundException`.

---

### [x] TC-PROPG-U-011: PropertyGroupService.remove — ForbiddenException коли не власник

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROPG-U-012: PropertyGroupService.remove — ForbiddenException коли база заблокована

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-010          |
| **Issue**    | #60             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Очікуваний результат:**

- Викидається `ForbiddenException`.

---

### [x] TC-PROPG-U-013: PropertyGroupService.remove — видаляє групу

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-010             |
| **Issue**    | #60                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Очікуваний fрезультат:**

- `groupRepo.delete("g-1")` викликається.
