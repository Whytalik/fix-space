# Unit Tests: Authentication

### [x] TC-AUTH-U-001: AuthService.register — створення користувача та хешування пароля

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-001             |
| **Issue**    | #1                 |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати `AuthService.register()` з валідними email, username та password.
2. Перевірити, що викликано `hashPassword` для введеного пароля.
3. Перевірити, що в базу даних передається об'єкт користувача з хешованим паролем та `isVerified: false`.
4. Перевірити, що створюється запис `EmailVerificationToken` з терміном дії 24 години.

**Очікуваний результат:**

- Пароль успішно хешується перед збереженням.
- Користувач створюється в статусі непідтвердженого.
- Генерується токен підтвердження email з `expiresAt` рівним +24 години від поточного часу.

---

---

### [x] TC-AUTH-U-002: AuthService.verifyEmail — валідація токену та активація профілю

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-002                  |
| **Issue**    | #2                      |
| **TS**       | —                       |
| **Метод**    | Unit (Jest)             |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P1                      |

**Кроки:**

1. Викликати `AuthService.verifyEmail()` з неіснуючим токеном.
2. Викликати `AuthService.verifyEmail()` з простроченим токеном (`expiresAt` в минулому).
3. Викликати `AuthService.verifyEmail()` з валідним токеном.

**Очікуваний результат:**

- Неіснуючий або прострочений токен викликає помилку валідації (`BadRequestException`).
- Валідний токен оновлює статус користувача `isVerified: true`, а сам токен позначається як використаний (`usedAt` встановлено).

---

---

### [x] TC-AUTH-U-003: AuthService.login — перевірка облікових даних та верифікації

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-002                   |
| **Issue**    | #3                       |
| **TS**       | —                        |
| **Метод**    | Unit (Jest)              |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P1                       |

**Кроки:**

1. Викликати `AuthService.login()` з невірним паролем.
2. Викликати `AuthService.login()` для користувача, який не верифікував свій email (`isVerified: false`).
3. Викликати `AuthService.login()` з валідними email та password верифікованого користувача.

**Очікуваний результат:**

- Невірний пароль повертає помилку автентифікації (`UnauthorizedException`).
- Неверифікований email повертає помилку заборони входу (`ForbiddenException`).
- Успішний вхід генерує пару access/refresh JWT токенів.

---

---

### [x] TC-AUTH-U-004: AuthService.loginWithGoogle — створення або оновлення користувача через OAuth

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-003             |
| **Issue**    | #5                 |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати `AuthService.loginWithGoogle()` для нового email (раніше не зареєстрованого).
2. Викликати `AuthService.loginWithGoogle()` для існуючого email, що не має прив'язаного Google ID.
3. Викликати `AuthService.loginWithGoogle()` для користувача, який вже має зв'язаний Google ID.

**Очікуваний результат:**

- Для нового email автоматично створюється акаунт: нікнейм заповнюється з display name, пароль не встановлюється, `isVerified: true` (оскільки email верифікований Google).
- Для існуючого акаунту без прив'язки відбувається прив'язка Google ID до профілю.
- Для вже прив'язаного користувача повертається сесія входу.

---

---

### [x] TC-AUTH-U-005: AuthService.requestPasswordReset — генерація одноразового токену скидання

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-048                   |
| **Issue**    | #5                       |
| **TS**       | —                        |
| **Метод**    | Unit (Jest)              |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P1                       |

**Кроки:**

1. Викликати `AuthService.requestPasswordReset()` для неіснуючого в системі email.
2. Викликати `AuthService.requestPasswordReset()` для валідного email.
3. Перевірити `expiresAt` згенерованого токену скидання.

**Очікуваний результат:**

- Неіснуючий email повертає успішний статус або заглушку (для безпеки), але лист не надсилається.
- Валідний email створює `PasswordResetToken` з часом дії 1 година, надсилається email з посиланням на скидання.

---

---

### [x] TC-AUTH-U-006: AuthService.resetPassword — зміна пароля та анулювання сесій

| Поле         | Значення         |
| ------------ | ---------------- |
| **US**       | US-048           |
| **Issue**    | #5               |
| **TS**       | —                |
| **Метод**    | Unit (Jest)      |
| **Техніка**  | State Transition |
| **Priority** | P1               |

**Кроки:**

1. Викликати `AuthService.resetPassword()` з невалідним токеном скидання.
2. Викликати `AuthService.resetPassword()` з валідним токеном та новим паролем.
3. Перевірити, що всі активні `RefreshToken` користувача видалені з бази даних після зміни пароля.
4. Перевірити надсилання email-сповіщення про зміну пароля.

**Очікуваний результат:**

- Невалідний токен викликає помилку `BadRequestException`.
- Успішна зміна пароля хешує новий пароль, видаляє всі збережені refresh-токени користувача (анулює сесії) та ініціює надсилання email-сповіщення.

---

---

### [x] TC-AUTH-U-007: UserService.unlinkGoogle — обмеження відв'язування Google без пароля

| Поле         | Значення                             |
| ------------ | ------------------------------------ |
| **US**       | US-003                               |
| **Issue**    | #5                                   |
| **TS**       | —                                    |
| **Метод**    | Unit (Jest)                          |
| **Техніка**  | Equivalence Partitioning (protected) |
| **Priority** | P1                                   |

**Кроки:**

1. Спробувати відв'язати Google акаунт (`UserService.unlinkGoogle()`) для користувача, який не має встановленого локального пароля (зареєстрований виключно через Google OAuth).
2. Спробувати відв'язати Google акаунт для користувача, який встановив локальний пароль.

**Очікуваний результат:**

- Спроба відв'язати єдиний спосіб входу завершується помилкою `BadRequestException`.
- При наявності пароля відв'язування відбувається успішно.

---

---

### [x] TC-AUTH-U-008: UserService.deleteAccount — видалення даних після підтвердження пароля

| Поле         | Значення         |
| ------------ | ---------------- |
| **US**       | US-007           |
| **Issue**    | #6               |
| **TS**       | —                |
| **Метод**    | Unit (Jest)      |
| **Техніка**  | State Transition |
| **Priority** | P1               |

**Кроки:**

1. Спробувати видалити акаунт з неправильним паролем підтвердження.
2. Спробувати видалити акаунт з вірним паролем.
3. Перевірити повне каскадне видалення зв'язаних даних користувача (User, Spaces, Databases, Records) у транзакції БД.
4. Перевірити надсилання фінального email про видалення акаунту.

**Очікуваний результат:**

- Невірний пароль повертає помилку `ForbiddenException`.
- Збіг пароля запускає видалення всіх даних користувача та відправку прощального листа.

---

---

---

### [x] TC-AUTH-U-009: AuthService — Відкат транзакції при виникненні помилки

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
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

### [x] TC-AUTH-U-010: AuthService — Обробка помилки дублювання унікальних полів

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-002         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Error Guessing |
| **Priority** | P1             |

**Кроки:**

1. Налаштувати мок репозиторію для імітації порушення унікального обмеження у БД (наприклад, унікального імені чи email).
2. Викликати відповідний метод створення або оновлення сервісу.
3. Перевірити, що метод перехоплює помилку репозиторію та викидає `ConflictException`.

**Очікуваний результат:**

- Метод повертає `ConflictException` із повідомленням про помилку дублювання.

---

---

### [x] TC-AUTH-U-011: TokenService.createRefreshToken — генерація та збереження refresh-токена

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати `TokenService.createRefreshToken("user-1")`.
2. Перевірити, що `prisma.refreshToken.create` викликано з `userId`, `tokenHash` та `expiresAt`.
3. Перевірити, що метод повертає сирий (unhashed) рядок токена.

**Очікуваний результат:**

- Повертається рядок `rawToken`.
- У БД зберігається хеш токена, а не сам токен.
- `expiresAt` встановлено згідно з `JWT_REFRESH_EXPIRATION` конфігом (за замовчуванням `7d`).

---

---

### [x] TC-AUTH-U-012: TokenService.validateRefreshToken — валідний токен

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Підготувати мок: `prisma.refreshToken.findFirst` повертає запис з `userId` та `id`.
2. Викликати `TokenService.validateRefreshToken("raw_token")`.
3. Перевірити результат.

**Очікуваний результат:**

- Повертається `{ userId, tokenId }`.
- Пошук здійснюється за хешем токена, `revokedAt: null`, `expiresAt > now`.

---

---

### [x] TC-AUTH-U-013: TokenService.validateRefreshToken — відкликаний або прострочений токен

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-002         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. Підготувати мок: `prisma.refreshToken.findFirst` повертає `null`.
2. Викликати `TokenService.validateRefreshToken("raw_token")`.

**Очікуваний результат:**

- Повертається `null` (не кидає виняток).

---

---

### [x] TC-AUTH-U-014: TokenService.rotateRefreshToken — ротація токена

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Підготувати мок: `prisma.refreshToken.update` та `prisma.refreshToken.create` успішні.
2. Викликати `TokenService.rotateRefreshToken("old-token-id", "user-1")`.

**Очікуваний результат:**

- Старий токен позначається `revokedAt: new Date()`.
- Створюється новий refresh-токен.
- Повертається сирий новий токен.

---

---

### [x] TC-AUTH-U-015: TokenService.revokeRefreshToken — відкликання токена за хешем

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Викликати `TokenService.revokeRefreshToken("raw_token")`.
2. Перевірити виклик `prisma.refreshToken.updateMany`.

**Очікуваний результат:**

- `updateMany` викликається з фільтром за `tokenHash` та `revokedAt: null`, встановлює `revokedAt`.

---

---

### [x] TC-AUTH-U-016: TokenService.revokeAllUserRefreshTokens — анулювання всіх сесій користувача

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-048             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати `TokenService.revokeAllUserRefreshTokens("user-1")`.
2. Перевірити виклик `prisma.refreshToken.updateMany`.

**Очікуваний результат:**

- `updateMany` викликається з фільтром `{ userId, revokedAt: null }`.
- Всі активні refresh-токени користувача позначаються відкликаними.

---

---

### [x] TC-AUTH-U-017: TokenService.validateVerificationToken — валідний токен

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-001             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Підготувати мок: `prisma.emailVerificationToken.findFirst` повертає запис.
2. Викликати `TokenService.validateVerificationToken("raw_token")`.

**Очікуваний результат:**

- Повертається `{ userId, tokenId }`.
- Пошук за `tokenHash`, `usedAt: null`, `expiresAt > now`.

---

---

### [x] TC-AUTH-U-018: TokenService.validateVerificationToken — вже використаний або прострочений

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-001         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. Підготувати мок: `prisma.emailVerificationToken.findFirst` повертає `null`.
2. Викликати `TokenService.validateVerificationToken("raw_token")`.

**Очікуваний результат:**

- Повертається `null`.

---

---

### [x] TC-AUTH-U-019: TokenService.createPasswordResetToken — генерація токена скидання пароля

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-048             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати `TokenService.createPasswordResetToken("user-1")`.
2. Перевірити виклик `prisma.passwordResetToken.create`.

**Очікуваний результат:**

- Зберігається хеш токена з `expiresAt` = поточний час + 1 година (за конфігом).
- Повертається сирий токен.

---

---

### [x] TC-AUTH-U-020: TokenService.validatePasswordResetToken — валідний токен

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-048             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Підготувати мок: `prisma.passwordResetToken.findFirst` повертає запис.
2. Викликати `TokenService.validatePasswordResetToken("raw_token")`.

**Очікуваний результат:**

- Повертається `{ userId, tokenId }`.
- Пошук за `tokenHash`, `usedAt: null`, `expiresAt > now`.

---

---

### [x] TC-AUTH-U-021: TokenService.validatePasswordResetToken — прострочений або використаний токен

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-048         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. Підготувати мок: `prisma.passwordResetToken.findFirst` повертає `null`.
2. Викликати `TokenService.validatePasswordResetToken("raw_token")`.

**Очікуваний результат:**

- Повертається `null`.

---

---

### [x] TC-AUTH-U-023: AuthService.logoutAll — відкликання всіх сесій

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Викликати `AuthService.logoutAll("user-1")`.
2. Перевірити виклик `tokenService.revokeAllUserRefreshTokens`.

**Очікуваний результат:**

- `tokenService.revokeAllUserRefreshTokens("user-1")` викликається один раз.
- Повертається об'єкт із `clearCookies: true`.

---

---

### [x] TC-AUTH-U-022: TokenService.generateAccessToken — JWT-підпис

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Підготувати мок: `jwtService.sign` повертає `"signed.jwt.token"`.
2. Викликати `TokenService.generateAccessToken("user-1", "testuser")`.

**Очікуваний результат:**

- `jwtService.sign` викликається з `{ sub: "user-1", username: "testuser" }`.
- Повертається рядок JWT-токена.

---

### [x] TC-AUTH-U-024: AuthService.getSessions — повертає сесії з isCurrent=true для поточної

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Мок `tokenService.findActiveSessions` повертає 2 сесії (id: "rt-1", "rt-2").
2. Мок `tokenService.validateRefreshToken` повертає `{ tokenId: "rt-1" }`.
3. Викликати `AuthService.getSessions("user-1", "raw_token")`.

**Очікуваний результат:**

- Масив з 2 елементів `SessionResponseDto`.
- Сесія "rt-1" має `isCurrent: true`.
- Сесія "rt-2" має `isCurrent: false`.

---

### [x] TC-AUTH-U-025: AuthService.getSessions — isCurrent=false коли refresh-токен не переданий

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Мок `tokenService.findActiveSessions` повертає 2 сесії.
2. Викликати `AuthService.getSessions("user-1")` без другого аргументу.

**Очікуваний результат:**

- Всі сесії мають `isCurrent: false`.

---

### [x] TC-AUTH-U-026: AuthService.revokeSession — успішне відкликання

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-002             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Мок `tokenService.revokeSessionById` повертає `true`.
2. Викликати `AuthService.revokeSession("user-1", "rt-1")`.

**Очікуваний результат:**

- Повертається об'єкт з `message`.
- `tokenService.revokeSessionById` викликається з `("rt-1", "user-1")`.

---

### [x] TC-AUTH-U-027: AuthService.revokeSession — ForbiddenException коли сесія чужа

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-002         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. Мок `tokenService.revokeSessionById` повертає `false`.
2. Викликати `AuthService.revokeSession("user-1", "rt-999")`.

**Очікуваний результат:**

- Кидається `ForbiddenException`.

---

### [x] TC-AUTH-U-028: UserService.findById — повертає UserResponseDto

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-025             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Мок `userRepo.findByIdOrThrow` повертає об'єкт користувача.
2. Викликати `UserService.findById("user-1")`.

**Очікуваний результат:**

- Повертається екземпляр `UserResponseDto` з коректними полями.
- `userRepo.findByIdOrThrow` викликається з `"user-1"`.

---

### [x] TC-AUTH-U-029: UserService.findById — NotFoundException коли не знайдено

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-025         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Error Guessing |
| **Priority** | P1             |

**Кроки:**

1. Мок `userRepo.findByIdOrThrow` кидає `NotFoundException`.
2. Викликати `UserService.findById("nonexistent")`.

**Очікуваний результат:**

- Прокидається `NotFoundException`.

---

### [x] TC-AUTH-U-030: UserService.update — оновлення полів профілю

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-025             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Мок `userRepo.update` повертає оновлений об'єкт користувача.
2. Викликати `UserService.update("user-1", { username: "newname" })`.

**Очікуваний результат:**

- `userRepo.update` викликається з `"user-1"` та оновленими полями.
- Повертається `UserResponseDto` з новим username.

---

### [x] TC-AUTH-U-031: UserService.update — хешує пароль коли передано поле password

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-025             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Мок `hashPassword` повертає `"hashed"`.
2. Викликати `UserService.update("user-1", { password: "NewPass1!" })`.

**Очікуваний результат:**

- `hashPassword` викликано з `"NewPass1!"`.
- `userRepo.update` викликано з `passwordHash: "hashed"`.
- Поле `password` не передається напряму в репозиторій.

---

### [x] TC-AUTH-U-032: UserService.changePassword — Google-only акаунт без пароля

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-070                   |
| **Issue**    | —                        |
| **TS**       | —                        |
| **Метод**    | Unit (Jest)              |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P1                       |

**Кроки:**

1. Мок `userRepo.findByIdOrThrow` повертає користувача з `passwordHash: null`.
2. Викликати `UserService.changePassword("user-1", { currentPassword: "any", newPassword: "New1!" })`.

**Очікуваний результат:**

- Кидається `UnauthorizedException` (акаунт не має локального пароля).

---

### [x] TC-AUTH-U-033: UserService.changePassword — невірний поточний пароль

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-070                   |
| **Issue**    | —                        |
| **TS**       | —                        |
| **Метод**    | Unit (Jest)              |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P1                       |

**Кроки:**

1. Мок `userRepo.findByIdOrThrow` повертає користувача з `passwordHash: "hash"`.
2. Мок `verifyPassword` повертає `false`.
3. Викликати `UserService.changePassword("user-1", { currentPassword: "wrong", newPassword: "New1!" })`.

**Очікуваний результат:**

- Кидається `UnauthorizedException`.

---

### [x] TC-AUTH-U-034: UserService.changePassword — успішна зміна пароля

| Поле         | Значення         |
| ------------ | ---------------- |
| **US**       | US-070           |
| **Issue**    | —                |
| **TS**       | —                |
| **Метод**    | Unit (Jest)      |
| **Техніка**  | State Transition |
| **Priority** | P1               |

**Кроки:**

1. Мок `verifyPassword` повертає `true`.
2. Мок `hashPassword` повертає `"newhash"`.
3. Викликати `UserService.changePassword("user-1", { currentPassword: "Old1!", newPassword: "New1!" })`.

**Очікуваний результат:**

- `userRepo.update` викликано з `passwordHash: "newhash"`.
- `tokenService.revokeAllUserRefreshTokens("user-1")` викликано.
- `mailService.sendPasswordChangeNotification(email)` викликано.
- Повертається `{ message: "Password changed successfully" }`.

---

### [x] TC-AUTH-U-035: UserService.updateAvatar — успішне збереження аватара

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-025             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Мок `storageService.saveAvatar` повертає `"avatars/user-1/avatar.webp"`.
2. Мок `userRepo.update` повертає оновленого користувача.
3. Викликати `UserService.updateAvatar("user-1", mockFile)`.

**Очікуваний результат:**

- `storageService.saveAvatar("user-1", mockFile)` викликано.
- `userRepo.update("user-1", { icon: "avatars/user-1/avatar.webp" })` викликано.
- Повертається `UserResponseDto`.

---

### [x] TC-AUTH-U-036: UserService.updateAvatar — відкочує файл при помилці оновлення БД

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | US-025         |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Error Guessing |
| **Priority** | P2             |

**Кроки:**

1. Мок `storageService.saveAvatar` повертає шлях успішно.
2. Мок `userRepo.update` кидає помилку.
3. Викликати `UserService.updateAvatar("user-1", mockFile)`.

**Очікуваний результат:**

- `storageService.removeAvatarFiles("user-1")` викликано для видалення завантаженого файлу.
- Помилка прокидається далі.

---

### [x] TC-AUTH-U-037: UserService.removeAvatar — успішне видалення аватара

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-025             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Мок `userRepo.update` повертає користувача з `icon: null`.
2. Викликати `UserService.removeAvatar("user-1")`.

**Очікуваний результат:**

- `userRepo.update("user-1", { icon: null })` викликано.
- `storageService.removeAvatarFiles("user-1")` викликано.
- Повертається `UserResponseDto`.

---

### [x] TC-AUTH-U-038: should call service.findById with correct arguments

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call service.findById with correct arguments.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-039: should call service.update with correct arguments

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call service.update with correct arguments.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-040: should call service.updateAvatar with correct arguments

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call service.updateAvatar with correct arguments.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-041: should call service.removeAvatar with correct arguments

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call service.removeAvatar with correct arguments.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-042: should call service.changePassword with correct arguments

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call service.changePassword with correct arguments.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-043: should call service.remove with correct arguments

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call service.remove with correct arguments.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-044: should call prisma.findUnique with email

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call prisma.findUnique with email.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-045: should call prisma.findUniqueOrThrow with id

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call prisma.findUniqueOrThrow with id.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-046: should call prisma.update

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call prisma.update.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---

### [x] TC-AUTH-U-047: should call prisma.delete

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-070             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Викликати відповідний метод із тестовим сценарієм.
2. перевірити, що call prisma.delete.

**Очікуваний результат:**

- Успішне виконання та відповідність очікуваному стану/помилці.

---
