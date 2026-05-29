[<- Назад до загального списку](../github-issues.md)

# Issues - MVP Core

## #54 [Auth] User registration with email and password

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:auth`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-001:** Як новий користувач, я хочу зареєструватися з email і паролем, щоб отримати доступ до платформи.

### Description

Реєстрація — перша точка контакту користувача з платформою. Система приймає email та пароль, створює акаунт, надсилає email з посиланням для підтвердження і перенаправляє на сторінку з повідомленням про необхідність верифікації. Вхід доступний лише після підтвердження email.

### Acceptance Criteria

- [ ] **Given** користувач на сторінці реєстрації, **When** вводить валідний email та пароль (≥8 символів, цифра, велика літера) і натискає «Sign Up», **Then** система створює акаунт і надсилає лист-підтвердження
- [ ] **Given** email вже зареєстрований, **When** спроба реєстрації з тим самим email, **Then** помилка «Account already exists» без уточнення деталей
- [ ] **Given** пароль не відповідає вимогам, **When** натискає «Sign Up», **Then** відображається конкретне повідомлення про недотриману вимогу
- [ ] **Given** акаунт створений, **When** email не підтверджений, **Then** вхід заблокований з повідомленням «Please verify your email»
- [ ] Пароль зберігається хешованим (bcrypt, ≥10 раундів)
- [ ] Лист-підтвердження містить унікальне посилання, дійсне 24 години

### Technical Notes

**API:**

- `POST /api/auth/register` — body: `{ email, password }` → `201 Created` | `409 Conflict`
- Хешування: bcrypt з cost factor 10+
- Генерація verification token (UUID v4), збереження в БД

**Web:**

- Сторінка `/register` з формою email + password
- Client-side валідація (формат email, вимоги до пароля) перед відправкою
- Redirect на `/verify-email` з повідомленням після успіху

**DB:**

- Таблиця `users`: id, email, passwordHash, isEmailVerified, createdAt
- Таблиця `email_verifications`: id, userId, token, expiresAt

### Implementation Checklist

**Backend (API):**

- [ ] DTO: `RegisterDto` з валідацією (class-validator)
- [ ] Service: `AuthService.register()` — створення юзера + відправка email
- [ ] Email: шаблон листа підтвердження з посиланням
- [ ] Unit tests: валідація, дублікат email, хешування

**Frontend (Web):**

- [ ] Сторінка `/register` з формою
- [ ] Валідація полів (email формат, password strength)
- [ ] Error handling (409, validation errors)
- [ ] Redirect flow після успіху

### Functional Requirements

- [ ] **[§3.1]** Реєстрація за електронною поштою та паролем

### References

- Functional: §3.1 Автентифікація та акаунт
- User Stories: US-001

---

## #55 [Auth] Email verification via confirmation link

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:auth`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-002:** Як зареєстрований користувач, я хочу підтвердити email за посиланням з листа, щоб активувати акаунт і отримати доступ до workspace.

### Description

Після реєстрації користувач отримує email з посиланням для підтвердження. Посилання містить унікальний токен, дійсний 24 години. Після кліку система верифікує токен, підтверджує email і дозволяє авторизацію. При протермінованому токені відображається помилка з можливістю повторної відправки.

### Acceptance Criteria

- [ ] **Given** користувач отримав email з посиланням, **When** клікає на посилання протягом 24 годин, **Then** email підтверджено, відображається сторінка успіху з кнопкою «Go to Login»
- [ ] **Given** посилання прострочене (>24 год), **When** клікає на нього, **Then** помилка «Link expired» з кнопкою «Resend verification email»
- [ ] **Given** токен вже використаний або невалідний, **When** перехід за посиланням, **Then** помилка «Invalid or already used link»
- [ ] **Given** email не підтверджений, **When** користувач запитує повторну відправку, **Then** система надсилає новий лист і скасовує попередній токен

### Technical Notes

**API:**

- `GET /api/auth/verify-email?token=<uuid>` → `200 OK` | `400 Bad Request` | `410 Gone`
- `POST /api/auth/resend-verification` — body: `{ email }` → `200 OK`

**Web:**

- Сторінка `/verify-email?token=<uuid>` — обробка результату
- Сторінка `/verify-email/pending` — повідомлення «Check your inbox»

### Implementation Checklist

**Backend (API):**

- [ ] Service: `AuthService.verifyEmail(token)` — перевірка + підтвердження
- [ ] Service: `AuthService.resendVerification(email)` — генерація нового токена
- [ ] Cron/TTL: автоматичне видалення протермінованих токенів
- [ ] Unit tests

**Frontend (Web):**

- [ ] Сторінка `/verify-email` з обробкою query param `token`
- [ ] Стани: success / expired / invalid
- [ ] Кнопка resend з cooldown (60 сек)

### Functional Requirements

- [ ] **[§3.1]** Після реєстрації система надсилає лист із посиланням для підтвердження email (діє 24 год)
- [ ] **[§3.1]** Вхід до системи доступний лише після підтвердження email

### References

- Functional: §3.1 Автентифікація та акаунт
- User Stories: US-002

---

## #56 [Auth] User login with JWT access/refresh tokens

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:auth`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-003:** Як зареєстрований користувач, я хочу увійти з email і паролем, щоб отримати доступ до свого workspace.

### Description

Авторизація за email та паролем з видачею пари JWT-токенів: короткоживучий access token (15 хв) для API-запитів і довгоживучий refresh token (30 днів) у httpOnly cookie для оновлення сесії. Вхід доступний лише після підтвердження email.

### Acceptance Criteria

- [ ] **Given** користувач з підтвердженим email, **When** вводить коректні email та пароль, **Then** отримує access token (JWT, 15 хв) і refresh token (httpOnly cookie, 30 днів)
- [ ] **Given** неправильний email або пароль, **When** спроба логіну, **Then** помилка «Invalid credentials» без деталей (не розкриває, що саме невірно)
- [ ] **Given** email не підтверджений, **When** спроба логіну, **Then** помилка «Please verify your email first»
- [ ] **Given** успішний логін, **When** клієнт отримує access token, **Then** redirect на домашню сторінку workspace

### Technical Notes

**API:**

- `POST /api/auth/login` — body: `{ email, password }` → `{ accessToken }` + Set-Cookie: refreshToken
- Access token: JWT з payload `{ userId, email, iat, exp }`
- Refresh token: UUID v4, зберігається в таблиці sessions, httpOnly + Secure + SameSite=Strict

**Web:**

- Сторінка `/login` з формою email + password
- Збереження access token в memory (не localStorage)
- Axios interceptor для Authorization header

### Implementation Checklist

**Backend (API):**

- [ ] DTO: `LoginDto` з валідацією
- [ ] Service: `AuthService.login()` — перевірка credentials, генерація токенів
- [ ] Guard: `JwtAuthGuard` для захисту ендпоінтів
- [ ] Таблиця `sessions`: id, userId, refreshToken, deviceInfo, lastActiveAt, expiresAt
- [ ] Unit tests

**Frontend (Web):**

- [ ] Сторінка `/login` з формою
- [ ] Auth context/store для access token
- [ ] Axios interceptor для Bearer token
- [ ] Redirect logic після логіну

### Functional Requirements

- [ ] **[§3.1]** Вхід в систему за email та паролем
- [ ] **[§3.1]** Вихід із системи (завершення поточної сесії)

### References

- Functional: §3.1 Автентифікація та акаунт
- User Stories: US-003

---

## #57 [Auth] Silent token refresh without user interruption

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:auth`, `layer:api`, `priority:must`

### User Story

**US-005:** Як авторизований користувач, я хочу, щоб моя сесія автоматично оновлювалася без повторного входу, щоб не переривати роботу кожні 15 хвилин.

### Description

Access token живе 15 хвилин. Клієнт автоматично оновлює його через refresh endpoint до закінчення терміну дії. Refresh token живе 30 днів і ротується при кожному оновленні. Якщо refresh token прострочений — перенаправлення на логін.

### Acceptance Criteria

- [ ] **Given** access token скоро закінчується (<2 хв), **When** клієнт відправляє refresh запит, **Then** отримує новий access token і новий refresh token (ротація)
- [ ] **Given** refresh token валідний, **When** запит на оновлення, **Then** старий refresh token інвалідується, видається новий
- [ ] **Given** refresh token прострочений (>30 днів бездіяльності), **When** запит на оновлення, **Then** помилка 401, redirect на логін
- [ ] Оновлення відбувається прозоро — користувач не бачить жодних переривань

### Technical Notes

**API:**

- `POST /api/auth/refresh` — cookie: refreshToken → `{ accessToken }` + Set-Cookie: new refreshToken
- Ротація: старий refresh token видаляється з sessions, створюється новий

**Web:**

- Axios interceptor: при 401 — спроба refresh, при повторній 401 — redirect /login
- Proactive refresh: таймер за 2 хв до expiry access token

### Implementation Checklist

**Backend (API):**

- [ ] Service: `AuthService.refreshTokens()` — валідація + ротація
- [ ] Middleware: витягування refresh token з cookie
- [ ] Unit tests: ротація, expiry, reuse detection

**Frontend (Web):**

- [ ] Axios response interceptor для автоматичного retry при 401
- [ ] Proactive refresh timer
- [ ] Redirect на /login при неможливості оновити

### References

- Functional: §3.1 (рядок 14, implicit: token lifecycle)
- User Stories: US-005

---

## #58 [Auth] Password reset via email link

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:auth`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-004:** Як користувач, що забув пароль, я хочу скинути його через email, щоб відновити доступ до акаунту.

### Description

Користувач вводить email, отримує лист з посиланням для скидання (дійсне 1 годину). За посиланням відкривається форма нового пароля. Після зміни — всі активні сесії анулюються, надсилається сповіщення на email.

### Acceptance Criteria

- [ ] **Given** користувач на сторінці скидання, **When** вводить зареєстрований email, **Then** система надсилає лист з посиланням (дійсне 1 год)
- [ ] **Given** email не зареєстрований, **When** запит скидання, **Then** система все одно показує «Check your inbox» (не розкриває існування акаунту)
- [ ] **Given** валідне посилання, **When** користувач вводить новий пароль, **Then** пароль оновлений, всі сесії анульовані, email-сповіщення надіслане
- [ ] **Given** посилання прострочене (>1 год), **When** перехід, **Then** помилка «Link expired» з кнопкою повторної відправки
- [ ] Після зміни пароля всі активні refresh tokens інвалідуються

### Technical Notes

**API:**

- `POST /api/auth/forgot-password` — body: `{ email }` → `200 OK` (завжди)
- `POST /api/auth/reset-password` — body: `{ token, newPassword }` → `200 OK` | `400`

**Web:**

- Сторінка `/forgot-password` — форма email
- Сторінка `/reset-password?token=<uuid>` — форма нового пароля

**DB:**

- Таблиця `password_resets`: id, userId, token, expiresAt, usedAt

### Implementation Checklist

**Backend (API):**

- [ ] Service: `AuthService.forgotPassword(email)` — генерація reset token
- [ ] Service: `AuthService.resetPassword(token, newPassword)` — зміна + інвалідація сесій
- [ ] Email: шаблон листа скидання пароля
- [ ] Email: шаблон сповіщення про зміну пароля
- [ ] Unit tests

**Frontend (Web):**

- [ ] Сторінка `/forgot-password` з формою email
- [ ] Сторінка `/reset-password` з формою нового пароля
- [ ] Обробка станів: success, expired, invalid

### Functional Requirements

- [ ] **[§3.1]** Скидання пароля через email: користувач отримує посилання (діє 1 год), переходить на сторінку встановлення нового пароля

### References

- Functional: §3.1 Автентифікація та акаунт
- User Stories: US-004

---

## #59 [Workspace] Auto-initialize workspace with 9 preset databases on registration

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:workspace`, `mod:database`, `layer:api`, `layer:db`, `priority:must`

### User Story

**US-010 / US-024:** Як новий користувач, я хочу, щоб при реєстрації автоматично створювався workspace з 9 пресетними базами даних, щоб одразу мати готову структуру для ведення журналу.

### Description

При реєстрації система автоматично створює workspace зі стартовим пакетом: 4 секції та 9 пресетних БД (Trading Journal, Daily Routine, Routine Library, Mistakes, Notes, Accounts, Operations, Trading System, Performance Review). Кожна БД містить попередньо визначені системні властивості, зв'язки між БД та системні шаблони.

### Acceptance Criteria

- [ ] **Given** новий користувач завершує реєстрацію, **When** email підтверджений, **Then** workspace створений з 9 пресетними БД, кожна з коректними властивостями
- [ ] Усі RELATION-зв'язки між БД коректні (наприклад, Trading Journal → Accounts, Daily Routine → Trading Journal)
- [ ] Кожна пресетна БД має щонайменше один системний шаблон
- [ ] Пресетні БД позначені індикатором «системна» і захищені від видалення
- [ ] Стартові секції створені з правильними назвами, іконками та кольорами
- [ ] Workspace має домашню сторінку (дашборд)

### Technical Notes

**API:**

- Trigger: виклик після успішної верифікації email (або одразу при реєстрації, lazy init)
- Service: `WorkspaceService.initializeDefault(userId)` — транзакція: workspace → sections → databases → properties → templates
- Seed data: JSON/TypeScript конфігурація з описом всіх 9 БД, їх властивостей та шаблонів

**DB:**

- Таблиці: `workspaces`, `sections`, `databases`, `properties`, `templates`
- Поле `isPreset: boolean` у databases та properties
- Cascade setup для зв'язків

### Implementation Checklist

**Backend (API):**

- [ ] Seed конфігурація: 9 БД з властивостями, типами, категоріями SELECT/STATUS
- [ ] Seed конфігурація: системні шаблони для кожної БД
- [ ] Service: `WorkspaceService.initializeDefault()` — транзакційне створення
- [ ] RELATION-зв'язки між БД (targetDatabaseId)
- [ ] Integration test: перевірка повноти ініціалізації

### Functional Requirements

- [ ] **[§3.2]** **Робочий простір** — це верхній рівень організаційної ієрархії платформи. Він є ізольованим контейнером, що об'єднує всі секції, бази даних і записи конкретного користувача. Кожен простір є повністю незалежним: зміни в одному просторі не впливають на інший.
- [ ] **[§3.2]** Автоматичне створення робочого простору при реєстрації
- [ ] **[§3.2]** Автоматичне наповнення простору стартовим пакетом секцій і баз даних
- [ ] **[§3.3]** Автоматичне створення стартових секцій при ініціалізації робочого простору
- [ ] **[§3.4]** При ініціалізації простору система автоматично створює набір пресет-баз даних, оптимізованих під типові задачі трейдера. Кожна пресет-база має попередньо визначену структуру властивостей і не потребує початкового налаштування — користувач одразу може починати вводити дані. Водночас система зберігає гнучкість: користувач може створювати власні бази під специфічні потреби, які виходять за межі стандартного набору.
- [ ] **[§3.4]** Автоматичне створення стартового набору баз даних при ініціалізації робочого простору

### References

- Functional: §3.2 Робочий простір, §3.3 Секції, §3.4 Бази даних
- User Stories: US-010, US-024

---

## #60 [Property] TEXT property type: plain/rich text, URL handling, config

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

TEXT — базовий тип властивості, що зберігає рядок або форматований текст. Підтримує два режими: простий (однорядковий) та rich text (жирний, курсив, підкреслення, закреслення, код, посилання, виділення кольором). Налаштування `urlHandling` визначає поведінку URL: `detect` — автоперетворення на посилання, `preview` — вбудований попередній перегляд.

### Acceptance Criteria

- [ ] **Given** властивість TEXT з `isRichText: false`, **When** користувач редагує значення, **Then** відображається однорядкове поле введення
- [ ] **Given** властивість TEXT з `isRichText: true`, **When** редагування, **Then** відкривається rich text редактор з toolbar (bold, italic, underline, strikethrough, code, link, highlight)
- [ ] **Given** `urlHandling: detect`, **When** значення містить URL, **Then** URL автоматично перетворюється на клікабельне посилання
- [ ] **Given** `urlHandling: preview`, **When** значення містить підтримуваний URL, **Then** відображається вбудований попередній перегляд
- [ ] Ctrl+V зберігає форматування у rich text режимі; Ctrl+Shift+V — вставка без форматування
- [ ] Підтримує масове редагування (перезапис для всіх вибраних записів)

### Technical Notes

**API:**

- Property config: `{ type: "TEXT", config: { isRichText: boolean, urlHandling: "none" | "detect" | "preview" } }`
- Значення зберігається як string (plain) або JSON (rich text)

**Web:**

- Inline editor в table cell та record card
- Rich text editor: Tiptap або подібна бібліотека
- URL detection regex + link rendering

**DB:**

- Значення в `record_values`: `{ value: string | RichTextJSON }`

### Implementation Checklist

**Backend (API):**

- [ ] Property type registration: TEXT з config schema
- [ ] Validation: isRichText, urlHandling enum
- [ ] Storage: plain string або rich text JSON

**Frontend (Web):**

- [ ] Inline text input для plain mode
- [ ] Rich text editor з toolbar для rich mode
- [ ] URL auto-detection та preview rendering
- [ ] Clipboard handling (Ctrl+V, Ctrl+Shift+V)

### Functional Requirements

- [ ] **[§3.20]** Редагування в режимі inline — безпосередньо в комірці таблиці або полі картки запису
- [ ] **[§3.20]** У режимі `isRichText: false` — однорядкове текстове поле
- [ ] **[§3.20]** У режимі `isRichText: true` — відкривається rich text редактор: жирний, курсив, підкреслення, закреслення, код, посилання, виділення кольором
- [ ] **[§3.20]** `urlHandling: detect` — URL автоматично перетворюються на клікабельні посилання при відображенні
- [ ] **[§3.20]** `urlHandling: preview` — для підтримуваних URL (зображення, YouTube, інші сервіси) відображається вбудований попередній перегляд
- [ ] **[§3.20]** Вставка через Ctrl+V зберігає форматування в режимі rich text; Ctrl+Shift+V — вставка без форматування
- [ ] **[§3.20]** Порожнє значення зберігається як порожній рядок; null форматується як `""` при відображенні
- [ ] **[§3.20]** Підтримує масове редагування (перезаписати значення для всіх вибраних записів)

### References

- Functional: §3.20 TEXT
- User Stories: US-036

---

## #61 [Property] NUMBER property type: formats, decimals, currency, percentage

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

NUMBER — числове поле з гнучким форматуванням. Підтримує формати: integer (без десяткової частини), currency (з символом валюти), percentage (з суфіксом %). Налаштування prefix, suffix та decimalPlaces впливають лише на відображення — збережене значення завжди чисте число.

### Acceptance Criteria

- [ ] **Given** властивість NUMBER, **When** користувач вводить нечислові символи, **Then** вони відхиляються
- [ ] **Given** формат `integer`, **When** введено дробове число, **Then** округлення автоматично
- [ ] **Given** формат `currency` з `currencySymbol: "$"`, **When** відображення, **Then** показано `$150.00`
- [ ] **Given** формат `percentage`, **When** відображення, **Then** показано `75%`
- [ ] `prefix` та `suffix` відображаються навколо числа (наприклад, `2.5 R`, `0.1 lots`)
- [ ] `decimalPlaces` визначає кількість знаків після коми при відображенні
- [ ] Підтримує масове редагування

### Technical Notes

**API:**

- Config: `{ type: "NUMBER", config: { format: "number"|"integer"|"currency"|"percentage", decimalPlaces: number, currencySymbol?: string, prefix?: string, suffix?: string } }`
- Значення зберігається як number; null → 0 у формулах

**Web:**

- Inline number input з відхиленням нечислових символів
- Форматування при blur (display mode)

### Implementation Checklist

**Backend (API):**

- [ ] Property type: NUMBER з config schema та валідацією
- [ ] Зберігання значення як float/decimal

**Frontend (Web):**

- [ ] Number input з фільтрацією введення
- [ ] Display formatting: currency, percentage, prefix/suffix, decimal places

### Functional Requirements

- [ ] **[§3.21]** Редагування в режимі inline; відхиляє нечислові символи
- [ ] **[§3.21]** Формат `integer`: десяткова крапка заблокована; при введенні нецілого значення округлюється автоматично
- [ ] **[§3.21]** Формат `currency`: `currencySymbol` відображається перед числом (наприклад, `$150.00`)
- [ ] **[§3.21]** Формат `percentage`: значення відображається з суфіксом `%`
- [ ] **[§3.21]** `prefix` і `suffix` відображаються навколо числа в таблиці та картці (наприклад, `2.5 R`, `0.1 lots`, `×5`)
- [ ] **[§3.21]** `decimalPlaces` визначає кількість знаків після коми при відображенні; збережене значення зберігається з повною точністю
- [ ] **[§3.21]** Порожнє значення відображається як порожня комірка; null форматується як `0` при обчисленнях у формулах та підсумках
- [ ] **[§3.21]** Підтримує масове редагування

### References

- Functional: §3.21 NUMBER
- User Stories: US-036

---

## #62 [Property] DATE property type: date/datetime, formats, time zones

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

DATE — поле дати або дати з часом. Значення зберігається в ISO 8601 (UTC), відображається у форматі та часовому поясі з налаштувань користувача. Редагування через календарний попап. Підтримує `defaultValue: "today"` для автозаповнення при створенні запису.

### Acceptance Criteria

- [ ] **Given** властивість DATE, **When** клік на комірку, **Then** відкривається календарний попап
- [ ] **Given** `includeTime: true`, **When** відкрито попап, **Then** поруч з календарем відображається time picker
- [ ] Кнопка «Сьогодні» встановлює поточну дату з урахуванням часового поясу користувача
- [ ] `defaultValue: "today"` підставляється при створенні запису, не при відкритті форми
- [ ] Очищення: кнопка «Очистити» або Delete у виділеній комірці
- [ ] Відображення у форматі з налаштувань користувача (DD/MM/YYYY, MM/DD/YYYY тощо)
- [ ] Підтримує масове редагування

### Technical Notes

**API:**

- Config: `{ type: "DATE", config: { includeTime: boolean, defaultValue?: "today" | null } }`
- Значення: ISO 8601 string (UTC)

**Web:**

- Calendar popup з навігацією по місяцях
- Time picker (HH:mm або hh:mm A відповідно до timeFormat користувача)
- Timezone conversion при відображенні

### Implementation Checklist

**Backend (API):**

- [ ] Property type: DATE з config schema
- [ ] Default value resolution: "today" → current date at creation time

**Frontend (Web):**

- [ ] Calendar popup component
- [ ] Time picker component (optional based on includeTime)
- [ ] Date formatting з user timezone та format preferences

### Functional Requirements

- [ ] **[§3.22]** Редагування через календарний попап зі стрілками навігації по місяцях
- [ ] **[§3.22]** Якщо `includeTime: true` — поруч із календарем відображається time picker у форматі `HH:mm` або `hh:mm A` (відповідно до `timeFormat`)
- [ ] **[§3.22]** Кнопка «Сьогодні» в попапі встановлює поточну дату (враховує часовий пояс із налаштувань користувача)
- [ ] **[§3.22]** `defaultValue: "today"` замінюється поточною датою в момент **створення запису**, а не при відкритті форми
- [ ] **[§3.22]** Очищення значення — кнопка «Очистити» в попапі або клавіша Delete у виділеній комірці
- [ ] **[§3.22]** Відображення у таблиці: формат із конфіга властивості; якщо `includeTime: false` — час не відображається навіть якщо збережений у значенні
- [ ] **[§3.22]** Відносне відображення («Сьогодні», «Вчора», «2 дні тому») — опційне налаштування подання
- [ ] **[§3.22]** Підтримує масове редагування

### References

- Functional: §3.22 DATE
- User Stories: US-036

---

## #63 [Property] CHECKBOX property type: boolean, null semantics

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

CHECKBOX — найпростіший тип: булеве значення (відмічено / не відмічено). Перемикається в один клік без відкриття редактора. null відображається як false, але зберігається як null до першого явного встановлення.

### Acceptance Criteria

- [ ] **Given** комірка CHECKBOX, **When** клік, **Then** значення перемикається (true ↔ false) без відкриття редактора
- [ ] Відображення: заповнений квадрат з галочкою (true), порожній квадрат (false/null)
- [ ] null відображається як false; збережене значення залишається null до першого кліку
- [ ] **Given** `isRequired: true`, **When** запис зберігається без явного встановлення, **Then** попередження
- [ ] Підтримує масове редагування: встановити всі вибрані в true або false

### Technical Notes

**API:**

- Config: `{ type: "CHECKBOX" }`
- Значення: `boolean | null`

**Web:**

- Checkbox component: click toggle, no popup

### Implementation Checklist

**Backend (API):**

- [ ] Property type: CHECKBOX
- [ ] Validation: boolean | null

**Frontend (Web):**

- [ ] Checkbox cell component з toggle по кліку
- [ ] Visual states: checked, unchecked, null (same as unchecked)

### Functional Requirements

- [ ] **[§3.23]** Перемикач кліком безпосередньо в комірці таблиці або картці запису — редактор не відкривається
- [ ] **[§3.23]** Відображається як квадратний чекбокс; `true` — заповнений з галочкою, `false` / null — порожній
- [ ] **[§3.23]** null відображається як `false`; збережене значення залишається null до першого явного встановлення
- [ ] **[§3.23]** Якщо властивість позначена як `isRequired: true` — запис не можна зберегти, поки значення явно не встановлено в `true`
- [ ] **[§3.23]** Підтримує масове редагування: встановити всі вибрані в `true` або `false`

### References

- Functional: §3.23 CHECKBOX
- User Stories: US-036

---

## #64 [Property] DURATION property type: seconds storage, time formats

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

DURATION — зберігає ціле невід'ємне число секунд. Відображається у форматі часу з config (HH:mm, HH:mm:ss, Xh Ym, minutes, seconds). Редагування через inline поле з розпізнаванням введеного формату.

### Acceptance Criteria

- [ ] **Given** введення `1:30`, **Then** інтерпретується як 5400 секунд (1 год 30 хв)
- [ ] **Given** введення `1:30:00`, **Then** інтерпретується як 5400 секунд
- [ ] **Given** введення `90` з форматом `minutes`, **Then** зберігається 5400 секунд
- [ ] Від'ємні значення та нечислові символи відхиляються
- [ ] Відображення згідно з config format: `HH:mm` → `01:30`, `Xh Ym` → `1h 30m`
- [ ] null відображається як `0` / `00:00`
- [ ] Підтримує масове редагування

### Technical Notes

**API:**

- Config: `{ type: "DURATION", config: { format: "HH:mm" | "HH:mm:ss" | "Xh Ym" | "minutes" | "seconds" } }`
- Значення: integer (секунди) | null

**Web:**

- Inline input з parsing різних форматів
- Display formatting на основі config

### Implementation Checklist

**Backend (API):**

- [ ] Property type: DURATION з config schema
- [ ] Validation: non-negative integer

**Frontend (Web):**

- [ ] Duration input з multi-format parsing
- [ ] Display formatting для 5 форматів

### Functional Requirements

- [ ] **[§3.24]** Редагування через inline-поле з розпізнаванням введеного формату:
- [ ] **[§3.24]** Від'ємні значення та нечислові символи відхиляються; порожній ввід зберігається як null
- [ ] **[§3.24]** Відображення у таблиці та картці згідно з `format` властивості:
- [ ] **[§3.24]** null відображається як `0` / `00:00` залежно від формату
- [ ] **[§3.24]** Підтримує масове редагування

### References

- Functional: §3.24 DURATION
- User Stories: US-036

---

## #65 [Property] SELECT property type: single/multi select, categories, options

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

SELECT — поле вибору зі згрупованого списку варіантів. Варіанти організовані в іменовані категорії. Підтримує single та multi select. Обрані варіанти відображаються як кольорові chip-мітки. Dropdown з пошуком по назві варіанту (від 1 символу).

### Acceptance Criteria

- [ ] Обрані варіанти відображаються як кольорові chip-мітки в комірці
- [ ] **Given** `isMultiSelect: false`, **When** вибір, **Then** один chip або порожня комірка
- [ ] **Given** `isMultiSelect: true`, **When** кілька вибрані, **Then** chips з лічильником `+N` якщо не вміщуються
- [ ] Клік на комірку відкриває dropdown з категоріями та варіантами
- [ ] Пошук у dropdown від 1 символу по назві варіанту
- [ ] Зняття вибору: повторний клік на обраний варіант або × на chip
- [ ] Управління варіантами: додавання, перейменування, видалення, зміна кольору/іконки/порядку
- [ ] Управління категоріями: додавання, перейменування, видалення (з вибором долі варіантів)
- [ ] Видалення варіанту: записи отримують null (single) або видаляється з масиву (multi)
- [ ] Підтримує масове редагування

### Technical Notes

**API:**

- Config: `{ type: "SELECT", config: { isMultiSelect: boolean, categories: [{ id, name, options: [{ id, name, color, icon }] }] } }`
- Значення: `optionId` (single) або `optionId[]` (multi)

**Web:**

- Chip display component
- Dropdown з категоріями, пошуком, мультивибором
- Settings panel для управління категоріями та варіантами

### Implementation Checklist

**Backend (API):**

- [ ] Property type: SELECT з повною config schema
- [ ] CRUD для categories та options
- [ ] Cascading: при видаленні option → оновлення record values

**Frontend (Web):**

- [ ] Chip display component (single/multi, overflow +N)
- [ ] Dropdown з categories, search, selection
- [ ] Settings panel: category/option CRUD з drag-and-drop

### Functional Requirements

- [ ] **[§3.25]** Обрані варіанти відображаються як кольорові chip-мітки у комірці таблиці
- [ ] **[§3.25]** При `isMultiSelect: false` — один chip або порожня комірка
- [ ] **[§3.25]** При `isMultiSelect: true` — кілька chips; якщо не вміщуються — обрізаються з лічильником `+N`
- [ ] **[§3.25]** Клік на комірку відкриває dropdown з категоріями та варіантами
- [ ] **[§3.25]** Пошук у dropdown починається з 1 символу; фільтрує по назві варіанту
- [ ] **[§3.25]** Зняття вибору: повторний клік на вже обраний варіант або × на chip
- [ ] **[§3.25]** Додавання, перейменування та видалення категорій; видалення категорії вимагає вибору долі її варіантів: перемістити до іншої категорії або видалити
- [ ] **[§3.25]** Перетягування порядку категорій
- [ ] **[§3.25]** Додавання нового варіанту в категорію; редагування назви варіанту
- [ ] **[§3.25]** Призначення кольору варіанту (колірна палітра)
- [ ] **[§3.25]** Призначення іконки варіанту (emoji або системна іконка)
- [ ] **[§3.25]** Перетягування порядку варіантів всередині категорії та між категоріями
- [ ] **[§3.25]** Видалення варіанту: записи з цим значенням отримують null (одиничний вибір) або видаляють це значення з масиву (множинний)
- [ ] **[§3.25]** Підтримує масове редагування

### References

- Functional: §3.25 SELECT
- User Stories: US-036

---

## #66 [Property] STATUS property type: 3 semantic categories, custom options

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

STATUS — семантичний аналог SELECT з трьома фіксованими категоріями: `todo` (сірий), `in_progress` (жовтий/помаранчевий), `complete` (зелений). Призначений для відстеження прогресу запису. Label категорій можна перейменовувати, внутрішні ID залишаються незмінними.

### Acceptance Criteria

- [ ] Відображається як кольоровий pill з назвою поточної опції
- [ ] Dropdown розбитий на три секції з кольоровими заголовками категорій
- [ ] Зміна статусу в один клік з таблиці
- [ ] Labels категорій можна перейменовувати (todo → «Open», «Planned», тощо)
- [ ] Додавання, редагування, видалення опцій всередині категорій
- [ ] Видалення опції: записи отримують `defaultOption` категорії
- [ ] Підтримує масове редагування

### Technical Notes

**API:**

- Config: `{ type: "STATUS", config: { categories: { todo: { label, options }, in_progress: { label, options }, complete: { label, options } }, defaultOption: optionId } }`

**Web:**

- Pill display з кольором категорії
- Dropdown з трьома секціями

### Implementation Checklist

**Backend (API):**

- [ ] Property type: STATUS з fixed category schema
- [ ] Default option logic при видаленні

**Frontend (Web):**

- [ ] Pill display component
- [ ] 3-section dropdown
- [ ] Settings panel для опцій

### Functional Requirements

- [ ] **[§3.26]** Відображається як кольоровий pill з назвою поточної опції
- [ ] **[§3.26]** Клік відкриває dropdown, розбитий на три чітко відокремлені секції з заголовками категорій
- [ ] **[§3.26]** Колір заголовка секції фіксований за семантикою: `todo` — сірий, `in_progress` — жовтий/помаранчевий, `complete` — зелений
- [ ] **[§3.26]** Зміна статусу в один клік з таблиці; обрана опція закриває dropdown
- [ ] **[§3.26]** Відображувана назва кожної категорії (`label`) редагується: наприклад, `todo` → «Open», «Planned», «Backlog»
- [ ] **[§3.26]** Внутрішній ідентифікатор категорії (`todo` / `in_progress` / `complete`) незмінний
- [ ] **[§3.26]** Додавання, перейменування та видалення опцій всередині кожної категорії
- [ ] **[§3.26]** Перетягування порядку опцій всередині категорії; переміщення опцій між категоріями
- [ ] **[§3.26]** Видалення опції: записи з цим значенням отримують `defaultOption` тієї ж категорії
- [ ] **[§3.26]** Встановлення `defaultOption` на рівні всієї властивості та на рівні кожної категорії окремо
- [ ] **[§3.26]** Підтримує масове редагування

### References

- Functional: §3.26 STATUS
- User Stories: US-036

---

## #67 [Property] RELATION property type: cross-db links, back-relation, broken state

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

RELATION — посилання на записи іншої БД в межах workspace. Підтримує single та multiple зв'язки. Пошуковий діалог для вибору записів цільової БД. При видаленні цільової БД переходить у стан «broken»: нові значення заблоковані, існуючі відображаються як текст.

### Acceptance Criteria

- [ ] Пов'язані записи відображаються як pill-chips з назвою запису
- [ ] Клік на комірку відкриває пошуковий діалог зі списком записів цільової БД
- [ ] Пошук за назвою від 1 символу
- [ ] **Given** `multiple: false`, **When** вибір запису, **Then** діалог закривається автоматично
- [ ] **Given** `multiple: true`, **When** мультивибір, **Then** підтвердження кнопкою «Застосувати»
- [ ] Клік на chip → відкриття запису; Ctrl+клік → у новій вкладці
- [ ] **Given** пов'язаний запис у Кошику, **Then** chip приглушений, без посилання; після відновлення — нормальний стан
- [ ] **Given** цільова БД видалена (broken), **Then** поле read-only, tooltip пропонує видалити або перепризначити
- [ ] Масове редагування: лише очищення (не заміна)

### Technical Notes

**API:**

- Config: `{ type: "RELATION", config: { targetDatabaseId: uuid, multiple: boolean } }`
- Значення: `recordId` або `recordId[]`
- Broken state: перевірка existence targetDatabaseId при кожному запиті

**Web:**

- Pill-chip display з навігацією
- Search dialog: пошук по записах цільової БД
- Broken state UI: disabled field, tooltip

### Implementation Checklist

**Backend (API):**

- [ ] Property type: RELATION з targetDatabaseId validation
- [ ] Broken state detection та handling
- [ ] Cascade: при видаленні запису — очищення посилань в інших записах

**Frontend (Web):**

- [ ] Pill-chip display з click navigation
- [ ] Record search dialog
- [ ] Broken state UI + trash state UI (dimmed chips)

### Functional Requirements

- [ ] **[§3.5]** Якщо властивість типу RELATION посилається на видалену базу даних — вона переходить у стан «broken»: нові значення не можна додати, наявні відображаються як простий текст із назвою запису без посилання; tooltip повідомляє причину та пропонує видалити або перепризначити властивість
- [ ] **[§3.27]** Пов'язані записи відображаються як pill-chips із назвою запису в комірці таблиці
- [ ] **[§3.27]** Клік на комірку відкриває пошуковий діалог: поле введення + список записів цільової бази
- [ ] **[§3.27]** Пошук за назвою запису починається з 1 символу; результати оновлюються в реальному часі
- [ ] **[§3.27]** При `multiple: false` — вибір одного запису автоматично закриває діалог
- [ ] **[§3.27]** При `multiple: true` — мультивибір через чекбокси; підтверджується кнопкою «Застосувати»
- [ ] **[§3.27]** Видалення окремого зв'язку: × на chip у комірці або зняття вибору в діалозі
- [ ] **[§3.27]** Навігація до пов'язаного запису: клік на chip відкриває запис; Ctrl+клік — у новій вкладці
- [ ] **[§3.27]** Нові значення додати неможливо; поле відображається у режимі лише читання
- [ ] **[§3.27]** Наявні збережені значення відображаються як plain text із назвою запису без посилання
- [ ] **[§3.27]** Tooltip над комірками повідомляє причину: «Цільова база даних видалена»; пропонує видалити або перепризначити властивість на іншу базу
- [ ] **[§3.27]** Підтримується лише очищення (встановити порожнє значення); заміна конкретних значень у масовому режимі не підтримується

### References

- Functional: §3.27 RELATION, §3.5 Властивості
- User Stories: US-036

---

## #68 [Property] RATING property type: stars, half-stars, maxStars config

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

RATING — числова оцінка у форматі зірок. Значення від 0 до `maxStars`. Підтримує half-stars (якщо увімкнено). Повторний клік на ту саму зірку скидає до 0.

### Acceptance Criteria

- [ ] Горизонтальний ряд зірок: ★ заповнені, ☆ порожні; кількість = maxStars
- [ ] Клік на зірку встановлює рейтинг = позиція зірки
- [ ] Повторний клік на ту саму зірку → скидання до 0
- [ ] Hover: підсвічуються всі зірки від першої до наведеної
- [ ] **Given** `allowHalf: true`, **When** hover на лівій половині зірки, **Then** значення N - 0.5
- [ ] null відображається як порожній ряд (0 зірок)
- [ ] Підтримує масове редагування

### Technical Notes

**API:**

- Config: `{ type: "RATING", config: { maxStars: number, allowHalf: boolean } }`
- Значення: number [0, maxStars] з кроком 0.5 (якщо allowHalf) або 1

### Implementation Checklist

**Backend (API):**

- [ ] Property type: RATING з config
- [ ] Validation: value ∈ [0, maxStars]

**Frontend (Web):**

- [ ] Star rating component з hover preview
- [ ] Half-star support (ліва/права половина зірки)

### Functional Requirements

- [ ] **[§3.28]** Відображається як горизонтальний ряд зірок (`★` заповнені / `☆` порожні); загальна кількість = `maxStars`
- [ ] **[§3.28]** Клік на зірку встановлює рейтинг, рівний позиції зірки (1–`maxStars`)
- [ ] **[§3.28]** Повторний клік на ту саму зірку скидає рейтинг до 0 (очищення)
- [ ] **[§3.28]** Hover-стан: підсвічуються всі зірки від першої до наведеної включно
- [ ] **[§3.28]** Якщо `allowHalf: true` — hover враховує половину зірки: ліва половина зірки = `N - 0.5`, права = `N`; відображається `★½` для дробових значень
- [ ] **[§3.28]** Значення обрізається до діапазону `[0, maxStars]` при збереженні
- [ ] **[§3.28]** null відображається як порожній ряд (0 заповнених зірок)
- [ ] **[§3.28]** Підтримує масове редагування

### References

- Functional: §3.28 RATING
- User Stories: US-036

---

## #69 [Property] PROGRESS property type: range, step, thresholds, progress bar

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-036 (partial):** Як приватний трейдер, я хочу мати 11 типів властивостей, щоб точно описувати різні аспекти торгівлі.

### Description

PROGRESS — числове значення в діапазоні [min, max] з візуалізацією у вигляді прогрес-бара. Колір бара визначається масивом thresholds. Редагування через slider або числове введення.

### Acceptance Criteria

- [ ] Горизонтальний прогрес-бар; заповнення = `(value - min) / (max - min) × 100%`
- [ ] **Given** `showLabel: true`, **Then** числове значення поруч з баром
- [ ] Клік на комірку відкриває slider + числове поле
- [ ] Значення обрізається до [min, max]
- [ ] Крок slider = `step`; клавіші ←/→ змінюють на один step
- [ ] Колір бара визначається thresholds: перший поріг де `value ≤ upTo`
- [ ] null = порожній бар (0%)
- [ ] Підтримує масове редагування

### Technical Notes

**API:**

- Config: `{ type: "PROGRESS", config: { min, max, step, showLabel, thresholds: [{ upTo, color }] } }`
- Значення: number | null

### Implementation Checklist

**Backend (API):**

- [ ] Property type: PROGRESS з config validation
- [ ] Value clamping до [min, max]

**Frontend (Web):**

- [ ] Progress bar component з threshold coloring
- [ ] Slider + number input editor

### Functional Requirements

- [ ] **[§3.29]** Відображається як горизонтальний бар заповнення; відсоток заповнення = `(value - min) / (max - min) × 100%`
- [ ] **[§3.29]** Якщо `showLabel: true` — числове значення відображається поруч із баром (праворуч або під баром залежно від ширини комірки)
- [ ] **[§3.29]** Редагування: клік на комірку відкриває slider та числове поле введення
- [ ] **[§3.29]** Drag по slider або введення числа вручну; значення обрізається до `[min, max]`
- [ ] **[§3.29]** Крок зміни slider відповідає `step`; клавіші ←/→ змінюють значення на один `step`
- [ ] **[§3.29]** Колір бару визначається масивом `thresholds`: перевіряються зліва направо, застосовується перший поріг, для якого `value ≤ upTo`; якщо жоден не підходить — використовується останній поріг; при порожньому `thresholds` — акцентний колір поточної теми
- [ ] **[§3.29]** null відображається як порожній бар (0% заповнення)
- [ ] **[§3.29]** Підтримує масове редагування

### References

- Functional: §3.29 PROGRESS
- User Stories: US-036

---

## #70 [Property] Add property to database

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-032:** Як авторизований користувач, я хочу додавати нові властивості до бази даних, щоб розширити структуру записів відповідно до потреб.

### Description

Додавання нової користувацької властивості до бази даних: вибір типу з 11 доступних, введення назви та налаштування параметрів типу. Нова властивість з'являється як стовпець у table view та поле в картці запису.

### Acceptance Criteria

- [ ] **Given** відкрита БД, **When** натиснуто «Add property», **Then** відкривається діалог: вибір типу → назва → параметри типу
- [ ] Всі 11 типів доступні для вибору (TEXT, NUMBER, DATE, CHECKBOX, DURATION, SELECT, STATUS, RELATION, RATING, PROGRESS, FORMULA)
- [ ] Після створення властивість відображається як стовпець у table view та поле в картці запису
- [ ] **Given** БД заблокована (locked structure), **When** спроба додати властивість, **Then** дія заблокована

### Technical Notes

**API:**

- `POST /api/databases/:id/properties` — body: `{ name, type, config }` → `201 Created`
- Validation: unique name within DB, valid type + config combination

**Web:**

- Add property dialog: type picker → name input → type-specific config form
- Immediate table column addition

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: create property
- [ ] Validation: name uniqueness, type enum, config по типу
- [ ] Position: автоматичне присвоєння останньої позиції

**Frontend (Web):**

- [ ] Add property dialog з type picker
- [ ] Type-specific config forms для кожного з 11 типів
- [ ] Table column hot-addition

### Functional Requirements

- [ ] **[§3.5]** **Властивість** — це іменований стовпець бази даних із фіксованим типом даних. Сукупність властивостей визначає структуру бази: які поля існують, яке значення вони приймають та в якому порядку відображаються. Кожен запис у базі заповнює ці поля конкретними значеннями.
- [ ] **[§3.5]** Перегляд переліку властивостей бази даних

### References

- Functional: §3.5 Властивості
- User Stories: US-032

---

## #71 [Property] Edit property settings (name, type parameters)

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:property`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-033:** Як авторизований користувач, я хочу редагувати налаштування властивості (назва, параметри типу), щоб адаптувати її до актуальних потреб.

### Description

Редагування назви та параметрів конфігурації існуючої властивості. Зміни відображаються у всіх записах. Системні властивості пресетних БД мають обмеження: не можна змінити тип, не можна видалити.

### Acceptance Criteria

- [ ] **Given** користувацька властивість, **When** відкриті налаштування, **Then** можна змінити назву та параметри типу
- [ ] Зміна назви відображається у всіх записах, table view та картках
- [ ] **Given** системна властивість, **When** редагування, **Then** можна змінити назву, але не тип
- [ ] **Given** БД заблокована, **When** спроба редагувати, **Then** дія заблокована

### Technical Notes

**API:**

- `PATCH /api/properties/:id` — body: `{ name?, config? }` → `200 OK`
- Validation: системні обмеження для preset properties

**Web:**

- Property settings popover/panel
- Config forms відповідно до типу

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: update property (name, config)
- [ ] System property guards (no type change, no delete)

**Frontend (Web):**

- [ ] Property settings panel з формою
- [ ] Real-time update у table view

### Functional Requirements

- [ ] **[§3.5]** Кожна властивість має тип, що визначає формат значення та доступні параметри конфігурації. Деякі типи потребують додаткового налаштування при створенні (наприклад, вибір з переліку варіантів або зазначення цільової бази для зв'язку). Повний перелік типів властивостей та їх специфікація наведені в розділі 2.2.
- [ ] **[§3.5]** У пресетних базах даних розрізняються два класи властивостей. **Системні** властивості створені при ініціалізації простору: їх не можна видалити та не можна змінити тип, але можна перейменувати та перемістити — це зберігає цілісність формул і зв'язків. **Користувацькі** властивості додає вручну сам користувач і має над ними повний контроль. У кастомних базах даних усі властивості є користувацькими.
- [ ] **[§3.5]** Властивість **Name** є первинною для всіх баз даних — вона визначає заголовок запису, що відображається в таблиці, пошуку та переходах. Name не може бути видалена або змінена в іншу позицію.
- [ ] **[§3.5]** Редагування назви властивості; **увага:** перейменування системної властивості, яка використовується у шаблонах через Record Context (`thisRecord.<PropertyName>`), FORMULA-виразах або автоматизаціях, може порушити ці посилання — система не оновлює їх автоматично при перейменуванні
- [ ] **[§3.5]** Налаштування параметрів властивості залежно від типу (специфікація в розділі 2.2)
- [ ] **[§3.5]** Заборона видалення та зміни типу системних властивостей пресетних баз даних
- [ ] **[§3.5]** Заборона видалення та зміни властивості Name

### References

- Functional: §3.5 Властивості
- User Stories: US-033

---

## #72 [Record] Create empty record

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-043:** Як авторизований користувач, я хочу створювати порожні записи, щоб заповнювати їх з нуля.

### Description

Створення нового запису в базі даних без шаблону. Запис створюється з порожніми значеннями всіх властивостей, отримує дефолтну назву та відкривається для редагування.

### Acceptance Criteria

- [ ] **Given** відкрита БД, **When** натиснуто «New record» (без шаблону), **Then** створено запис з порожніми полями
- [ ] Запис отримує дефолтну назву (наприклад, «Untitled»)
- [ ] Запис відкривається для редагування (якщо увімкнено в налаштуваннях)
- [ ] Новий рядок з'являється в table view
- [ ] Мета-поля (createdAt, updatedAt) заповнюються автоматично

### Technical Notes

**API:**

- `POST /api/databases/:id/records` — body: `{}` або `{ templateId? }` → `201 Created` з recordId

**Web:**

- «New record» button у table view header
- Auto-scroll до нового рядка

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: create record
- [ ] Auto-assign: name, icon, createdAt, updatedAt
- [ ] Record limit check (якщо встановлено)

**Frontend (Web):**

- [ ] «New record» button
- [ ] Scroll-to-new-row
- [ ] Auto-open record (optional, settings-driven)

### Functional Requirements

- [ ] **[§3.6]** Записи можна створювати з шаблону або без нього. У першому випадку властивості отримують попередвно визначені значення — це прискорює введення даних при повторюваних сценаріях, наприклад щоденній фіксації рутини. Дублювання запису дозволяє швидко створити новий на основі існуючого зі збереженням усіх значень властивостей.
- [ ] **[§3.6]** Створення запису в базі даних (з обраного шаблону або без нього) (#83)

### References

- Functional: §3.6 Записи
- User Stories: US-043

---

## #73 [Record] Edit record property values in real time

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-045:** Як приватний трейдер, я хочу редагувати значення властивостей запису, щоб фіксувати актуальні дані угоди, рутини або іншого об'єкта.

### Description

Редагування значень властивостей запису inline в table view або в картці запису. Зміни зберігаються в реальному часі. Валідація типів при введенні. Обов'язкові поля підсвічуються при невалідному стані.

### Acceptance Criteria

- [ ] **Given** комірка в table view, **When** клік/подвійний клік, **Then** відкривається inline editor відповідного типу
- [ ] Зміни зберігаються автоматично при blur або Enter
- [ ] Валідація типів: числові поля приймають лише числа, дати — валідні дати
- [ ] **Given** обов'язкове поле порожнє, **When** запис зберігається, **Then** поле підсвічено з попередженням
- [ ] FORMULA-поля відображаються як read-only

### Technical Notes

**API:**

- `PATCH /api/records/:id/values` — body: `{ propertyId: value, ... }` → `200 OK`
- Validation: type-specific per property

**Web:**

- Inline editors для кожного типу властивості (#60–#69)
- Debounced auto-save

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: update record values (batch)
- [ ] Type-specific validation per property
- [ ] Auto-update: updatedAt timestamp

**Frontend (Web):**

- [ ] Type-specific inline editors в table cells
- [ ] Record card property form
- [ ] Auto-save з debounce
- [ ] Required field highlighting

### Functional Requirements

- [ ] **[§3.6]** Заповнення та редагування значень властивостей запису

### References

- Functional: §3.6 Записи
- User Stories: US-045

---

## #74 [Record] Edit record name and icon

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-044:** Як авторизований користувач, я хочу змінювати назву та іконку запису, щоб легко ідентифікувати його у списку.

### Description

Редагування назви та іконки запису. Назва редагується inline в table view та в заголовку картки. Іконка обирається з emoji picker. Зміни оновлюються в реальному часі у всіх місцях відображення.

### Acceptance Criteria

- [ ] **Given** Name-комірка в table view, **When** клік, **Then** inline editing назви
- [ ] **Given** заголовок картки запису, **When** клік на назву, **Then** inline editing
- [ ] **Given** іконка запису, **When** клік, **Then** відкривається emoji picker
- [ ] Зміни відображаються одразу в table view, заголовку запису та RELATION-chips

### Technical Notes

**API:**

- `PATCH /api/records/:id` — body: `{ name?, icon? }` → `200 OK`

**Web:**

- Inline text editing для назви
- Emoji picker для іконки

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: update record name/icon

**Frontend (Web):**

- [ ] Inline name editor (table + card)
- [ ] Emoji picker component
- [ ] Real-time UI update

### Functional Requirements

- [ ] **[§3.6]** Редагування назви та іконки запису

### References

- Functional: §3.6 Записи
- User Stories: US-044

---

## #75 [View] Table view: display records as rows with property columns

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-072:** Як авторизований користувач, я хочу переглядати записи бази даних у вигляді таблиці, щоб бачити всі дані в структурованому форматі.

### Description

Основне подання бази даних — таблиця. Кожен рядок — запис, кожна колонка — властивість. Перший стовпець (Name) закріплений при горизонтальному прокручуванні. Всі типи властивостей коректно відображаються у відповідних комірках.

### Acceptance Criteria

- [ ] Записи відображаються як рядки таблиці, властивості — як стовпці
- [ ] Перший стовпець (Name) закріплений при горизонтальному прокручуванні
- [ ] Кожен тип властивості відображається коректно (chips для SELECT, зірки для RATING тощо)
- [ ] Серверне збереження налаштувань відображення
- [ ] Перемикач wrap / no wrap для тексту в комірках

### Technical Notes

**API:**

- `GET /api/databases/:id/records` — query: `{ viewId, page, pageSize, filters, sort }` → paginated records
- `GET /api/databases/:id/views/:viewId` — config подання

**Web:**

- Virtualized table для великих наборів даних
- Sticky first column (Name)
- Cell renderers для кожного типу властивості

### Implementation Checklist

**Backend (API):**

- [ ] Endpoint: get records with pagination, filtering, sorting
- [ ] View config storage та retrieval

**Frontend (Web):**

- [ ] Table component з sticky Name column
- [ ] Cell renderers для всіх 11 типів
- [ ] Wrap/no-wrap toggle
- [ ] Virtualization для performance

### Functional Requirements

- [ ] **[§3.4]** **База даних** — це основний контейнер структурованих даних усередині робочого простору. Вона складається з властивостей — визначених полів із фіксованим типом даних — та записів, кожен з яких заповнює ці поля конкретними значеннями. Саме на рівні бази даних трейдер взаємодіє з основним масивом інформації: переглядає, фільтрує, сортує та аналізує записи.
- [ ] **[§3.4]** Перегляд бази даних зі списком записів та значеннями властивостей
- [ ] **[§3.6]** **Запис** — це одна одиниця даних усередині бази даних: окрема угода в Trading Journal, один день у Daily Routine, одна помилка в Mistakes. Запис складається з двох частин: набору значень властивостей — структурованих полів із конкретними даними — та контентної області, де зберігається довільний текстовий вміст із форматуванням.
- [ ] **[§3.6]** Кожен запис має мета-поля, незалежні від структури бази даних: назву, іконку, дату створення та дату останнього оновлення. Ці поля доступні для сортування та групування в будь-якій базі.
- [ ] **[§3.6]** Перегляд запису на окремій сторінці
- [ ] **[§3.9]** Відображення записів у вигляді таблиці зі стовпцями-властивостями
- [ ] **[§3.9]** Перемикання режиму перенесення тексту в комірках (wrap / no wrap)
- [ ] **[§3.9]** Серверне збереження всіх налаштувань відображення (доступні з будь-якого пристрою)

### References

- Functional: §3.4 Бази даних, §3.6 Записи, §3.9 Подання (Views)
- User Stories: US-072

---

## #76 [View] Table view: filter records by property values

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-076:** Як приватний трейдер, я хочу фільтрувати записи за значеннями властивостей, щоб аналізувати підмножини даних.

### Description

Фільтрація записів за значеннями властивостей з підтримкою різних операторів порівняння залежно від типу. Кілька фільтрів комбінуються (AND за замовчуванням). Кількість знайдених записів відображається.

### Acceptance Criteria

- [ ] **Given** відкрита панель фільтрів, **When** вибрано властивість, **Then** відображаються оператори порівняння відповідно до типу
- [ ] Набір операторів: TEXT (contains, equals, starts with, is empty), NUMBER (=, ≠, >, <, ≥, ≤, between, is empty), DATE (is, before, after, between, is empty), SELECT/STATUS (is, is not, is any of, is empty), CHECKBOX (is checked, is not checked)
- [ ] Кілька фільтрів комбінуються (AND за замовчуванням)
- [ ] Кількість результатів відображається
- [ ] Фільтри зберігаються в конфігурації подання на сервері

### Technical Notes

**API:**

- Query параметри: `filters: [{ propertyId, operator, value }]`
- Server-side filtering з SQL WHERE clause generation

**Web:**

- Filter panel: add filter → property picker → operator → value
- Active filter badges
- Result count display

### Implementation Checklist

**Backend (API):**

- [ ] Filter engine: property-type-specific operators
- [ ] SQL query builder для фільтрів
- [ ] View config: зберігання активних фільтрів

**Frontend (Web):**

- [ ] Filter panel UI
- [ ] Type-specific value inputs для кожного оператора
- [ ] Active filter display та видалення

### Functional Requirements

- [ ] **[§3.9]** Фільтрація записів за значеннями властивостей з підтримкою логічних операторів AND / OR між умовами (#130)
- [ ] **[§3.9]** Набір операторів порівняння залежить від типу властивості (специфікація — у розділі 2.2)

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-076

---

## #77 [View] Table view: sort records by property value

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-077:** Як авторизований користувач, я хочу сортувати записи за значенням властивості, щоб бачити дані у потрібному порядку.

### Description

Сортування записів за одним критерієм: вибір властивості та напрямку (зростання/спадання). Числа, дати, текст сортуються коректно. Сортування через клік на заголовок колонки або панель налаштувань.

### Acceptance Criteria

- [ ] **Given** клік на заголовок колонки, **When** перший клік, **Then** сортування за зростанням; другий клік — за спаданням; третій — зняття
- [ ] Числа сортуються числово, дати хронологічно, текст алфавітно
- [ ] Сортування зберігається в конфігурації подання
- [ ] Відображається індикатор активного сортування (↑/↓) в заголовку колонки

### Technical Notes

**API:**

- Query: `sort: { propertyId, direction: "asc" | "desc" }`
- SQL ORDER BY з type-specific collation

**Web:**

- Column header click → cycle through sort states
- Sort indicator icon

### Implementation Checklist

**Backend (API):**

- [ ] Sort engine: property-type-aware ordering
- [ ] View config: зберігання sort

**Frontend (Web):**

- [ ] Column header sort toggle
- [ ] Sort indicator UI
- [ ] Sort panel alternative

### References

- Functional: §3.9 (рядки 313–315)
- User Stories: US-077

---

## #78 [View] Table view: show/hide columns

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:view`, `layer:web`, `priority:must`

### User Story

**US-073:** Як авторизований користувач, я хочу показувати або приховувати колонки у table view, щоб бачити лише потрібні дані.

### Description

Управління видимістю колонок через панель налаштувань. Прихована колонка не видаляє дані — лише прибирає стовпець з відображення. Конфігурація видимості зберігається в поданні.

### Acceptance Criteria

- [ ] **Given** панель видимості колонок, **When** знято галочку з властивості, **Then** стовпець зникає з таблиці
- [ ] Приховання колонки не впливає на дані в записах
- [ ] Name-колонка не може бути прихована
- [ ] Конфігурація видимості зберігається між сесіями (в view config)

### Technical Notes

**Web:**

- Column visibility panel: checkbox list of properties
- View config update on toggle

### Implementation Checklist

**Frontend (Web):**

- [ ] Column visibility panel
- [ ] Toggle visibility з збереженням у view config
- [ ] Name column protection

### Functional Requirements

- [ ] **[§3.9]** Показ та приховування властивостей (визначає які стовпці відображаються)

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-073

---

## #79 [View] Table view: real-time inline search by record name

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:view`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-075:** Як авторизований користувач, я хочу шукати записи за назвою в реальному часі, щоб швидко знайти потрібний запис.

### Description

Пошук записів у межах бази даних за назвою та значеннями властивостей. Пошук починається з 2 символів. Результати фільтрують таблицю в реальному часі без перезавантаження.

### Acceptance Criteria

- [ ] **Given** поле пошуку у header таблиці, **When** введено ≥2 символів, **Then** таблиця фільтрується в реальному часі
- [ ] Пошук здійснюється по назві запису та значеннях властивостей
- [ ] Очищення поля відновлює повний список
- [ ] Пошук працює поверх активних фільтрів

### Technical Notes

**API:**

- Query parameter: `search: string` додається до existing filters
- Server-side ILIKE search по name + property values

**Web:**

- Search input у table header
- Debounced API calls (300ms)

### Implementation Checklist

**Backend (API):**

- [ ] Search query: ILIKE по name та text property values

**Frontend (Web):**

- [ ] Search input component
- [ ] Debounced search з real-time table update

### Functional Requirements

- [ ] **[§3.9]** Пошук записів у межах бази даних за назвою та значеннями властивостей
- [ ] **[§3.9]** Пошук починається з 2 введених символів

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-075

---

## #80 [Formula] FORMULA property type engine with preset database formulas

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:formula`, `layer:api`, `layer:web`, `layer:db`, `priority:must`

### User Story

**US-098:** Як приватний трейдер, я хочу бачити автоматично розраховані значення формул у записах пресетних баз даних, щоб не рахувати показники вручну.

### Description

FORMULA — автоматично обчислювана read-only властивість. Значення перераховується при зміні залежних полів. Пресетні БД мають попередньо визначені формули (Net PnL, Risk %, Actual RR, Win Rate тощо). Формула посилається лише на властивості того ж запису.

### Acceptance Criteria

- [ ] FORMULA-властивості відображаються як read-only в table view та картці запису
- [ ] Значення перераховується автоматично при зміні будь-якої залежної властивості
- [ ] Пресетні формули (Net PnL, Risk %, тощо) коректно обчислюються в пресетних БД
- [ ] FORMULA-поля не відображаються в списку доступних полів для вибору в інших формулах (захист від циклів)
- [ ] FORMULA-властивість доступна для фільтрації, сортування та групування

### Technical Notes

**API:**

- Formula engine: server-side evaluation
- Config: `{ type: "FORMULA", config: { expression: string, outputType: string, dependencies: propertyId[] } }`
- Recalculation trigger: on record value update (if dependency changed)

**Web:**

- Read-only display відповідно до outputType (number, text, date, etc.)

### Implementation Checklist

**Backend (API):**

- [ ] Formula expression parser та evaluator
- [ ] Dependency tracking: які properties впливають на формулу
- [ ] Recalculation on dependent value change
- [ ] Preset formulas seed для кожної пресетної БД

**Frontend (Web):**

- [ ] Read-only formula value display
- [ ] Output type formatting (number, text, date, rating, progress)

### References

- Functional: §3.13 Формули (рядки 522–617)
- User Stories: US-098

---

## #81 [Template] System templates: content and initial values on record creation

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:template`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-066:** Як приватний трейдер, я хочу використовувати системні шаблони при створенні записів, щоб одразу отримати правильну структуру вмісту.

### Description

Системні шаблони створюються автоматично при ініціалізації БД. Кожен шаблон містить: назву, іконку, опис, початкові значення властивостей та структуру контентної області. При створенні запису з шаблону — все копіюється в новий запис.

### Acceptance Criteria

- [ ] Кожна пресетна БД має щонайменше один системний шаблон
- [ ] **Given** вибір шаблону при створенні запису, **When** запис створено, **Then** назва (з Name Pattern), значення властивостей та контентна область скопійовані з шаблону
- [ ] Список шаблонів відображає назву, іконку та опис кожного
- [ ] Системні шаблони можна редагувати (вони залишаються редагованими)

### Technical Notes

**API:**

- `GET /api/databases/:id/templates` → list of templates
- Template seed: JSON config з values та content structure

**Web:**

- Template picker при створенні запису
- Template preview (name, icon, description)

### Implementation Checklist

**Backend (API):**

- [ ] Template model: name, icon, description, propertyValues, contentStructure
- [ ] Seed: системні шаблони для всіх 9 пресетних БД
- [ ] Record creation from template: copy values + content

**Frontend (Web):**

- [ ] Template picker dialog
- [ ] Template list з preview

### Functional Requirements

- [ ] **[§3.8]** Автоматичне створення системних шаблонів при ініціалізації бази даних
- [ ] **[§3.8]** Перегляд списку шаблонів бази даних
- [ ] **[§3.8]** Редагування системних шаблонів (системний шаблон залишається редагованим)

### References

- Functional: §3.8 Шаблони
- User Stories: US-066

---

## #82 [Template] Set default template for database

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:template`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-067:** Як авторизований користувач, я хочу встановити шаблон за замовчуванням для бази даних, щоб він автоматично застосовувався при кожному новому записі.

### Description

Один шаблон може бути позначений як default для БД. При створенні запису дефолтний шаблон застосовується автоматично. Користувач може змінити шаблон у момент створення.

### Acceptance Criteria

- [ ] **Given** шаблон позначений як default, **When** створюється новий запис, **Then** дефолтний шаблон застосовується автоматично
- [ ] Можна змінити шаблон при створенні запису (обрати інший або «без шаблону»)
- [ ] Лише один шаблон може бути default для БД
- [ ] Default можна змінити або зняти в налаштуваннях БД

### Technical Notes

**API:**

- `PATCH /api/databases/:id` — body: `{ defaultTemplateId: uuid | null }`
- Record creation: if defaultTemplateId set and no explicit templateId → use default

### Implementation Checklist

**Backend (API):**

- [ ] Database model: defaultTemplateId field
- [ ] Record creation logic: auto-apply default template

**Frontend (Web):**

- [ ] Default template selector в settings БД
- [ ] Template override при створенні запису

### Functional Requirements

- [ ] **[§3.4]** Налаштування використання шаблону за замовчуванням при створенні запису
- [ ] **[§3.8]** Встановлення шаблону за замовчуванням для бази даних

### References

- Functional: §3.4 Бази даних, §3.8 Шаблони
- User Stories: US-067

---

## #83 [Record] Create record from template

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-042:** Як приватний трейдер, я хочу створювати записи з шаблону, щоб одразу отримати готову структуру вмісту та початкові значення полів.

### Description

Створення запису з обраного шаблону. Вміст, назва (з Name Pattern) та початкові значення властивостей копіюються з шаблону. Запис відкривається для редагування.

### Acceptance Criteria

- [ ] **Given** вибір шаблону при створенні, **When** запис створено, **Then** значення властивостей, контентна область та назва (з Name Pattern) скопійовані
- [ ] Name Pattern токени обчислюються в момент створення: `{{today}}`, `{{count}}`, тощо
- [ ] Запис відкривається для редагування після створення
- [ ] Усі скопійовані значення можна вільно редагувати

### Technical Notes

**API:**

- `POST /api/databases/:id/records` — body: `{ templateId }` → `201 Created`
- Name Pattern resolution: server-side token substitution

### Implementation Checklist

**Backend (API):**

- [ ] Record creation from template: copy property values + content
- [ ] Name Pattern engine: resolve tokens (today, month, year, quarter, count)

**Frontend (Web):**

- [ ] Template selection у create record flow
- [ ] Post-creation redirect to record

### Functional Requirements

- [ ] **[§3.8]** Вибір шаблону при створенні запису (відображається назва, іконка та опис) або створення запису без шаблону

### References

- Functional: §3.8 Шаблони
- User Stories: US-042

---

## #84 [Content] Record content: row-column-block layout with drag-and-drop

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:content`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-053:** Як приватний трейдер, я хочу структурувати вміст запису у вигляді рядків, колонок та блоків, щоб гнучко організовувати нотатки та аналіз угоди.

### Description

Контентна область запису організована за 4-рівневою ієрархією: Row → Column (1–5 на рядок, регульована ширина) → Block (опціональний, іменований контейнер) → Component. Рядки можуть бути вкладені (макс. 2 рівні). Drag-and-drop для переміщення блоків.

### Acceptance Criteria

- [ ] Додавання рядка з вибором кількості колонок (1–5)
- [ ] Зміна ширини колонок перетягуванням меж
- [ ] Вкладення рядка в колонку (максимум 2 рівні)
- [ ] Блоки: додавання, назва (обов'язкова), візуальне оформлення (фон, рамка, заокруглення, відступи)
- [ ] Drag-and-drop для переміщення блоків між колонками та рядками
- [ ] Зміна порядку рядків перетягуванням
- [ ] Видалення рядків та блоків

### Technical Notes

**API:**

- Content stored as JSON tree: `{ rows: [{ columns: [{ blocks: [{ components: [] }] }] }] }`
- `PUT /api/records/:id/content` — body: content JSON

**Web:**

- Layout builder з drag-and-drop (dnd-kit або react-beautiful-dnd)
- Column resize handles
- Block creation dialog з name + styling options

### Implementation Checklist

**Backend (API):**

- [ ] Content model: JSON tree storage
- [ ] Content CRUD endpoint
- [ ] Validation: max nesting depth, column count

**Frontend (Web):**

- [ ] Row/Column/Block layout renderer
- [ ] Drag-and-drop system
- [ ] Column resize handles
- [ ] Block creation dialog (name + styling)

### Functional Requirements

- [ ] **[§3.7]** Додавання рядка до контентної області
- [ ] **[§3.7]** Вибір кількості колонок у рядку (1–5)
- [ ] **[§3.7]** Зміна ширини колонок шляхом перетягуванням меж
- [ ] **[§3.7]** Вкладення рядка в колонку іншого рядка (максимум 2 рівні вкладення)
- [ ] **[§3.7]** Зміна порядку рядків перетягуванням
- [ ] **[§3.7]** Видалення рядка
- [ ] **[§3.7]** Додавання блоку до колонки через візуальний конструктор
- [ ] **[§3.7]** Обов'язкове введення назви блоку при його створенні
- [ ] **[§3.7]** Редагування назви блоку
- [ ] **[§3.7]** Налаштування візуального оформлення блоку:
- [ ] **[§3.7]** Зміна порядку блоків перетягуванням (у межах колонки та між колонками)
- [ ] **[§3.7]** Видалення блоку
- [ ] **[§3.7]** Додавання компонента безпосередньо до колонки або всередину блоку
- [ ] **[§3.7]** Редагування вмісту компонента у режимі inline (#85)
- [ ] **[§3.7]** Зміна порядку компонентів перетягуванням (у межах блоку та між блоками й колонками)
- [ ] **[§3.7]** Видалення компонента

### References

- Functional: §3.7 Контентна область запису
- User Stories: US-053

---

## #85 [Content] Content blocks: text, headings H1–H3 with rich formatting

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:content`, `layer:web`, `priority:must`

### User Story

**US-054:** Як приватний трейдер, я хочу додавати текстові блоки та заголовки з форматуванням, щоб структурувати аналіз угоди чи нотатки.

### Description

Текстові компоненти контентної області: paragraph та заголовки H1–H3 з rich text форматуванням (bold, italic, underline, strikethrough, code, посилання, колір виділення). Ctrl+Shift+V вставляє чистий текст.

### Acceptance Criteria

- [ ] Компоненти: Paragraph, Heading 1, Heading 2, Heading 3
- [ ] Rich text toolbar: bold, italic, underline, strikethrough, code, link, highlight color
- [ ] Перемикання рівня заголовка (H1 ↔ H2 ↔ H3 ↔ Paragraph)
- [ ] Ctrl+V зберігає форматування; Ctrl+Shift+V — plain text
- [ ] Inline editing безпосередньо на сторінці запису

### Technical Notes

**Web:**

- Rich text editor: Tiptap з extensions для headings та formatting
- Component type: `{ type: "TEXT" | "HEADING", config: { level?: 1|2|3 }, content: RichTextJSON }`

### Implementation Checklist

**Frontend (Web):**

- [ ] Text component з rich text editor
- [ ] Heading component з level selector
- [ ] Formatting toolbar
- [ ] Paste handling (Ctrl+V, Ctrl+Shift+V)

### References

- Functional: §3.7 (рядки 233–236, implicit text component types)
- User Stories: US-054

---

## #86 [Content] Content blocks: image, checklist, divider, callout, toggle, lists

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:content`, `layer:web`, `priority:must`

### User Story

**US-055:** Як приватний трейдер, я хочу додавати блоки зображень, чеклістів, роздільників, callout, toggle та списків, щоб збагатити вміст запису.

### Description

Додаткові типи компонентів: IMAGE (PNG, JPG, WebP, ≤5 МБ), CHECKLIST (відмічені пункти), DIVIDER, CALLOUT (highlighted box), TOGGLE (згортається/розгортається), ordered/unordered lists.

### Acceptance Criteria

- [ ] IMAGE: завантаження файлу (PNG, JPG/JPEG, WebP, ≤5 МБ), preview, resize
- [ ] CHECKLIST: список пунктів з чекбоксами, додавання/видалення пунктів
- [ ] DIVIDER: горизонтальна лінія-роздільник
- [ ] CALLOUT: блок з іконкою та виділеним фоном
- [ ] TOGGLE: заголовок + згортаємий вміст
- [ ] Ordered та unordered lists
- [ ] Кожен компонент коректно відображається, переміщується drag-and-drop, видаляється

### Technical Notes

**Web:**

- Component registry: кожен тип має renderer + editor
- Image upload: `POST /api/uploads` → URL, max 5MB, accepted formats
- Checklist: array of `{ text, checked }` items

### Implementation Checklist

**Frontend (Web):**

- [ ] IMAGE component: upload, preview, resize
- [ ] CHECKLIST component: items + checkbox toggle
- [ ] DIVIDER component
- [ ] CALLOUT component: icon + color + text
- [ ] TOGGLE component: header + collapsible content
- [ ] List components: ordered, unordered

**Backend (API):**

- [ ] File upload endpoint для images (S3/local storage)

### Functional Requirements

- [ ] **[§3.7]** Підтримка типів компонентів визначається у розділі 2.4; для зображень: формати PNG, JPG/JPEG, WebP; максимальний розмір файлу — 5 МБ

### References

- Functional: §3.7 Контентна область запису
- User Stories: US-055

---

## #87 [Content] Content autosave with save status indicator

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:content`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-057:** Як авторизований користувач, я хочу, щоб зміни у вмісті запису зберігалися автоматично, щоб не втрачати дані при закритті вкладки.

### Description

Зміни контентної області зберігаються автоматично без явного натискання «Зберегти». Індикатор стану збереження видимий (Saving… / Saved / Error).

### Acceptance Criteria

- [ ] Зміни зберігаються автоматично після кожної значущої дії (debounce 1–2 сек)
- [ ] Індикатор збереження: «Saving…» → «Saved» → idle
- [ ] **Given** мережева помилка, **When** auto-save fails, **Then** індикатор «Error — retry» з кнопкою повтору
- [ ] Дані не втрачаються при закритті вкладки (beforeunload warning якщо unsaved)

### Technical Notes

**API:**

- `PUT /api/records/:id/content` — body: content JSON tree
- Debounced requests (1-2 sec after last change)

**Web:**

- Save status indicator component
- beforeunload event listener

### Implementation Checklist

**Backend (API):**

- [ ] Content save endpoint (idempotent PUT)

**Frontend (Web):**

- [ ] Auto-save hook з debounce
- [ ] Save status indicator (Saving/Saved/Error)
- [ ] beforeunload guard

### Functional Requirements

- [ ] **[§3.7]** Автоматичне збереження змін контентної області

### References

- Functional: §3.7 Контентна область запису
- User Stories: US-057

---

## #88 [Content] Content undo/redo (Ctrl+Z/Y, up to 50 snapshots per record)

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:content`, `layer:web`, `priority:must`

### User Story

**US-056:** Як авторизований користувач, я хочу скасовувати та повторювати зміни у вмісті запису, щоб легко виправляти помилки редагування.

### Description

Undo/redo для контентної області: Ctrl+Z (undo), Ctrl+Y або Ctrl+Shift+Z (redo). Стан зберігається на сервері та доступний після перезавантаження. Undo/redo ізольований для кожного запису.

### Acceptance Criteria

- [ ] Ctrl+Z скасовує останню дію; Ctrl+Y / Ctrl+Shift+Z повторює
- [ ] До 50 знімків стану на запис
- [ ] Undo/redo ізольований для кожного запису
- [ ] Стан undo/redo зберігається між сесіями (server-side)

### Technical Notes

**API:**

- Snapshots stored in DB: `content_snapshots` table
- Max 50 per record; oldest deleted when exceeded

**Web:**

- Undo/redo stack management
- Keyboard shortcuts: Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z

### Implementation Checklist

**Backend (API):**

- [ ] Snapshot storage: зберігання стану при кожній значущій зміні
- [ ] Snapshot limit: max 50, FIFO deletion

**Frontend (Web):**

- [ ] Undo/redo stack (client-side with server sync)
- [ ] Keyboard shortcut handlers

### Functional Requirements

- [ ] **[§3.7]** Скасування (undo) та повторення (redo) дій; стан зберігається на сервері та доступний після перезавантаження сторінки

### References

- Functional: §3.7 Контентна область запису
- User Stories: US-056

---

## #89 [Record] Soft-delete records to 30-day trash

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:record`, `layer:api`, `layer:web`, `priority:must`

### User Story

**US-046:** Як авторизований користувач, я хочу видаляти записи в Кошик, щоб не втрачати дані при випадковому видаленні.

### Description

Видалення запису переміщує його до Кошика, де він зберігається 30 днів до автоматичного постійного видалення. Записи в Кошику не враховуються у фільтрах, пошуку, статистиці, лімітах та FORMULA-розрахунках.

### Acceptance Criteria

- [ ] **Given** запис, **When** натиснуто «Delete», **Then** запис переміщується до Кошика
- [ ] Запис зникає з table view, фільтрів, пошуку, статистики
- [ ] RELATION-chip в інших записах відображається приглушеним (без посилання)
- [ ] Запис зберігається в Кошику 30 днів
- [ ] Автоматичне постійне видалення після 30 днів
- [ ] Записи в Кошику не враховуються в лімітах БД та {{count}} токені

### Technical Notes

**API:**

- `DELETE /api/records/:id` → soft delete: set `deletedAt = now()`
- Cron job: permanent delete where `deletedAt < now() - 30 days`
- All queries: `WHERE deletedAt IS NULL` by default

**Web:**

- Delete confirmation dialog
- Record disappears from table immediately

### Implementation Checklist

**Backend (API):**

- [ ] Soft delete: deletedAt field
- [ ] Query filter: exclude soft-deleted by default
- [ ] Cron: автоматичне постійне видалення (30 днів)
- [ ] RELATION handling: dimmed state for trashed records

**Frontend (Web):**

- [ ] Delete confirmation dialog
- [ ] Immediate removal from UI

### Functional Requirements

- [ ] **[§3.6]** Видалення запису: запис переміщується до Кошика, де зберігається 30 днів до автоматичного постійного видалення

### References

- Functional: §3.6 Записи
- User Stories: US-046

---

## #90 [View] Table view: column width resize with persistence

**State:** OPEN
**Milestone:** MVP Core
**Labels:** `feature`, `mod:view`, `layer:web`, `priority:must`

### User Story

**US-074:** Як авторизований користувач, я хочу змінювати ширину колонок перетягуванням, щоб зручно переглядати дані різної довжини.

### Description

Ширина колонок регулюється перетягуванням правого краю заголовка. Мінімальна ширина обмежена. Налаштування зберігаються між сесіями в конфігурації подання.

### Acceptance Criteria

- [ ] **Given** курсор на правому краю заголовка колонки, **When** перетягування, **Then** ширина змінюється
- [ ] Мінімальна ширина колонки обмежена (≥80px)
- [ ] Ширина зберігається між сесіями (в view config)

### Technical Notes

**Web:**

- Column resize handle: drag event listeners
- View config: `columnWidths: { [propertyId]: number }`

### Implementation Checklist

**Frontend (Web):**

- [ ] Column resize handles на заголовках
- [ ] Drag events + cursor style
- [ ] Persistence у view config

### Functional Requirements

- [ ] **[§3.9]** Регулювання ширини стовпців перетягуванням меж

### References

- Functional: §3.9 Подання (Views)
- User Stories: US-074

---

<!-- ============================================================ -->
<!--                   FEATURE COMPLETE                            -->
<!-- ============================================================ -->

## #187 chore(api): add Swagger UI via @nestjs/swagger

**State:** CLOSED
**Milestone:** MVP Core
**Labels:** `chore`, `layer:api`

### Description

## Summary

Підключити `@nestjs/swagger` для інтерактивної API-документації.

## Scope

- Встановити `@nestjs/swagger` в `apps/api`
- Додати CLI-плагін в `apps/api/nest-cli.json`
- Налаштувати `DocumentBuilder` + `SwaggerModule.setup` в `main.ts`
- Swagger UI доступний на `/api/docs`, JSON-специфікація — на `/api/docs-json`
- `@ApiTags` на всіх контролерах
- `@ApiBearerAuth('access-token')` на захищених контролерах
- `@ApiOperation({ summary })` на кожному ендпоінті
- `@ApiProperty` на request DTOs в `packages/domain`

## Acceptance Criteria

- [x] `http://localhost:3000/api/docs` відкривається
- [x] Ендпоінти згруповані по тегах (Auth, User, Space, Database, Record, Property, Template, Settings…)
- [x] Bearer auth кнопка працює — після введення токена захищені запити проходять
- [x] Request body відображає схему з полями (не просто `object`)

---

## #188 chore(ci): add GitHub Actions CI workflow

**State:** CLOSED
**Milestone:** MVP Core
**Labels:** `chore`, `layer:api`, `layer:web`

### Description

## Summary

Створити `.github/workflows/ci.yml` — автоматичний запуск lint + test + build на кожен PR та push до `develop`.

## Scope

- Тригери: `push` до `develop`, `pull_request` до `develop`
- Jobs:
  - `lint` — `turbo lint`
  - `test` — `turbo test` (unit-тести, без e2e)
  - `build` — `turbo build`
- Node.js 20, pnpm через `pnpm/action-setup`
- Кешування `~/.pnpm-store` для швидших запусків

## Acceptance Criteria

- [x] Workflow запускається автоматично на PR
- [x] `turbo lint` проходить без помилок
- [x] `turbo test` проходить (0 failed)
- [x] `turbo build` успішно збирає всі пакети
- [x] Статус CI відображається на PR у GitHub

---
