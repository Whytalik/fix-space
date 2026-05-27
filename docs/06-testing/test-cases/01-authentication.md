# Test Cases: Authentication

## 1. Authentication (TC-AUTH-001 — TC-AUTH-027)

---

### TC-AUTH-001: Реєстрація з валідними даними

| Поле         | Значення                               |
| ------------ | -------------------------------------- |
| **US**       | US-001                                 |
| **Issue**    | #1                                     |
| **TS**       | TS-AUTH-01                             |
| **Метод**    | Black Box (Postman)                    |
| **Техніка**  | Equivalence Partitioning (valid class) |
| **Priority** | P1                                     |

**Кроки:**

1. `POST /auth/register` з тілом:
   ```json
   {
     "email": "newuser@example.com",
     "username": "newuser",
     "password": "Test1234!"
   }
   ```
2. Перевірити статус-код відповіді
3. Перевірити тіло відповіді
4. Перевірити базу даних (таблиця User)

**Очікуваний результат:**

- Статус: `201 Created`
- Body: `{ "message": "Registration successful. Check your email to verify." }`
- У БД створено користувача з `isVerified: false`, пароль хешований

---

### TC-AUTH-002: Реєстрація з невалідним email

| Поле         | Значення                                 |
| ------------ | ---------------------------------------- |
| **US**       | US-001                                   |
| **Issue**    | #1                                       |
| **TS**       | TS-AUTH-01                               |
| **Метод**    | Black Box (Postman)                      |
| **Техніка**  | Equivalence Partitioning (invalid email) |
| **Priority** | P1                                       |

**Кроки:**

1. `POST /auth/register` з тілом:
   ```json
   { "email": "invalid-email", "username": "testuser", "password": "Test1234!" }
   ```
2. Перевірити статус-код відповіді

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Body містить помилку валідації поля `email`

---

### TC-AUTH-003: Реєстрація з існуючим email

| Поле         | Значення                             |
| ------------ | ------------------------------------ |
| **US**       | US-001                               |
| **Issue**    | #1                                   |
| **TS**       | TS-AUTH-01                           |
| **Метод**    | Black Box (Postman)                  |
| **Техніка**  | Equivalence Partitioning (duplicate) |
| **Priority** | P1                                   |

**Кроки:**

1. Зареєструвати користувача з `email: "dup@example.com"`
2. Повторити `POST /auth/register` з тим самим email, іншим username
3. Перевірити статус-код відповіді

**Очікуваний результат:**

- Статус: `409 Conflict`
- Body: `{ "message": "Email already exists" }`

---

### TC-AUTH-004: Верифікація email з валідним токеном

| Поле         | Значення                               |
| ------------ | -------------------------------------- |
| **US**       | US-002                                 |
| **Issue**    | #2                                     |
| **TS**       | TS-AUTH-02                             |
| **Метод**    | Black Box (Postman)                    |
| **Техніка**  | Equivalence Partitioning (valid token) |
| **Priority** | P1                                     |

**Кроки:**

1. Зареєструвати користувача (`POST /auth/register`)
2. Отримати токен верифікації з БД (EmailVerificationToken)
3. `POST /auth/verify` з тілом: `{ "token": "<raw-token>" }`
4. Перевірити статус-код
5. Перевірити `isVerified` користувача в БД

**Очікуваний результат:**

- Статус: `200 OK`
- `isVerified: true` в БД
- Токен позначений як використаний (`usedAt` заповнено)

---

### TC-AUTH-005: Верифікація з невалідним токеном

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-002              |
| **Issue**    | #2                  |
| **TS**       | TS-AUTH-02          |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | Error Guessing      |
| **Priority** | P1                  |

**Кроки:**

1. `POST /auth/verify` з тілом: `{ "token": "invalid-token-123" }`
2. Перевірити статус-код

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Body: `{ "message": "Invalid or expired verification token" }`

---

### TC-AUTH-006: Верифікація з простроченим токеном

| Поле         | Значення                          |
| ------------ | --------------------------------- |
| **US**       | US-002                            |
| **Issue**    | #2                                |
| **TS**       | TS-AUTH-02                        |
| **Метод**    | Black Box (Postman)               |
| **Техніка**  | Boundary Value Analysis (expired) |
| **Priority** | P1                                |

**Кроки:**

1. Зареєструвати користувача
2. В БД змінити `expiresAt` токена на минулий час (`Date.now() - 1000`)
3. `POST /auth/verify` з тілом: `{ "token": "<raw-token>" }`
4. Перевірити статус-код

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Body: `{ "message": "Invalid or expired verification token" }`

---

### TC-AUTH-007: Вхід з валідними даними

| Поле         | Значення                         |
| ------------ | -------------------------------- |
| **US**       | US-003                           |
| **Issue**    | #3                               |
| **TS**       | TS-AUTH-03                       |
| **Метод**    | Black Box (Postman)              |
| **Техніка**  | Equivalence Partitioning (valid) |
| **Priority** | P1                               |

**Кроки:**

1. Зареєструвати та верифікувати користувача
2. `POST /auth/login` з тілом:
   ```json
   { "email": "user@example.com", "password": "Test1234!" }
   ```
3. Перевірити статус-код
4. Перевірити тіло відповіді
5. Перевірити cookies у відповіді

**Очікуваний результат:**

- Статус: `200 OK`
- Body: `{ "message": "Login successful", "accessToken": "...", "refreshToken": "..." }`
- Cookies: `access_token` та `refresh_token` встановлені (HTTP-only)

---

### TC-AUTH-008: Вхід з неправильним паролем

| Поле         | Значення                                    |
| ------------ | ------------------------------------------- |
| **US**       | US-003                                      |
| **Issue**    | #3                                          |
| **TS**       | TS-AUTH-03                                  |
| **Метод**    | Black Box (Postman)                         |
| **Техніка**  | Equivalence Partitioning (invalid password) |
| **Priority** | P1                                          |

**Кроки:**

1. Зареєструвати та верифікувати користувача
2. `POST /auth/login` з тілом:
   ```json
   { "email": "user@example.com", "password": "WrongPassword123!" }
   ```
3. Перевірити статус-код та повідомлення

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body: `{ "message": "Invalid credentials" }` (без уточнення що саме неправильне)

---

### TC-AUTH-009: Вхід з неіснуючим email

| Поле         | Значення                                     |
| ------------ | -------------------------------------------- |
| **US**       | US-003                                       |
| **Issue**    | #3                                           |
| **TS**       | TS-AUTH-03                                   |
| **Метод**    | Black Box (Postman)                          |
| **Техніка**  | Equivalence Partitioning (non-existent user) |
| **Priority** | P1                                           |

**Кроки:**

1. `POST /auth/login` з тілом:
   ```json
   { "email": "nonexistent@example.com", "password": "Test1234!" }
   ```
2. Перевірити статус-код та повідомлення

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body: `{ "message": "Invalid credentials" }` (таке саме як при неправильному паролі — захист від enumeration)

---

### TC-AUTH-010: Вхід без верифікації email

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-003              |
| **Issue**    | #3                  |
| **TS**       | TS-AUTH-03          |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | State Transition    |
| **Priority** | P1                  |

**Кроки:**

1. Зареєструвати користувача (не верифікувати)
2. `POST /auth/login` з валідними даними
3. Перевірити статус-код

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body містить повідомлення про необхідність верифікації email

---

### TC-AUTH-011: Скидання пароля — запит

| Поле         | Значення                         |
| ------------ | -------------------------------- |
| **US**       | US-004                           |
| **Issue**    | #5                               |
| **TS**       | TS-AUTH-06                       |
| **Метод**    | Black Box (Postman)              |
| **Техніка**  | Equivalence Partitioning (valid) |
| **Priority** | P1                               |

**Кроки:**

1. Зареєструвати та верифікувати користувача
2. `POST /auth/forgot-password` з тілом: `{ "email": "user@example.com" }`
3. Перевірити статус-код
4. Перевірити БД (PasswordResetToken)

**Очікуваний результат:**

- Статус: `200 OK`
- У БД створено PasswordResetToken з `expiresAt` = поточний час + 1 година

---

### TC-AUTH-012: Скидання пароля — встановлення нового пароля

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-004              |
| **Issue**    | #5                  |
| **TS**       | TS-AUTH-06          |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | State Transition    |
| **Priority** | P1                  |

**Кроки:**

1. Виконати TC-AUTH-011 (запит на скидання)
2. Отримати токен з БД
3. `POST /auth/reset-password` з тілом: `{ "token": "<raw-token>", "newPassword": "NewPass1234!" }`
4. Перевірити статус-код
5. Спробувати увійти з новим паролем

**Очікуваний результат:**

- Статус: `200 OK`
- Вхід з новим паролем успішний (`200`)
- Вхід зі старим паролем неуспішний (`401`)

---

### TC-AUTH-013: Скидання пароля — прострочений токен

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-004                  |
| **Issue**    | #5                      |
| **TS**       | TS-AUTH-06              |
| **Метод**    | Black Box (Postman)     |
| **Техніка**  | Boundary Value Analysis |
| **Priority** | P1                      |

**Кроки:**

1. Виконати запит на скидання пароля
2. В БД змінити `expiresAt` токена на минулий час
3. `POST /auth/reset-password` з простроченим токеном

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Body: `{ "message": "Invalid or expired reset token" }`

---

### TC-AUTH-014: Скидання пароля — повторне використання токена

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-004              |
| **Issue**    | #5                  |
| **TS**       | TS-AUTH-06          |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | State Transition    |
| **Priority** | P1                  |

**Кроки:**

1. Виконати TC-AUTH-012 (скинути пароль)
2. Повторити `POST /auth/reset-password` з тим самим токеном

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Токен позначений як використаний, повторне використання неможливе

---

### TC-AUTH-015: Оновлення токена — успішний refresh

| Поле         | Значення                         |
| ------------ | -------------------------------- |
| **US**       | US-005                           |
| **Issue**    | #4                               |
| **TS**       | TS-AUTH-04                       |
| **Метод**    | Black Box (Postman)              |
| **Техніка**  | Equivalence Partitioning (valid) |
| **Priority** | P1                               |

**Кроки:**

1. Увійти в систему (отримати refresh token)
2. `POST /auth/refresh` з cookie `refresh_token=<token>`
3. Перевірити статус-код та тіло відповіді

**Очікуваний результат:**

- Статус: `200 OK`
- Body: `{ "accessToken": "...", "refreshToken": "..." }`
- Новий refresh token відрізняється від попереднього (token rotation)

---

### TC-AUTH-016: Refresh — повторне використання старого токена

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-005              |
| **Issue**    | #4                  |
| **TS**       | TS-AUTH-04          |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | State Transition    |
| **Priority** | P1                  |

**Кроки:**

1. Виконати TC-AUTH-015 (refresh)
2. Повторити `POST /auth/refresh` зі старим refresh token

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body: `{ "message": "Invalid or expired refresh token" }`
- Старий токен відкликаний (revoked)

---

### TC-AUTH-017: Refresh — відсутній токен

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-005              |
| **Issue**    | #4                  |
| **TS**       | TS-AUTH-04          |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | Error Guessing      |
| **Priority** | P1                  |

**Кроки:**

1. `POST /auth/refresh` без cookie `refresh_token`
2. Перевірити статус-код

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body: `{ "message": "Refresh token not provided" }`

---

### TC-AUTH-018: Google OAuth — вхід через Google

| Поле         | Значення                                    |
| ------------ | ------------------------------------------- |
| **US**       | US-006                                      |
| **Issue**    | #71                                         |
| **TS**       | TS-AUTH-03                                  |
| **Метод**    | Black Box (Postman/Browser)                 |
| **Техніка**  | Equivalence Partitioning (valid OAuth flow) |
| **Priority** | P2                                          |

**Кроки:**

1. Відкрити `GET /auth/google` в браузері
2. Авторизуватися в Google
3. Перевірити редірект на callback
4. Перевірити що створено/оновлено користувача в БД

**Очікуваний результат:**

- Редірект на frontend з accessToken
- Користувач створений або оновлений з Google-даними
- GoogleAccount прив'язаний до користувача

---

### TC-AUTH-019: Google OAuth — реєстрація нового користувача

| Поле         | Значення                                      |
| ------------ | --------------------------------------------- |
| **US**       | US-006                                        |
| **Issue**    | #71                                           |
| **TS**       | TS-AUTH-03                                    |
| **Метод**    | Black Box (Browser)                           |
| **Техніка**  | Equivalence Partitioning (new user via OAuth) |
| **Priority** | P2                                            |

**Кроки:**

1. Виконати Google OAuth з акаунтом якого немає в системі
2. Перевірити що створено нового користувача
3. Перевірити що `isVerified: true` (Google верифікує email)

**Очікуваний результат:**

- Новий користувач створений з даними з Google
- Email підтверджено автоматично

---

### TC-AUTH-020: Google OAuth — прив'язка до існуючого акаунту

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-006              |
| **Issue**    | #71                 |
| **TS**       | TS-AUTH-03          |
| **Метод**    | Black Box (Browser) |
| **Техніка**  | State Transition    |
| **Priority** | P2                  |

**Кроки:**

1. Зареєструвати користувача з email `user@gmail.com`
2. Виконати Google OAuth з тим самим Google-акаунтом
3. Перевірити що GoogleAccount прив'язаний до існуючого користувача

**Очікуваний результат:**

- Новий користувач НЕ створений
- Існуючий користувач отримав прив'язку GoogleAccount

---

### TC-AUTH-021: Перегляд активних сесій

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-007                   |
| **Issue**    | #72                      |
| **TS**       | —                        |
| **Метод**    | Black Box (Postman)      |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P2                       |

**Кроки:**

1. Увійти в систему
2. `GET /auth/sessions` з Authorization header
3. Перевірити статус-код та тіло відповіді

**Очікуваний результат:**

- Статус: `200 OK`
- Body: масив сесій з полями `device`, `ip`, `lastActive`, `isCurrent`

---

### TC-AUTH-022: Поточна сесія позначена

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | US-007                   |
| **Issue**    | #72                      |
| **TS**       | —                        |
| **Метод**    | Black Box (Postman)      |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P2                       |

**Кроки:**

1. Увійти з двох різних "пристроїв" (різні User-Agent)
2. `GET /auth/sessions` з першого пристрою
3. Перевірити що одна сесія має `isCurrent: true`

**Очікуваний результат:**

- Дві активні сесії в списку
- Поточна сесія позначена `isCurrent: true`

---

### TC-AUTH-023: Завершення всіх сесій

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-008              |
| **Issue**    | #98                 |
| **TS**       | —                   |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | State Transition    |
| **Priority** | P2                  |

**Кроки:**

1. Увійти в систему
2. `POST /auth/logout-all` з Authorization header
3. Перевірити статус-код
4. Спробувати використати refresh token

**Очікуваний результат:**

- Статус: `200 OK`
- Всі refresh tokens відкликані (revokedAt заповнено)
- Поточна сесія також завершена

---

### TC-AUTH-024: Завершення конкретної сесії

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-008              |
| **Issue**    | #98                 |
| **TS**       | —                   |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | State Transition    |
| **Priority** | P2                  |

**Кроки:**

1. Увійти з двох пристроїв
2. `DELETE /auth/sessions/:sessionId` з одного пристрою (вказати ID іншої сесії)
3. Перевірити що інша сесія відкликана
4. Перевірити що поточна сесія досі активна

**Очікуваний результат:**

- Цільова сесія відкликана
- Поточна сесія залишається активною

---

### TC-AUTH-025: Видалення акаунту — валідний запит

| Поле         | Значення                         |
| ------------ | -------------------------------- |
| **US**       | US-009                           |
| **Issue**    | #99                              |
| **TS**       | —                                |
| **Метод**    | Black Box (Postman)              |
| **Техніка**  | Equivalence Partitioning (valid) |
| **Priority** | P2                               |

**Кроки:**

1. Увійти в систему
2. `POST /auth/delete-account` з тілом: `{ "password": "Test1234!" }`
3. Перевірити статус-код
4. Перевірити БД (користувач видалений)

**Очікуваний результат:**

- Статус: `200 OK`
- Користувач видалений з БД (каскадне видалення всіх даних)
- Всі сесії закриті

---

### TC-AUTH-026: Видалення акаунту — неправильний пароль

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-009              |
| **Issue**    | #99                 |
| **TS**       | —                   |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | Error Guessing      |
| **Priority** | P2                  |

**Кроки:**

1. `POST /auth/delete-account` з тілом: `{ "password": "WrongPassword!" }`
2. Перевірити статус-код

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Акаунт НЕ видалений

---

### TC-AUTH-027: Видалення акаунту — без підтвердження

| Поле         | Значення            |
| ------------ | ------------------- |
| **US**       | US-009              |
| **Issue**    | #99                 |
| **TS**       | —                   |
| **Метод**    | Black Box (Postman) |
| **Техніка**  | Error Guessing      |
| **Priority** | P2                  |

**Кроки:**

1. `POST /auth/delete-account` з порожнім тілом `{}`
2. Перевірити статус-код

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Body містить помилку валідації поля `password`

---
