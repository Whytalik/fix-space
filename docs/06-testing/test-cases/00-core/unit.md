# Unit Tests: Core Infrastructure

Покриття інфраструктурних сервісів: `CacheService`, `StorageService`, `MailService`.

---

## CacheService

### [x] TC-CORE-U-001: CacheService.get — попадання в кеш (hit)

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок Redis: `redis.get` повертає `'{"value":42}'`.
2. Викликати `cacheService.get<{ value: number }>("key")`.

**Очікуваний результат:**

- Повертається десеріалізований об'єкт `{ value: 42 }`.

---

---

### [x] TC-CORE-U-002: CacheService.get — промах кешу (miss)

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок Redis: `redis.get` повертає `null`.
2. Викликати `cacheService.get("key")`.

**Очікуваний результат:**

- Повертається `null`.

---

---

### [x] TC-CORE-U-003: CacheService.get — помилка Redis (graceful degradation)

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | —              |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Error Guessing |
| **Priority** | P2             |

**Кроки:**

1. Підготувати мок Redis: `redis.get` кидає `new Error("Connection refused")`.
2. Викликати `cacheService.get("key")`.

**Очікуваний результат:**

- Виняток НЕ прокидається вище.
- Повертається `null` (graceful degradation).
- `logger.error` викликається з описом помилки.

---

---

### [x] TC-CORE-U-004: CacheService.set — збереження значення з TTL

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок Redis: `redis.set` успішний.
2. Викликати `cacheService.set("key", { data: 1 }, 300)`.

**Очікуваний результат:**

- `redis.set` викликається з `("key", '{"data":1}', "EX", 300)`.

---

---

### [x] TC-CORE-U-005: CacheService.set — помилка Redis (no throw)

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | —              |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Error Guessing |
| **Priority** | P2             |

**Кроки:**

1. Підготувати мок Redis: `redis.set` кидає помилку.
2. Викликати `cacheService.set("key", {})`.

**Очікуваний результат:**

- Виняток НЕ прокидається. `logger.error` викликається.

---

---

### [x] TC-CORE-U-006: CacheService.delete — видалення ключа

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок: `redis.del` успішний.
2. Викликати `cacheService.delete("key")`.

**Очікуваний результат:**

- `redis.del("key")` викликається один раз.

---

---

### [x] TC-CORE-U-007: CacheService.deletePattern — видалення за шаблоном (ключі знайдені)

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок: `redis.keys("trades_cache:*")` повертає `["k1", "k2"]`.
2. Підготувати мок: `redis.del` успішний.
3. Викликати `cacheService.deletePattern("trades_cache:*")`.

**Очікуваний результат:**

- `redis.del("k1", "k2")` викликається.

---

---

### [x] TC-CORE-U-008: CacheService.deletePattern — ключів не знайдено

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | —              |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P2             |

**Кроки:**

1. Підготувати мок: `redis.keys` повертає `[]`.
2. Викликати `cacheService.deletePattern("no_match:*")`.

**Очікуваний результат:**

- `redis.del` НЕ викликається.

---

---

### [x] TC-CORE-U-009: CacheService.generateTradeCacheKey — коректний формат ключа

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Викликати `cacheService.generateTradeCacheKey("conn-1", "2026-01-01", "2026-01-31")`.

**Очікуваний результат:**

- Повертається `"trades_cache:conn-1:2026-01-01:2026-01-31"`.

---

---

## StorageService

### [x] TC-CORE-U-010: StorageService.saveAvatar — успішне завантаження

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок Cloudinary `uploader.upload_stream` → повертає `{ secure_url: "https://res.cloudinary.com/..." }`.
2. Викликати `storageService.saveAvatar("user-1", { mimetype: "image/png", size: 1024, buffer: Buffer.from("") } as Express.Multer.File)`.

**Очікуваний результат:**

- Повертається `"https://res.cloudinary.com/..."`.
- Cloudinary викликається з `public_id: "user-1"`, `overwrite: true`, `transformation`.

---

---

### [x] TC-CORE-U-011: StorageService.saveAvatar — невалідний MIME-тип

| Поле         | Значення                 |
| ------------ | ------------------------ |
| **US**       | —                        |
| **Issue**    | —                        |
| **TS**       | —                        |
| **Метод**    | Unit (Jest)              |
| **Техніка**  | Equivalence Partitioning |
| **Priority** | P1                       |

**Кроки:**

1. Викликати `storageService.saveAvatar("user-1", { mimetype: "image/gif", size: 1024 } as Express.Multer.File)`.

**Очікуваний результат:**

- Кидається `BadRequestException` з повідомленням про невалідний тип файлу.
- Cloudinary НЕ викликається.

---

---

### [x] TC-CORE-U-012: StorageService.saveAvatar — перевищення розміру файлу

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | —              |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Boundary Value |
| **Priority** | P1             |

**Кроки:**

1. Викликати `storageService.saveAvatar("user-1", { mimetype: "image/png", size: 6 * 1024 * 1024 } as Express.Multer.File)`.

**Очікуваний результат:**

- Кидається `BadRequestException` з повідомленням про перевищення максимального розміру (5 MB).

---

---

### [x] TC-CORE-U-013: StorageService.saveContentImage — успішне завантаження

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок Cloudinary: повертає `{ secure_url: "https://res.cloudinary.com/img.png" }`.
2. Викликати `storageService.saveContentImage({ mimetype: "image/jpeg", size: 512, buffer: Buffer.from("") } as Express.Multer.File)`.

**Очікуваний результат:**

- Повертається Cloudinary URL.
- `overwrite: false`, `public_id` — це UUID (не `userId`).

---

---

### [x] TC-CORE-U-014: StorageService.removeAvatarFiles — видалення аватара з Cloudinary

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок: `cloudinary.uploader.destroy` успішний.
2. Викликати `storageService.removeAvatarFiles("user-1")`.

**Очікуваний результат:**

- `destroy` викликається з `"fixspace/avatars/user-1"` (або значенням `CLOUDINARY_AVATAR_FOLDER`).

---

---

### [x] TC-CORE-U-015: StorageService.removeAvatarFiles — помилка Cloudinary (no throw)

| Поле         | Значення       |
| ------------ | -------------- |
| **US**       | —              |
| **Issue**    | —              |
| **TS**       | —              |
| **Метод**    | Unit (Jest)    |
| **Техніка**  | Error Guessing |
| **Priority** | P2             |

**Кроки:**

1. Підготувати мок: `cloudinary.uploader.destroy` кидає помилку.
2. Викликати `storageService.removeAvatarFiles("user-1")`.

**Очікуваний результат:**

- Виняток НЕ прокидається. `logger.warn` викликається з деталями.

---

---

## MailService

### [x] TC-CORE-U-016: MailService.sendVerificationEmail — шлях Resend (production)

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-001             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Ініціалізувати `MailService` з `NODE_ENV=production` та `RESEND_API_KEY` у ConfigService.
2. Підготувати мок Resend SDK: `emails.send` повертає `{ data: {}, error: null }`.
3. Викликати `mailService.sendVerificationEmail("user@example.com", "testuser", "raw_token")`.

**Очікуваний результат:**

- `resend.emails.send` викликається з правильними `to`, `subject`, `html` (де html містить `verificationLink` з токеном).
- SMTP транспорт НЕ використовується.

---

---

### [x] TC-CORE-U-017: MailService.sendVerificationEmail — шлях SMTP (development)

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-001             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Ініціалізувати `MailService` з `NODE_ENV=development`, `SMTP_HOST=localhost`.
2. Підготувати мок `nodemailer.createTransport` та `transporter.sendMail`.
3. Викликати `mailService.sendVerificationEmail("user@example.com", "testuser", "raw_token")`.

**Очікуваний результат:**

- `transporter.sendMail` викликається з коректними `to`, `subject`, `html`.
- Resend SDK НЕ використовується.

---

---

### [x] TC-CORE-U-018: MailService.sendPasswordResetEmail — коректне посилання в листі

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-048             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P1                 |

**Кроки:**

1. Підготувати мок Resend: `emails.send` успішний.
2. Викликати `mailService.sendPasswordResetEmail("user@example.com", "reset_token_123")`.

**Очікуваний результат:**

- HTML у листі містить `reset-password?token=reset_token_123`.
- `resend.emails.send` або `transporter.sendMail` викликається один раз.

---

---

### [x] TC-CORE-U-019: MailService.sendPasswordChangeNotification — сповіщення про зміну пароля

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | US-048             |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок Resend: `emails.send` успішний.
2. Викликати `mailService.sendPasswordChangeNotification("user@example.com")`.

**Очікуваний результат:**

- Email відправляється (Resend або SMTP).
- Ніякого токена або посилання у листі немає — лише інформаційне повідомлення.

---

---

### [x] TC-CORE-U-020: MailService.sendAccountDeletionNotification — сповіщення про видалення акаунту

| Поле         | Значення           |
| ------------ | ------------------ |
| **US**       | —                  |
| **Issue**    | —                  |
| **TS**       | —                  |
| **Метод**    | Unit (Jest)        |
| **Техніка**  | Statement Coverage |
| **Priority** | P2                 |

**Кроки:**

1. Підготувати мок Resend: `emails.send` успішний.
2. Викликати `mailService.sendAccountDeletionNotification("user@example.com")`.

**Очікуваний результат:**

- Email відправляється з відповідним subject та html.
