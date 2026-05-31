# Модель безпеки та авторизації (FIX Space)

---

## 1. Загальна модель загроз

| #   | Загроза                                | Вектор атаки                                    | Реалізоване рішення                              |
| --- | -------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| 1   | Несанкціонований доступ до чужих даних | Прямий HTTP-запит до ресурсу іншого користувача | `JwtAuthGuard` + `ResourceOwnerGuard`            |
| 2   | Крадіжка токена через XSS              | Шкідливий JS зчитує токен із `localStorage`     | HTTP-only cookies, прапор `SameSite`             |
| 3   | Brute-force атака на логін             | Масові запити до `/auth/login`                  | `ThrottlerGuard` — 5 запитів / 60 с              |
| 4   | Крадіжка refresh token                 | Перехоплення cookie або витік БД                | Ротація токенів + зберігання як `tokenHash`      |
| 5   | SQL Injection / витік БД               | Шкідливі SQL-вирази або компрометація БД        | Prisma параметризовані запити + bcrypt хешування |
| 6   | Нескінченні цикли у формулах           | Циклічні залежності між FORMULA-властивостями   | Cycle detector при збереженні конфігурації       |

---

## 2. Автентифікація (JWT)

Детальний flow (Register → Verify → Login → Refresh → Logout) описано в [`docs/03-architecture/algorithms.md`](./algorithms.md) — розділ 7.

### Структура JWT

```
header.payload.signature
```

| Частина     | Вміст                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| `header`    | `{ "alg": "HS256", "typ": "JWT" }`                                      |
| `payload`   | `{ "sub": "<userId>", "iat": <issued-at>, "exp": <expiry> }`            |
| `signature` | HMAC-SHA256 хеш від `header + payload` із секретним ключем `JWT_SECRET` |

Токен підписаний, але **не зашифрований** — payload у Base64 читається без секрету. Тому в payload ніколи не кладуться чутливі дані (пароль, credentials).

### Зберігання токенів

| Токен            | Де зберігається                  | Чому                                                 |
| ---------------- | -------------------------------- | ---------------------------------------------------- |
| Access (15 хв)   | HTTP-only cookie `access_token`  | JavaScript не може прочитати → захист від XSS        |
| Refresh (7 днів) | HTTP-only cookie `refresh_token` | Те саме; плюс `revokedAt` в БД для явного анулювання |

Прапор `SameSite=Lax` на cookies — додатковий захист від CSRF: cookie не надсилається при cross-site запитах.

### Google OAuth 2.0

Альтернативний шлях входу — Authorization Code Flow:

1. Користувач натискає «Sign in with Google» → перенаправлення на Google
2. Google повертає `code` на `/auth/google/callback`
3. Система обмінює `code` на `access_token` Google → отримує профіль
4. Створює або знаходить `User` + `GoogleAccount` → видає стандартні JWT cookies

FIX Space ніколи не бачить пароль Google.

---

## 3. Авторизація та ізоляція даних (RBAC)

Система використовує **resource-level ownership** замість ролей: кожен ресурс належить конкретному User, і доступ перевіряється на кожному запиті.

### Шари захисту

```
HTTP Request
    ↓
JwtAuthGuard (глобальний)
  → перевіряє підпис access token
  → 401 Unauthorized якщо токен відсутній або прострочений
    ↓
ResourceOwnerGuard (на захищених endpoints)
  → витягує userId з JWT payload (@CurrentUser())
  → порівнює з ownerId ресурсу (Space, Database тощо)
  → 403 Forbidden якщо userId ≠ ownerId
    ↓
Controller / Service
```

### Декоратори

| Декоратор                    | Призначення                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `APP_GUARD` → `JwtAuthGuard` | Глобальний guard — всі endpoints захищені за замовчуванням                   |
| `@Public()`                  | Opt-out — позначає публічні endpoints (`/auth/register`, `/auth/login` тощо) |
| `@RequiredOwnership()`       | Метадані для `ResourceOwnerGuard` — вказує який параметр є ID ресурсу        |
| `@CurrentUser()`             | Витягує `userId` з JWT payload у контролері                                  |

### Результати

| Ситуація                         | HTTP статус      |
| -------------------------------- | ---------------- |
| Немає токена або прострочений    | 401 Unauthorized |
| Токен валідний, але ресурс чужий | 403 Forbidden    |
| Токен валідний, ресурс свій      | 200 / відповідь  |

---

## 4. Захист паролів (bcrypt)

### Як працює bcrypt

```
зберігання:  passwordHash = bcrypt.hash(plainPassword, saltRounds=10)
перевірка:   bcrypt.compare(plainPassword, storedHash)  →  true / false
```

- **Salt** генерується випадково для кожного хешу та вбудовується в рядок хешу — два однакові паролі дають різні хеші
- **Cost factor (rounds=10)** — хеш рахується 2¹⁰ = 1024 разів, що робить brute-force надзвичайно повільним
- При витоці таблиці `User` — зловмисник отримує тільки хеші, не паролі

### Чому bcryptjs, а не argon2

argon2 теоретично кращий, але потребує нативних C-бінарників. bcryptjs — чистий JavaScript, без нативних залежностей → простіша крос-платформна збірка Docker-контейнерів.

### Зміна пароля

При зміні пароля всі активні refresh токени анулюються (`revokedAt = now`) — усі сесії крім поточної завершуються.

---

## 5. CORS (Cross-Origin Resource Sharing)

```
Origin: https://fix-space.vercel.app  →  дозволено
Origin: https://evil.com              →  заблоковано
```

**Конфігурація:**

| Параметр      | Значення                                                       |
| ------------- | -------------------------------------------------------------- |
| `origin`      | Зі змінної `CORS_ORIGIN` (env) — не hardcode                   |
| `credentials` | `true` — необхідно для передачі HTTP-only cookies між доменами |
| `methods`     | `GET, POST, PATCH, DELETE, OPTIONS`                            |

Pre-flight (`OPTIONS`) запити обробляються автоматично. Якщо `Origin` не в списку дозволених — браузер блокує відповідь на рівні клієнта.

---

## 6. Rate Limiting

### `/auth/login` — Brute-force захист

```
ThrottlerGuard: 5 запитів / 60 секунд з однієї IP
Перевищення → 429 Too Many Requests
```

Навіть якщо зловмисник знає email жертви, перебір паролів стає практично неможливим: при 5 спробах/хв на перебір 1 000 000 варіантів знадобиться ~138 днів.

### Глобальний ліміт

200 запитів / хвилину на всі API endpoints — захист від простих DDoS атак та надмірного навантаження.

---

## 7. Валідація вхідних даних

NestJS `ValidationPipe` зареєстровано **глобально** — кожен вхідний DTO автоматично валідується перед виконанням контролера.

**Опції:**

| Опція                        | Призначення                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `whitelist: true`            | Відкидає поля, яких немає у DTO — захист від mass assignment |
| `forbidNonWhitelisted: true` | Кидає помилку якщо передано зайве поле (не просто ігнорує)   |
| `transform: true`            | Автоматична конвертація типів (рядок → число тощо)           |

**Приклади декораторів:**

```
@IsEmail()          email: string
@MinLength(8)       password: string
@IsUUID()           id: string
@IsEnum(PropertyType) type: PropertyType
```

Помилка валідації → `400 Bad Request` з масивом описів порушень.

---

## 8. Захист від SQL Injection

Prisma ORM використовує **параметризовані запити** для всіх операцій із БД — SQL ін'єкція унеможливлена на рівні бібліотеки.

```typescript
// ✅ Prisma — параметризовано
prisma.record.findMany({ where: { name: userInput } })
// ❌ Raw SQL — небезпечно (у проекті не використовується)
`SELECT * FROM records WHERE name = '${userInput}'`;
```

Поле `PropertyValue.value` (JSONB) також обробляється через Prisma API — JSON не підставляється в рядок запиту.

---

## 9. Управління секретами

| Секрет                             | Де зберігається                                           |
| ---------------------------------- | --------------------------------------------------------- |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | `.env.*` файли (не в git)                                 |
| `DATABASE_URL`                     | `.env.*` файли                                            |
| `RESEND_API_KEY`                   | `.env.*` файли                                            |
| SMTP credentials (fallback)        | `.env.*` файли                                            |
| API ключі брокерів (Binance, MT5)  | Зашифровані в `IntegrationConnection.credentials` (JSONB) |

**Правило:** `.env.example` — шаблон з назвами змінних без значень, версіонується в git. `.env.development` та `.env.production` — в `.gitignore`.

---

## 10. Що свідомо не реалізовано

### Шифрування полів на рівні застосунку

`PropertyValue.value` зберігається у відкритому JSONB — без шифрування на рівні коду. Причини:

- Шифрований JSONB не можна фільтрувати / сортувати засобами БД
- Управління ключами шифрування додає операційні ризики (втрата ключа = дані недоступні)
- Індустріальний стандарт для цього рівня захисту — **шифрування at-rest на рівні інфраструктури**: Google Cloud SQL Encryption, VPC без публічного доступу до БД

### Two-Factor Authentication (2FA)

Поза scope v1.0. Вхід через Google OAuth частково знижує ризик (Google 2FA), але власного TOTP немає.

### Security Audit Log

Системний журнал подій безпеки (входи, зміни пароля, підозріла активність) не реалізований. `AutomationLog` є, але відстежує автоматизації, не security-події.
