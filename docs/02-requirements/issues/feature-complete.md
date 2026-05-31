[<- Назад до загального списку](../github-issues.md)

# Issues - Feature Complete

## #91 [Property] Delete custom property

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-034:** Як авторизований користувач, я хочу видаляти кастомні властивості, щоб прибрати зайві поля.

### Description

Видалення користувацької властивості разом з усіма її значеннями у записах. Системні властивості та Name захищені від видалення. Перед видаленням — попередження з переліком вразливих подань (фільтри, сортування, групування).

### Acceptance Criteria

- [ ] **Given** кастомна властивість, **When** натиснуто «Delete», **Then** підтвердження з попередженням
- [ ] Всі значення цієї властивості в записах видаляються
- [ ] Фільтри, сортування та групування в поданнях, що посилаються на цю властивість, видаляються автоматично
- [ ] Попередження перед видаленням містить перелік вразливих подань
- [ ] Системні властивості та Name захищені від видалення

### Technical Notes

**API:**

- `DELETE /api/properties/:id` → cascade delete values + cleanup view configs
- Pre-delete: check for affected views, formulas, automations

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: delete property з cascade
- [ ] Affected views detection та auto-cleanup
- [ ] System property protection guard

**Frontend (Web):**

- [ ] Delete confirmation з affected views list
- [ ] System property delete button disabled

### Functional Requirements

- [ ] **[§3.5]** Видалення користувацької властивості разом з усіма її значеннями в записах
- [ ] **[§3.5]** При видаленні властивості — автоматичне видалення всіх фільтрів, сортувань і групувань у поданнях, що на неї посилаються; перед видаленням відображається попередження з переліком вразливих подань

### References

- Functional: §3.5 Властивості
- User Stories: US-034

---

## #92 [Property] Reorder properties via drag-and-drop

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:property`, `layer:web`, `priority:must`

### User Story

**US-035:** Як авторизований користувач, я хочу змінювати порядок властивостей, щоб найважливіші відображалися першими.

### Description

Зміна порядку властивостей drag-and-drop у налаштуваннях або table view. Порядок визначає послідовність стовпців у таблиці та полів у картці запису.

### Acceptance Criteria

- [ ] Drag-and-drop у налаштуваннях або table view header для зміни порядку
- [ ] Name завжди першою (не можна перемістити)
- [ ] Порядок зберігається між сесіями
- [ ] Зміна порядку відображається одразу

### Technical Notes

**API:**

- `PATCH /api/databases/:id/properties/reorder` — body: `{ orderedIds: uuid[] }`

### Implementation Checklist

**Backend (API):**

- [ ] Reorder endpoint: update position field для кожної property

**Frontend (Web):**

- [ ] Drag-and-drop для property list/columns
- [ ] Name column pinned to first position

### Functional Requirements

- [ ] **[§3.5]** Зміна порядку властивостей (визначає порядок стовпців у базі та полів у картці запису)
- [ ] **[§3.9]** Закріплення першого стовпця (Name) при горизонтальному прокручуванні

### References

- Functional: §3.5 Властивості, §3.9 Подання (Views)
- User Stories: US-035

---

## #93 [Database] Create custom database

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:database`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-025:** Як авторизований користувач, я хочу створювати власні бази даних, щоб відстежувати специфічні дані, яких немає в пресетах.

### Description

Створення нової бази даних із довільною структурою. Нова БД створюється з мінімальним набором (властивість Name), отримує іконку за замовчуванням і відображається в обраній секції.

### Acceptance Criteria

- [ ] **Given** натиснуто «New database», **When** введено назву, **Then** створюється БД з властивістю Name
- [ ] БД отримує іконку за замовчуванням (з налаштувань або system default)
- [ ] БД відображається в обраній секції сайдбару
- [ ] БД не позначена як пресетна — можна видалити

### Technical Notes

**API:**

- `POST /api/workspaces/:id/databases` — body: `{ name, sectionId?, icon? }` → `201 Created`

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: create database
- [ ] Auto-create Name property

**Frontend (Web):**

- [ ] Create database dialog (name, section, icon)
- [ ] Sidebar update

### Functional Requirements

- [ ] **[§3.4]** Створення нової бази даних із довільною структурою

### References

- Functional: §3.4 Бази даних
- User Stories: US-025

---

## #94 [Database] Rename database

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:database`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-026:** Як авторизований користувач, я хочу перейменовувати бази даних, щоб їх назви відповідали вмісту.

### Description

Зміна назви БД. Нова назва відображається всюди: сайдбар, заголовок, RELATION-поля інших БД.

### Acceptance Criteria

- [ ] **Given** БД, **When** зміна назви, **Then** нова назва відображається в сайдбарі, заголовку та RELATION-посиланнях
- [ ] Порожня назва — помилка валідації

### Technical Notes

**API:**

- `PATCH /api/databases/:id` — body: `{ name }` → `200 OK`

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: update database name
- [ ] Validation: non-empty string

**Frontend (Web):**

- [ ] Inline rename в сайдбарі та заголовку
- [ ] Real-time update

### Functional Requirements

- [ ] **[§3.4]** Редагування назви та іконки бази даних

### References

- Functional: §3.4 Бази даних
- User Stories: US-026

---

## #95 [Database] Delete custom (non-preset) database

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:database`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-027:** Як авторизований користувач, я хочу видаляти кастомні бази даних, щоб прибрати непотрібне.

### Description

Видалення кастомної БД разом з усіма записами, властивостями та шаблонами. Пресетні БД захищені від видалення. Потрібне підтвердження.

### Acceptance Criteria

- [ ] **Given** кастомна БД, **When** натиснуто «Delete», **Then** підтвердження → БД видалено разом з усіма даними
- [ ] Пресетні БД мають disabled кнопку видалення з поясненням
- [ ] RELATION-властивості інших БД, що посилаються на видалену, переходять у broken state

### Technical Notes

**API:**

- `DELETE /api/databases/:id` → cascade: records, properties, templates, views
- Guard: isPreset check

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: delete database з cascade
- [ ] Preset protection guard
- [ ] RELATION broken state trigger

**Frontend (Web):**

- [ ] Delete confirmation dialog
- [ ] Preset badge + disabled delete

### Functional Requirements

- [ ] **[§3.4]** Видалення бази даних (пресетні бази даних видалити не можна)
- [ ] **[§3.4]** Відображення індикатора пресетної (системної) бази даних у сайдбарі та заголовку

### References

- Functional: §3.4 Бази даних
- User Stories: US-027

---

## #96 [Workspace] Create new workspace (max 5 per account)

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:workspace`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-011:** Як авторизований користувач, я хочу створити новий workspace, щоб розділити різні торгові стратегії або рахунки.

### Description

Створення додаткового workspace з пресетним набором БД. Ліміт: 5 workspace на акаунт. Новий workspace ініціалізується так само, як при реєстрації.

### Acceptance Criteria

- [ ] **Given** <5 workspace, **When** натиснуто «Create workspace», **Then** новий workspace створюється з пресетними БД
- [ ] **Given** 5 workspace, **When** спроба створити, **Then** помилка «Workspace limit reached (5)»
- [ ] Новий workspace містить всі 9 пресетних БД, секції, шаблони

### Technical Notes

**API:**

- `POST /api/workspaces` — body: `{ name }` → reuse initializeDefault logic
- Pre-check: count user workspaces ≤ 5

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: create workspace з ініціалізацією
- [ ] Limit check: max 5 per account

**Frontend (Web):**

- [ ] Create workspace dialog
- [ ] Limit warning

### Functional Requirements

- [ ] **[§3.2]** Можливість створення додаткових просторів і дублювання існуючого вирішує задачу безпечного експериментування зі структурою даних: трейдер може спробувати нову організацію баз даних або властивостей на копії простору, не ризикуючи накопиченими даними в основному. Якщо нова структура підходить — зміни вносяться в основний простір; якщо ні — копія видаляється (#153).
- [ ] **[§3.2]** Створення додаткового робочого простору
- [ ] **[§3.2]** Ліміт: до 5 робочих просторів на акаунт

### References

- Functional: §3.2 Робочий простір
- User Stories: US-011

---

## #97 [Workspace] Rename workspace

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:workspace`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-012:** Як авторизований користувач, я хочу перейменовувати workspace, щоб його назва відповідала актуальному змісту.

### Description

Зміна назви workspace. Відображається в сайдбарі та заголовку.

### Acceptance Criteria

- [ ] Нова назва відображається в сайдбарі та заголовку
- [ ] Порожня назва — помилка валідації

### Technical Notes

**API:**

- `PATCH /api/workspaces/:id` — body: `{ name }` → `200 OK`

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: update workspace name

**Frontend (Web):**

- [ ] Inline rename в sidebar/header

### Functional Requirements

- [ ] **[§3.2]** Редагування назви та іконки робочого простору

### References

- Functional: §3.2 Робочий простір
- User Stories: US-012

---

## #98 [Workspace] Delete workspace

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:workspace`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-013:** Як авторизований користувач, я хочу видалити workspace, щоб прибрати непотрібні дані.

### Description

Видалення workspace з усіма даними. Не можна видалити workspace, позначений як основний. Потрібне підтвердження.

### Acceptance Criteria

- [ ] **Given** не-основний workspace, **When** натиснуто «Delete», **Then** підтвердження → все видалено
- [ ] **Given** основний workspace, **When** спроба видалення, **Then** помилка «Cannot delete default workspace»
- [ ] Всі дані workspace видаляються (секції, БД, записи, шаблони)

### Technical Notes

**API:**

- `DELETE /api/workspaces/:id` → cascade all data
- Guard: isDefault check

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: delete workspace з cascade
- [ ] Default workspace protection

**Frontend (Web):**

- [ ] Delete confirmation dialog
- [ ] Default workspace — disabled delete

### Functional Requirements

- [ ] **[§3.17]** Перейменування та видалення наявних робочих просторів (видалення основного простору заборонено)
- [ ] **[§3.2]** Видалення робочого простору (не дозволяється видаляти простір, позначений як основний)

### References

- Functional: §3.17 Налаштування, §3.2 Робочий простір
- User Stories: US-013

---

## #99 [Section] Create section in workspace

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:section`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-018:** Як авторизований користувач, я хочу створювати розділи у workspace, щоб групувати пов'язані бази даних.

### Description

Створення нової секції з назвою, іконкою та кольором. Секція відображається в сайдбарі.

### Acceptance Criteria

- [ ] **Given** натиснуто «New section», **When** введено назву, **Then** секція з'являється в сайдбарі
- [ ] Можна задати іконку та колір при створенні або після

### Technical Notes

**API:**

- `POST /api/workspaces/:id/sections` — body: `{ name, icon?, color? }` → `201 Created`

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: create section з position auto-assign

**Frontend (Web):**

- [ ] Create section UI в sidebar

### Functional Requirements

- [ ] **[§3.3]** **Секція** — це іменована група баз даних усередині робочого простору. Вона не зберігає записи і не має власних налаштувань даних — її єдина функція полягає в організації навігаційної структури сайдбару.
- [ ] **[§3.3]** Створення нової секції

### References

- Functional: §3.3 Секції
- User Stories: US-018

---

## #100 [Section] Rename section

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:section`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-019:** Як авторизований користувач, я хочу перейменовувати розділи, щоб їх назви відповідали поточному змісту.

### Description

Редагування назви, іконки та кольору секції. Зміни відображаються одразу в сайдбарі.

### Acceptance Criteria

- [ ] Нова назва відображається одразу
- [ ] Порожня назва — помилка
- [ ] Можна змінити іконку та колір

### Technical Notes

**API:**

- `PATCH /api/sections/:id` — body: `{ name?, icon?, color? }` → `200 OK`

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: update section

**Frontend (Web):**

- [ ] Inline rename + icon/color picker

### Functional Requirements

- [ ] **[§3.3]** Редагування назви, іконки та кольору секції

### References

- Functional: §3.3 Секції
- User Stories: US-019

---

## #101 [Section] Delete section

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:section`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-020:** Як авторизований користувач, я хочу видаляти розділи, щоб прибрати непотрібні групи.

### Description

Видалення секції. БД з видаленої секції залишаються в просторі без прив'язки та відображаються нижче всіх секцій. Потрібне підтвердження якщо секція містить БД.

### Acceptance Criteria

- [ ] **Given** секція з БД, **When** натиснуто «Delete», **Then** підтвердження → секція видалена, БД стають «невпорядкованими»
- [ ] БД не видаляються разом з секцією
- [ ] Невпорядковані БД відображаються в сайдбарі нижче всіх секцій

### Technical Notes

**API:**

- `DELETE /api/sections/:id` → set databases.sectionId = null

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: delete section, unlink databases

**Frontend (Web):**

- [ ] Delete confirmation (if has databases)
- [ ] Unsectioned databases display in sidebar

### Functional Requirements

- [ ] **[§3.3]** Видалення секції (бази даних із видаленої секції залишаються в просторі без прив'язки до секції та відображаються в сайдбарі нижче всіх секцій)

### References

- Functional: §3.3 Секції
- User Stories: US-020

---

## #102 [Section] Reorder sections via drag-and-drop

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:section`, `layer:web`, `priority:must`

### User Story

**US-021:** Як авторизований користувач, я хочу змінювати порядок розділів у сайдбарі, щоб найважливіші відображалися першими.

### Description

Drag-and-drop для зміни порядку секцій у сайдбарі. Зміна порядку баз даних всередині секції. Зміни зберігаються між сесіями.

### Acceptance Criteria

- [ ] Drag-and-drop для секцій у сайдбарі
- [ ] Drag-and-drop для БД всередині секції
- [ ] Зміни зберігаються між сесіями

### Technical Notes

**API:**

- `PATCH /api/workspaces/:id/sections/reorder` — body: `{ orderedIds }` → `200 OK`
- `PATCH /api/sections/:id/databases/reorder` — body: `{ orderedIds }` → `200 OK`

### Implementation Checklist

**Backend (API):**

- [ ] Reorder endpoints: sections та databases within section

**Frontend (Web):**

- [ ] Drag-and-drop у sidebar для секцій та БД

### Functional Requirements

- [ ] **[§3.3]** Зміна порядку секцій у сайдбарі
- [ ] **[§3.3]** Зміна порядку баз даних усередині секції
- [ ] **[§3.4]** Зміна порядку баз даних усередині секції

### References

- Functional: §3.3 Секції, §3.4 Бази даних
- User Stories: US-021

---

## #103 [Settings] Update profile avatar and nickname

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:settings`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-117:** Як авторизований користувач, я хочу змінювати аватар та нікнейм у профілі, щоб персоналізувати свій акаунт.

### Description

Зміна аватара (завантаження зображення) та нікнейму в розділі Settings → Profile.

### Acceptance Criteria

- [ ] Завантаження нового зображення аватара
- [ ] Видалення поточного аватара
- [ ] Зміна нікнейму
- [ ] Зміни зберігаються одразу

### Technical Notes

**API:**

- `PATCH /api/users/me` — body: `{ nickname }` → `200 OK`
- `POST /api/users/me/avatar` — multipart file upload → `200 OK`
- `DELETE /api/users/me/avatar` → `200 OK`

### Implementation Checklist

**Backend (API):**

- [ ] Profile update endpoint (nickname)
- [ ] Avatar upload/delete endpoints

**Frontend (Web):**

- [ ] Profile settings page
- [ ] Avatar upload component
- [ ] Nickname input

### Functional Requirements

- [ ] **[§3.17]** Зміна аватару (завантаження нового зображення, видалення поточного)
- [ ] **[§3.17]** Зміна нікнейму

### References

- Functional: §3.17 Налаштування
- User Stories: US-117

---

## #104 [Settings] Change account email with verification

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:settings`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-118:** Як авторизований користувач, я хочу змінювати email-адресу акаунту з підтвердженням, щоб актуалізувати контактні дані.

### Description

Зміна email: лист верифікації надсилається на новий email. Після підтвердження — email змінюється, старий інвалідується.

### Acceptance Criteria

- [ ] **Given** введено новий email, **When** підтвердження, **Then** лист верифікації надіслано на новий email
- [ ] **Given** новий email підтверджений, **Then** email акаунту змінено
- [ ] Старий email більше не працює для входу

### Technical Notes

**API:**

- `POST /api/users/me/change-email` — body: `{ newEmail, password }` → sends verification email
- Verification flow similar to registration

### Implementation Checklist

**Backend (API):**

- [ ] Change email flow: verify current password → send verification → update on confirm

**Frontend (Web):**

- [ ] Change email form in settings
- [ ] Current password confirmation

### Functional Requirements

- [ ] **[§3.17]** Зміна електронної пошти облікового запису (потрібне підтвердження через лист на нову адресу)

### References

- Functional: §3.17 Налаштування
- User Stories: US-118

---

## #105 [Settings] Change password from security settings

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:settings`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-119:** Як авторизований користувач, я хочу змінювати пароль у налаштуваннях безпеки, щоб захистити акаунт.

### Description

Зміна пароля в Settings → Security. Потрібен поточний пароль. Після зміни — всі інші сесії інвалідуються, email-сповіщення надсилається.

### Acceptance Criteria

- [ ] **Given** введено поточний та новий пароль, **When** підтверджено, **Then** пароль змінено
- [ ] Всі інші сесії (крім поточної) інвалідуються
- [ ] Email-сповіщення про зміну пароля надіслано
- [ ] Неправильний поточний пароль — помилка

### Technical Notes

**API:**

- `POST /api/users/me/change-password` — body: `{ currentPassword, newPassword }` → `200 OK`

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: change password з current password verification
- [ ] Invalidate all other sessions
- [ ] Email notification

**Frontend (Web):**

- [ ] Change password form in security settings

### Functional Requirements

- [ ] **[§3.1]** Після зміни пароля (через скидання або в налаштуваннях) всі активні сесії анулюються; система надсилає сповіщення на email
- [ ] **[§3.17]** Зміна пароля (потрібен поточний пароль; після зміни всі активні сесії анулюються)

### References

- Functional: §3.1 Автентифікація та акаунт, §3.17 Налаштування
- User Stories: US-119

---

## #106 [Statistics] Trading statistics dashboard with key metrics and time filters

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:statistics`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-112 / US-113:** Як приватний трейдер, я хочу переглядати ключові торгові метрики на дашборді статистики з фільтрацією за часовим діапазоном, щоб оцінити ефективність торгівлі.

### Description

Дашборд статистики з автоматично розрахованими метриками з пресетних БД: Win Rate, Profit Factor, Expectancy, Max Drawdown, Average RR тощо. Фільтрація за часовими діапазонами (тиждень/місяць/квартал/рік/кастом).

### Acceptance Criteria

- [ ] Ключові метрики розраховуються автоматично з пресетних БД (Trading Journal)
- [ ] Метрики: Win Rate, Profit Factor, Expectancy, Max Drawdown, Average RR, Total Trades, Net P&L
- [ ] Пресети часових діапазонів: тиждень, місяць, квартал, рік
- [ ] Кастомний date picker для довільного діапазону
- [ ] Статистика перераховується миттєво при зміні фільтра

### Technical Notes

**API:**

- `GET /api/workspaces/:id/statistics` — query: `{ from, to }` → aggregated metrics

**Web:**

- Statistics page з metric cards та time range picker

### Implementation Checklist

**Backend (API):**

- [ ] Statistics aggregation service: query Trading Journal records + compute metrics
- [ ] Time range filtering

**Frontend (Web):**

- [ ] Statistics dashboard page
- [ ] Metric cards/widgets
- [ ] Time range picker (presets + custom)

### Functional Requirements

- [ ] **[§3.16]** Відображення ключових торгових метрик на основі пресетних баз даних
- [ ] **[§3.16]** Фільтрація всіх метрик за часовим діапазоном
- [ ] **[§3.16]** Відображення поведінкових метрик: динаміка оцінок у часі та зв'язок дотримання правил із результатом
- [ ] **[§3.16]** Відображення облікових показників по акаунтах: динаміка балансу, drawdown-крива, використання денних лімітів

### References

- Functional: §3.16 Статистика
- User Stories: US-112, US-113

---

## #107 [Statistics] Statistics period comparison and breakdown by property

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:statistics`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-114 / US-115:** Як приватний трейдер, я хочу порівнювати статистику між двома періодами та бачити розбивку за SELECT/STATUS властивостями, щоб відстежувати прогрес.

### Description

Порівняння метрик між двома часовими діапазонами з відображенням різниці у %. Розбивка статистики за SELECT/STATUS властивостями (наприклад, по напряму угоди, активу, стратегії).

### Acceptance Criteria

- [ ] Вибір двох діапазонів для порівняння
- [ ] Різниця у відсотках для кожної метрики
- [ ] Позитивні/негативні зміни візуально відрізняються (зелений/червоний)
- [ ] Вибір SELECT/STATUS властивості для розбивки
- [ ] Окрема статистика для кожного значення обраної властивості

### Technical Notes

**API:**

- `GET /api/workspaces/:id/statistics/compare` — query: `{ from1, to1, from2, to2 }` → comparison data
- `GET /api/workspaces/:id/statistics/breakdown` — query: `{ from, to, propertyId }` → grouped metrics

### Implementation Checklist

**Backend (API):**

- [ ] Comparison endpoint: two-period delta calculation
- [ ] Breakdown endpoint: group-by property value aggregation

**Frontend (Web):**

- [ ] Period comparison UI з delta indicators
- [ ] Property breakdown selector та display

### Functional Requirements

- [ ] **[§3.16]** Режим порівняння двох часових діапазонів: метрики обох діапазонів відображаються поруч із відносним відхиленням
- [ ] **[§3.16]** Автоматична генерація розбивок (breakdown) за кожною SELECT та STATUS властивістю пресетних баз — нова властивість з'являється як новий вимір без будь-якого налаштування

### References

- Functional: §3.16 Статистика
- User Stories: US-114, US-115

---

## #108 [Search] Global cross-database search with match highlighting (Ctrl+K)

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:search`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-085 / US-086:** Як авторизований користувач, я хочу шукати записи по всіх базах даних workspace через Ctrl+K, щоб знайти будь-який запис без навігації по розділах.

### Description

Глобальний пошук по всіх БД workspace: назва запису, значення властивостей, текст контентної області. Модальне вікно Ctrl+K/Cmd+K. Результати згруповані по БД, максимум 5 на БД. Збіги підсвічені.

### Acceptance Criteria

- [ ] Ctrl+K / Cmd+K відкриває модальне вікно пошуку з будь-якої сторінки
- [ ] Пошук починається від 2 символів, результати в реальному часі
- [ ] Область пошуку: назва, властивості, контент
- [ ] Результати згруповані по БД з назвою секції
- [ ] Максимум 5 результатів на БД + «показати всі»
- [ ] Збіги підсвічені (highlight)
- [ ] Клік на результат → перехід до запису
- [ ] Нещодавні пошукові запити при відкритті порожнього пошуку

### Technical Notes

**API:**

- `GET /api/workspaces/:id/search` — query: `{ q }` → grouped results

**Web:**

- Command palette modal (Ctrl+K)
- Debounced search
- Recent searches in localStorage

### Implementation Checklist

**Backend (API):**

- [ ] Full-text search across databases: name + property values + content text

**Frontend (Web):**

- [ ] Command palette modal
- [ ] Keyboard shortcut registration (Ctrl+K)
- [ ] Search results з grouping та highlighting
- [ ] Recent searches

### Functional Requirements

- [ ] **[§3.10]** Відкриття пошуку з будь-якої сторінки платформи (клавіатурний скорочення Ctrl+K / Cmd+K)
- [ ] **[§3.10]** Пошук починається з 2 введених символів; результати оновлюються в реальному часі
- [ ] **[§3.10]** Область пошуку: назва запису, значення властивостей, текст контентної області
- [ ] **[§3.10]** Результати згруповані за базами даних з назвою секції та бази
- [ ] **[§3.10]** Відображається до 5 результатів від кожної бази; посилання «показати всі результати в [назва бази]»
- [ ] **[§3.10]** Виділення знайденого фрагменту в рядку результату
- [ ] **[§3.10]** Перехід до запису при кліку на результат
- [ ] **[§3.10]** Відображення нещодавніх пошукових запитів при відкритті порожнього пошуку

### References

- Functional: §3.10 Пошук
- User Stories: US-085, US-086

---

## #109 [Record] Trash: sidebar navigation section for deleted records

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:record`, `layer:web`, `priority:should`

### User Story

**US-134:** Як авторизований користувач, я хочу переглядати Кошик як окрему навігаційну секцію з переліком видалених записів.

### Description

Кошик доступний через посилання в нижній частині сайдбару (відображається лише якщо в ньому є записи). Показує видалені записи з інформацією про БД, дату видалення та час до автовидалення.

### Acceptance Criteria

- [ ] Кошик відображається в сайдбарі лише якщо є видалені записи
- [ ] Кожен запис показує: назву, БД, дату видалення, днів до автовидалення
- [ ] Доступні: bulk restore та bulk permanent delete
- [ ] Записи з Кошика виключені з пошуку, фільтрів, статистики

### Technical Notes

**API:**

- `GET /api/workspaces/:id/trash` → list of soft-deleted records

**Web:**

- Trash page accessible from sidebar
- Conditional sidebar link (shown only if trash non-empty)

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: get trashed records with metadata (daysLeft, database name)

**Frontend (Web):**

- [ ] Trash page/panel
- [ ] Conditional sidebar link
- [ ] Bulk actions (restore, permanent delete)

### Functional Requirements

- [ ] **[§3.6]** Кошик доступний через посилання у нижній частині сайдбару (відображається лише якщо в ньому є записи)
- [ ] **[§3.6]** Відображення видалених записів із зазначенням бази даних, дати видалення та часу до автоматичного постійного видалення
- [ ] **[§3.6]** Записи у Кошику не враховуються у фільтрах, пошуку, підсумкових показниках, статистиці та лімітах бази даних; вони також не відображаються у LINKED_VIEW компонентах контентної області та не враховуються у FORMULA-розрахунках

### References

- Functional: §3.6 Записи
- User Stories: US-134

---

## #110 [Import/Export] CSV import with column mapping

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:import-export`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-087 / US-088:** Як приватний трейдер, я хочу імпортувати записи з CSV-файлу з ручним зіставленням колонок, щоб перенести дані з Excel.

### Description

Імпорт записів з CSV: завантаження файлу (≤25 МБ, UTF-8), попередній перегляд, маппінг колонок CSV до властивостей БД, валідація, підсумок, виконання. RELATION-поля виключені з маппінгу.

### Acceptance Criteria

- [ ] Завантаження CSV (≤25 МБ, UTF-8)
- [ ] Попередній перегляд перших рядків
- [ ] Таблиця маппінгу: колонки CSV ↔ властивості БД
- [ ] Ручна зміна зіставлення; незіставлені колонки ігноруються
- [ ] RELATION-властивості виключені з маппінгу
- [ ] Валідація значень перед імпортом
- [ ] Підсумок: N записів буде створено, M пропущено через помилки
- [ ] Фінальний звіт після імпорту

### Technical Notes

**API:**

- `POST /api/databases/:id/import/preview` — multipart file → parsed preview + suggested mapping
- `POST /api/databases/:id/import/execute` — body: `{ mapping, skipErrors }` → import result

**Web:**

- Import wizard: upload → preview → mapping → validation → confirm → report

### Implementation Checklist

**Backend (API):**

- [ ] CSV parser (handle UTF-8, large files)
- [ ] Column auto-mapping by name similarity
- [ ] Type validation per property
- [ ] Import execution: create records batch

**Frontend (Web):**

- [ ] Import wizard multi-step UI
- [ ] CSV preview table
- [ ] Mapping interface з dropdowns
- [ ] Validation summary
- [ ] Result report

### Functional Requirements

- [ ] **[§3.11]** Завантаження CSV-файлу до обраної бази даних (максимальний розмір файлу — 25 МБ; кодування UTF-8)
- [ ] **[§3.11]** Попередній перегляд перших рядків файлу перед підтвердженням
- [ ] **[§3.11]** Відображення зіставлення полів CSV-файлу із властивостями бази даних (field mapping); властивості типу RELATION виключені з маппінгу — CSV містить текстові значення, а не UUID записів, тому RELATION-поля не можуть бути встановлені через CSV-імпорт
- [ ] **[§3.11]** Можливість вручну змінити зіставлення (вибрати яку властивість відповідає якому стовпцю CSV)
- [ ] **[§3.11]** Валідація значень перед імпортом (відповідність типу властивості)
- [ ] **[§3.11]** Відображення підсумку перед підтвердженням (скільки записів буде створено, скільки рядків пропущено через помилки валідації)
- [ ] **[§3.11]** При перевищенні ліміту записів бази даних: у підсумку відображається попередження з кількістю рядків у файлі та поточним лімітом; пропонується імпортувати лише перші N дозволених записів або скасувати; імпорт без попередження ніколи не обрізається мовчки
- [ ] **[§3.11]** Підтвердження та виконання імпорту: некоректні рядки пропускаються, коректні імпортуються
- [ ] **[§3.11]** Відображення фінального звіту після імпорту (кількість імпортованих записів, список пропущених рядків із причиною)

### References

- Functional: §3.11 Імпорт та Експорт
- User Stories: US-087, US-088

---

## #111 [Import/Export] CSV export of database records

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:import-export`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-089:** Як приватний трейдер, я хочу експортувати записи бази даних у CSV-файл, щоб аналізувати дані у зовнішніх інструментах.

### Description

Вивантаження записів у CSV (UTF-8): вибір властивостей для включення, врахування активних фільтрів подання, включення мета-полів.

### Acceptance Criteria

- [ ] Вибір набору властивостей для включення до файлу
- [ ] Врахування активних фільтрів: всі записи або лише відфільтровані
- [ ] Включення мета-полів (назва, дата створення, дата оновлення)
- [ ] Файл завантажується автоматично (UTF-8)

### Technical Notes

**API:**

- `GET /api/databases/:id/export` — query: `{ propertyIds, viewId?, all? }` → CSV file download

### Implementation Checklist

**Backend (API):**

- [ ] CSV generation service
- [ ] Property selection, filter application, meta-fields

**Frontend (Web):**

- [ ] Export dialog: property selection, filter option
- [ ] Download trigger

### Functional Requirements

- [ ] **[§3.11]** Вивантаження записів бази даних у CSV-файл (кодування UTF-8)
- [ ] **[§3.11]** Вибір набору властивостей для включення до файлу (або всі)
- [ ] **[§3.11]** Врахування активних фільтрів подання: експорт усіх записів або лише відфільтрованих
- [ ] **[§3.11]** Включення мета-полів запису (назва, дата створення, дата оновлення)

### References

- Functional: §3.11 Імпорт та Експорт
- User Stories: US-089

---

## #112 [Record] Trash: restore record to its database

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-048:** Як авторизований користувач, я хочу відновлювати записи з Кошика, щоб повернути випадково видалені дані.

### Description

Відновлення запису з Кошика повертає його до оригінальної БД. RELATION-зв'язки відновлюються.

### Acceptance Criteria

- [ ] **Given** запис у Кошику, **When** натиснуто «Restore», **Then** запис повертається до своєї БД
- [ ] RELATION-зв'язки відновлюються (chips у інших записах стають нормальними)
- [ ] Кошик оновлюється

### Technical Notes

**API:**

- `POST /api/records/:id/restore` → set deletedAt = null

### Implementation Checklist

**Backend (API):**

- [ ] Restore endpoint: clear deletedAt

**Frontend (Web):**

- [ ] Restore button у trash view

### Functional Requirements

- [ ] **[§3.6]** Відновлення окремого запису до оригінальної бази даних
- [ ] **[§3.6]** Масове відновлення всіх записів або відфільтрованої групи

### References

- Functional: §3.6 Записи
- User Stories: US-048

---

## #113 [Record] Trash: permanently delete record

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-049:** Як авторизований користувач, я хочу остаточно видаляти записи з Кошика, щоб звільнити місце.

### Description

Постійне видалення запису з Кошика без можливості відновлення. Потрібне підтвердження. Також можна видалити всі записи Кошика одночасно.

### Acceptance Criteria

- [ ] **Given** запис у Кошику, **When** натиснуто «Delete permanently», **Then** підтвердження → запис видалено назавжди
- [ ] Кнопка «Delete all» для очищення всього Кошика
- [ ] Автовидалення через 30 днів (cron job)

### Technical Notes

**API:**

- `DELETE /api/records/:id/permanent` → hard delete
- `DELETE /api/workspaces/:id/trash` → hard delete all trashed

### Implementation Checklist

**Backend (API):**

- [ ] Permanent delete endpoint (single + bulk)
- [ ] Cascade: delete record values, content, snapshots

**Frontend (Web):**

- [ ] Permanent delete confirmation dialog
- [ ] «Delete all» button

### Functional Requirements

- [ ] **[§3.6]** Постійне видалення окремого запису або всіх записів у Кошику вручну до закінчення 30-денного терміну (з підтвердженням)

### References

- Functional: §3.6 Записи
- User Stories: US-049

---

## #114 [Record] Bulk edit property values across multiple records

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-050:** Як авторизований користувач, я хочу одночасно змінювати значення властивостей у кількох записах, щоб не редагувати кожен окремо.

### Description

Вибір кількох записів (checkbox, Shift+Click), потім floating toolbar з кількістю вибраних та кнопками «Edit property» і «Delete». Вибір властивості та нового значення → застосування до всіх. FORMULA та RELATION не підтримують масове редагування.

### Acceptance Criteria

- [ ] Вибір записів через checkbox або Shift+Click
- [ ] Floating toolbar: кількість вибраних, кнопки «Edit property», «Delete»
- [ ] Вибір властивості та нового значення → застосування до всіх
- [ ] FORMULA та RELATION виключені з масового редагування

### Technical Notes

**API:**

- `PATCH /api/databases/:id/records/bulk` — body: `{ recordIds, propertyId, value }` → `200 OK`

### Implementation Checklist

**Backend (API):**

- [ ] Bulk update endpoint
- [ ] Property type validation (exclude FORMULA, RELATION)

**Frontend (Web):**

- [ ] Multi-select (checkbox, Shift+Click)
- [ ] Floating action toolbar
- [ ] Property + value picker dialog

### Functional Requirements

- [ ] **[§3.6]** Масове редагування властивостей кількох записів одночасно: вибір записів через чекбокс або Shift+Click, флоатуюча панель із кількістю вибраних та кнопками «Редагувати властивість» і «Видалити»; при редагуванні — вибір властивості та нового значення з подальшим застосуванням до всіх вибраних записів; FORMULA і RELATION не підтримують масове редагування

### References

- Functional: §3.6 Записи
- User Stories: US-050

---

## #115 [Record] Bulk delete records to trash

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-051:** Як авторизований користувач, я хочу видаляти кілька записів одночасно в Кошик.

### Description

Масове видалення вибраних записів. Діалог підтвердження: «N записів потраплять до Кошика на 30 днів».

### Acceptance Criteria

- [ ] Вибір кількох записів → кнопка «Delete» у floating toolbar
- [ ] Підтвердження: «N записів потраплять до Кошика на 30 днів»
- [ ] Всі вибрані записи переміщуються до Кошика

### Technical Notes

**API:**

- `POST /api/databases/:id/records/bulk-delete` — body: `{ recordIds }` → soft delete all

### Implementation Checklist

**Backend (API):**

- [ ] Bulk soft-delete endpoint

**Frontend (Web):**

- [ ] Bulk delete confirmation dialog
- [ ] Multi-select integration

### Functional Requirements

- [ ] **[§3.6]** Масове видалення кількох записів одночасно; перед підтвердженням відображається діалог: «N записів потраплять до Кошика на 30 днів»

### References

- Functional: §3.6 Записи
- User Stories: US-051

---

## #116 [Workspace] Home dashboard: market sessions, workflow progress, daily summary

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:workspace`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-017:** Як приватний трейдер, я хочу бачити головну панель із ринковими сесіями, workflow та зведенням за сьогодні.

### Description

Домашня сторінка workspace: 4 блоки — індикатор ринкових сесій (Tokyo/Frankfurt/London/NY), щоденний workflow (Plan→Execute→Reflect→Log), картки «Сьогодні» (записи за день), міні-графіки (P&L Curve, Win Rate, RR Deviation).

### Acceptance Criteria

- [ ] Ринкові сесії: поточний час, активні сесії з кольоровими індикаторами
- [ ] Workflow: 4 кроки з прогресом (чи був запис сьогодні в кожній БД)
- [ ] «Сьогодні»: 4 картки з записами за поточний день + кнопка додавання
- [ ] Міні-графіки: P&L Curve, Win Rate Dynamics, RR Deviation
- [ ] Перехід до дашборду через кнопку в сайдбарі

### Technical Notes

**API:**

- `GET /api/workspaces/:id/dashboard` → aggregated dashboard data

**Web:**

- Dashboard page: 4-section layout
- Real-time session indicator (client-side timezone logic)
- Charts: lightweight charting library

### Implementation Checklist

**Backend (API):**

- [ ] Dashboard data aggregation: today's records, workflow status, chart data

**Frontend (Web):**

- [ ] Dashboard page layout
- [ ] Market session indicator (real-time)
- [ ] Workflow progress cards
- [ ] Today's records cards
- [ ] Mini charts (P&L, Win Rate, RR)

### Functional Requirements

- [ ] **[§3.2]** Кожен простір має **домашню сторінку** — окрему сторінку-дашборд, доступну через кнопку у сайдбарі. Вона є точкою входу до простору та відкривається автоматично при перемиканні між просторами.
- [ ] **[§3.2]** Домашня сторінка складається з чотирьох функціональних блоків:
- [ ] **[§3.2]** Перегляд домашньої сторінки (дашборду) поточного простору
- [ ] **[§3.2]** Перехід до домашньої сторінки через кнопку у сайдбарі
- [ ] **[§3.2]** Відображення поточного часу та активних торгових сесій у режимі реального часу
- [ ] **[§3.2]** Відображення статусу виконання щоденного воркфлоу (чи був створений хоча б один запис сьогодні в кожній із 4 баз)
- [ ] **[§3.2]** Швидке створення запису з домашньої сторінки (перехід до бази та відкриття нового запису в режимі редагування)
- [ ] **[§3.2]** Відображення записів, створених за поточний день, у секції «Сьогодні»
- [ ] **[§3.2]** Відображення міні-графіків поточної торгової статистики

### References

- Functional: §3.2 Робочий простір
- User Stories: US-017

---

## #117 [Database] Lock database structure (prevent property changes)

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:database`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-028:** Як авторизований користувач, я хочу блокувати структуру бази даних, щоб запобігти випадковим змінам властивостей.

### Description

Блокування структури БД: неможливо додати, редагувати або видалити властивості. Введення даних у записи залишається доступним. Індикатор заблокованої структури в заголовку.

### Acceptance Criteria

- [ ] **Given** БД заблокована, **When** спроба додати/видалити/редагувати властивість, **Then** дія заблокована
- [ ] Введення значень у записах залишається доступним
- [ ] Індикатор 🔒 у заголовку БД
- [ ] Розблокування через ту саму кнопку

### Technical Notes

**API:**

- `PATCH /api/databases/:id` — body: `{ isStructureLocked: boolean }` → `200 OK`
- Guard: check isStructureLocked on property CRUD operations

### Implementation Checklist

**Backend (API):**

- [ ] Database field: isStructureLocked
- [ ] Property CRUD guards

**Frontend (Web):**

- [ ] Lock/unlock toggle
- [ ] Lock indicator в header
- [ ] Disabled state для property actions

### Functional Requirements

- [ ] **[§3.4]** Блокування та розблокування структури бази даних (унеможливлює додавання, редагування та видалення властивостей; введення даних у записи залишається доступним)
- [ ] **[§3.4]** Відображення індикатора заблокованої структури у заголовку бази даних

### References

- Functional: §3.4 Бази даних
- User Stories: US-028

---

## #118 [Database] Column aggregate statistics in table view (COUNT, SUM, AVG, MEDIAN…)

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:database`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-030:** Як авторизований користувач, я хочу бачити підсумкову статистику по колонках, щоб аналізувати дані без ручних розрахунків.

### Description

Підсумкові показники в нижній частині кожного стовпця: для числових — COUNT/SUM/AVG/MEDIAN/MIN/MAX/RANGE, для CHECKBOX — checked/unchecked/%, для SELECT/STATUS — unique count, для DATE — earliest/latest/range. Враховуються лише видимі записи (з фільтрами).

### Acceptance Criteria

- [ ] Footer row під таблицею з aggregate значеннями
- [ ] Числові: COUNT, SUM, AVG, MEDIAN, MIN, MAX, RANGE (вибір через dropdown)
- [ ] CHECKBOX: checked, unchecked, % checked
- [ ] SELECT/STATUS: кількість унікальних значень
- [ ] DATE: найраніша, найпізніша, діапазон
- [ ] Всі типи: загальна кількість, заповнені, порожні
- [ ] Враховуються лише видимі записи (з фільтрами)

### Technical Notes

**API:**

- `GET /api/databases/:id/aggregates` — query: `{ viewId, propertyIds, functions }` → aggregate values

### Implementation Checklist

**Backend (API):**

- [ ] Aggregate computation engine (per property type)
- [ ] Filter-aware aggregation

**Frontend (Web):**

- [ ] Table footer row
- [ ] Aggregate function selector dropdown per column

### Functional Requirements

- [ ] **[§3.4]** Відображення підсумкових показників у нижній частині кожного стовпця бази даних:
- [ ] **[§3.4]** Підсумкові показники враховують лише записи, видимі в поточному поданні (з урахуванням активних фільтрів і пошукового запиту)

### References

- Functional: §3.4 Бази даних
- User Stories: US-030

---

## #119 [Formula] Custom formula property from gallery with live preview

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:formula`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-099 / US-100:** Як авторизований користувач, я хочу додавати формулу з галереї готових розрахунків з попереднім переглядом.

### Description

Галерея named calculations при додаванні FORMULA: загальні (умовний текст, різниця дат, відсоток, по пов'язаних записах, середній бал, категорія за порогом) та трейдерські (R-Multiple, запланований RR, ризик %, дотримання правил). Fill-in-the-blanks через дропдауни. Live preview на тестових даних.

### Acceptance Criteria

- [ ] Галерея пресетних обчислень з описами
- [ ] Опція «Свій розрахунок» з покроковим конструктором
- [ ] Fill-in-the-blanks: всі параметри через дропдауни (без ручного синтаксису)
- [ ] Доступні лише властивості сумісного типу
- [ ] FORMULA-властивості виключені з вибору (захист від циклів)
- [ ] Live preview: обчислене значення для першого запису в реальному часі
- [ ] Вихідний тип визначається автоматично

### Technical Notes

**API:**

- Formula gallery: hardcoded preset definitions
- Custom formula: AST-based expression builder

### Implementation Checklist

**Backend (API):**

- [ ] Formula preset definitions та templates
- [ ] Custom formula builder: AST → evaluation

**Frontend (Web):**

- [ ] Formula gallery UI
- [ ] Fill-in-the-blanks form per preset
- [ ] Step-by-step constructor for custom
- [ ] Live preview panel

### Functional Requirements

- [ ] **[§3.13]** При додаванні FORMULA-властивості відкривається галерея пресетних обчислень із назвами в мові трейдера (не технічні терміни)
- [ ] **[§3.13]** Кожен пресет містить короткий опис того, що буде відображатись у колонці
- [ ] **[§3.13]** Наявна опція «Свій розрахунок» для побудови власного обчислення через покроковий конструктор
- [ ] **[§3.13]** Вибір пресету одразу переводить до кроку заповнення пропусків
- [ ] **[§3.13]** Кожне поле пресету або конструктора заповнюється виключно через дропдауни: вибір властивості, оператора або фіксованого значення
- [ ] **[§3.13]** Користувач не вводить жодного синтаксису, функцій або посилань вручну
- [ ] **[§3.13]** Доступний для вибору лише властивості сумісного типу даних (число → числові поля, дата → поля типу DATE тощо)
- [ ] **[§3.13]** FORMULA-властивості не відображаються у списку доступних полів для вибору — це унеможливлює циклічні залежності на рівні інтерфейсу
- [ ] **[§3.13]** Вихідний тип (`NUMBER`, `TEXT`, `DATE`, `BOOLEAN`, `RATING`, `PROGRESS`, `DURATION`, масив об'єктів) визначається автоматично з обраного сценарію та не потребує явного вибору
- [ ] **[§3.13]** Підтримувані операції: математичні (+, −, ×, ÷), порівняння (більше, менше, дорівнює, не дорівнює), різниця між датами, об'єднання тексту
- [ ] **[§3.13]** Конструктор обмежений двома рівнями: `[поле / значення] [операція] [поле / значення]`; для умовного відображення: `якщо [умова] → показати [текст], інакше [текст]`
- [ ] **[§3.13]** Доступний лише якщо в базі є мінімум три числових поля (Ціна входу, Стоп-лосс, Ціна цілі)
- [ ] **[§3.13]** Wizard із трьох дропдаунів: «Ціна входу», «Стоп-лосс», «Ціна цілі» — кожен вибирається з NUMBER-полів бази
- [ ] **[§3.13]** Формула за лаштунками: `(Ціль − Вхід) / (Вхід − Стоп)` для Long; окрема кнопка «Угода є Short» інвертує знаменник: `(Вхід − Ціль) / (Стоп − Вхід)`
- [ ] **[§3.13]** Вихідний тип — число; від'ємне значення сигналізує про помилку у цінових рівнях (ціль і стоп розміщені неправильно)
- [ ] **[§3.13]** Wizard показує всі CHECKBOX-поля бази у вигляді списку з мультивибором — користувач позначає лише ті, що є правилами угоди
- [ ] **[§3.13]** Система рахує частку відмічених полів від обраних: `(Кількість відмічених / Загальна кількість обраних) × 100`
- [ ] **[§3.13]** Поля, не включені до списку правил, не впливають на результат
- [ ] **[§3.13]** Вихідний тип — число (відсоток від 0 до 100); порожній запис без жодного заповненого CHECKBOX дає 0%
- [ ] **[§3.13]** Користувач обирає від 2 до 5 полів типу NUMBER або RATING через мультивибір
- [ ] **[§3.13]** Система обчислює арифметичне середнє обраних полів у межах одного запису
- [ ] **[§3.13]** Якщо будь-яке з обраних полів порожнє у записі — воно виключається з обчислення (середнє рахується по заповнених полях)
- [ ] **[§3.13]** Користувач обирає одне числове поле та задає до 3 правил вигляду «якщо [поле] більше ніж [N] → показати [мітку]»
- [ ] **[§3.13]** Правила перевіряються зверху вниз; перше виконане — застосовується
- [ ] **[§3.13]** Обов'язкове поле «Інакше → показати [мітку]» визначає значення за замовчуванням
- [ ] **[§3.13]** Приклад: Grade > 4 → «Відмінно», Grade > 2 → «Нормально», інакше → «Слабо»
- [ ] **[§3.13]** Доступний лише якщо база даних має щонайменше одну RELATION-властивість
- [ ] **[§3.13]** Wizard із трьох кроків: 1) вибір RELATION-властивості; 2) вибір поля у пов'язаній базі; 3) вибір операції агрегації
- [ ] **[§3.13]** Підтримувані операції: Кількість (будь-яке поле) → `NUMBER`; Сума / Середнє / Мін / Макс (лише числові поля) → `NUMBER`; Найраніша / Найпізніша (лише DATE-поля) → `DATE`; Список значень (будь-яке поле) → масив об'єктів — повертає перелік усіх значень обраного поля з пов'язаних записів
- [ ] **[§3.13]** Доступні поля пов'язаної бази фільтруються за сумісністю з обраною операцією — несумісні поля у дропдауні не відображаються
- [ ] **[§3.13]** Значення перераховується автоматично при зміні будь-якого пов'язаного запису
- [ ] **[§3.13]** Панель налаштування формули відображає обчислене значення для першого наявного запису у реальному часі
- [ ] **[§3.13]** При відсутності записів у базі — відображається приклад з підставленими тестовими значеннями
- [ ] **[§3.13]** Попередній перегляд оновлюється миттєво при зміні будь-якого параметру конструктора
- [ ] **[§3.13]** Значення FORMULA-властивості є лише для читання — редагувати вручну неможливо
- [ ] **[§3.13]** Перерахунок відбувається автоматично при збереженні будь-якої зміни в записі
- [ ] **[§3.13]** Стандартні пресети та конструктор посилаються лише на властивості того ж запису; доступ до пов'язаних баз даних реалізований виключно через пресет «По пов'язаних записах»

### References

- Functional: §3.13 Формули
- User Stories: US-099, US-100

---

## #120 [Automation] Automation core: gallery templates, triggers, and actions

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:automation`, `layer:api`, `layer:web`, `layer:db`, `priority:should`

### User Story

**US-102 / US-103 / US-104:** Як авторизований користувач, я хочу створювати автоматизації з готових шаблонів з тригерами та діями.

### Description

Автоматизація: «КОЛИ → ТО» правила. Галерея шаблонів (загальні + трейдерські). Тригери: поле змінюється, запис створено, за розкладом. Дії: встановити значення, створити запис, зв'язати записи. Fill-in-the-blanks підхід. Максимум 10 автоматизацій на БД.

### Acceptance Criteria

- [ ] Галерея шаблонів (загальні та трейдерські) з описами
- [ ] «Почати з нуля» — порожня «КОЛИ → ТО» структура
- [ ] Тригери: поле змінюється (на конкретне значення), запис створено, за розкладом
- [ ] Дії: встановити поле, створити запис, зв'язати записи
- [ ] Максимум 10 автоматизацій на БД
- [ ] FORMULA-поля виключені з тригерів
- [ ] Захист від рекурсії

### Technical Notes

**API:**

- Automation model: trigger + conditions + actions
- Server-side execution engine
- Event system: record.created, record.updated, cron

### Implementation Checklist

**Backend (API):**

- [ ] Automation model: trigger, conditions, actions
- [ ] Event listeners: record changes, cron scheduler
- [ ] Action executors: set value, create record, link records
- [ ] Recursion protection (max depth 1)

**Frontend (Web):**

- [ ] Automation gallery
- [ ] КОЛИ → ТО builder UI
- [ ] Trigger/action config forms

### Functional Requirements

- [ ] **[§3.14]** При створенні автоматизації відкривається галерея шаблонів із назвами та коротким описом сценарію кожного
- [ ] **[§3.14]** Кожен шаблон містить структуру «КОЛИ → ТО» з підказками, які саме пропуски потрібно заповнити
- [ ] **[§3.14]** Наявна опція «Почати з нуля» — відкриває порожню структуру «КОЛИ → ТО» з тими самими дропдаунами
- [ ] **[§3.14]** Назви «тригер», «умова», «дія» не використовуються в інтерфейсі
- [ ] **[§3.14]** **Поле змінюється** — вибір конкретної властивості та, за необхідності, умови на нове значення: конкретне значення (наприклад, «Статус» змінюється на «Reviewed»); або для полів без переліку значень (DATE, NUMBER, TEXT, RELATION) — «заповнюється» (значення з порожнього стає непорожнім) або «очищається»; поля типу FORMULA виключені з цього тригера — їхнє значення перераховується системою автоматично і не є «зміною» з точки зору автоматизації
- [ ] **[§3.14]** **Запис створено** — спрацьовує при додаванні будь-якого нового запису до цієї бази даних
- [ ] **[§3.14]** **За розкладом** — вибір інтервалу (щодня / щотижня / щомісяця), дня тижня або числа місяця та часу доби; мінімальний інтервал — 1 день
- [ ] **[§3.14]** **Встановити значення поля** — вибір властивості поточного запису та нового значення: фіксоване значення, поточна дата або значення іншої властивості цього запису
- [ ] **[§3.14]** **Створити запис** — вибір цільової бази даних (та сама або інша в межах простору), перелік полів нового запису та їхніх значень; значення полів можуть бути фіксованими або перенесеними з полів запису, що спричинив тригер
- [ ] **[§3.14]** **Зв'язати записи** — пошук записів у вибраній базі даних за заданими фільтрами та додавання знайдених записів до RELATION-властивості поточного запису; фільтри підтримують посилання на поля поточного запису (наприклад, `Date between Date From..Date To`); режим запису: `replace` (замінити всі наявні зв'язки) або `append` (додати до існуючих); якщо будь-яке з полів, задіяних у фільтрах, порожнє — дія пропускається без помилки
- [ ] **[§3.14]** До однієї автоматизації можна додати до 5 дій; дії виконуються послідовно зверху вниз
- [ ] **[§3.14]** Редагування будь-якого параметру автоматизації без необхідності видаляти та створювати заново
- [ ] **[§3.14]** Видалення автоматизації (з підтвердженням)
- [ ] **[§3.14]** Ліміт: до 10 автоматизацій на базу даних
- [ ] **[§3.14]** Якщо дія автоматизації змінює поле, яке є тригером цієї ж автоматизації — новий тригер не запускається (захист від рекурсії)
- [ ] **[§3.14]** Автоматизації різних баз даних не взаємодіють між собою каскадно: якщо дія автоматизації створює запис в іншій базі — автоматизації тієї бази не запускаються через цей запис; це виключає можливість циклів типу A → B → A між різними базами, але не знімає з користувача відповідальність за логічну суперечність усередині однієї бази (кілька автоматизацій, що змінюють одне й те саме поле одна одній)
- [ ] **[§3.14]** Автоматизація з тригером «За розкладом» виконується лише якщо відповідна база даних існує та доступна

### References

- Functional: §3.14 Автоматизації
- User Stories: US-102, US-103, US-104

---

## #121 [Automation] Automation test run and execution log (last 50 runs)

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:automation`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-105 / US-106:** Як авторизований користувач, я хочу тестувати автоматизації та переглядати журнал їх виконання.

### Description

Тестовий запуск: показує що зміниться без реального збереження. Журнал виконання: останні 50 запусків з датою, часом, статусом (успіх/помилка), деталями помилки.

### Acceptance Criteria

- [ ] Тестовий запуск показує preview змін без реального запису
- [ ] Журнал: останні 50 запусків
- [ ] Кожен запис: дата, час, статус (success/error), деталі помилки
- [ ] Журнал доступний з панелі автоматизації

### Technical Notes

**API:**

- `POST /api/automations/:id/test` → dry-run result
- `GET /api/automations/:id/logs` → last 50 execution logs

### Implementation Checklist

**Backend (API):**

- [ ] Dry-run mode: execute без збереження, return preview
- [ ] Execution log storage (max 50 per automation)

**Frontend (Web):**

- [ ] Test run button + result preview
- [ ] Execution log panel

### Functional Requirements

- [ ] **[§3.14]** Кнопка «Перевірити» запускає автоматизацію вручну на обраному існуючому записі без збереження результату
- [ ] **[§3.14]** Після тесту відображається результат у людській мові: які поля були б змінені та якими значеннями
- [ ] **[§3.14]** Тестовий запуск доступний до активації автоматизації
- [ ] **[§3.14]** Для кожної автоматизації доступний журнал останніх 50 запусків
- [ ] **[§3.14]** Кожен рядок журналу містить: дату та час, назву запису, що спричинив тригер, результат у людській мові («встановлено "Reviewed At" = 25.05.2025») або опис помилки («пропущено: поле P&L порожнє»)
- [ ] **[§3.14]** Помилка одного запуску не блокує наступні

### References

- Functional: §3.14 Автоматизації
- User Stories: US-105, US-106

---

## #122 [Button] Button property in table view with action configuration

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-108 / US-109:** Як авторизований користувач, я хочу додавати кнопку як колонку в таблицю для виконання дій одним кліком.

### Description

BUTTON як тип «властивості» в table view: кнопка в кожному рядку. Дії: встановити поле, встановити кілька полів, створити запис. До 3 дій на кнопку.

### Acceptance Criteria

- [ ] Кнопка відображається в кожному рядку таблиці
- [ ] Натискання виконує налаштовані дії (до 3)
- [ ] Дії: встановити поле, встановити кілька полів, створити запис
- [ ] Дані оновлюються без перезавантаження

### Technical Notes

**API:**

- `POST /api/records/:id/buttons/:buttonId/execute` → execute button actions

### Implementation Checklist

**Backend (API):**

- [ ] Button property type з action config
- [ ] Button execution engine (reuse automation action executors)

**Frontend (Web):**

- [ ] Button cell renderer
- [ ] Button action config dialog

### Functional Requirements

- [ ] **[§3.15]** При додаванні BUTTON-властивості відкривається конфігураційна панель: мітка та мінімум одна дія є обов'язковими
- [ ] **[§3.15]** Для дій «Встановити значення поля» / «Встановити кілька полів» доступні всі властивості поточної бази, крім інших BUTTON- та FORMULA-властивостей
- [ ] **[§3.15]** Для дії «Створити запис в базі» доступні всі бази поточного простору; після вибору бази з'являється маппінг полів: яке поле поточного запису потрапляє у яке поле нового
- [ ] **[§3.15]** Порядок дій змінюється перетягуванням
- [ ] **[§3.15]** Ліміт: до 3 дій на одну кнопку
- [ ] **[§3.15]** Кнопка відображається в кожному рядку таблиці та у картці запису
- [ ] **[§3.15]** Під час виконання — стан «Виконується…» з індикатором
- [ ] **[§3.15]** После успішного завершення — тимчасовий стан «Готово» протягом 2 с; під кнопкою відображається час останнього успішного виконання; цей час зберігається як метадані `ButtonExecution { recordId, propertyId, executedAt }` — не є значенням властивості та не бере участі у фільтрації, сортуванні або формулах
- [ ] **[§3.15]** При помилці — повідомлення з коротким описом причини
- [ ] **[§3.15]** BUTTON-властивість не підтримує сортування, фільтрацію або групування — вона є дією, а не значенням
- [ ] **[§3.15]** BUTTON-властивість не доступна як вхід у формулах та автоматизаціях
- [ ] **[§3.15]** BUTTON-властивості виключені з масового редагування
- [ ] **[§3.15]** У шаблонах записів конфігурація BUTTON-властивості не зберігається — кнопки налаштовуються виключно на рівні бази даних

### References

- Functional: §3.15 Кнопка
- User Stories: US-108, US-109

---

## #123 [Button] Button component in record content area

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `layer:web`, `priority:should`

### User Story

**US-110:** Як авторизований користувач, я хочу додавати кнопки до вмісту запису.

### Description

BUTTON як компонент контентної області. Ті самі дії + «вставити блок» (з параметром позиції: after_last, before_first, after_section).

### Acceptance Criteria

- [ ] BUTTON-компонент доступний у content area
- [ ] Підтримує дії: встановити поле, створити запис, вставити блок
- [ ] Вставка блоку: вибір позиції (after_last, before_first, after_section)
- [ ] Відображається як інтерактивна кнопка

### Technical Notes

**Web:**

- Content component type: BUTTON
- Reuses button action execution from #122

### Implementation Checklist

**Frontend (Web):**

- [ ] BUTTON content component renderer
- [ ] Action config dialog (extended with «insert block»)
- [ ] Block insertion logic

### Functional Requirements

- [ ] **[§3.15]** Додається до контентної області запису або шаблону як окремий компонент (поруч із текстом, зображеннями тощо)
- [ ] **[§3.15]** Конфігурація (label, color, actions) задається окремо від BUTTON-властивості бази — один і той самий запис може мати і колонку-кнопку, і кнопку в контенті з різними діями
- [ ] **[§3.15]** Доступний набір дій — той самий, що й для BUTTON-властивості (встановити значення поля, встановити кілька полів, створити запис в базі), плюс ексклюзивна дія **«Вставити блок у контент»**: вставляє заздалегідь визначений блок у контентну область поточного запису із заданою позицією (`after_last` · `before_first` · `after_section`) та опційним підстановленням мітки часу у назву блоку
- [ ] **[§3.15]** У шаблонах конфігурація BUTTON-компонента зберігається разом із контентною областю та переноситься в новий запис при створенні з шаблону

### References

- Functional: §3.15 Кнопка
- User Stories: US-110

---

## #124 [View] Configurable records per page (10/25/50/75/100)

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:view`, `layer:web`, `priority:should`

### User Story

**US-078:** Як авторизований користувач, я хочу налаштовувати кількість записів на сторінці.

### Description

Вибір розміру сторінки: 10, 25, 50, 75 або 100 записів. Пагінація вимикається при активному групуванні.

### Acceptance Criteria

- [ ] Dropdown вибору: 10, 25, 50, 75, 100
- [ ] Навігація між сторінками (prev/next, номери сторінок)
- [ ] При активному групуванні — пагінація вимикається
- [ ] Вибір зберігається у view config

### Technical Notes

**Web:**

- Pagination controls: page size selector + page navigation
- View config: `pageSize` field

### Implementation Checklist

**Frontend (Web):**

- [ ] Page size selector dropdown
- [ ] Pagination controls (prev/next/numbers)
- [ ] Grouping check: disable pagination when grouped

### Functional Requirements

- [ ] **[§3.9]** Вибір розміру сторінки: 10, 25, 50, 75 або 100 записів
- [ ] **[§3.9]** Пагінація вимикається при активному групуванні

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-078

---

## #125 [View] Multi-column sort with drag-and-drop priority

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-079:** Як авторизований користувач, я хочу сортувати за кількома полями одночасно з пріоритетами.

### Description

Сортування за кількома властивостями або мета-полями одночасно. Drag-and-drop для зміни пріоритету. Напрямок (asc/desc) для кожного.

### Acceptance Criteria

- [ ] До 3 полів сортування одночасно
- [ ] Drag-and-drop для зміни пріоритету
- [ ] Перше поле має вищий пріоритет
- [ ] Мета-поля (createdAt, updatedAt) доступні для сортування

### Technical Notes

**API:**

- Query: `sort: [{ propertyId, direction }]` — array для multi-sort

### Implementation Checklist

**Backend (API):**

- [ ] Multi-column ORDER BY

**Frontend (Web):**

- [ ] Sort panel з drag-and-drop для priority
- [ ] Multiple sort criteria UI

### Functional Requirements

- [ ] **[§3.9]** Сортування записів за кількома властивостями або мета-полями одночасно (дата створення, дата оновлення)
- [ ] **[§3.9]** Визначення пріоритету між критеріями сортування
- [ ] **[§3.9]** Вибір напрямку (за зростанням / за спаданням) для кожного критерію

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-079

---

## #126 [View] Group records by property value or date period

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-080:** Як приватний трейдер, я хочу групувати записи за властивістю або датою.

### Description

Групування за одним критерієм: мета-поле (дата створення) або властивість. Для DATE — рівні деталізації (День/Тиждень/Місяць/Квартал/Рік). Групи згортаються/розгортаються. При групуванні пагінація вимикається.

### Acceptance Criteria

- [ ] Групування за SELECT, STATUS, DATE, мета-полями
- [ ] DATE: вибір деталізації (День/Тиждень/Місяць/Квартал/Рік)
- [ ] Записи без дати — група «Без дати»
- [ ] Згортання/розгортання груп
- [ ] Зміна кольору фону заголовка групи
- [ ] Пагінація вимикається при групуванні

### Technical Notes

**API:**

- Query: `groupBy: { propertyId, dateGranularity? }` → grouped response

### Implementation Checklist

**Backend (API):**

- [ ] Group-by query: GROUP BY property value or date bucket

**Frontend (Web):**

- [ ] Group headers з collapse/expand
- [ ] Group color customization
- [ ] Date granularity selector

### Functional Requirements

- [ ] **[§3.9]** Групування записів за одним критерієм: за мета-полем (дата створення) або за значенням властивості
- [ ] **[§3.9]** При групуванні за властивістю типу DATE — вибір рівня деталізації: День / Тиждень / Місяць / Квартал / Рік; за замовчуванням — Місяць; записи без дати виносяться в окрему групу «Без дати»
- [ ] **[§3.9]** При активному групуванні пагінація вимикається — відображаються всі записи
- [ ] **[§3.9]** Показ та приховування окремих груп
- [ ] **[§3.9]** Зміна кольору фону заголовка групи

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-080

---

## #127 [View] Save filter configuration as named preset

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-081:** Як авторизований користувач, я хочу зберігати конфігурацію фільтрів як пресет.

### Description

Іменовані фільтр-пресети (наприклад, «Збиткові угоди», «London session»). Збережений пресет застосовується одним кліком.

### Acceptance Criteria

- [ ] Збереження поточних фільтрів під назвою
- [ ] Список збережених пресетів
- [ ] Застосування пресету одним кліком
- [ ] Редагування та видалення пресетів

### Technical Notes

**API:**

- `POST /api/views/:id/filter-presets` — body: `{ name, filters }` → `201 Created`

### Implementation Checklist

**Backend (API):**

- [ ] Filter preset CRUD endpoints

**Frontend (Web):**

- [ ] Save filter preset dialog
- [ ] Preset list + apply/edit/delete

### Functional Requirements

- [ ] **[§3.9]** Створення та збереження іменованих фільтр-пресетів (наприклад, «Збиткові угоди», «London session»)
- [ ] **[§3.9]** Застосування та видалення іменованих фільтр-пресетів

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-081

---

## #128 [View] Multiple named views per database (max 10)

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `layer:db`, `priority:should`

### User Story

**US-082:** Як авторизований користувач, я хочу створювати кілька іменованих view для бази даних (максимум 10).

### Description

Кожна БД підтримує до 10 іменованих подань. Перемикання через вкладки. Кожне подання має свої фільтри, сортування, видимість колонок.

### Acceptance Criteria

- [ ] До 10 подань на БД
- [ ] Перемикання через вкладки в заголовку БД
- [ ] Створення, перейменування, дублювання, видалення подань
- [ ] Не можна видалити єдине подання
- [ ] View за замовчуванням

### Technical Notes

**API:**

- View CRUD endpoints
- Default view logic

### Implementation Checklist

**Backend (API):**

- [ ] View CRUD (create, rename, duplicate, delete)
- [ ] Default view logic
- [ ] Max 10 limit

**Frontend (Web):**

- [ ] View tabs у header БД
- [ ] View management menu

### Functional Requirements

- [ ] **[§3.9]** Кожна база даних підтримує до 10 іменованих подань
- [ ] **[§3.9]** Перемикання між поданнями через вкладки у заголовку бази даних
- [ ] **[§3.9]** Створення нового подання
- [ ] **[§3.9]** Перейменування подання
- [ ] **[§3.9]** Дублювання подання (зі збереженням усіх параметрів конфігурації)
- [ ] **[§3.9]** Видалення подання (не дозволяється видалити єдине подання бази даних)
- [ ] **[§3.9]** Встановлення подання за замовчуванням для бази даних (відкривається при кожному вході до бази; при першому відкритті — перше подання у списку)

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-082

---

## #129 [View] Lock view configuration

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-083:** Як авторизований користувач, я хочу блокувати конфігурацію view, щоб запобігти випадковій зміні.

### Description

Блокування подання: фільтри, сортування та видимість колонок не можна змінити. Пошук залишається доступним.

### Acceptance Criteria

- [ ] **Given** view заблоковане, **When** спроба змінити фільтри/сортування/видимість, **Then** дія заблокована
- [ ] Пошук залишається доступним
- [ ] Індикатор 🔒 на вкладці view

### Technical Notes

**API:**

- `PATCH /api/views/:id` — body: `{ isLocked: boolean }`

### Implementation Checklist

**Backend (API):**

- [ ] View field: isLocked
- [ ] Guards on config update endpoints

**Frontend (Web):**

- [ ] Lock/unlock toggle
- [ ] Disabled filter/sort/visibility controls when locked

### Functional Requirements

- [ ] **[§3.9]** Блокування та розблокування налаштувань подання (запобігає випадковій зміні фільтрів, сортування та групування)

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-083

---

## #130 [View] AND/OR logic for combining filter rules

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-084:** Як приватний трейдер, я хочу комбінувати фільтри з AND/OR логікою.

### Description

Перемикач AND/OR для групи фільтрів. AND = всі умови повинні виконуватись. OR = хоча б одна.

### Acceptance Criteria

- [ ] Перемикач AND/OR для групи фільтрів
- [ ] AND: всі умови виконуються (за замовчуванням)
- [ ] OR: хоча б одна умова виконується
- [ ] Коректне застосування до всіх типів властивостей

### Technical Notes

**API:**

- Filter query: `{ logic: "AND" | "OR", rules: [...] }`

### Implementation Checklist

**Backend (API):**

- [ ] Filter engine: AND/OR logic support

**Frontend (Web):**

- [ ] AND/OR toggle in filter panel

### References

- Functional: §3.9 (рядок 306)
- User Stories: US-084

---

## #131 [Content] Content version history: snapshots and restore

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:content`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-135:** Як авторизований користувач, я хочу переглядати та відновлювати збережені знімки вмісту запису.

### Description

Автоматичні знімки контентної області: кожні 5 хвилин та при значних змінах (додавання/видалення компонента, 200+ символів). Максимум 50 знімків. Перегляд списку та відновлення з будь-якого.

### Acceptance Criteria

- [ ] Автоматичне створення знімків: кожні 5 хв та при значних змінах
- [ ] Максимум 50 знімків на запис (FIFO)
- [ ] Перегляд списку знімків з часовими мітками
- [ ] Відновлення з будь-якого знімка (з підтвердженням)

### Technical Notes

**API:**

- `GET /api/records/:id/snapshots` → list
- `POST /api/records/:id/snapshots/:snapshotId/restore` → restore content

### Implementation Checklist

**Backend (API):**

- [ ] Snapshot creation: periodic + significant-change detection
- [ ] Snapshot storage (max 50, FIFO)
- [ ] Restore endpoint

**Frontend (Web):**

- [ ] Snapshot list panel
- [ ] Restore confirmation dialog

### Functional Requirements

- [ ] **[§3.7]** Автоматичне збереження знімків (snapshots) контентної області: кожні 5 хвилин та при значних змінах — додавання або видалення компонента, або зміна тексту більш ніж на 200 символів за раз (максимум 50 знімків на запис; при досягненні ліміту найстаріший знімок видаляється)
- [ ] **[§3.7]** Перегляд списку збережених знімків із мітками часу
- [ ] **[§3.7]** Відновлення контентної області із будь-якого збереженого знімку

### References

- Functional: §3.7 Контентна область запису
- User Stories: US-135

---

## #132 [Auth] Google OAuth login and registration

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:auth`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-006:** Як користувач, я хочу увійти через Google-акаунт, щоб не запам'ятовувати окремий пароль.

### Description

Вхід та реєстрація через Google OAuth 2.0. При першому вході — автоматичне створення акаунту (email з Google, нікнейм з display name, email вважається підтвердженим). Прив'язка/відв'язка Google-акаунту в налаштуваннях.

### Acceptance Criteria

- [ ] Кнопка «Sign in with Google» → redirect на Google → return з активною сесією
- [ ] При першому вході — автоматична реєстрація
- [ ] Email з Google вважається підтвердженим
- [ ] Прив'язка Google-акаунту до існуючого профілю в налаштуваннях
- [ ] Відв'язка Google-акаунту (лише якщо встановлено пароль)
- [ ] Користувач зареєстрований через Google може встановити пароль

### Technical Notes

**API:**

- Google OAuth 2.0 flow: `/api/auth/google` → redirect → `/api/auth/google/callback`
- Passport.js GoogleStrategy

### Implementation Checklist

**Backend (API):**

- [ ] Google OAuth strategy (Passport.js)
- [ ] Auto-registration on first Google login
- [ ] Link/unlink Google account endpoints

**Frontend (Web):**

- [ ] «Sign in with Google» button
- [ ] Google link/unlink в settings

### Functional Requirements

- [ ] **[§3.1]** Вхід через Google (OAuth 2.0) — натискання кнопки «Sign in with Google» перенаправляє на сторінку авторизації Google; після підтвердження користувач автоматично повертається до застосунку з активною сесією
- [ ] **[§3.1]** При першому вході через Google — автоматичне створення акаунту: email береться з Google профілю, нікнейм — з display name; email вважається підтвердженим (верифікація Google)
- [ ] **[§3.1]** Користувач, зареєстрований через Google, може встановити пароль у налаштуваннях (після цього доступний вхід і за email/password)
- [ ] **[§3.1]** Прив'язка Google-акаунту до існуючого профілю в налаштуваннях
- [ ] **[§3.1]** Відв'язка Google-акаунту в налаштуваннях (доступно лише якщо встановлено пароль — не можна залишити акаунт без жодного методу входу)

### References

- Functional: §3.1 Автентифікація та акаунт
- User Stories: US-006

---

## #133 [Auth] View list of active sessions

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:auth`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-007:** Як авторизований користувач, я хочу переглядати список активних сесій, щоб контролювати доступ.

### Description

Список активних сесій із інформацією про пристрій, IP та час останньої активності. Поточна сесія позначена.

### Acceptance Criteria

- [ ] Список сесій з: пристрій, IP, час останньої активності
- [ ] Поточна сесія позначена окремо
- [ ] Кожна сесія має інформацію про browser/OS

### Technical Notes

**API:**

- `GET /api/auth/sessions` → list of active sessions

### Implementation Checklist

**Backend (API):**

- [ ] Session list endpoint (from sessions table)
- [ ] Device/IP tracking при login/refresh

**Frontend (Web):**

- [ ] Sessions list в Security settings

### Functional Requirements

- [ ] **[§3.17]** Перегляд списку активних сесій (IP-адреса, пристрій, браузер, приблизне місцезнаходження, дата входу)

### References

- Functional: §3.17 Налаштування
- User Stories: US-007

---

## #134 [Onboarding] Demo workspace with realistic trading data

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:onboarding`, `layer:api`, `layer:db`, `priority:should`

### User Story

**US-125:** Як новий трейдер, я хочу мати доступ до демо-workspace з реалістичними торговими даними.

### Description

Демо-простір створюється при реєстрації з реалістичними тестовими даними: кількадесят угод, тиждень рутин, помилки, нотатки, акаунти. Повністю інтерактивний. Позначений міткою «Demo».

### Acceptance Criteria

- [ ] Демо-workspace створюється автоматично при реєстрації
- [ ] Містить реалістичні дані у всіх 9 пресетних БД
- [ ] Повністю інтерактивний (можна редагувати, видаляти)
- [ ] Позначений міткою «Demo» в сайдбарі
- [ ] Статистика працює коректно з демо-даними

### Technical Notes

**API:**

- Demo seed: JSON/TypeScript з реалістичними торговими даними
- Created alongside default workspace during registration

### Implementation Checklist

**Backend (API):**

- [ ] Demo data seed: realistic trades, routines, mistakes, notes
- [ ] Demo workspace creation (isDemo flag)
- [ ] Demo workspace labeling

### Functional Requirements

- [ ] **[§3.18]** Автоматичне створення демо-простору при першій реєстрації поряд із основним робочим простором
- [ ] **[§3.18]** Демо-простір позначається відповідною міткою в сайдбарі та заголовку
- [ ] **[§3.18]** Заповнення демо-простору реалістичними тестовими даними: записи в усіх пресетних базах даних, заповнені властивості, контент у записах, значущі показники статистики
- [ ] **[§3.18]** Повна інтерактивність демо-простору: редагування, створення та видалення записів доступні так само, як і в звичайному просторі

### References

- Functional: §3.18 Онбординг
- User Stories: US-125

---

<!-- ============================================================ -->
<!--                       POLISHED                                -->
<!-- ============================================================ -->

## #189 [Record] Record meta-fields (Created At / Updated At) in view filters and sort

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:should`

### User Story

**US-138:** Як авторизований користувач, я хочу фільтрувати та сортувати записи за метаполями «Дата створення» і «Дата оновлення».

### Description

Метаполя `createdAt` та `updatedAt` доступні у filter picker та sort picker. Відображаються в картці запису як read-only. Доступні для CSV-експорту.

### Acceptance Criteria

- [ ] `Дата створення` та `Дата оновлення` з'являються у filter property picker
- [ ] Обидва поля доступні для сортування
- [ ] Відображаються в картці запису (read-only)
- [ ] Доступні для CSV-експорту (opt-in)
- [ ] Групування за createdAt вже підтримується — без змін

### References

- Functional: §3.6 (рядок 154), §3.9 (рядок 313)
- User Stories: US-138

---

## #190 [Record] RELATION chip visual state when related record is in Trash

**State:** OPEN
**Milestone:** Feature Complete
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:should`

### User Story

Як авторизований користувач, я хочу бачити візуальний стан RELATION-chip, коли пов'язаний запис у Кошику, щоб відрізняти його від видаленої БД (broken state).

### Description

Коли пов'язаний запис переміщено до Кошика, RELATION-chip залишається видимим, але з приглушеним/закресленим стилем і disabled click. Після відновлення — chip повертається до нормального стану. Після постійного видалення — chip видаляється, значення очищується.

### Acceptance Criteria

- [ ] Трешований запис: chip present, dimmed/strikethrough, click disabled
- [ ] Restored: chip повертається до нормального стану автоматично
- [ ] Permanently deleted: chip removed, RELATION value cleared
- [ ] Відрізняється від broken state (deleted DB): broken = plain text, no link; trash = dimmed chip

### Functional Requirements

- [ ] **[§3.27]** Якщо пов'язаний запис переміщено до Кошика — chip відображається з приглушеним виглядом (без посилання); після відновлення з Кошика — chip повертається до звичайного стану; після постійного видалення — значення очищується автоматично

### References

- Functional: §3.27 RELATION
- User Stories: (related to US-046)
