# Unit Tests: Settings

### [x] TC-SET-U-001: SettingsService.getSettings — повертає дефолти коли в БД немає записів

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-066             |
| **Issue**    | #94                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `settingsRepo.findMany` повертає `[]`.
2. Викликати `service.getSettings("u-1", DATABASE, DEFAULT_DATABASE_SETTINGS)`.

**Очікуваний результат:**

- Повертається об'єкт рівний `DEFAULT_DATABASE_SETTINGS`.

---

### [x] TC-SET-U-002: SettingsService.getSettings — перезаписує дефолти значеннями з БД

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-066             |
| **Issue**    | #94                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. `findMany` повертає `[{ key: "defaultDatabaseIcon", value: "custom-icon" }]`.
2. Викликати `getSettings`.

**Очікуваний результат:**

- `result.defaultDatabaseIcon === "custom-icon"`.

---

### [x] TC-SET-U-003: SettingsService.getSettings — ігнорує невідомі ключі з БД

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-066          |
| **Issue**    | #94             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Кроки:**

1. `findMany` повертає `[{ key: "unknownKey", value: "something" }]`.
2. Викликати `getSettings`.

**Очікуваний результат:**

- Результат рівний дефолту; `result.unknownKey === undefined`.

---

### [x] TC-SET-U-004: SettingsService.updateSettings — видаляє запис коли значення дорівнює дефолту

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-066          |
| **Issue**    | #94             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. Передати значення `defaultDatabaseIcon`, що дорівнює дефолту.
2. Викликати `updateSettings`.

**Очікуваний результат:**

- `settingsRepo.deleteMany` викликається для цього ключа.
- `settingsRepo.upsert` не викликається.

---

### [x] TC-SET-U-005: SettingsService.updateSettings — upsert коли значення відрізняється від дефолту

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-066          |
| **Issue**    | #94             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P1              |

**Кроки:**

1. Передати нове значення `"my-icon"` для `defaultDatabaseIcon`.
2. Викликати `updateSettings`.

**Очікуваний результат:**

- `settingsRepo.upsert` викликається з правильними аргументами.
- `settingsRepo.deleteMany` не викликається.

---

### [x] TC-SET-U-006: SettingsService.updateSettings — повертає оновлені налаштування після запису

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-066             |
| **Issue**    | #94                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. `findMany` після оновлення повертає оновлений запис.
2. Перевірити результат `updateSettings`.

**Очікуваний результат:**

- `result.defaultDatabaseIcon` дорівнює новому значенню.

---

### [x] TC-SET-U-007: SettingsService.getDefaultIcon — повертає дефолтну іконку бази даних

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-068             |
| **Issue**    | #96                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. `findMany` повертає `[]`.
2. Викликати `getDefaultIcon("u-1", DATABASE)`.

**Очікуваний результат:**

- Повертається `DEFAULT_DATABASE_SETTINGS.defaultDatabaseIcon`.

---

### [x] TC-SET-U-008: SettingsService.getDefaultIcon — повертає дефолтну іконку workspace

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-067          |
| **Issue**    | #95             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Кроки:**

1. Викликати `getDefaultIcon("u-1", SPACE)`.

**Очікуваний результат:**

- Повертається `DEFAULT_SPACE_SETTINGS.defaultSpaceIcon`.

---

### [x] TC-SET-U-009: SettingsService.resolveDefaults — використовує надану іконку без запиту до БД

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-067          |
| **Issue**    | #95             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Кроки:**

1. Викликати `resolveDefaults("u-1", DATABASE, { icon: "provided-icon" })`.

**Очікуваний результат:**

- `result.icon === "provided-icon"`.
- `settingsRepo.findMany` не викликається.

---

### [x] TC-SET-U-010: SettingsService.resolveDefaults — отримує дефолтну іконку коли не надана

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-067             |
| **Issue**    | #95                |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. `findMany` повертає `[]`.
2. Викликати `resolveDefaults("u-1", DATABASE, {})`.

**Очікуваний результат:**

- `result.icon === DEFAULT_DATABASE_SETTINGS.defaultDatabaseIcon`.

---

### [x] TC-SET-U-011: SettingsService.resolveDefaults — резолвить колір секції коли category=SECTION

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-067          |
| **Issue**    | #95             |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P2              |

**Кроки:**

1. `findMany` повертає `[]`.
2. Викликати `resolveDefaults("u-1", SECTION, { icon: "my-icon" })`.

**Очікуваний результат:**

- `result.icon === "my-icon"`.
- `result.color === DEFAULT_SECTION_SETTINGS.defaultSectionColor`.
