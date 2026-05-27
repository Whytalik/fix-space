# Auth — Email & Password Flow

[Вимога: §3.1 functional.md | Issues: #54 #55 #56 #57 #58 | Branch: feature/auth-email-and-password]

---

## Ключові бізнес-правила

- **Логін заблоковано до підтвердження email.** `User.isVerified = false` після реєстрації. `login()` перевіряє цей прапор першим після bcrypt-compare, а не після — інакше невалідний пароль поверне 403, а не 401.
- **Forgot-password повертає однаковий generic response** незалежно від того, чи існує email у БД — захист від user enumeration. Цей принцип порушувати не можна.
- **Reset password повинен анулювати всі активні сесії** (`revokeAllUserRefreshTokens`). Зараз це не реалізовано в `AuthService.resetPassword()` — це security gap.
- **Refresh token ротується при кожному `/auth/refresh`**: старий `revokedAt = now`, новий запис у БД з `expiresAt = now + 30d`. Це rolling expiration — 30 днів від останнього використання.
- **Новий verification token анулює попередній** (functional.md: "новий лінк анулює попередній"). Реалізується через `usedAt IS NULL AND expiresAt > now` — але якщо старий токен ще не прострочено, він технічно ще валідний. Потрібно або позначати старі як used при resend, або шукати лише останній.
- **Resend verification cooldown 60 с** — цей endpoint ще не реалізовано (`POST /auth/resend-verification`).

---

## Шар 1: DTO

### Що вже є

| DTO                 | Де лежить                                             | Поля                                                                              |
| ------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `RegisterUserDto`   | `packages/domain/src/user/dto/register-user.dto.ts`   | `email`, `username` (3–50, `[a-zA-Z0-9_-]`), `password` (8–128, regex складності) |
| `LoginUserDto`      | `packages/domain/src/user/dto/login-user.dto.ts`      | `email`, `password`                                                               |
| `VerifyEmailDto`    | `packages/domain/src/auth/dto/verify-email.dto.ts`    | `token: string` (в body, не query)                                                |
| `ForgotPasswordDto` | `packages/domain/src/auth/dto/forgot-password.dto.ts` | `email`                                                                           |
| `ResetPasswordDto`  | `packages/domain/src/auth/dto/reset-password.dto.ts`  | `token`, `newPassword` (той самий складний regex що в register)                   |

> **Увага:** `RegisterUserDto` та `LoginUserDto` лежать у `packages/domain/src/user/dto/`, не в `auth/dto/`. Це не помилка — так вирішено архітектурно. Відповідно й імпортувати з `@fixspace/domain` (загальний barrel).

### Що відсутнє

`ResendVerificationDto` — лише `{ email: string }` зі стандартними валідаторами.

### Тест-кейси DTO (EP + BVA)

**RegisterUserDto:**

- Fails: `username = "ab"` (2 chars, min 3)
- Fails: `username = "user name"` (пробіл — не в regex)
- Fails: `password = "password"` (немає цифри та спеціального символу)
- Fails: `password = "Pass1!"` (6 chars, min 8)
- Passes: `password = "P@ssw0rd"` (8 chars, всі вимоги)

**ResetPasswordDto:**

- Fails: пустий `token`
- Fails: `newPassword` без uppercase
- Passes: `newPassword = "NewP@ss1"`

---

## Шар 2: DB Schema

### Моделі (вже в schema.prisma)

```
User           { id, email!, username!, passwordHash, icon?, isVerified=false, createdAt }
RefreshToken   { id, userId, tokenHash, expiresAt, createdAt, revokedAt? }
               → onDelete: Cascade при видаленні User
EmailVerificationToken { id, userId, tokenHash, expiresAt, usedAt?, createdAt }
PasswordResetToken     { id, userId, tokenHash, expiresAt, usedAt?, createdAt }
```

Всі три токен-таблиці мають `@@index([tokenHash])` — lookup по хешу O(log n).

### Важливе про зберігання токенів

Опак-токени (refresh, verification, password-reset) хешуються **SHA-256** через `hashToken()`, а **не bcrypt**. Документ `security.md` описує bcrypt, але реальний код (`token.helper.ts`) використовує `crypto.createHash("sha256")`. Це прийнятно — token є вже криптографічно-випадковим 32-байтним значенням, не user-generated password.

### Чеклист ручної перевірки БД

- [ ] `User.isVerified = false` після `POST /auth/register`
- [ ] `EmailVerificationToken` запис створено з `expiresAt = now + 24h`, `usedAt = null`
- [ ] Після `POST /auth/verify` — `User.isVerified = true`, `usedAt` заповнено
- [ ] Після `POST /auth/login` — новий `RefreshToken` запис
- [ ] Після `POST /auth/refresh` — старий `revokedAt` заповнено, новий запис створено
- [ ] Після `POST /auth/logout` — `revokedAt` заповнено у поточному токені
- [ ] Після `POST /auth/reset-password` — `PasswordResetToken.usedAt` заповнено

---

## Шар 3: Service

### Сценарії та результати

| Сценарій                            | Де реалізовано                             | Очікуваний результат                           |
| ----------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| Реєстрація: email вже є             | `RegisterUserUseCase`                      | `409 Conflict`                                 |
| Реєстрація: username вже є          | `RegisterUserUseCase`                      | `409 Conflict`                                 |
| Логін: email не знайдено            | `AuthService.login()`                      | `401 Unauthorized` (не 404 — anti-enumeration) |
| Логін: пароль невірний              | `AuthService.login()`                      | `401 Unauthorized`                             |
| Логін: email не підтверджено        | `AuthService.login()`                      | `401 Unauthorized` з `EMAIL_NOT_VERIFIED`      |
| Verify: токен прострочений або used | `TokenService.validateVerificationToken()` | `null` → `400 Bad Request`                     |
| Refresh: токен revoked або expired  | `TokenService.validateRefreshToken()`      | `null` → `401`                                 |
| Forgot password: email не існує     | `AuthService.forgotPassword()`             | `200 OK` з generic message                     |
| Reset password: токен невалідний    | `AuthService.resetPassword()`              | `400 Bad Request`                              |

### Ключові тести (ще не написані — нема жодних spec-файлів)

**КЛЮЧОВИЙ ТЕСТ — логін блокується до верифікації:**

```typescript
it("should reject login when email is not verified", async () => {
  // Arrange
  const user = {
    email: "test@test.com",
    passwordHash: await hashPassword("P@ssw0rd1"),
    isVerified: false,
  };
  prisma.user.findUnique.mockResolvedValue(user);

  // Act & Assert
  await expect(
    authService.login({ email: "test@test.com", password: "P@ssw0rd1" }),
  ).rejects.toThrow(UnauthorizedException);
});
```

**Тест ротації refresh token:**

```typescript
it("should revoke old refresh token and create new one on refresh", async () => {
  const oldTokenId = "old-id";
  tokenService.validateRefreshToken.mockResolvedValue({
    userId: "user1",
    tokenId: oldTokenId,
  });
  tokenService.rotateRefreshToken.mockResolvedValue("new-raw-token");

  await authService.refresh("old-raw-token");

  expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith(
    oldTokenId,
    "user1",
  );
});
```

**Тест anti-enumeration у forgot-password:**

```typescript
it("should return same message regardless of email existence", async () => {
  prisma.user.findUnique.mockResolvedValue(null);
  const result = await authService.forgotPassword("nonexistent@test.com");
  expect(result.message).toBe(t("errors.PASSWORD_RESET_GENERIC"));
});
```

### GAP: resetPassword не анулює сесії

`AuthService.resetPassword()` оновлює `passwordHash` але не викликає `tokenService.revokeAllUserRefreshTokens(userId)`. Виправити:

```typescript
// В AuthService.resetPassword(), після транзакції:
await this.tokenService.revokeAllUserRefreshTokens(validated.userId);
```

### GAP: resetPassword не надсилає email-сповіщення

Functional.md §3.1: "Після зміни пароля система надсилає сповіщення на email". Потрібно додати `this.mailService.sendPasswordChangedEmail(user.email)` і реалізувати відповідний метод у `MailService`.

---

## Шар 4: Controller

### Endpoints (всі в `AuthController`, prefix `/auth`)

| Method | Path                    | Guard         | Throttle | HTTP | Що повертає                          |
| ------ | ----------------------- | ------------- | -------- | ---- | ------------------------------------ |
| POST   | `/auth/register`        | `@Public()`   | —        | 201  | `{ message }`                        |
| POST   | `/auth/verify`          | `@Public()`   | —        | 200  | `{ message }`                        |
| POST   | `/auth/login`           | `@Public()`   | 5/60s    | 200  | `{ message, accessToken }` + cookies |
| POST   | `/auth/refresh`         | `@Public()`   | —        | 200  | `{ message, accessToken }` + cookies |
| POST   | `/auth/logout`          | JWT (default) | —        | 200  | `{ message }` + clear cookies        |
| POST   | `/auth/forgot-password` | `@Public()`   | 3/60s    | 200  | `{ message }`                        |
| POST   | `/auth/reset-password`  | `@Public()`   | —        | 200  | `{ message }`                        |

> **Cookies** встановлюються `AuthCookiesInterceptor` (`@UseInterceptors` на рівні класу). Сервіс повертає `{ accessToken, refreshToken }` в об'єкті — interceptor читає ці поля, встановлює HTTP-only cookies, і **видаляє їх з response body** (клієнт не отримує токени у JSON).

> **`accessToken`** залишається у відповіді body (з interceptor'у) на `login` та `refresh` — це потрібно для frontend-збереження (якщо використовується не тільки cookie). Перевірити чи це потрібно.

### Postman чеклист

**Register → Verify → Login:**

1. `POST /auth/register` body `{ email, username, password }` → 201, перевірити email (Ethereal у dev)
2. З листа взяти token → `POST /auth/verify` body `{ token }` → 200
3. `POST /auth/login` body `{ email, password }` → 200, перевірити cookies `access_token` + `refresh_token` в браузері/Postman cookie jar
4. `POST /auth/login` до верифікації → 401 з `EMAIL_NOT_VERIFIED`
5. `POST /auth/login` невірний пароль → 401
6. 6-й запит на логін підряд → 429 Too Many Requests

**Refresh + Logout:** 7. `POST /auth/refresh` (з cookie) → 200, новий `access_token` у cookie 8. `POST /auth/refresh` зі старим (revoked) токеном → 401 9. `POST /auth/logout` → 200, cookies очищено

**Password Reset:** 10. `POST /auth/forgot-password` body `{ email }` → 200 (і для існуючого, і для неіснуючого email — однаковий response) 11. Взяти token з email → `POST /auth/reset-password` body `{ token, newPassword }` → 200 12. Той самий reset token повторно → 400

---

## Нестандартна поведінка

### Silent Token Refresh (#57) — Frontend

Це frontend concern, не backend. Backend endpoint `/auth/refresh` вже готовий.

На frontend потрібен **HTTP interceptor** (axios interceptor або Next.js middleware), який:

1. Перехоплює `401 Unauthorized` відповідь
2. Автоматично викликає `POST /auth/refresh`
3. Якщо refresh успішний — повторює оригінальний запит
4. Якщо refresh повернув `401` — перенаправляє на `/login`

**Критична деталь:** якщо кілька запитів повертають 401 одночасно, не можна запускати кілька `POST /auth/refresh` паралельно (ротація зробить першу відповідь валідною, решта отримають 401). Потрібна черга: перший запит виконує refresh, решта чекають його завершення.

### Cookie domain у dev

`AuthCookiesInterceptor` читає `COOKIE_DOMAIN` з env (default `"localhost"`). При локальній розробці frontend на `:3001` і API на `:3000` cookies передаються тільки якщо `withCredentials: true` в запиті і CORS `credentials: true`.

### JWT_REFRESH_EXPIRATION — перевірити env

Interceptor передає `parseDurationToMs(configService.get("JWT_REFRESH_EXPIRATION", "7d"))` у cookie `maxAge`. Але spec каже 30 днів. Переконатися що `.env.development` має `JWT_REFRESH_EXPIRATION=30d`, інакше cookie проживе 7 днів замість 30.

---

## Шари 5–6: Page + Components

### `/register` page

- Форма: email, username, password (з show/hide)
- Після submit: показати повідомлення "Check your email" — не робити auto-login
- Якщо 409 (email/username taken) — показати конкретне поле з помилкою

### `/auth/verify` page (deep link з email)

- При завантаженні: читати `?token=` з URL, автоматично POST `/auth/verify`
- Success → redirect на `/login` з success toast
- Error (токен прострочений/використаний) → показати "Link expired" + кнопку "Resend email"

### `/login` page

- Після успішного login → redirect на `/` (або на `?redirect=` query param)
- При `EMAIL_NOT_VERIFIED` помилці → показати banner "Verify your email" + кнопку resend

### `/forgot-password` + `/reset-password` pages

- Forgot: один input email, submit → завжди success message (не показувати чи існує email)
- Reset: два поля (new password + confirm), token читається з `?token=` query param
- При помилці токена → "Link expired or invalid, request a new one"

---

## Коміти

```
feat(auth): implement user registration with email and workspace init
feat(auth): add email verification endpoint and token validation
feat(auth): implement login with JWT cookies and throttle guard
feat(auth): add token refresh rotation and logout
feat(auth): implement password reset flow via email link
fix(auth): revoke all sessions on password reset
fix(auth): send notification email after successful password reset
feat(auth): add resend-verification endpoint with 60s cooldown
```

---

## Definition of Done

- [ ] `POST /auth/register` → 201, user в БД з `isVerified=false`, verification email відправлено
- [ ] `POST /auth/verify` → 200, `isVerified=true`, токен позначено `usedAt`
- [ ] `POST /auth/verify` з використаним або простроченим токеном → 400
- [ ] `POST /auth/login` до верифікації → 401 (`EMAIL_NOT_VERIFIED`)
- [ ] `POST /auth/login` з неправильним паролем → 401
- [ ] `POST /auth/login` 6+ разів підряд → 429
- [ ] `POST /auth/refresh` → новий cookie, старий токен revoked
- [ ] `POST /auth/refresh` з revoked токеном → 401
- [ ] `POST /auth/logout` → cookies очищено, токен revoked
- [ ] `POST /auth/forgot-password` — однаковий response для існуючого і неіснуючого email
- [ ] `POST /auth/reset-password` → пароль змінено, всі сесії анульовано, notification email надіслано
- [ ] `POST /auth/reset-password` з використаним токеном → 400
- [ ] Unit тести: `AuthService` (login scenarios, refresh, forgot-password anti-enumeration)
- [ ] Unit тести: `RegisterUserUseCase` (conflict cases)
- [ ] Unit тести: `TokenService` (rotation, revocation, validation)
- [ ] Frontend: silent refresh interceptor з queue для concurrent requests
- [ ] Frontend: `/auth/verify` deep link → auto-verify on load
- [ ] Postman collection оновлено з auth endpoints
