# Unit Tests: Integrations

### [x] TC-INT-U-001: IntegrationMapper — зіставлення полів позиції з системними властивостями

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-076             |
| **Issue**    | #105               |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Передати в маппер сиру структуру Binance Position (symbol: "BTCUSDT", side: "BUY", qty: 0.1, entryPrice: 60000, realizedPnl: 150).
2. Передати сиру структуру MT5 Deal (symbol: "EURUSD", type: Sell, volume: 1.5, profit: -200).
3. Перевірити згенеровані поля внутрішнього об'єкта запису Trading Journal.

**Очікуваний результат:**

- Крок 1: символ = "BTCUSDT", напрямок = "Long", обсяг = 0.1, P&L = 150.
- Крок 2: символ = "EURUSD", напрямок = "Short", обсяг = 1.5, P&L = -200.

---

---

### [x] TC-INT-U-002: SyncService — ігнорування дублікатів за Position ID

| Поле         | Значення         |
| ------------ | ---------------- |
| **US**       | US-076           |
| **Issue**    | #105             |
| **TS**       | —                |
| **Метод**    | Unit (Jest)      |
| **Техніка**  | State Transition |
| **Priority** | P3               |

**Кроки:**

1. Отримати список нових угод з Bybit, де одна з угод має positionId = "pos-999" (вже існує в базі даних із кастомними нотатками користувача).
2. Запустити метод імпорту в `SyncService`.
3. Перевірити, чи не було оновлено або затерто оригінальний запис з `"pos-999"`.

**Очікуваний результат:**

- Угода з `"pos-999"` повністю ігнорується, існуючий запис у базі не перезаписується, кастомні дані збережені.

---

---

### [x] TC-INT-U-004: BinanceIntegrationProvider — перевірка read-only прав API-ключа

| Поле         | Значення        |
| ------------ | --------------- |
| **US**       | US-075          |
| **Issue**    | #105            |
| **TS**       | —               |
| **Метод**    | Unit (Jest)     |
| **Техніка**  | Branch Coverage |
| **Priority** | P3              |

**Кроки:**

1. Перевірити ключ, що має лише права read-only (Futuress Read / Spot Read).
2. Перевірити ключ, що має активовані права "Enable Spot & Margin Trading" (права на торгівлю).
3. Перевірити ключ із правами на виведення коштів (Withdrawals enabled).

**Очікуваний результат:**

- Крок 1: перевірка проходить успішно.
- Крок 2: викидається виняток `ForbiddenException` (ключі з торговими правами заборонені).
- Крок 3: викидається виняток `ForbiddenException` (ключі з правами виведення заборонені).

---

---

### [x] TC-INT-U-007: IntegrationService — Відкат транзакції при виникненні помилки

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-075             |
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

### [x] TC-INT-U-050: IntegrationConnectionService.findAll — отримання списку підключень

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-077             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати мок репозиторію на повернення списку підключень для користувача.
2. Викликати `service.findAll(userId)`.
3. Перевірити, що повернено масив з підключеннями.

**Очікуваний результат:**

- Метод повертає масив `IntegrationConnectionResponseDto[]`.
- Репозиторій викликано з правильним userId.

---

---

### [x] TC-INT-U-052: IntegrationConnectionService.findOne — отримання одного підключення

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-077                  |
| **Issue**    | —                       |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P3                      |

**Кроки:**

1. Налаштувати мок `findByOwner` на повернення підключення.
2. Викликати `service.findOne(id, userId)`.
3. Повторити з моком `findByOwner = null`.

**Очікуваний результат:**

- При знайденому підключенні — повертається DTO.
- При `null` — викидається `NotFoundException`.

---

---

### [x] TC-INT-U-053: IntegrationConnectionService.create — створення підключення (Binance)

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-078             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати моки: space знайдено, ліміт не перевищено, credentials валідні.
2. Викликати `service.create(userId, dto)`.
3. Перевірити, що створено підключення і створено сповіщення.

**Очікуваний результат:**

- Метод повертає `IntegrationConnectionResponseDto`.
- Викликано `notificationService.create`.

---

---

### [x] TC-INT-U-054: IntegrationConnectionService.create — MT5 токен генерація

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-078             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати моки для MT5 сервісу.
2. Викликати `service.create` з `service = METATRADER5`.
3. Перевірити, що credentials містять apiToken з префіксом `sk_`.

**Очікуваний результат:**

- Згенеровано токен через `crypto.randomBytes()` (не `Math.random()`).
- Токен повертається в response.

---

---

### [x] TC-INT-U-055: IntegrationConnectionService.create — ліміт підключень

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-078                  |
| **Issue**    | —                       |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P3                      |

**Кроки:**

1. Налаштувати мок `countBySpaceAndService` на повернення ліміту.
2. Викликати `service.create(userId, dto)`.

**Очікуваний результат:**

- Викидається `BadRequestException`.
- Підключення не створюється.

---

---

### [x] TC-INT-U-056: IntegrationConnectionService.update — оновлення підключення

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-079             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати мок `findByOwner` на повернення підключення.
2. Викликати `service.update(id, userId, { name: "New" })`.
3. Перевірити, що репозиторій оновлено і кеш очищено.

**Очікуваний результат:**

- Метод повертає оновлений DTO.
- `cacheService.deletePattern` викликано.

---

---

### [x] TC-INT-U-057: IntegrationConnectionService.update — простір з лімітом

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-079                  |
| **Issue**    | —                       |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P3                      |

**Кроки:**

1. Налаштувати моки: підключення знайдено, новий простір досяг ліміту.
2. Викликати `service.update(id, userId, { spaceId: "space-2" })`.

**Очікуваний результат:**

- Викидається `BadRequestException`.
- Підключення не оновлюється.

---

---

### [x] TC-INT-U-058: IntegrationConnectionService.delete — видалення підключення

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-080             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати мок `findByOwner` на повернення підключення.
2. Викликати `service.delete(id, userId)`.
3. Перевірити виклик `repo.delete` та `cacheService.deletePattern`.

**Очікуваний результат:**

- Підключення видалено, кеш очищено.

---

---

### [x] TC-INT-U-059: IntegrationConnectionService.delete — не знайдено

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-080                  |
| **Issue**    | —                       |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P3                      |

**Кроки:**

1. Налаштувати мок `findByOwner` на `null`.
2. Викликати `service.delete(id, userId)`.

**Очікуваний результат:**

- Викидається `NotFoundException`.
- `repo.delete` не викликано.

---

---

### [x] TC-INT-U-060: IntegrationConnectionService.triggerSync — ручна синхронізація

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-081             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати моки для успішної синхронізації.
2. Викликати `service.triggerSync(id, userId)`.
3. Перевірити результат синхронізації.

**Очікуваний результат:**

- Повертається `SyncResult` з `synced > 0`.
- Репозиторій оновлено з `lastSyncAt`.

---

---

### [x] TC-INT-U-062: IntegrationConnectionService.previewTrades — попередній перегляд угод

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-081             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати мок кешу на повернення списку угод.
2. Викликати `service.previewTrades(id, userId, dto)`.
3. Перевірити, що повернено список угод з `journalDatabaseId`.

**Очікуваний результат:**

- Метод повертає `PreviewTradesResponseDto` з угодами.
- Якщо підключення не знайдено — `NotFoundException`.

---

---

### [x] TC-INT-U-064: IntegrationConnectionService.handleMT5Webhook — обробка вебхука

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-081             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати моки: знайдено MT5 підключення, токен валідний.
2. Викликати `service.handleMT5Webhook(token, dto)`.
3. Перевірити результат імпорту.

**Очікуваний результат:**

- Повертається `{ success: true, imported: N, skipped: M }`.
- При невалідному connectionId — `UnprocessableEntityException`.
- При невалідному токені — `UnprocessableEntityException`.

---

---

### [x] TC-INT-U-065: IntegrationConnectionService.importTrades — імпорт вибраних угод

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-081             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P3                 |

**Кроки:**

1. Налаштувати моки: кеш з угодами, вибрано дві позиції.
2. Викликати `service.importTrades(id, userId, dto)`.
3. Перевірити, що імпортовано лише вибрані.

**Очікуваний результат:**

- Повертається `{ created: N, skipped: M }`.
- `persistTrades` викликано лише з вибраними sourcePositionIds.
