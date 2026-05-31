# API Contract — FIX Space

> **Що таке API Contract?**
> API contract — це формальна специфікація поведінки API: які endpoints існують, які дані вони приймають, що повертають і в яких випадках виникають помилки. Це «угода» між сервером і клієнтом. Розроблена на основі функціональних вимог (`../phase-2/REQUIREMENTS.md`) та API-ендпоінтів.

---

## Зміст

1. [Загальні конвенції](#1-загальні-конвенції)
2. [Автентифікація](#2-автентифікація)
3. [Профіль користувача](#3-профіль-користувача)
4. [Робочі простори (Spaces)](#4-робочі-простори-spaces)
5. [Бази даних (Databases)](#5-бази-даних-databases)
6. [Властивості (Properties)](#6-властивості-properties)
7. [Записи (Records)](#7-записи-records)
8. [Кошик (Trash)](#8-кошик-trash)
9. [Значення властивостей (Property Values)](#9-значення-властивостей-property-values)
10. [Контентна область (Record Content)](#10-контентна-область-record-content)
11. [Шаблони (Templates)](#11-шаблони-templates)
12. [Значення шаблону (Template Property Values)](#12-значення-шаблону-template-property-values)
13. [Перегляди (Views)](#13-перегляди-views)
14. [Пошук](#14-пошук)
15. [Імпорт / Експорт](#15-імпорт--експорт)
16. [Інтеграції](#16-інтеграції)
17. [Автоматизації](#17-автоматизації)
18. [Сповіщення](#18-сповіщення)
19. [Налаштування (Settings)](#19-налаштування-settings)
20. [Коди помилок](#20-коди-помилок)

---

## 1. Загальні конвенції

| Параметр       | Значення                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| Base URL       | `http://localhost:3000`                                                  |
| Формат даних   | JSON (`Content-Type: application/json`)                                  |
| Автентифікація | JWT, cookie `access_token` або заголовок `Authorization: Bearer <token>` |
| ID записів     | UUID v4                                                                  |
| Дати           | ISO 8601 UTC (`2025-05-23T14:00:00.000Z`)                                |

**Захист ендпоінтів:** усі ендпоінти захищені JWT за замовчуванням. Публічні (без `[auth]`) позначені явно.

**Стандартна структура помилки:**

```json
{
  "message": "Опис помилки",
  "statusCode": 400,
  "timestamp": "2025-05-23T14:00:00.000Z"
}
```

**Rate limiting:**

- Глобально: 200 запитів / хвилину
- `POST /auth/login`: 5 запитів / хвилину
- `POST /auth/forgot-password`: 3 запити / хвилину

---

## 2. Автентифікація

### POST /auth/register — Реєстрація `[public]`

Створює акаунт, надсилає email з токеном підтвердження (діє 24 год), автоматично ініціалізує робочий простір із стартовим пакетом баз даних.

**Request body:**

```json
{
  "email": "user@example.com", // required, email
  "username": "john_doe", // required, 3–50 символів, [a-zA-Z0-9_-]
  "password": "SecurePass1!" // required, 8–128 символів, мін. 1 велика, 1 цифра, 1 спецсимвол
}
```

**Response `201`:**

```json
{
  "message": "Registration successful",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

> `refresh_token` також встановлюється як HTTP-only cookie.

---

### POST /auth/verify — Підтвердження email `[public]`

**Request body:**

```json
{ "token": "<verification-token>" }
```

**Response `200`:**

```json
{
  "message": "Email verified successfully",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

---

### POST /auth/login — Вхід `[public]` `[throttle: 5/min]`

Вхід доступний лише після підтвердження email.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

**Response `200`:**

```json
{
  "message": "Login successful",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

> `access_token` — 15 хвилин; `refresh_token` — 30 днів (продовжується при кожному використанні).

---

### POST /auth/refresh — Оновлення токена `[public]`

Токен береться автоматично з cookie `refresh_token`.

**Response `200`:**

```json
{
  "message": "Token refreshed",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

---

### POST /auth/logout — Вихід `[auth]`

Анулює поточний refresh-токен із cookie.

**Response `200`:**

```json
{ "message": "Logged out successfully" }
```

---

### POST /auth/forgot-password — Скидання пароля `[public]` `[throttle: 3/min]`

Надсилає посилання (діє 1 год) на email.

**Request body:**

```json
{ "email": "user@example.com" }
```

**Response `200`:**

```json
{ "message": "Password reset email sent" }
```

---

### POST /auth/reset-password — Встановлення нового пароля `[public]`

**Request body:**

```json
{
  "token": "<reset-token>",
  "newPassword": "NewSecurePass1!" // 8–128 символів, ті ж вимоги що й при реєстрації
}
```

**Response `200`:**

```json
{ "message": "Password reset successful" }
```

---

### GET /auth/google — Початок Google OAuth `[public]`

Перенаправляє браузер на сторінку авторизації Google (OAuth 2.0 consent screen). Відповідь — `302 Redirect`.

---

### GET /auth/google/callback — Callback Google OAuth `[public]`

Google перенаправляє сюди після авторизації. Сервер обмінює `code` на токени Google, знаходить або створює акаунт, видає власні JWT.

**Query параметри (встановлюються Google автоматично):**

| Параметр | Тип    | Опис                |
| -------- | ------ | ------------------- |
| `code`   | string | Код авторизації     |
| `state`  | string | CSRF-захисний рядок |

**Response `200`:**

```json
{
  "message": "Google login successful",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

> Якщо email вже зареєстрований через звичайну форму — акаунти зв'язуються. При першому вході через Google простір ініціалізується автоматично (так само, як при реєстрації).

---

## 3. Профіль користувача

### GET /users/me `[auth]`

**Response `200`:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "john_doe",
  "icon": "🚀", // emoji або URL аватару, null якщо не задано
  "isVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### PATCH /users/me `[auth]`

Усі поля опціональні.

**Request body:**

```json
{
  "email": "new@example.com", // optional
  "username": "new_username", // optional, 3–50 символів
  "icon": "🎯" // optional, emoji або URL
}
```

**Response `200`:** — оновлений об'єкт користувача (той самий формат що `GET /users/me`).

---

### DELETE /users/me `[auth]`

Видаляє акаунт і всі дані безповоротно. Потребує підтвердження паролем (передається у body).

**Response `200`:**

```json
{ "message": "Account deleted successfully" }
```

---

## 4. Робочі простори (Spaces)

### POST /spaces `[auth]`

Ліміт: до 5 просторів на акаунт.

**Request body:**

```json
{
  "name": "My Workspace", // required, 1–120 символів
  "icon": "📊", // optional
  "isDefault": false // optional
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "ownerId": "uuid",
  "name": "My Workspace",
  "icon": "📊",
  "isDefault": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "config": null
}
```

---

### GET /spaces `[auth]`

Повертає всі простори поточного користувача.

**Response `200`:** масив об'єктів Space (без `sections` та `databases`).

---

### GET /spaces/:id `[auth]`

**Response `200`:**

```json
{
  "id": "uuid",
  "ownerId": "uuid",
  "name": "My Workspace",
  "icon": "📊",
  "isDefault": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "config": null,
  "sections": [
    {
      "id": "uuid",
      "spaceId": "uuid",
      "name": "Routine",
      "position": 0,
      "icon": null,
      "color": null,
      "createdAt": "...",
      "updatedAt": "...",
      "databases": [
        /* DatabaseResponse[] */
      ]
    }
  ],
  "databases": [
    /* бази без секції */
  ]
}
```

---

### PATCH /spaces/:id `[auth]`

Оновлює простір та/або виконує операції над секціями.

**Request body:**

```json
{
  "name": "Updated Name", // optional
  "icon": "🏆", // optional
  "isDefault": true, // optional — встановити як основний простір
  "sectionOperations": [
    // optional — операції над секціями
    {
      "operation": "CREATE", // CREATE | UPDATE | DELETE
      "create": {
        "name": "New Section",
        "icon": "📌",
        "color": "#3b82f6"
      }
    },
    {
      "operation": "UPDATE",
      "id": "uuid",
      "update": { "name": "Renamed", "position": 1 }
    },
    {
      "operation": "DELETE",
      "id": "uuid"
    }
  ]
}
```

**Response `200`:** оновлений об'єкт Space.

> **Видалення секції:** бази даних цієї секції не видаляються — їхній `sectionId` стає `null`.

---

### DELETE /spaces/:id `[auth]`

Заборонено видаляти простір із `isDefault: true`.

**Response `200`:**

```json
{ "message": "Space deleted successfully" }
```

---

### POST /spaces/:id/duplicate `[auth]`

Дублює простір із усією структурою (секції, бази, властивості, шаблони) — **без записів**.

**Response `201`:** новий об'єкт Space.

---

## 5. Бази даних (Databases)

### POST /databases `[auth]`

**Request body:**

```json
{
  "spaceId": "uuid", // required
  "name": "My Database", // required, 1–120 символів
  "title": "My Database Title", // required, 1–255 символів
  "sectionId": "uuid", // optional — прив'язати до секції
  "icon": "📋", // optional
  "recordLimit": 500, // optional, 1–100 (null = без ліміту)
  "type": "custom" // optional: trading-journal | daily-routine | notes | mistakes | accounts | operations | trading-system | custom
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "spaceId": "uuid",
  "sectionId": "uuid",
  "name": "My Database",
  "title": "My Database Title",
  "icon": "📋",
  "recordLimit": null,
  "useDefaultTemplate": true,
  "isPreset": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET /databases?spaceId=:id `[auth]`

**Response `200`:** масив DatabaseResponse.

---

### GET /databases/:id `[auth]`

**Response `200`:** один DatabaseResponse.

---

### PATCH /databases/:id `[auth]`

**Request body:** (усі поля опціональні)

```json
{
  "name": "New Name",
  "title": "New Title",
  "icon": "📝",
  "sectionId": "uuid", // null — прибрати з секції
  "recordLimit": 200,
  "useDefaultTemplate": false,
  "isLocked": true // заблокувати структуру (не можна додавати/видаляти властивості)
}
```

**Response `200`:** оновлений DatabaseResponse.

---

### DELETE /databases/:id `[auth]`

Пресетні бази (`isPreset: true`) не можна видалити.

**Response `200`:**

```json
{ "message": "Database deleted successfully" }
```

---

### POST /databases/:id/duplicate `[auth]`

Дублює базу з усіма властивостями та шаблонами — **без записів**.

**Response `201`:** новий DatabaseResponse.

---

## 6. Властивості (Properties)

### POST /properties `[auth]`

**Request body:**

```json
{
  "databaseId": "uuid", // required
  "name": "Trade Date", // required, 1–120 символів
  "type": "DATE", // required: TEXT|NUMBER|DATE|CHECKBOX|DURATION|SELECT|STATUS|RELATION|FORMULA|RATING|PROGRESS
  "position": 1, // required, >= 0
  "isRequired": false, // optional
  "isVisible": true, // optional
  "isProtected": false, // optional
  "icon": "📅", // optional
  "hint": "Entry date", // optional
  "group": "General", // optional — назва групи в картці запису
  "config": {
    // optional — конфігурація залежно від типу (деталі нижче)
    "format": "DD.MM.YYYY",
    "includeTime": true,
    "timeFormat": "HH:mm"
  }
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "databaseId": "uuid",
  "name": "Trade Date",
  "type": "DATE",
  "position": 1,
  "icon": "📅",
  "hint": "Entry date",
  "group": "General",
  "isRequired": false,
  "isVisible": true,
  "isProtected": false,
  "config": {
    "format": "DD.MM.YYYY",
    "includeTime": true,
    "timeFormat": "HH:mm"
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Конфігурація за типом (`config`):**

| Тип      | Поля конфігурації                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| TEXT     | `defaultValue`, `isRichText`, `urlHandling` (`none`/`detect`/`preview`)                                                     |
| NUMBER   | `defaultValue`, `format` (`integer`/`float`/`currency`/`percentage`), `decimalPlaces`, `currencySymbol`, `prefix`, `suffix` |
| DATE     | `defaultValue`, `format` (`DD.MM.YYYY`/`MM/DD/YYYY`/`YYYY-MM-DD`), `includeTime`, `timeFormat` (`HH:mm`/`hh:mm A`)          |
| CHECKBOX | `defaultValue` (boolean)                                                                                                    |
| DURATION | `defaultValue`, `format` (`HH:mm`/`HH:mm:ss`/`Xh Ym`/`minutes`/`seconds`)                                                   |
| SELECT   | `isMultiSelect`, `categories: [{ label, options: [{ value, color?, icon? }] }]`                                             |
| STATUS   | `defaultOption`, `categories: [{ category, label, defaultOption, options: [{ name, color, icon? }] }]`                      |
| RELATION | `relatedEntityId` (UUID бази), `multiple` (boolean)                                                                         |
| FORMULA  | `expression` (генерується системою)                                                                                         |
| RATING   | `defaultValue`, `maxStars` (1–10), `allowHalf`                                                                              |
| PROGRESS | `defaultValue`, `min`, `max`, `step`, `showLabel`, `thresholds: [{ upTo, color }]`                                          |

---

### GET /properties?databaseId=:id `[auth]`

**Response `200`:** масив PropertyResponse.

---

### GET /properties/:id `[auth]`

**Response `200`:** один PropertyResponse.

---

### PATCH /properties/:id `[auth]`

Заборонено змінювати тип системних властивостей та властивості `Name`.

**Request body:** (усі поля опціональні)

```json
{
  "name": "New Name",
  "position": 2,
  "isRequired": true,
  "isVisible": false,
  "icon": "🔢",
  "hint": "New hint",
  "group": "Trading",
  "config": { "format": "currency" }
}
```

**Response `200`:** оновлений PropertyResponse.

---

### DELETE /properties/:id `[auth]`

Видаляє властивість і всі її значення. Заборонено для системних властивостей пресетних баз та для властивості `Name`.

**Response `200`:**

```json
{ "message": "Property deleted successfully" }
```

---

## 7. Записи (Records)

### POST /records `[auth]`

При наявності `isDefault`-шаблону значення властивостей підставляються автоматично.

**Request body:**

```json
{
  "databaseId": "uuid", // required
  "name": "EURUSD Long", // optional, до 255 символів
  "icon": "📈", // optional
  "templateId": "uuid" // optional — застосувати шаблон
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "databaseId": "uuid",
  "name": "EURUSD Long",
  "icon": "📈",
  "createdAt": "...",
  "updatedAt": "...",
  "config": null,
  "values": [
    /* PropertyValueResponse[] */
  ]
}
```

---

### GET /records?databaseId=:id `[auth]`

Підтримує пагінацію та пошук.

**Query параметри:**

| Параметр     | Тип    | Опис                                                    |
| ------------ | ------ | ------------------------------------------------------- |
| `databaseId` | string | required                                                |
| `page`       | number | optional, за замовчуванням 1                            |
| `limit`      | number | optional, 10/25/50/75/100                               |
| `search`     | string | optional, пошук за назвою і значеннями (мін. 2 символи) |

**Response `200`:**

```json
{
  "data": [
    /* RecordResponse[] */
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}
```

---

### GET /records/:id `[auth]`

**Response `200`:** один RecordResponse (з `values`).

---

### PATCH /records/:id `[auth]`

**Request body:** (усі поля опціональні)

```json
{
  "name": "Updated Name",
  "icon": "📉",
  "databaseId": "uuid" // optional — перемістити в іншу базу
}
```

**Response `200`:** оновлений RecordResponse.

---

### DELETE /records/:id `[auth]`

Soft delete — запис переміщується до Кошика на 30 днів.

**Response `200`:**

```json
{ "message": "Record moved to trash" }
```

---

### GET /records/search?spaceId=:id&query=:q `[auth]`

Глобальний пошук по всіх базах простору (мін. 2 символи). Охоплює назву, значення властивостей, контентну область.

**Response `200`:**

```json
[
  {
    "databaseId": "uuid",
    "databaseName": "Trading Journal",
    "sectionName": "Routine",
    "records": [
      {
        "id": "uuid",
        "name": "EURUSD Long",
        "highlight": "...EURUSD..." // фрагмент з виділеним збігом
      }
    ],
    "total": 12
  }
]
```

> Максимум 5 записів на базу в одній відповіді. Результати згруповані за базами.

---

## 8. Кошик (Trash)

Soft-видалені записи зберігаються 30 днів, після чого видаляються автоматично.

### GET /records/trash?spaceId=:id `[auth]`

Повертає всі soft-видалені записи простору.

**Query параметри:**

| Параметр  | Тип    | Опис     |
| --------- | ------ | -------- |
| `spaceId` | string | required |

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "databaseId": "uuid",
    "databaseName": "Trading Journal",
    "name": "EURUSD Long",
    "icon": "📈",
    "deletedAt": "2025-05-23T10:00:00.000Z",
    "expiresAt": "2025-06-22T10:00:00.000Z"
  }
]
```

---

### POST /records/:id/restore `[auth]`

Відновлює запис із Кошика до його вихідної бази.

**Response `200`:**

```json
{ "message": "Record restored successfully" }
```

---

### DELETE /records/:id/permanent `[auth]`

Безповоротне видалення запису з Кошика.

**Response `200`:**

```json
{ "message": "Record permanently deleted" }
```

---

## 9. Значення властивостей (Property Values)

### POST /values `[auth]`

**Request body:**

```json
{
  "recordId": "uuid", // required
  "propertyId": "uuid", // required
  "value": "2025-05-23T09:00:00.000Z", // optional — формат залежить від типу властивості
  "computed": false // optional — true для FORMULA-значень
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "recordId": "uuid",
  "propertyId": "uuid",
  "value": "2025-05-23T09:00:00.000Z",
  "computed": false,
  "propertyName": "Date" // optional, для зручності клієнта
}
```

**Формат `value` залежно від типу властивості:**

| Тип      | Формат значення                       | Приклад                       |
| -------- | ------------------------------------- | ----------------------------- |
| TEXT     | string або null                       | `"EURUSD"`                    |
| NUMBER   | number або null                       | `1.08520`                     |
| DATE     | ISO 8601 рядок або null               | `"2025-05-23T09:00:00.000Z"`  |
| CHECKBOX | boolean або null                      | `true`                        |
| DURATION | ціле число секунд або null            | `5400` (= 1.5 год)            |
| SELECT   | рядок або масив рядків або null       | `"Long"` / `["London", "NY"]` |
| STATUS   | рядок (назва опції) або null          | `"In Progress"`               |
| RELATION | UUID або масив UUID або null          | `["uuid1", "uuid2"]`          |
| FORMULA  | залежить від виразу (лише читання)    | `2.4`                         |
| RATING   | число 0–maxStars або null             | `4.5`                         |
| PROGRESS | число в діапазоні [min, max] або null | `75`                          |

---

### GET /values?recordId=:id `[auth]`

**Response `200`:** масив PropertyValueResponse.

---

### GET /values/:id `[auth]`

**Response `200`:** один PropertyValueResponse.

---

### PATCH /values/:id `[auth]`

**Request body:**

```json
{ "value": 2.4 }
```

**Response `200`:** оновлений PropertyValueResponse.

---

### DELETE /values/:id `[auth]`

**Response `200`:**

```json
{ "message": "Value deleted successfully" }
```

---

## 10. Контентна область (Record Content)

Кожен запис має структуровану контентну область — ієрархія 4 рівнів: **Row → Column → Block → Component**. Автозбереження відбувається при кожній зміні; система зберігає останні знімки (snapshots) для можливості відновлення.

### GET /records/:id/content `[auth]`

Повертає поточний вміст контентної області запису.

**Response `200`:**

```json
{
  "recordId": "uuid",
  "updatedAt": "2025-05-23T14:00:00.000Z",
  "rows": [
    {
      "id": "uuid",
      "position": 0,
      "columns": [
        {
          "id": "uuid",
          "position": 0,
          "width": 100,
          "blocks": [
            {
              "id": "uuid",
              "type": "text", // text | heading | image | table | divider | list | code | embed
              "position": 0,
              "components": [
                {
                  "id": "uuid",
                  "type": "paragraph",
                  "content": "Текст нотатки"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

### PATCH /records/:id/content `[auth]`

Оновлює контентну область. Приймає повну або часткову структуру. Автозбереження — сервер створює snapshot перед кожним оновленням.

**Request body:**

```json
{
  "rows": [
    /* повна нова структура Row[] */
  ]
}
```

**Response `200`:** оновлений об'єкт контенту (той самий формат що GET).

---

### GET /records/:id/content/snapshots `[auth]`

Повертає список знімків контентної області для відновлення.

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "recordId": "uuid",
    "createdAt": "2025-05-23T13:55:00.000Z",
    "label": "Auto-save" // або мітка, задана користувачем
  }
]
```

---

### POST /records/:id/content/restore/:snapshotId `[auth]`

Відновлює контентну область зі знімка. Поточний стан зберігається як новий snapshot перед відновленням.

**Response `200`:** об'єкт контенту після відновлення (той самий формат що GET).

---

## 11. Шаблони (Templates)

### POST /templates `[auth]`

**Request body:**

```json
{
  "databaseId": "uuid", // required
  "name": "Daily Routine", // optional, до 255 символів
  "description": "Шаблон...", // optional
  "icon": "📋", // optional
  "isDefault": false, // optional — застосовувати автоматично при створенні запису
  "position": 0 // optional, >= 0
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "databaseId": "uuid",
  "name": "Daily Routine",
  "description": null,
  "icon": "📋",
  "isDefault": false,
  "position": 0,
  "createdAt": "...",
  "updatedAt": "...",
  "config": null,
  "values": []
}
```

---

### GET /templates?databaseId=:id `[auth]`

**Response `200`:** масив TemplateResponse.

---

### GET /templates/:id `[auth]`

**Response `200`:** один TemplateResponse (з `values`).

---

### PATCH /templates/:id `[auth]`

**Request body:** (усі поля опціональні)

```json
{
  "name": "Updated Name",
  "description": "New description",
  "icon": "📌",
  "isDefault": true,
  "position": 1
}
```

**Response `200`:** оновлений TemplateResponse.

---

### DELETE /templates/:id `[auth]`

**Response `200`:**

```json
{ "message": "Template deleted successfully" }
```

---

### POST /templates/:id/duplicate `[auth]`

**Response `201`:** новий TemplateResponse.

---

## 12. Значення шаблону (Template Property Values)

### POST /template-property-values `[auth]`

**Request body:**

```json
{
  "templateId": "uuid", // required
  "propertyId": "uuid", // required
  "value": "Long" // optional
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "templateId": "uuid",
  "propertyId": "uuid",
  "value": "Long"
}
```

---

### GET /template-property-values?templateId=:id `[auth]`

**Response `200`:** масив TemplatePropertyValueResponse.

---

### GET /template-property-values/:id `[auth]`

**Response `200`:** один TemplatePropertyValueResponse.

---

### PATCH /template-property-values/:id `[auth]`

**Request body:**

```json
{ "value": "Short" }
```

**Response `200`:** оновлений TemplatePropertyValueResponse.

---

### DELETE /template-property-values/:id `[auth]`

**Response `200`:**

```json
{ "message": "Template value deleted successfully" }
```

---

## 13. Перегляди (Views)

Кожна база може мати до **10 переглядів**. Перегляд визначає спосіб відображення записів: фільтри, сортування, групування, пагінацію. Заблокований перегляд (`isLocked: true`) не може бути змінений звичайним користувачем.

**Типи переглядів:** `table` · `board` · `gallery` · `list` · `calendar` · `timeline`

### POST /views `[auth]`

**Request body:**

```json
{
  "databaseId": "uuid", // required
  "name": "My View", // required, 1–120 символів
  "type": "table", // required: table | board | gallery | list | calendar | timeline
  "position": 0, // optional, >= 0
  "isLocked": false, // optional
  "config": {
    // optional
    "filters": [
      {
        "propertyId": "uuid",
        "operator": "equals", // equals | not_equals | contains | greater_than | less_than | is_empty | is_not_empty
        "value": "Long"
      }
    ],
    "sorting": [
      {
        "propertyId": "uuid",
        "direction": "asc" // asc | desc
      }
    ],
    "grouping": {
      "propertyId": "uuid",
      "direction": "asc"
    },
    "pagination": {
      "pageSize": 25 // 10 | 25 | 50 | 75 | 100
    }
  }
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "databaseId": "uuid",
  "name": "My View",
  "type": "table",
  "position": 0,
  "isLocked": false,
  "config": {
    /* ... */
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET /views?databaseId=:id `[auth]`

**Response `200`:** масив ViewResponse.

---

### GET /views/:id `[auth]`

**Response `200`:** один ViewResponse.

---

### PATCH /views/:id `[auth]`

**Request body:** (усі поля опціональні)

```json
{
  "name": "Updated View",
  "position": 1,
  "isLocked": true,
  "config": {
    "filters": [],
    "sorting": [{ "propertyId": "uuid", "direction": "desc" }]
  }
}
```

**Response `200`:** оновлений ViewResponse.

---

### DELETE /views/:id `[auth]`

**Response `200`:**

```json
{ "message": "View deleted successfully" }
```

---

### POST /views/:id/duplicate `[auth]`

**Response `201`:** новий ViewResponse.

---

## 14. Пошук

Описано в розділі [7 — GET /records/search](#get-recordssearchspaceididsqueryq-auth).

---

## 15. Імпорт / Експорт

### POST /databases/:id/import `[auth]`

Імпорт записів із CSV-файлу. `Content-Type: multipart/form-data`.

**Обмеження:** максимальний розмір файлу — 25 МБ; кодування — UTF-8.

**Form fields:**

| Поле      | Тип    | Опис                                                                                             |
| --------- | ------ | ------------------------------------------------------------------------------------------------ |
| `file`    | File   | required — CSV-файл                                                                              |
| `mapping` | string | required — JSON-рядок: `{ "csv_column_name": "propertyId" }` або `{ "csv_col": "propertyName" }` |

**Приклад `mapping`:**

```json
{
  "Date": "uuid-of-date-property",
  "Pair": "uuid-of-text-property",
  "Result": "uuid-of-number-property"
}
```

**Response `200`:**

```json
{
  "imported": 42,
  "skipped": 3,
  "errors": [
    {
      "row": 5,
      "message": "Invalid date format in column 'Date'"
    }
  ]
}
```

---

### GET /databases/:id/export?format=csv `[auth]`

Експорт усіх записів бази у CSV. Значення властивостей перетворюються на рядки; FORMULA-поля включаються з обчисленим значенням.

**Query параметри:**

| Параметр | Тип    | Опис                           |
| -------- | ------ | ------------------------------ |
| `format` | string | required — наразі тільки `csv` |

**Response `200`:** файл `text/csv; charset=utf-8` з заголовком:

```
Content-Disposition: attachment; filename="<database-name>.csv"
```

---

## 16. Інтеграції

FIX Space підтримує підключення до торгових платформ для автоматичного імпорту угод.

**Типи:** `binance` · `bybit` · `okx` · `mt5` · `ctrader`

**Статуси:** `active` · `auth_error` · `disconnected`

Синхронізація відбувається автоматично кожні **5 хвилин**.

### POST /integrations `[auth]`

**Request body:**

```json
{
  "spaceId": "uuid", // required
  "type": "binance", // required: binance | bybit | okx | mt5 | ctrader
  "name": "My Binance", // optional, 1–120 символів
  "credentials": {
    // required — структура залежить від типу (деталі нижче)
    "apiKey": "...",
    "apiSecret": "..."
  }
}
```

**Структура `credentials` за типом:**

| Тип       | Поля                                                                           |
| --------- | ------------------------------------------------------------------------------ |
| `binance` | `apiKey`, `apiSecret`                                                          |
| `bybit`   | `apiKey`, `apiSecret`                                                          |
| `okx`     | `apiKey`, `apiSecret`                                                          |
| `mt5`     | `login` (number), `investorPassword`, `server`                                 |
| `ctrader` | Ініціюється через OAuth 2.0 редирект — `credentials` не потрібен при створенні |

**Response `201`:**

```json
{
  "id": "uuid",
  "spaceId": "uuid",
  "type": "binance",
  "name": "My Binance",
  "status": "active",
  "lastSyncAt": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

> `credentials` **не повертаються** в жодній відповіді.

---

### GET /integrations?spaceId=:id `[auth]`

**Response `200`:** масив IntegrationResponse.

---

### GET /integrations/:id `[auth]`

**Response `200`:** один IntegrationResponse.

---

### PATCH /integrations/:id `[auth]`

**Request body:** (усі поля опціональні)

```json
{
  "name": "Updated Name",
  "credentials": {
    "apiKey": "new-key",
    "apiSecret": "new-secret"
  }
}
```

**Response `200`:** оновлений IntegrationResponse.

---

### DELETE /integrations/:id `[auth]`

**Response `200`:**

```json
{ "message": "Integration disconnected" }
```

---

### POST /integrations/:id/sync `[auth]`

Ручний запуск синхронізації (позачергово).

**Response `200`:**

```json
{
  "message": "Sync started",
  "syncId": "uuid"
}
```

---

### GET /auth/ctrader/callback — cTrader OAuth callback `[public]`

Після авторизації у cTrader платформа перенаправляє сюди. Сервер завершує OAuth-обмін і активує інтеграцію.

**Query параметри (встановлюються cTrader автоматично):**

| Параметр | Тип    | Опис            |
| -------- | ------ | --------------- |
| `code`   | string | Код авторизації |
| `state`  | string | UUID інтеграції |

**Response `200`:**

```json
{ "message": "cTrader connected successfully" }
```

---

## 17. Автоматизації

Кожна база може мати до **10 автоматизацій**. Кожна автоматизація складається з тригера і дії. Система зберігає лог останніх **50 запусків**.

**Тригери:** `field_changed` · `record_created` · `scheduled`

**Дії:** `set_field_value` · `create_record` · `link_records`

### POST /automations `[auth]`

**Request body:**

```json
{
  "databaseId": "uuid", // required
  "name": "Auto-set Status", // optional, 1–120 символів
  "isActive": true, // optional, за замовчуванням true
  "trigger": {
    // required
    "type": "field_changed", // field_changed | record_created | scheduled
    "config": {
      // для field_changed:
      "propertyId": "uuid",
      "condition": "equals", // equals | not_equals | is_empty | is_not_empty
      "value": "Done"

      // для scheduled:
      // "cron": "0 9 * * 1-5"  // CRON-вираз (UTC)

      // для record_created: config не потрібен
    }
  },
  "action": {
    // required
    "type": "set_field_value", // set_field_value | create_record | link_records
    "config": {
      // для set_field_value:
      "propertyId": "uuid",
      "value": "Archived"

      // для create_record:
      // "databaseId": "uuid",
      // "values": [{ "propertyId": "uuid", "value": "..." }]

      // для link_records:
      // "sourcePropertyId": "uuid",
      // "targetRecordId": "uuid"
    }
  }
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "databaseId": "uuid",
  "name": "Auto-set Status",
  "isActive": true,
  "trigger": {
    "type": "field_changed",
    "config": {
      /* ... */
    }
  },
  "action": {
    "type": "set_field_value",
    "config": {
      /* ... */
    }
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET /automations?databaseId=:id `[auth]`

**Response `200`:** масив AutomationResponse.

---

### GET /automations/:id `[auth]`

**Response `200`:** один AutomationResponse.

---

### PATCH /automations/:id `[auth]`

**Request body:** (усі поля опціональні)

```json
{
  "name": "Updated Name",
  "isActive": false,
  "trigger": {
    /* нова конфігурація тригера */
  },
  "action": {
    /* нова конфігурація дії */
  }
}
```

**Response `200`:** оновлений AutomationResponse.

---

### DELETE /automations/:id `[auth]`

**Response `200`:**

```json
{ "message": "Automation deleted successfully" }
```

---

### POST /automations/:id/test `[auth]`

Запускає автоматизацію вручну на тестовому записі.

**Request body:**

```json
{ "recordId": "uuid" }
```

**Response `200`:**

```json
{
  "success": true,
  "log": {
    "triggeredAt": "2025-05-23T14:00:00.000Z",
    "status": "success",
    "details": "Field 'Status' set to 'Archived'"
  }
}
```

---

### GET /automations/:id/logs `[auth]`

Повертає лог останніх 50 запусків автоматизації.

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "automationId": "uuid",
    "triggeredAt": "2025-05-23T14:00:00.000Z",
    "status": "success", // success | error
    "recordId": "uuid",
    "details": "Field 'Status' set to 'Archived'",
    "error": null
  }
]
```

---

## 18. Сповіщення

### GET /notifications `[auth]`

Повертає всі сповіщення поточного користувача (від новіших до старіших).

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "automation_error", // automation_error | import_complete | sync_error | ...
    "title": "Automation failed",
    "body": "Automation 'Auto-set Status' failed: property not found",
    "isRead": false,
    "createdAt": "2025-05-23T14:00:00.000Z",
    "meta": {
      // optional — посилання на пов'язаний ресурс
      "automationId": "uuid",
      "databaseId": "uuid"
    }
  }
]
```

---

### PATCH /notifications/:id/read `[auth]`

Позначає сповіщення як прочитане.

**Response `200`:**

```json
{ "id": "uuid", "isRead": true }
```

---

### PATCH /notifications/read-all `[auth]`

Позначає всі сповіщення як прочитані.

**Response `200`:**

```json
{ "message": "All notifications marked as read" }
```

---

### DELETE /notifications `[auth]`

Видаляє всі сповіщення поточного користувача.

**Response `200`:**

```json
{ "message": "Notifications cleared" }
```

---

## 19. Налаштування (Settings)

Налаштування зберігаються за категоріями. Ключ та значення кожної категорії визначаються відповідним інтерфейсом. Всі категорії повертають / приймають об'єкт `value`.

### GET /settings/:category `[auth]`

### PATCH /settings/:category `[auth]`

**Категорії:**

| Категорія      | Опис                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| `profile`      | Ім'я, email, аватар, мова інтерфейсу                                            |
| `security`     | Зміна пароля, перегляд активних сесій, відключення всіх пристроїв               |
| `appearance`   | Тема (light/dark/system), щільність інтерфейсу, шрифт                           |
| `workspace`    | Налаштування простору: сортування баз, поведінка за замовчуванням               |
| `sections`     | Налаштування секцій: відображення, порядок                                      |
| `databases`    | Налаштування баз: пагінація за замовчуванням, видимість колонок                 |
| `records`      | Налаштування записів: поля картки за замовчуванням                              |
| `integrations` | Конфігурація пов'язаних інтеграцій (readonly, для отримання статусу підключень) |

**Request body:** часткове оновлення налаштувань категорії.

**Response `200`:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "key": "appearance",
  "value": {
    "theme": "dark",
    "density": "compact",
    "font": "system"
  }
}
```

---

## 20. Коди помилок

| HTTP                    | Причина                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `201 Created`           | Ресурс успішно створено                                       |
| `400 Bad Request`       | Валідаційна помилка; порушення foreign key (`P2003`)          |
| `401 Unauthorized`      | Відсутній або прострочений access token                       |
| `403 Forbidden`         | Користувач не є власником ресурсу                             |
| `404 Not Found`         | Ресурс не знайдено (`P2025`)                                  |
| `409 Conflict`          | Порушення унікальності (дублікат імені, email тощо) (`P2002`) |
| `413 Payload Too Large` | Файл перевищує ліміт (імпорт: 25 МБ)                          |
| `422 Unprocessable`     | Файл пройшов валідацію розміру, але має структурні помилки    |
| `429 Too Many Requests` | Перевищено rate limit                                         |
