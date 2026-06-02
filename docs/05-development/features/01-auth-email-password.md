# Feature: Auth — Authentication and Infrastructure

## GitHub Issues

- **Issues:** #54, #55, #56, #57, #58, #59 — [Auth & Workspace Core]
- **Branch:** `feature/auth-email-password`
- **Milestone:** v0.1 — MVP Core
- **Priority:** P0 (Must · Критична)

---

## User Stories & Критерії приймання (Acceptance Criteria)

**US-001** · Реєстрація

> Як новий користувач, я хочу зареєструватися з email і паролем, щоб отримати доступ до платформи.

- [x] **Given** користувач на сторінці реєстрації, **When** вводить валідний email та пароль (≥8 символів, цифра, велика літера) і натискає «Sign Up», **Then** створюється акаунт і надсилається лист-підтвердження (UUID токен діє 24 год). · _Тест-кейси: [TC-AUTH-001](../../06-testing/test-cases/01-authentication.md#tc-auth-001-реєстрація-з-валідними-даними), [TC-AUTH-033 (E2E Playwright)](../../06-testing/test-cases/01-authentication.md#tc-auth-033-повний-e2e-флоу-реєстрації-та-входу-playwright)_
- [x] **Given** email вже зареєстрований, **When** спроба реєстрації, **Then** повертається помилка `409 Conflict` (без деталей). · _Тест-кейси: [TC-AUTH-003](../../06-testing/test-cases/01-authentication.md#tc-auth-003-реєстрація-з-існуючим-email), [TC-AUTH-034 (E2E Playwright)](../../06-testing/test-cases/01-authentication.md#tc-auth-034-негативна-реєстрація--дублікат-email-playwright)_

**US-002** · Підтвердження Email

> Як зареєстрований користувач, я хочу підтвердити email за посиланням з листа, щоб активувати акаунт.

- [x] **Given** отримано лист, **When** перехід за посиланням протягом 24 годин, **Then** email підтверджено, відображається успішний статус. · _Тест-кейси: [TC-AUTH-004](../../06-testing/test-cases/01-authentication.md#tc-auth-004-верифікація-email-з-валідним-токеном), [TC-AUTH-032 (E2E Playwright)](../../06-testing/test-cases/01-authentication.md#tc-auth-032-успішне-підтвердження-email-playwright-ui-e2e)_
- [x] **Given** посилання прострочене (>24 год) або недійсне, **When** перехід, **Then** відображається помилка з можливістю повторної відправки. · _Тест-кейси: [TC-AUTH-005](../../06-testing/test-cases/01-authentication.md#tc-auth-005-верифікація-з-невалідним-токеном), [TC-AUTH-006](../../06-testing/test-cases/01-authentication.md#tc-auth-006-верифікація-з-простроченим-токеном), [TC-AUTH-037 (E2E Playwright)](../../06-testing/test-cases/01-authentication.md#tc-auth-037-помилка-верифікації-email-та-повторне-надсилання-playwright)_

**US-003** · Вхід (JWT)

> Як зареєстрований користувач, я хочу увійти з email і паролем, щоб отримати доступ до свого workspace.

- [x] **Given** верифікований email, **When** введено правильні дані, **Then** видається access token (JWT, 15 хв) та refresh token (httpOnly cookie, 30 днів). · _Тест-кейси: [TC-AUTH-007](../../06-testing/test-cases/01-authentication.md#tc-auth-007-вхід-з-валідними-даними), [TC-AUTH-028 (E2E Playwright)](../../06-testing/test-cases/01-authentication.md#tc-auth-028-успішне-завантаження-сторінки-входу-playwright-ui-e2e)_
- [x] **Given** непідтверджений email або невірні дані, **When** спроба входу, **Then** повертається `401 Unauthorized`. · _Тест-кейси: [TC-AUTH-008](../../06-testing/test-cases/01-authentication.md#tc-auth-008-вхід-з-неправильним-паролем), [TC-AUTH-009](../../06-testing/test-cases/01-authentication.md#tc-auth-009-вхід-з-неіснуючим-email), [TC-AUTH-010](../../06-testing/test-cases/01-authentication.md#tc-auth-010-вхід-без-верифікації-email), [TC-AUTH-035 (E2E Playwright)](../../06-testing/test-cases/01-authentication.md#tc-auth-035-негативний-вхід--невалідний-пароль-playwright)_

**US-004** · Відновлення пароля

> Як користувач, що забув пароль, я хочу скинути його через email, щоб відновити доступ.

- [x] **Given** запит на відновлення, **When** введено email, **Then** надсилається лист із токеном (діє 1 год). · _Тест-кейс: [TC-AUTH-011](../../06-testing/test-cases/01-authentication.md#tc-auth-011-скидання-пароля--запит)_
- [x] **Given** зміна пароля, **When** встановлюється новий пароль, **Then** всі активні сесії анулюються (Revoke All Tokens). · _Тест-кейси: [TC-AUTH-012](../../06-testing/test-cases/01-authentication.md#tc-auth-012-скидання-пароля--встановлення-нового-пароля), [TC-AUTH-013](../../06-testing/test-cases/01-authentication.md#tc-auth-013-скидання-пароля--прострочений-токен), [TC-AUTH-014](../../06-testing/test-cases/01-authentication.md#tc-auth-014-скидання-пароля--повторне-використання-токена)_

**US-005** · Silent Token Refresh

> Як активний користувач, я хочу, щоб моя сесія подовжувалася автоматично без повторного входу.

- [x] **Given** access token закінчується, **When** клієнт робить запит, **Then** токени автоматично оновлюються за принципом ротації (старий refresh token інвалідується). · _Тест-кейси: [TC-AUTH-015](../../06-testing/test-cases/01-authentication.md#tc-auth-015-оновлення-токена--успішний-refresh), [TC-AUTH-016](../../06-testing/test-cases/01-authentication.md#tc-auth-016-refresh--повторне-використання-старого-токена), [TC-AUTH-017](../../06-testing/test-cases/01-authentication.md#tc-auth-017-refresh--відсутній-токен), [TC-AUTH-036 (E2E Playwright)](../../06-testing/test-cases/01-authentication.md#tc-auth-036-збереження-сесії-та-вихід-з-системи-playwright)_

**US-010 / US-024** · Автоініціалізація

> Як новий користувач, я хочу, щоб при першому підтвердженні email мій простір автоматично заповнювався 9 пресетними базами.

- [x] **Given** перша верифікація email, **When** акаунт активовано, **Then** автоматично створюється default workspace, 4 секції та 9 пресетних баз із шаблонами. · _Тест-кейси: простори: [TC-WS-001](../../06-testing/test-cases/02-workspace.md#tc-ws-001-автоматичне-створення-workspace-при-реєстрації), [TC-WS-002](../../06-testing/test-cases/02-workspace.md#tc-ws-002-пресетні-бази-мають-коректні-властивості), [TC-WS-003](../../06-testing/test-cases/02-workspace.md#tc-ws-003-пресетні-шаблони-створені); бази даних: [TC-DB-001](../../06-testing/test-cases/04-databases.md#tc-db-001-пресетні-бази-при-ініціалізації), [TC-DB-002](../../06-testing/test-cases/04-databases.md#tc-db-002-пресетні-звзки-між-базами)_

---

## Ключові бізнес-правила

- **Реєстрація та верифікація:** Вхід заблоковано до верифікації email. Після верифікації акаунт активується та ініціалізується default workspace.
- **Паролі:** Хешуються bcrypt; у відкритому вигляді не зберігаються.
- **Токени доступу:** Access token діє 15 хв, refresh token — 30 днів (httpOnly cookie).
- **Верифікаційні токени:** Email verification token діє 24 год, password reset token — 1 год.
- **Сесії:** Ротація refresh token — при кожному оновленні старий токен інвалідується. Скидання пароля анулює всі активні сесії.

---

## Технічний дизайн за шарами

### 1. Шар DTO & Валідація

- [x] `register-user.dto.ts` — Реєстрація: `email` (`@IsEmail`), `username` (`@MinLength(3)`),
      `password` (`@MinLength(8)` + Regex).
- [x] `login-user.dto.ts` — Вхід: `email` (`@IsEmail`), `password` (`@IsString`).
- [x] `forgot-password.dto.ts` — Скидання (запит): `email` (`@IsEmail`).
- [x] `reset-password.dto.ts` — Зміна пароля: `token` (`@IsString`), `newPassword`
      (`@MinLength(8)` + Regex).
- [x] `verify-email.dto.ts` — Верифікація: `token` (`@IsString`).

### 2. Шар DB Schema

Для підтримки автентифікації додано чотири моделі:

- [x] **User:** Зберігає профіль користувача, прапорець `isVerified` та зв'язки.
- [x] **RefreshToken:** Зберігає хеш токена, термін дії та дату відкликання (`revokedAt`)
      для механізму ротації сесії.
- [x] **EmailVerificationToken / PasswordResetToken:** Токени підтвердження пошти та
      скидання пароля відповідно.

### 3. Шар Service & Controller (API)

- [x] **RegisterUserUseCase:** Перевірка унікальності $\rightarrow$ Хеш bcrypt $\rightarrow$
      Створення `User` $\rightarrow$ Ініціалізація стартового простору (default workspace, 4 секції,
      9 БД) $\rightarrow$ Генерація `EmailVerificationToken` $\rightarrow$ Надсилання листа.
- [x] **AuthService.login:** Перевірка пароля та верифікації email $\rightarrow$
      Випуск пари JWT (Access + Refresh) $\rightarrow$ Запис рефреш-сесії в БД.
- [x] **AuthService.refresh:** Валідація рефреш-токена $\rightarrow$ Ротація сесії (видалення
      старого токена, створення нової пари) $\rightarrow$ Запис нових токенів.
- [x] **AuthService.resetPassword:** Валідація токена $\rightarrow$ Оновлення пароля $\rightarrow$
      Анулювання **всіх** сесій користувача.
- [x] **Endpoints (AuthController):**
  - [x] `POST /auth/register` (Public)
  - [x] `POST /auth/verify` (Public)
  - [x] `POST /auth/login` (Public, Rate Limit: 5/min)
  - [x] `POST /auth/refresh` (Public, HttpOnly Cookie)
  - [x] `POST /auth/logout` (Auth required, очищення cookies)
  - [x] `POST /auth/forgot-password` (Public, Rate Limit: 3/min)
  - [x] `POST /auth/reset-password` (Public)

### 4. Шар Pages & Components (Web)

- [x] **Pages:**
  - [x] `/login` — Вхід в систему, зберігання access token в memory.
  - [x] `/register` — Реєстрація нового користувача.
  - [x] `/forgot-password` — Запит на відновлення пароля.
  - [x] `/reset-password?token=...` — Встановлення нового пароля.
  - [x] `/auth/verify?token=...` — Сторінка підтвердження email після реєстрації.
- [x] **Components:**
  - [x] `login-form.tsx` — Форма входу з обробкою помилок (невірна пошта/неверифікований email) та станом loading.
  - [x] `forgot-password-form.tsx` — Форма запиту відновлення, блокування кнопки відправки на 60 сек.
  - [x] `register-success.tsx` — Екран з проханням підтвердити email після реєстрації.
  - [x] `reset-password-form.tsx` — Форма введення та підтвердження нового пароля (реалізовано у page.tsx).
  - [x] `verify-email-status.tsx` — Стан перевірки токена верифікації, успішна кнопка входу або повторна відправка листа.

### 5. Документація API (Swagger & Postman)

- [x] **Swagger (OpenAPI):** Ендпоінти `AuthController` повністю задокументовані за допомогою `@ApiTags`, `@ApiOperation`, `@ApiResponse` та інтегровані в автоматично генеровану схему `/api/docs`.
- [x] **Postman:** Сценарії тестування всього Auth flow (валідація, успішна реєстрація, верифікація токена, логін, оновлення токенів, скидання та логаут) додані в колекцію `docs/06-testing/postman/postman_collection.json`.

### 6. Шар E2E тестування (Web)

- [x] **Інструментарій:** Playwright (Chromium, Firefox, WebKit).
- [x] **Сценарії (auth.spec.ts):**
  - [x] Smoke: Завантаження сторінки входу. · _Тест-кейс: [TC-AUTH-028](../../06-testing/test-cases/01-authentication.md#tc-auth-028-успішне-завантаження-сторінки-входу-playwright-ui-e2e)_
  - [x] Позитивний: Реєстрація $\rightarrow$ Верифікація (через mock/DB) $\rightarrow$ Логін $\rightarrow$ Доступ до Dashboard. · _Тест-кейс: [TC-AUTH-033](../../06-testing/test-cases/01-authentication.md#tc-auth-033-повний-e2e-флоу-реєстрації-та-входу-playwright)_
  - [x] Негативний: Логін із невірним паролем, реєстрація існуючого email. · _Тест-кейси: [TC-AUTH-034](../../06-testing/test-cases/01-authentication.md#tc-auth-034-негативна-реєстрація--дублікат-email-playwright), [TC-AUTH-035](../../06-testing/test-cases/01-authentication.md#tc-auth-035-негативний-вхід--невалідний-пароль-playwright)_
  - [x] Сесії: Перевірка збереження сесії після перезавантаження сторінки та автоматичне оновлення токена. · _Тест-кейс: [TC-AUTH-036](../../06-testing/test-cases/01-authentication.md#tc-auth-036-збереження-сесії-та-вихід-з-системи-playwright)_

---

## Коміти

```bash
# 1. Схема БД та міграція
chore(db): add User, RefreshToken, EmailVerificationToken, PasswordResetToken models and migration
# 2. DTO (домен)
feat(domain/user): add auth and user DTOs with validation
# 3. Бізнес-логіка (API)
feat(api/auth): add AuthService, TokenService, and RegisterUserUseCase logic
# 4. Тести бізнес-логіки
test(api/auth): add unit tests for AuthService and RegisterUserUseCase
# 5. Ендпоінти (API)
feat(api/auth): add AuthController endpoints and JwtAuthGuard
# 6. Клієнтська логіка та сторінки (Web)
feat(web/auth): add login, register, reset-password, and forgot-password pages and forms
# 7. E2E Тести (Web)
test(web/e2e): add Playwright authentication flows
# 8. Документація та тести
docs(auth): update test-cases, RTM, and Postman collection
```

---

## Definition of Done

- [x] Всі DTO покриті тестами валідації.
- [x] DB міграція застосована та перевірена в Prisma Studio.
- [x] UseCase-и та AuthService мають 100% покриття бізнес-логіки тестами.
- [x] Ендпоінти протестовані e2e та перевірені через Postman (колекція оновлена).
- [x] UI-компоненти та сторінки перевірені (smoke + exploratory) на адаптивність та обробку помилок від API.
- [x] E2E сценарії в Playwright проходять успішно для всіх підтримуваних браузерів.
- [x] `turbo lint`, `turbo test`, `turbo build` проходять без помилок.
- [x] Документація тест-кейсів [01-authentication.md](../../06-testing/test-cases/01-authentication.md) оновлена.
- [x] Матриця трасабельності вимог (RTM) оновлена.
