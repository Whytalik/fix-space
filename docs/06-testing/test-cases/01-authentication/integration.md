# Integration Tests: Authentication

### [ ] TC-AUTH-001: Реєстрація з валідними даними

| Поле         | Значення                               |
| ------------ | -------------------------------------- |
| **US**       | US-001                                 |
| **Issue**    | #1                                     |
| **TS**       | TS-AUTH-01                             |
| **Метод**    | Integration (Supertest)                |
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

### [ ] TC-AUTH-002: Реєстрація з невалідним email

| Поле         | Значення                                 |
| ------------ | ---------------------------------------- |
| **US**       | US-001                                   |
| **Issue**    | #1                                       |
| **TS**       | TS-AUTH-01                               |
| **Метод**    | Integration (Supertest)                  |
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

### [ ] TC-AUTH-003: Реєстрація з існуючим email

| Поле         | Значення                             |
| ------------ | ------------------------------------ |
| **US**       | US-001                               |
| **Issue**    | #1                                   |
| **TS**       | TS-AUTH-01                           |
| **Метод**    | Integration (Supertest)              |
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

### [ ] TC-AUTH-004: Верифікація email з валідним токеном

| Поле         | Значення                               |
| ------------ | -------------------------------------- |
| **US**       | US-002                                 |
| **Issue**    | #2                                     |
| **TS**       | TS-AUTH-02                             |
| **Метод**    | Integration (Supertest)                |
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

### [ ] TC-AUTH-005: Верифікація з невалідним токеном

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-002                  |
| **Issue**    | #2                      |
| **TS**       | TS-AUTH-02              |
| **Метод**    | Integration (Supertest) |
| **Техніка**  | Error Guessing          |
| **Priority** | P1                      |

**Кроки:**

1. `POST /auth/verify` з тілом: `{ "token": "invalid-token-123" }`
2. Перевірити статус-код

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Body: `{ "message": "Invalid or expired verification token" }`

---

### [ ] TC-AUTH-007: Вхід з валідними даними

| Поле         | Значення                         |
| ------------ | -------------------------------- |
| **US**       | US-002                           |
| **Issue**    | #3                               |
| **TS**       | TS-AUTH-03                       |
| **Метод**    | Integration (Supertest)          |
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

### [ ] TC-AUTH-008: Вхід з неправильним паролем

| Поле         | Значення                                    |
| ------------ | ------------------------------------------- |
| **US**       | US-002                                      |
| **Issue**    | #3                                          |
| **TS**       | TS-AUTH-03                                  |
| **Метод**    | Integration (Supertest)                     |
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

### [ ] TC-AUTH-009: Вхід з неіснуючим email

| Поле         | Значення                                     |
| ------------ | -------------------------------------------- |
| **US**       | US-002                                       |
| **Issue**    | #3                                           |
| **TS**       | TS-AUTH-03                                   |
| **Метод**    | Integration (Supertest)                      |
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

### [ ] TC-AUTH-010: Вхід без верифікації email

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-002                  |
| **Issue**    | #3                      |
| **TS**       | TS-AUTH-03              |
| **Метод**    | Integration (Supertest) |
| **Техніка**  | State Transition        |
| **Priority** | P1                      |

**Кроки:**

1. Зареєструвати користувача (не верифікувати)
2. `POST /auth/login` з валідними даними
3. Перевірити статус-код

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body містить повідомлення про необхідність верифікації email

---

### [ ] TC-AUTH-011: Скидання пароля — запит

| Поле         | Значення                         |
| ------------ | -------------------------------- |
| **US**       | US-003                           |
| **Issue**    | #5                               |
| **TS**       | TS-AUTH-06                       |
| **Метод**    | Integration (Supertest)          |
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

### [ ] TC-AUTH-012: Скидання пароля — встановлення нового пароля

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-003                  |
| **Issue**    | #5                      |
| **TS**       | TS-AUTH-06              |
| **Метод**    | Integration (Supertest) |
| **Техніка**  | State Transition        |
| **Priority** | P1                      |

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

### [ ] TC-AUTH-013: Скидання пароля — прострочений токен

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-003                  |
| **Issue**    | #5                      |
| **TS**       | TS-AUTH-06              |
| **Метод**    | Integration (Supertest) |
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

### [ ] TC-AUTH-014: Скидання пароля — повторне використання токена

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-003                  |
| **Issue**    | #5                      |
| **TS**       | TS-AUTH-06              |
| **Метод**    | Integration (Supertest) |
| **Техніка**  | State Transition        |
| **Priority** | P1                      |

**Кроки:**

1. Виконати TC-AUTH-012 (скинути пароль)
2. Повторити `POST /auth/reset-password` з тим самим токеном

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Токен позначений як використаний, повторне використання неможливе

---

### [ ] TC-AUTH-015: Оновлення токена — успішний refresh

| Поле         | Значення                         |
| ------------ | -------------------------------- |
| **US**       | US-002                           |
| **Issue**    | #4                               |
| **TS**       | TS-AUTH-04                       |
| **Метод**    | Integration (Supertest)          |
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

### [ ] TC-AUTH-016: Refresh — повторне використання старого токена

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-002                  |
| **Issue**    | #4                      |
| **TS**       | TS-AUTH-04              |
| **Метод**    | Integration (Supertest) |
| **Техніка**  | State Transition        |
| **Priority** | P1                      |

**Кроки:**

1. Виконати TC-AUTH-015 (refresh)
2. Повторити `POST /auth/refresh` зі старим refresh token

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body: `{ "message": "Invalid or expired refresh token" }`
- Старий токен відкликаний (revoked)

---

### [ ] TC-AUTH-017: Refresh — відсутній токен

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-002                  |
| **Issue**    | #4                      |
| **TS**       | TS-AUTH-04              |
| **Метод**    | Integration (Supertest) |
| **Техніка**  | Error Guessing          |
| **Priority** | P1                      |

**Кроки:**

1. `POST /auth/refresh` без cookie `refresh_token`
2. Перевірити статус-код

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body: `{ "message": "Refresh token not provided" }`

---

### [ ] TC-AUTH-029: Повторне надсилання посилання для верифікації

| Поле         | Значення                               |
| ------------ | -------------------------------------- |
| **US**       | US-002                                 |
| **Issue**    | #55                                    |
| **TS**       | TS-AUTH-02                             |
| **Метод**    | Integration (Supertest)                |
| **Техніка**  | Equivalence Partitioning (valid class) |
| **Priority** | P1                                     |

**Кроки:**

1. Зареєструвати нового користувача (`POST /auth/register`)
2. `POST /auth/resend-verification` з тілом:
   ```json
   { "email": "newuser@example.com" }
   ```
3. Перевірити статус-код відповіді
4. Перевірити базу даних (новий токен створено)

**Очікуваний результат:**

- Статус: `200 OK`
- Body: `{ "message": "Verification link sent successfully" }`
- У БД створено новий запис `EmailVerificationToken` для цього користувача

---

### [ ] TC-AUTH-030: Повторне надсилання — обмеження (cooldown)

| Поле         | Значення                          |
| ------------ | --------------------------------- |
| **US**       | US-002                            |
| **Issue**    | #55                               |
| **TS**       | TS-AUTH-02                        |
| **Метод**    | Integration (Supertest)           |
| **Техніка**  | Boundary Value Analysis (timeout) |
| **Priority** | P2                                |

**Кроки:**

1. Виконати запит на повторне надсилання (TC-AUTH-029)
2. Негайно повторити той самий запит `POST /auth/resend-verification`
3. Перевірити статус-код

**Очікуваний результат:**

- Статус: `400 Bad Request`
- Body: `{ "message": "Please wait before requesting another link" }`
- Новий токен НЕ створений

---

### [ ] TC-AUTH-038: Запит до захищеного ендпоінту без токена автентифікації

| Поле         | Значення                |
| ------------ | ----------------------- |
| **US**       | US-002                  |
| **Issue**    | —                       |
| **TS**       | —                       |
| **Метод**    | Integration (Supertest) |
| **Техніка**  | Security Testing        |
| **Priority** | P1                      |

**Кроки:**

1. Надіслати запит до будь-якого захищеного ендпоінту модуля Authentication (наприклад, `GET /auth/sessions`) без заголовка `Authorization`.
2. Перевірити статус-код відповіді та повідомлення про помилку.

**Очікуваний результат:**

- Статус: `401 Unauthorized`
- Body містить повідомлення про відсутність або невалідність токена.
