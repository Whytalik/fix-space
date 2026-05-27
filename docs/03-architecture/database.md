# Фізична модель даних та БД (FIX Space)

Цей документ деталізує фізичну реалізацію бази даних PostgreSQL через Prisma ORM.

## 1. Схема бази даних (ERD)

### 1.1. Перелік таблиць

| Таблиця                  | Призначення                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `User`                   | Акаунт користувача — власник усіх даних                               |
| `RefreshToken`           | Хешований refresh-токен для оновлення сесії                           |
| `EmailVerificationToken` | Одноразовий токен підтвердження email                                 |
| `PasswordResetToken`     | Одноразовий токен скидання пароля                                     |
| `Settings`               | Ключ-значення налаштувань користувача за категоріями                  |
| `Notification`           | In-app сповіщення (інтеграції, автоматизації, система)                |
| `IntegrationConnection`  | Підключення до зовнішніх брокерських сервісів                         |
| `Space`                  | Ізольований робочий простір                                           |
| `Section`                | Навігаційна група баз даних у сайдбарі                                |
| `Database`               | Структурована колекція записів із набором властивостей                |
| `Property`               | Колонка бази даних із типом та конфігурацією                          |
| `Record`                 | Рядок бази даних; набір комірок + контентна область                   |
| `PropertyValue`          | Значення однієї комірки (пара «запис × властивість»)                  |
| `RecordContent`          | Контентна область запису (блоки, зображення, чеклісти), 1:1 до Record |
| `Template`               | Пресет значень властивостей для прискореного створення записів        |
| `TemplatePropertyValue`  | Попередньо заповнене значення в шаблоні                               |
| `View`                   | Збережене подання бази (фільтри, сортування, групування, колонки)     |
| `Automation`             | Правило автоматизації: тригер → умова → дії                           |
| `AutomationLog`          | Журнал виконання автоматизації                                        |
| `ImportMapping`          | Збережений маппінг CSV-стовпців до властивостей бази                  |
| `ImportHistory`          | Історія імпортів: статус, кількість записів, логи помилок             |

### 1.2. Enums

| Enum                 | Значення                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `PropertyType`       | `TEXT`, `NUMBER`, `DATE`, `CHECKBOX`, `SELECT`, `STATUS`, `RELATION`, `FORMULA`, `RATING`, `PROGRESS`, `DURATION`, `BUTTON` |
| `AutomationTrigger`  | `ON_RECORD_CREATE`, `ON_FIELD_CHANGE`, `ON_SCHEDULE`                                                                        |
| `AutomationStatus`   | `PENDING`, `SUCCESS`, `FAILED`, `SKIPPED`                                                                                   |
| `NotificationType`   | `INTEGRATION`, `AUTOMATION`, `SYSTEM`                                                                                       |
| `IntegrationService` | `BINANCE`, `BYBIT`, `OKX`, `MT5`, `CTRADER`                                                                                 |
| `IntegrationStatus`  | `CONNECTED`, `SYNCING`, `ERROR`, `DISCONNECTED`                                                                             |
| `ImportStatus`       | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`                                                                             |

### 1.3. ER-діаграма

Діаграма винесена в окремий файл: [`docs/diagrams/ER_Diagram.plantuml`](../diagrams/ER_Diagram.plantuml)

**Перегляд:**

- **VS Code** — розширення _PlantUML_ (відкрити файл → `Alt+D` для preview)
- **Онлайн** — [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) → вставити вміст файлу
- **CLI** — `plantuml docs/diagrams/ER_Diagram.plantuml` → згенерує PNG

### 1.4. Зв'язки між таблицями (текстова форма)

```
User 1──N Space
User 1──N Settings
User 1──N RefreshToken
User 1──N EmailVerificationToken
User 1──N PasswordResetToken
User 1──N Notification
User 1──N IntegrationConnection

Space 1──N Section
Space 1──N Database

Section 1──N Database  (onDelete: SetNull)

Database 1──N Property
Database 1──N Record
Database 1──N Template
Database 1──N View
Database 1──N Automation
Database 1──N ImportMapping

Property 1──N PropertyValue
Property 1──N TemplatePropertyValue

Record 1──N PropertyValue
Record 1──1 RecordContent
Record N──1 Template (sourceTemplate, onDelete: SetNull)

Template 1──N TemplatePropertyValue
Template 1──N Record

Automation 1──N AutomationLog

ImportMapping 1──N ImportHistory
```

## 2. Стратегія видалення даних (Cascade & Soft Deletes)

- **Hard Deletes (Каскадне видалення):**
  - Видалення `User` → видаляє `Space`, `Section`, `Database`, `Record`, `Property`, `Notification`, `IntegrationConnection`, `Settings`, токени тощо.
  - Видалення `Space` → видаляє всі `Section`, `Database` та їхні підграфи.
  - Видалення `Database` → видаляє всі пов'язані `Record`, `Property`, `Template`, `View`, `Automation`, `ImportMapping` та їхні підграфи.
  - Видалення `Record` → видаляє `PropertyValue`, `RecordContent`.
  - Видалення `Property` → видаляє всі `PropertyValue`, `TemplatePropertyValue`.
  - Видалення `Template` → видаляє `TemplatePropertyValue`; `Record.sourceTemplate` стає `null` (SetNull).
  - Видалення `Automation` → видаляє `AutomationLog`.
  - Видалення `ImportMapping` → видаляє `ImportHistory`.
- **SetNull:**
  - Видалення `Section` → `sectionId` у таблиці `Database` стає `null` (бази переносяться у «Несортоване»).
  - Видалення `Template` → `templateId` у `Record` стає `null` (записи зберігаються без прив'язки до шаблону).
- **Soft Deletes (Кошик):**
  - Видалення `Record` → встановлюється поле `deletedAt` (Timestamp). Записи з `deletedAt != null` не враховуються у фільтрах, пошуку, статистиці, формулах, `LINKED_VIEW` та лімітах бази. Записи автоматично очищуються через 30 днів (cron job або background worker).

## 3. Зберігання гнучких структур (JSONB)

_Як реляційна база працює з нереляційними даними._

### 3.1. Таблиця `PropertyValue`

- Поле `value` має тип `JSONB`.
- **Чому JSONB?** Дозволяє зберігати числа, рядки, булеві значення, масиви (для Multi-Select або Relation) та об'єкти конфігурації в одній колонці без створення десятків таблиць-зв'язок.

### 3.2. Таблиця `RecordContent`

- Поле `content` (тип `JSONB`).
- Зберігає повне дерево візуальних компонентів запису: Row → Column → Block → Component.

### 3.3. Таблиця `Settings`

- Поле `value` (тип `JSONB`).
- Зберігає налаштування довільної структури за категоріями: `profile`, `security`, `appearance`, `workspace`, `sections`, `databases`, `records`, `integrations`.

### 3.4. Таблиця `Automation`

- Поля `condition`, `actions`, `config` (тип `JSONB`).
- `condition` — умова тригера (яке поле, яке значення для `ON_FIELD_CHANGE`; розклад для `ON_SCHEDULE`).
- `actions` — масив дій до 5 елементів (встановити поле, створити запис, зв'язати записи).

### 3.5. Таблиця `IntegrationConnection`

- Поля `credentials`, `config` (тип `JSONB`).
- `credentials` — зашифровані облікові дані (API Key/Secret, OAuth tokens тощо).

### 3.6. Таблиця `View`

- Поля `filters`, `sort`, `columnOrder`, `columnWidths` (тип `JSONB`).
- Дозволяє зберігати довільну конфігурацію подання без фіксованої схеми колонок.

### 3.7. Таблиці імпорту

- `ImportMapping.mappingRules` (JSONB) — правила маппінгу CSV-стовпців.
- `ImportHistory.errorLog`, `sourceFileInfo` (JSONB) — логи помилок та метадані файлу.

## 4. Індексування та оптимізація

_Для забезпечення швидкості (відповідь API < 300ms)._

- **B-Tree індекси:**
  - На зовнішні ключі (`spaceId`, `databaseId`, `recordId`, `propertyId`, `templateId`, `automationId`, `importMappingId`).
  - На поля сортування та фільтрації (`createdAt`, `updatedAt`, `deletedAt`, `position`, `isRead`, `active`, `status`).
  - На унікальні поля (`email`, `username`, `userId + key` для Settings, `ownerId + name` для Space, `spaceId + name` для Database, `databaseId + name` для Template/View, `recordId + propertyId` для PropertyValue, `templateId + propertyId` для TemplatePropertyValue).
- **GIN індекси (опціонально для масштабування):**
  - Для текстового пошуку по полю `content` у JSONB (`RecordContent`).

## 5. Обмеження унікальності (Unique Constraints)

| Constraint                           | Таблиця                 | Пояснення                                                     |
| ------------------------------------ | ----------------------- | ------------------------------------------------------------- |
| `@@unique([userId, key])`            | `Settings`              | Один ключ налаштування на користувача                         |
| `@@unique([ownerId, name])`          | `Space`                 | Два простори одного користувача не можуть мати однакову назву |
| `@@unique([spaceId, name])`          | `Section`               | Дві секції одного простору не можуть мати однакову назву      |
| `@@unique([spaceId, name])`          | `Database`              | Дві бази одного простору не можуть мати однакову назву        |
| `@@unique([databaseId, name])`       | `Template`              | Два шаблони одної бази не можуть мати однакову назву          |
| `@@unique([databaseId, name])`       | `View`                  | Два подання одної бази не можуть мати однакову назву          |
| `@@unique([recordId, propertyId])`   | `PropertyValue`         | Одне значення на пару «запис × властивість»                   |
| `@@unique([templateId, propertyId])` | `TemplatePropertyValue` | Одне значення на пару «шаблон × властивість»                  |
| `recordId UNIQUE`                    | `RecordContent`         | Один контент на запис (1:1)                                   |

### 1.5. Опис сутностей

| Сутність                 | Батько              | Призначення                                                                            |
| ------------------------ | ------------------- | -------------------------------------------------------------------------------------- |
| `User`                   | —                   | Акаунт; власник усіх даних платформи                                                   |
| `Space`                  | User                | Ізольований робочий простір; мін. 1, макс. 10 на користувача                           |
| `Section`                | Space               | Іменована навігаційна група баз даних у сайдбарі; не зберігає даних                    |
| `Database`               | Space (+ Section?)  | Структурована колекція записів із набором властивостей; `recordLimit`, `isLocked`      |
| `Property`               | Database            | Колонка бази даних із фіксованим типом і конфігурацією                                 |
| `Record`                 | Database            | Рядок бази; набір комірок + контентна область; soft delete → Кошик 30 днів             |
| `PropertyValue`          | Record + Property   | Значення однієї комірки: пара «запис × властивість», унікальна в межах запису          |
| `RecordContent`          | Record              | Контентна область запису (блоки, зображення, чеклісти); зв'язок 1:1                    |
| `Template`               | Database            | Пресет значень властивостей та контентної структури для прискореного створення записів |
| `TemplatePropertyValue`  | Template + Property | Одне попередньо заповнене значення в шаблоні                                           |
| `View`                   | Database            | Збережене подання: фільтри, сортування, групування, видимість стовпців                 |
| `Automation`             | Database            | Правило автоматизації: тригер → умова → дія; ліміт 10 на базу                          |
| `AutomationLog`          | Automation          | Журнал виконання: запис-джерело, статус, час, текст результату                         |
| `IntegrationConnection`  | User                | Підключення до зовнішніх брокерських сервісів (Binance, MT5, cTrader)                  |
| `Notification`           | User                | In-app сповіщення; макс. 50 на користувача                                             |
| `Settings`               | User                | Ключ-значення налаштувань за категоріями: profile, security, appearance, workspace     |
| `RefreshToken`           | User                | Хешований refresh-токен із терміном дії та датою відкликання                           |
| `EmailVerificationToken` | User                | Одноразовий токен підтвердження email (діє 24 год)                                     |
| `PasswordResetToken`     | User                | Одноразовий токен скидання пароля (діє 1 год)                                          |
| `GoogleAccount`          | User                | Прив'язка Google OAuth: googleId, email, accessToken, refreshToken                     |

---

## 6. Data Dictionary

Повний перелік полів кожної таблиці — тип, обов'язковість та призначення.

### `User`

| Поле           | Тип      | Nullable | Опис                                                    |
| -------------- | -------- | -------- | ------------------------------------------------------- |
| `id`           | UUID     | —        | Первинний ключ                                          |
| `email`        | String   | —        | Унікальна email-адреса                                  |
| `username`     | String   | —        | Унікальний нікнейм                                      |
| `passwordHash` | String   | ✓        | bcrypt-хеш пароля; `null` якщо вхід тільки через Google |
| `icon`         | String   | ✓        | URL аватару профілю                                     |
| `isVerified`   | Boolean  | —        | Підтверджений email; за замовчуванням `false`           |
| `createdAt`    | DateTime | —        | Час реєстрації                                          |

### `RefreshToken`

| Поле        | Тип       | Nullable | Опис                                                                  |
| ----------- | --------- | -------- | --------------------------------------------------------------------- |
| `id`        | UUID      | —        | Первинний ключ                                                        |
| `userId`    | UUID (FK) | —        | Власник токена → `User`                                               |
| `tokenHash` | String    | —        | bcrypt-хеш refresh-токена; оригінал зберігається в cookie             |
| `expiresAt` | DateTime  | —        | Термін дії (30 днів від видачі, продовжується при ротації)            |
| `createdAt` | DateTime  | —        | Час видачі                                                            |
| `revokedAt` | DateTime  | ✓        | Час явного анулювання (logout або зміна пароля); `null` якщо активний |

### `EmailVerificationToken`

| Поле        | Тип       | Nullable | Опис                                             |
| ----------- | --------- | -------- | ------------------------------------------------ |
| `id`        | UUID      | —        | Первинний ключ                                   |
| `userId`    | UUID (FK) | —        | → `User`                                         |
| `tokenHash` | String    | —        | bcrypt-хеш токена з email-посилання              |
| `expiresAt` | DateTime  | —        | Термін дії (24 год)                              |
| `usedAt`    | DateTime  | ✓        | Час використання; `null` якщо ще не використаний |
| `createdAt` | DateTime  | —        | Час генерації                                    |

### `PasswordResetToken`

| Поле        | Тип       | Nullable | Опис                                |
| ----------- | --------- | -------- | ----------------------------------- |
| `id`        | UUID      | —        | Первинний ключ                      |
| `userId`    | UUID (FK) | —        | → `User`                            |
| `tokenHash` | String    | —        | bcrypt-хеш токена з email-посилання |
| `expiresAt` | DateTime  | —        | Термін дії (1 год)                  |
| `usedAt`    | DateTime  | ✓        | Час використання; одноразовий       |
| `createdAt` | DateTime  | —        | Час генерації                       |

### `GoogleAccount`

| Поле             | Тип               | Nullable | Опис                                           |
| ---------------- | ----------------- | -------- | ---------------------------------------------- |
| `id`             | UUID              | —        | Первинний ключ                                 |
| `userId`         | UUID (FK, unique) | —        | → `User`; один користувач — один Google-акаунт |
| `googleId`       | String (unique)   | —        | Унікальний ідентифікатор Google                |
| `email`          | String            | —        | Email із Google профілю                        |
| `displayName`    | String            | —        | Відображуване ім'я з Google                    |
| `avatarUrl`      | String            | ✓        | URL фото профілю Google                        |
| `accessToken`    | String            | —        | OAuth access token (зашифровано)               |
| `refreshToken`   | String            | —        | OAuth refresh token (зашифровано)              |
| `tokenExpiresAt` | DateTime          | —        | Термін дії access token                        |

### `Settings`

| Поле       | Тип       | Nullable | Опис                                                                                                            |
| ---------- | --------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `id`       | UUID      | —        | Первинний ключ                                                                                                  |
| `userId`   | UUID (FK) | —        | → `User`                                                                                                        |
| `key`      | String    | —        | Ключ налаштування (унікальний в межах користувача)                                                              |
| `value`    | Json      | —        | Значення налаштування (довільна структура)                                                                      |
| `category` | String    | —        | Категорія: `profile`, `security`, `appearance`, `workspace`, `sections`, `databases`, `records`, `integrations` |

### `Notification`

| Поле        | Тип              | Nullable | Опис                                    |
| ----------- | ---------------- | -------- | --------------------------------------- |
| `id`        | UUID             | —        | Первинний ключ                          |
| `userId`    | UUID (FK)        | —        | → `User`                                |
| `type`      | NotificationType | —        | `INTEGRATION` / `AUTOMATION` / `SYSTEM` |
| `text`      | String           | —        | Текст сповіщення                        |
| `isRead`    | Boolean          | —        | Прочитано; за замовчуванням `false`     |
| `link`      | String           | ✓        | Посилання на пов'язаний ресурс          |
| `createdAt` | DateTime         | —        | Час створення                           |

### `IntegrationConnection`

| Поле          | Тип                | Nullable | Опис                                                  |
| ------------- | ------------------ | -------- | ----------------------------------------------------- |
| `id`          | UUID               | —        | Первинний ключ                                        |
| `userId`      | UUID (FK)          | —        | → `User`                                              |
| `service`     | IntegrationService | —        | `BINANCE` / `BYBIT` / `OKX` / `MT5` / `CTRADER`       |
| `name`        | String             | —        | Довільна мітка підключення (напр. «Binance Main»)     |
| `credentials` | Json               | —        | Зашифровані облікові дані (API Key, OAuth token тощо) |
| `status`      | IntegrationStatus  | —        | `CONNECTED` / `SYNCING` / `ERROR` / `DISCONNECTED`    |
| `lastSyncAt`  | DateTime           | ✓        | Час останньої успішної синхронізації                  |
| `createdAt`   | DateTime           | —        | Час підключення                                       |
| `updatedAt`   | DateTime           | —        | Час останньої зміни                                   |
| `config`      | Json               | ✓        | Додаткова конфігурація (тип ринку, діапазон дат тощо) |

### `Space`

| Поле        | Тип       | Nullable | Опис                                       |
| ----------- | --------- | -------- | ------------------------------------------ |
| `id`        | UUID      | —        | Первинний ключ                             |
| `ownerId`   | UUID (FK) | —        | → `User`                                   |
| `name`      | String    | —        | Назва простору (унікальна для користувача) |
| `icon`      | String    | ✓        | Emoji або URL іконки                       |
| `isDefault` | Boolean   | —        | Основний простір (не може бути видалений)  |
| `createdAt` | DateTime  | —        | Час створення                              |

### `Section`

| Поле        | Тип       | Nullable | Опис                                      |
| ----------- | --------- | -------- | ----------------------------------------- |
| `id`        | UUID      | —        | Первинний ключ                            |
| `spaceId`   | UUID (FK) | —        | → `Space`                                 |
| `name`      | String    | —        | Назва секції (унікальна в межах простору) |
| `position`  | Int       | —        | Порядок у сайдбарі                        |
| `icon`      | String    | ✓        | Emoji або URL іконки                      |
| `color`     | String    | ✓        | Колір заголовка секції                    |
| `createdAt` | DateTime  | —        | Час створення                             |
| `updatedAt` | DateTime  | —        | Час останньої зміни                       |

### `Database`

| Поле                 | Тип       | Nullable | Опис                                                                      |
| -------------------- | --------- | -------- | ------------------------------------------------------------------------- |
| `id`                 | UUID      | —        | Первинний ключ                                                            |
| `spaceId`            | UUID (FK) | —        | → `Space`                                                                 |
| `sectionId`          | UUID (FK) | ✓        | → `Section`; `null` якщо база поза секцією (SetNull при видаленні секції) |
| `name`               | String    | —        | Системна назва (унікальна в межах простору)                               |
| `title`              | String    | —        | Відображувана назва                                                       |
| `icon`               | String    | ✓        | Emoji або URL іконки                                                      |
| `recordLimit`        | Int       | ✓        | Максимальна кількість активних записів; `null` = без обмеження            |
| `useDefaultTemplate` | Boolean   | —        | Автоматично застосовувати шаблон за замовчуванням при створенні запису    |
| `isPreset`           | Boolean   | —        | Попередньо налаштована (системна) база; не можна видалити                 |
| `isLocked`           | Boolean   | —        | Структура заблокована (заборонено змінювати властивості)                  |
| `createdAt`          | DateTime  | —        | Час створення                                                             |
| `updatedAt`          | DateTime  | —        | Час останньої зміни                                                       |

### `Property`

| Поле          | Тип          | Nullable | Опис                                                                                                                |
| ------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `id`          | UUID         | —        | Первинний ключ                                                                                                      |
| `databaseId`  | UUID (FK)    | —        | → `Database`                                                                                                        |
| `name`        | String       | —        | Назва властивості (унікальна в межах бази)                                                                          |
| `type`        | PropertyType | —        | Тип: TEXT / NUMBER / DATE / CHECKBOX / SELECT / STATUS / RELATION / FORMULA / RATING / PROGRESS / DURATION / BUTTON |
| `position`    | Int          | —        | Порядок стовпця в таблиці                                                                                           |
| `icon`        | String       | ✓        | Emoji іконки властивості                                                                                            |
| `hint`        | String       | ✓        | Підказка-tooltip                                                                                                    |
| `group`       | String       | ✓        | Група властивостей для візуального групування в картці запису                                                       |
| `isRequired`  | Boolean      | —        | Поле обов'язкове для заповнення                                                                                     |
| `isVisible`   | Boolean      | —        | Відображається в таблиці; за замовчуванням `true`                                                                   |
| `isProtected` | Boolean      | —        | Системна властивість; не можна видалити або змінити тип                                                             |
| `createdAt`   | DateTime     | —        | Час створення                                                                                                       |
| `updatedAt`   | DateTime     | —        | Час останньої зміни                                                                                                 |
| `config`      | Json         | ✓        | Конфігурація специфічна для типу (формати, опції, обмеження)                                                        |

### `Record`

| Поле         | Тип       | Nullable | Опис                                                                             |
| ------------ | --------- | -------- | -------------------------------------------------------------------------------- |
| `id`         | UUID      | —        | Первинний ключ                                                                   |
| `databaseId` | UUID (FK) | —        | → `Database`                                                                     |
| `templateId` | UUID (FK) | ✓        | → `Template`; шаблон, використаний при створенні (SetNull при видаленні шаблону) |
| `name`       | String    | —        | Заголовок запису; за замовчуванням `"Untitled"`                                  |
| `icon`       | String    | ✓        | Emoji іконки запису                                                              |
| `deletedAt`  | DateTime  | ✓        | Час переміщення до Кошика; `null` = активний запис                               |
| `createdAt`  | DateTime  | —        | Час створення                                                                    |
| `updatedAt`  | DateTime  | —        | Час останньої зміни                                                              |

### `PropertyValue`

| Поле         | Тип       | Nullable | Опис                                                                                          |
| ------------ | --------- | -------- | --------------------------------------------------------------------------------------------- |
| `id`         | UUID      | —        | Первинний ключ                                                                                |
| `recordId`   | UUID (FK) | —        | → `Record`                                                                                    |
| `propertyId` | UUID (FK) | —        | → `Property`                                                                                  |
| `value`      | Json      | ✓        | Значення комірки; тип залежить від `Property.type` (число / рядок / булеве / масив UUID тощо) |
| `computed`   | Boolean   | —        | `true` якщо значення обчислене формулою (read-only)                                           |

### `RecordContent`

| Поле           | Тип               | Nullable | Опис                                                                                      |
| -------------- | ----------------- | -------- | ----------------------------------------------------------------------------------------- |
| `id`           | UUID              | —        | Первинний ключ                                                                            |
| `recordId`     | UUID (FK, unique) | —        | → `Record`; зв'язок 1:1                                                                   |
| `content`      | Json              | —        | Дерево блоків контентної області: Row → Column → Block → Component; за замовчуванням `{}` |
| `lastEditedAt` | DateTime          | —        | Час останнього редагування (auto-update)                                                  |

### `Template`

| Поле          | Тип       | Nullable | Опис                                                                  |
| ------------- | --------- | -------- | --------------------------------------------------------------------- |
| `id`          | UUID      | —        | Первинний ключ                                                        |
| `databaseId`  | UUID (FK) | —        | → `Database`                                                          |
| `name`        | String    | —        | Назва шаблону (унікальна в межах бази); за замовчуванням `"Untitled"` |
| `description` | String    | ✓        | Короткий опис для вибору при створенні запису                         |
| `icon`        | String    | ✓        | Emoji або URL іконки                                                  |
| `isDefault`   | Boolean   | —        | Застосовується автоматично якщо `Database.useDefaultTemplate = true`  |
| `position`    | Int       | —        | Порядок у списку шаблонів                                             |
| `createdAt`   | DateTime  | —        | Час створення                                                         |
| `updatedAt`   | DateTime  | —        | Час останньої зміни                                                   |
| `config`      | Json      | ✓        | Додаткова конфігурація (наприклад `namePattern` для токенів назви)    |

### `TemplatePropertyValue`

| Поле         | Тип       | Nullable | Опис                                                                          |
| ------------ | --------- | -------- | ----------------------------------------------------------------------------- |
| `id`         | UUID      | —        | Первинний ключ                                                                |
| `templateId` | UUID (FK) | —        | → `Template`                                                                  |
| `propertyId` | UUID (FK) | —        | → `Property`                                                                  |
| `value`      | Json      | ✓        | Попередньо заповнене значення; підставляється у запис при створенні з шаблону |

### `View`

| Поле            | Тип       | Nullable | Опис                                                    |
| --------------- | --------- | -------- | ------------------------------------------------------- |
| `id`            | UUID      | —        | Первинний ключ                                          |
| `databaseId`    | UUID (FK) | —        | → `Database`                                            |
| `name`          | String    | —        | Назва подання (унікальна в межах бази)                  |
| `isDefault`     | Boolean   | —        | Відкривається першим при вході до бази                  |
| `isLocked`      | Boolean   | —        | Конфігурацію подання заблоковано від змін               |
| `position`      | Int       | —        | Порядок вкладки                                         |
| `filters`       | Json      | ✓        | Збережена конфігурація фільтрів (`FilterSet`)           |
| `sort`          | Json      | ✓        | Збережені критерії сортування                           |
| `groupBy`       | String    | ✓        | ID властивості для групування                           |
| `columnOrder`   | Json      | ✓        | Масив ID властивостей у порядку стовпців                |
| `columnWidths`  | Json      | ✓        | Ширина кожного стовпця у пікселях                       |
| `hiddenColumns` | String[]  | —        | Масив ID прихованих властивостей; за замовчуванням `[]` |
| `createdAt`     | DateTime  | —        | Час створення                                           |
| `updatedAt`     | DateTime  | —        | Час останньої зміни                                     |

### `Automation`

| Поле         | Тип               | Nullable | Опис                                                                          |
| ------------ | ----------------- | -------- | ----------------------------------------------------------------------------- |
| `id`         | UUID              | —        | Первинний ключ                                                                |
| `databaseId` | UUID (FK)         | —        | → `Database`                                                                  |
| `name`       | String            | —        | Назва автоматизації                                                           |
| `trigger`    | AutomationTrigger | —        | `ON_RECORD_CREATE` / `ON_FIELD_CHANGE` / `ON_SCHEDULE`                        |
| `condition`  | Json              | ✓        | Умова тригера (яке поле, яке значення або розклад)                            |
| `actions`    | Json              | —        | Масив дій до 5 елементів (встановити поле / створити запис / зв'язати записи) |
| `active`     | Boolean           | —        | Автоматизація увімкнена; за замовчуванням `true`                              |
| `position`   | Int               | —        | Порядок у списку автоматизацій                                                |
| `createdAt`  | DateTime          | —        | Час створення                                                                 |
| `updatedAt`  | DateTime          | —        | Час останньої зміни                                                           |
| `config`     | Json              | ✓        | Додаткова конфігурація (захист від рекурсії, метадані шаблону)                |

### `AutomationLog`

| Поле             | Тип              | Nullable | Опис                                                     |
| ---------------- | ---------------- | -------- | -------------------------------------------------------- |
| `id`             | UUID             | —        | Первинний ключ                                           |
| `automationId`   | UUID (FK)        | —        | → `Automation`                                           |
| `sourceRecordId` | UUID             | ✓        | ID запису, що спричинив тригер; `null` для `ON_SCHEDULE` |
| `status`         | AutomationStatus | —        | `PENDING` / `SUCCESS` / `FAILED` / `SKIPPED`             |
| `result`         | String           | ✓        | Опис результату або причини помилки в людській мові      |
| `createdAt`      | DateTime         | —        | Час виконання                                            |

### `ImportMapping`

| Поле           | Тип       | Nullable | Опис                                                  |
| -------------- | --------- | -------- | ----------------------------------------------------- |
| `id`           | UUID      | —        | Первинний ключ                                        |
| `databaseId`   | UUID (FK) | —        | → `Database`                                          |
| `name`         | String    | —        | Назва збереженого маппінгу                            |
| `sourceType`   | String    | —        | Тип джерела (наприклад `csv`)                         |
| `mappingRules` | Json      | —        | Правила зіставлення стовпців CSV з властивостями бази |
| `createdAt`    | DateTime  | —        | Час створення                                         |
| `updatedAt`    | DateTime  | —        | Час останньої зміни                                   |

### `ImportHistory`

| Поле              | Тип          | Nullable | Опис                                                |
| ----------------- | ------------ | -------- | --------------------------------------------------- |
| `id`              | UUID         | —        | Первинний ключ                                      |
| `importMappingId` | UUID (FK)    | —        | → `ImportMapping`                                   |
| `status`          | ImportStatus | —        | `PENDING` / `IN_PROGRESS` / `COMPLETED` / `FAILED`  |
| `recordsCreated`  | Int          | —        | Кількість успішно створених записів                 |
| `recordsFailed`   | Int          | —        | Кількість пропущених рядків через помилки валідації |
| `errorLog`        | Json         | ✓        | Деталі помилок (рядок CSV, причина відхилення)      |
| `sourceFileInfo`  | Json         | —        | Метадані файлу (ім'я, розмір, кодування)            |
| `createdAt`       | DateTime     | —        | Час початку імпорту                                 |
| `completedAt`     | DateTime     | ✓        | Час завершення; `null` якщо ще виконується          |

---

_Примітка: Інформація з цього документа ляже в основу Розділу 2 дипломної роботи (Проєктування бази даних)._
