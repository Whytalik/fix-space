# FIX Space — Архітектурна документація

## Зміст

1. [Огляд проєкту](#1-огляд-проєкту)
2. [Технологічний стек](#2-технологічний-стек)
3. [Структура монорепозиторію](#3-структура-монорепозиторію)
4. [Модель даних](#4-модель-даних)
5. [Рівень API](#5-рівень-api)
6. [Процес автентифікації](#6-процес-автентифікації)
7. [Архітектура клієнтської частини](#7-архітектура-клієнтської-частини)
8. [Спільний пакет домену](#8-спільний-пакет-домену)
9. [Ініціалізація та наповнення даними](#9-ініціалізація-та-наповнення-даними)
10. [Ключові патерни розробки](#10-ключові-патерни-розробки)
11. [Змінні оточення](#11-змінні-оточення)
12. [Команди розробки](#12-команди-розробки)

---

## 1. Огляд проєкту

FIX Space — це full-stack монорепозиторій для **платформи організації діяльності трейдера** (trading workspace platform) — системи, розробленої спеціально для потреб трейдерів. При реєстрації користувачі отримують персональний робочий простір (Space) із попередньо створеними секціями та базами даних (торговий журнал, нотатки, помилки, торгові рахунки тощо).

**Ієрархія основних концепцій системи:**

```
Робочий простір (Space) — це верхній рівень організаційної ієрархії платформи. Він є ізольованим контейнером, що об'єднує всі секції, бази даних і записи конкретного користувача. Кожен користувач має свій простір; може мати до 5 просторів.
```

---

## 2. Технологічний стек

### Серверна частина (apps/api)

| Сфера застосування  | Технологія                                                          |
| ------------------- | ------------------------------------------------------------------- |
| Фреймворк           | NestJS 11 (TypeScript)                                              |
| ORM бази даних      | Prisma 7                                                            |
| База даних          | PostgreSQL 16 (Docker)                                              |
| Автентифікація      | JWT (access + refresh токени), Passport                             |
| Хешування паролів   | bcryptjs                                                            |
| Пошта               | Resend SDK (Production), Nodemailer (Dev)                           |
| Валідація           | class-validator, Zod (для змінних оточення)                         |
| Обмеження запитів   | @nestjs/throttler (200 зап/хв глобально, 5 зап/хв на `/auth/login`) |
| Платформа виконання | Node.js 18+                                                         |

### Клієнтська частина (apps/web)

| Сфера застосування  | Технологія                        |
| ------------------- | --------------------------------- |
| Фреймворк           | Next.js 16 (React 19, TypeScript) |
| Збірка проєкту      | Turbopack (dev режим)             |
| Стилізація          | Tailwind CSS 4, PostCSS           |
| Іконки              | lucide-react, emoji-mart          |
| Drag & Drop         | @dnd-kit (core, sortable)         |
| Платформа виконання | Node.js 18+                       |

### Інструменти розробки (Tooling)

| Сфера застосування          | Технологія                   |
| --------------------------- | ---------------------------- |
| Пакетний менеджер           | pnpm 9.15                    |
| Оркестрація монорепозиторію | Turborepo 2.8                |
| Якість коду                 | ESLint, Prettier             |
| Тестування                  | Jest (unit), Supertest (e2e) |

---

## 3. Структура монорепозиторію

```
FIX Space-project/
├── apps/
│   ├── api/                        # REST API на NestJS — порт 3000
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── main.ts
│   │       ├── auth/               # Реєстрація, логін, рефреш, верифікація
│   │       ├── space/              # CRUD просторів + операції з секціями
│   │       ├── database/           # CRUD баз даних (колекцій)
│   │       ├── property/           # CRUD властивостей (колонок)
│   │       ├── property-value/     # Значення комірок
│   │       ├── record/             # CRUD записів (рядків)
│   │       ├── template/           # CRUD шаблонів
│   │       ├── template-property-value/ # Значення комірок шаблонів
│   │       ├── user/               # Профіль користувача
│   │       ├── settings/           # Ключ-значення налаштувань користувача
│   │       ├── jwt/                # JWT стратегія, guard
│   │       ├── mail/               # Поштовий сервіс
│   │       ├── common/             # Фільтри, інтерцептори, guards, декоратори, логер
│   │       └── config/             # Валідація env (Zod), конфігурація ініціалізації
│   │
│   └── web/                        # Frontend на Next.js — порт 3001
│       ├── app/                    # Сторінки Next.js App Router
│       │   ├── layout.tsx
│       │   ├── page.tsx            # Головна (лендінг або дашборд)
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   └── not-found.tsx
│       └── src/
│           ├── components/
│           │   ├── auth/           # Форми входу та реєстрації
│           │   ├── database/       # Перегляд бази даних: шапка, таблиця
│           │   ├── navigation/     # Сайдбар, елементи секцій/баз даних, перемикач просторів
│           │   ├── record/         # Модальне вікно запису
│           │   ├── property/       # Поля введення властивостей та іконки
│           │   ├── layout/         # Шапка, підвал
│           │   └── ui/             # Атомарні компоненти: форми, іконки, оверлеї, примітиви, вибір кольору
│           ├── context/
│           │   ├── app-context.tsx # Глобальний стан (користувач, простори, поточний простір)
│           │   └── database-context.tsx
│           ├── lib/
│           │   ├── api/            # Типізовані обгортки над fetch (client, user, space, database, …)
│           │   └── cache.ts        # Кешування на базі localStorage
│           └── styles/
│
├── packages/
│   ├── domain/                     # @fixspace/domain — спільні DTO та сутності
│   │   ├── src/                    # Вихідний код TypeScript
│   │   └── dist/                   # Скомпільований код (імпортується API та web)
│   ├── database/                   # @fixspace/database — Prisma схема, клієнт, міграції
│   │   ├── prisma/schema.prisma
│   │   ├── generated/              # Згенерований клієнт Prisma
│   │   ├── migrations/
│   │   └── src/seed.ts
│   ├── eslint-config/
│   ├── jest-config/
│   └── typescript-config/
│
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

### Правила використання пакетів

- **`@fixspace/domain`** компілюється в папку `dist/` за допомогою `tsc`. Необхідно запустити команду `pnpm --filter @fixspace/domain build` перед першим запуском розробки, якщо папка `dist/` відсутня. Під час розробки запустіть `pnpm --filter @fixspace/domain dev` (`tsc --watch`), щоб підтримувати автоматичну компіляцію при змінах.
- `@fixspace/domain` є `devDependency` у клієнтській частині web (тільки для типів); серверний API імпортує його як runtime-залежність.

---

## 4. Модель даних

### Перерахування (Enums)

```prisma
enum PropertyType {
  TEXT, NUMBER, DATE, CHECKBOX, DURATION, SELECT, STATUS, RELATION, FORMULA, RATING, PROGRESS, BUTTON
}
```

### Моделі (Models)

#### User (Користувач)

| Поле         | Тип      | Примітки            |
| ------------ | -------- | ------------------- |
| id           | uuid     | PK                  |
| email        | String   | унікальний          |
| username     | String   | унікальний          |
| passwordHash | String   | хеш bcryptjs        |
| icon         | String?  | emoji або URL       |
| isVerified   | Boolean  | підтвердження email |
| createdAt    | DateTime |                     |

Зв'язки: `spaces[]`, `refreshTokens[]`, `verificationTokens[]`, `settings[]`

#### RefreshToken (Рефреш-токен)

Зберігає хешовані refresh-токени з терміном дії. Видаляється каскадно разом із користувачем.

#### EmailVerificationToken (Токен підтвердження email)

Зберігає хешовані токени підтвердження з терміном дії та часом використання `usedAt`.

#### Settings (Налаштування ключ-значення)

| Поле     | Тип    | Примітки                          |
| -------- | ------ | --------------------------------- |
| id       | uuid   | PK                                |
| userId   | uuid   | FK → User                         |
| key      | String |                                   |
| value    | Json   |                                   |
| category | String | `space`, `database`, `section`, … |

Унікальний індекс на пару `(userId, key)`. Видаляється каскадно разом із користувачем.

#### Space (Робочий простір)

| Поле      | Тип      | Примітки                        |
| --------- | -------- | ------------------------------- |
| id        | uuid     | PK                              |
| ownerId   | uuid     | FK → User                       |
| name      | String   | унікальний для власника         |
| icon      | String?  |                                 |
| isDefault | Boolean  |                                 |
| config    | Json?    | гнучка конфігурація на майбутнє |
| createdAt | DateTime |                                 |

Зв'язки: `sections[]`, `databases[]`

#### Section (Секція)

| Поле                  | Тип      | Примітки             |
| --------------------- | -------- | -------------------- |
| id                    | uuid     | PK                   |
| spaceId               | uuid     | FK → Space           |
| name                  | String   | унікальна в просторі |
| position              | Int      | порядок відображення |
| icon                  | String?  |                      |
| color                 | String?  |                      |
| createdAt / updatedAt | DateTime |                      |

Зв'язки: `databases[]`

#### Database (База даних)

| Поле                  | Тип      | Примітки                                                  |
| --------------------- | -------- | --------------------------------------------------------- |
| id                    | uuid     | PK                                                        |
| spaceId               | uuid     | FK → Space                                                |
| sectionId             | uuid?    | FK → Section (може бути null)                             |
| name                  | String   | унікальна в просторі                                      |
| title                 | String?  | відображувана назва                                       |
| icon                  | String?  |                                                           |
| config                | Json?    |                                                           |
| recordLimit           | Int?     | макс. кількість дозволених записів (null = безліч)        |
| useDefaultTemplate    | Boolean  | автозастосування шаблону за замовчуванням (default: true) |
| createdAt / updatedAt | DateTime |                                                           |

Зв'язки: `properties[]`, `records[]`, `templates[]`

#### Property (Визначення властивості стовпця)

| Поле                  | Тип          | Примітки                                         |
| --------------------- | ------------ | ------------------------------------------------ |
| id                    | uuid         | PK                                               |
| databaseId            | uuid         | FK → Database                                    |
| name                  | String       |                                                  |
| type                  | PropertyType | enum                                             |
| position              | Int          | порядок стовпців                                 |
| icon / color          | String?      |                                                  |
| isRequired            | Boolean      |                                                  |
| isPrimary             | Boolean      | визначає первинне текстове поле (стовпець назви) |
| config                | Json?        | специфічна конфігурація для типу властивості     |
| createdAt / updatedAt | DateTime     |                                                  |

Зв'язки: `values[]`, `templateValues[]`

**Конфігурація для окремих типів властивостей:**

- **NUMBER**: `{ format: 'float' | 'integer' | 'currency', decimalPlaces, defaultValue }`
- **DATE**: `{ format, includeTime, timeFormat }`
- **SELECT**: `{ categories: [{ name, options: [] }], isMultiSelect }`
- **STATUS**: `{ values: [{ label, color }] }`
- **RELATION**: `{ relatedEntityId: string, multiple: bool }`
- **FORMULA**: `{ formula: string, output: { type: PropertyType } }`

#### Record (Рядок запису)

| Поле                  | Тип      | Примітки                       |
| --------------------- | -------- | ------------------------------ |
| id                    | uuid     | PK                             |
| databaseId            | uuid     | FK → Database                  |
| templateId            | uuid?    | FK → Template (може бути null) |
| name                  | String   |                                |
| icon                  | String?  |                                |
| config                | Json?    |                                |
| createdAt / updatedAt | DateTime |                                |

Зв'язки: `values[]`

#### PropertyValue (Комірка значення властивості)

| Поле       | Тип     | Примітки                               |
| ---------- | ------- | -------------------------------------- |
| id         | uuid    | PK                                     |
| recordId   | uuid    | FK → Record                            |
| propertyId | uuid    | FK → Property                          |
| value      | Json?   | типізоване значення                    |
| computed   | Boolean | true для результатів обчислення формул |

Унікальний індекс на пару `(recordId, propertyId)`.

#### Template (Шаблон)

| Поле                  | Тип      | Примітки                                             |
| --------------------- | -------- | ---------------------------------------------------- |
| id                    | uuid     | PK                                                   |
| databaseId            | uuid     | FK → Database                                        |
| name                  | String   | унікальна назва в межах бази даних                   |
| description           | String?  |                                                      |
| icon                  | String?  |                                                      |
| isDefault             | Boolean  | автозастосування при створенні запису без templateId |
| position              | Int      | порядок відображення                                 |
| config                | Json?    |                                                      |
| createdAt / updatedAt | DateTime |                                                      |

Зв'язки: `values[]`, `records[]`

#### TemplatePropertyValue (Попередньо заповнене значення в шаблоні)

| Поле       | Тип   | Примітки                      |
| ---------- | ----- | ----------------------------- |
| id         | uuid  | PK                            |
| templateId | uuid  | FK → Template                 |
| propertyId | uuid  | FK → Property                 |
| value      | Json? | попередньо заповнене значення |

Унікальний індекс на пару `(templateId, propertyId)`.

---

## 5. Рівень API

Усі кінцеві точки (endpoints) захищені за допомогою JWT, якщо вони не позначені як **[public]**. Автентифікація застосовується глобально через `JwtAuthGuard` як `APP_GUARD`; декоратор `@Public()` дозволяє зробити маршрут публічним.

### Автентифікація — `/auth`

| Метод | Шлях                  | Опис                                     |
| ----- | --------------------- | ---------------------------------------- |
| POST  | /auth/register        | Реєстрація нового користувача [public]   |
| POST  | /auth/login           | Вхід у систему (обмежено: 5/хв) [public] |
| POST  | /auth/verify          | Підтвердження email за токеном [public]  |
| POST  | /auth/refresh         | Оновлення access-токена [public]         |
| POST  | /auth/logout          | Вихід, анулювання refresh-токена         |
| POST  | /auth/dev/verify-user | Dev: обхід верифікації email             |
| POST  | /auth/dev/reset       | Dev: скидання тестових даних             |

### Користувач — `/users`

| Метод  | Шлях      | Опис                          |
| ------ | --------- | ----------------------------- |
| GET    | /users/me | Профіль поточного користувача |
| PATCH  | /users/me | Оновлення профілю             |
| DELETE | /users/me | Видалення акаунту             |

### Простір — `/spaces`

| Метод  | Шлях                  | Опис                                                |
| ------ | --------------------- | --------------------------------------------------- |
| POST   | /spaces               | Створення робочого простору                         |
| GET    | /spaces               | Список просторів користувача                        |
| GET    | /spaces/:id           | Деталі простору (секції + бази даних)               |
| PATCH  | /spaces/:id           | Оновлення простору / операції з секціями            |
| DELETE | /spaces/:id           | Видалення простору (крім простору за замовчуванням) |
| POST   | /spaces/:id/duplicate | Дублювання простору                                 |

### База даних — `/databases`

| Метод  | Шлях                     | Опис                                    |
| ------ | ------------------------ | --------------------------------------- |
| POST   | /databases               | Створення бази даних (`spaceId` в body) |
| GET    | /databases?spaceId=:id   | Список баз даних простору               |
| GET    | /databases/:id           | Отримати базу даних                     |
| PATCH  | /databases/:id           | Оновлення бази даних                    |
| DELETE | /databases/:id           | Видалення бази даних                    |
| POST   | /databases/:id/duplicate | Дублювання бази даних                   |

### Властивість — `/properties`

| Метод  | Шлях                       | Опис                                        |
| ------ | -------------------------- | ------------------------------------------- |
| POST   | /properties                | Створення властивості (`databaseId` в body) |
| GET    | /properties?databaseId=:id | Список властивостей бази даних              |
| GET    | /properties/:id            | Отримати властивість                        |
| PATCH  | /properties/:id            | Оновлення властивості                       |
| DELETE | /properties/:id            | Видалення властивості                       |

### Запис — `/records`

| Метод  | Шлях                    | Опис                                                    |
| ------ | ----------------------- | ------------------------------------------------------- |
| POST   | /records                | Створення запису (`databaseId` в body)                  |
| GET    | /records?databaseId=:id | Список записів (опціональна пагінація: `page`, `limit`) |
| GET    | /records/:id            | Отримати запис                                          |
| PATCH  | /records/:id            | Оновлення запису                                        |
| DELETE | /records/:id            | Видалення запису                                        |

### Значення властивості — `/values`

| Метод  | Шлях                 | Опис                                   |
| ------ | -------------------- | -------------------------------------- |
| POST   | /values              | Створення значення (`recordId` в body) |
| GET    | /values?recordId=:id | Список значень запису                  |
| GET    | /values/:id          | Отримати значення                      |
| PATCH  | /values/:id          | Оновлення значення                     |
| DELETE | /values/:id          | Видалення значення                     |

### Шаблон — `/templates`

| Метод  | Шлях                      | Опис                                    |
| ------ | ------------------------- | --------------------------------------- |
| POST   | /templates                | Створення шаблону (`databaseId` в body) |
| GET    | /templates?databaseId=:id | Список шаблонів бази даних              |
| GET    | /templates/:id            | Отримати шаблон                         |
| PATCH  | /templates/:id            | Оновлення шаблону                       |
| DELETE | /templates/:id            | Видалення шаблону                       |
| POST   | /templates/:id/duplicate  | Дублювання шаблону                      |

### Значення шаблону — `/template-property-values`

| Метод  | Шлях                                     | Опис                                             |
| ------ | ---------------------------------------- | ------------------------------------------------ |
| POST   | /template-property-values                | Створення значення шаблону (`templateId` в body) |
| GET    | /template-property-values?templateId=:id | Список значень шаблону                           |
| GET    | /template-property-values/:id            | Отримати значення шаблону                        |
| PATCH  | /template-property-values/:id            | Оновлення значення шаблону                       |
| DELETE | /template-property-values/:id            | Видалення значення шаблону                       |

### Налаштування — `/settings`

| Метод | Шлях               | Опис                             |
| ----- | ------------------ | -------------------------------- |
| GET   | /settings/space    | Отримати налаштування простору   |
| PATCH | /settings/space    | Оновити налаштування простору    |
| GET   | /settings/database | Отримати налаштування бази даних |
| PATCH | /settings/database | Оновити налаштування бази даних  |
| GET   | /settings/section  | Отримати налаштування секції     |
| PATCH | /settings/section  | Оновити налаштування секції      |
| GET   | /settings/record   | Отримати налаштування запису     |
| PATCH | /settings/record   | Оновити налаштування запису      |

---

### Стандартна структура відповідей (Success & Error)

```json
// Успішна відповідь (Success)
{ "id": "uuid", "name": "...", ...fields }

// Помилка (Error)
{ "message": "Текст помилки", "statusCode": 400, "timestamp": "..." }
```

| HTTP Код | Значення                                            |
| -------- | --------------------------------------------------- |
| 201      | Created (Створено)                                  |
| 400      | Validation error (Помилка валідації)                |
| 401      | Invalid / expired token (Невалідний токен)          |
| 403      | Not resource owner (Не є власником ресурсу)         |
| 404      | Not found (Не знайдено)                             |
| 409      | Duplicate unique constraint (Конфлікт унікальності) |
| 429      | Rate limited (Забагато запитів)                     |

---

## 6. Процес автентифікації

### Реєстрація

1. `POST /auth/register` з тілом `{ email, username, password }`
2. Пароль хешується за допомогою bcryptjs
3. Користувач створюється в БД; ініціалізується дефолтний робочий простір (див. розділ 9)
4. Надсилається лист підтвердження (Resend SDK / Nodemailer fallback)
5. Access-токен повертається в тілі відповіді; refresh-токен записується в HTTP-only cookie

### Вхід у систему (Login)

1. `POST /auth/login` з тілом `{ email, password }`
2. Пароль порівнюється з хешем у базі даних
3. Видається новий access-токен (діє 15 хв) та refresh-токен (діє 7 днів, зберігається як хеш в БД)
4. Refresh-токен записується в HTTP-only cookie `refresh_token`

### Оновлення токенів (Silent refresh)

1. `apiFetch` перехоплює відповіді зі статусом `401`
2. Надсилається запит на `POST /auth/refresh` (браузер автоматично передає cookie)
3. Сервер перевіряє хеш токена в БД та видає новий access-токен
4. Початковий запит повторюється; при повторній помилці -> перенаправлення на `/login`

### Guards та декоратори

- **`JwtAuthGuard`** — глобальний `APP_GUARD`; захищає всі маршрути за замовчуванням
- **`@Public()`** — виключає маршрут із обов'язкової автентифікації JWT
- **`@CurrentUser()`** — витягує `userId` із корисного навантаження (payload) JWT в параметри контролера
- **`ResourceOwnerGuard`** — перевіряє, чи належить ресурс користувачу, який робить запит
- **`ThrottlerGuard`** — лімітування кількості записів (налаштовується глобально або на рівні роутів)

### Вилучення JWT-токенів

`JwtStrategy` (`apps/api/src/jwt/jwt.strategy.ts`) спочатку намагається дістати access-токен із куки `access_token` (HTTP-only), а при відсутності — звертається до заголовка `Authorization: Bearer`. Допоміжні функції `setAccessTokenCookie()` / `setRefreshTokenCookie()` в `apps/api/src/common/utils/cookie.helper.ts` керують обома токенами.

---

## 7. Архітектура клієнтської частини

### Глобальний стан — `AppContext`

`AppProvider` (огортає весь застосунок у файлі `layout.tsx`) керує наступними даними:

- `user` — поточний автентифікований користувач
- `spaces[]` — список просторів користувача
- `space` — поточний обраний простір (із вкладеними секціями та базами даних)
- `isLoading` — глобальний стан завантаження

Доступні методи: `setSpace`, `addSpace`, `removeSpace`, `updateSpaceInList`, `updateDatabaseInSpace`, `addDatabaseToSpace`, `reorderSections`, `reorderDatabasesInSection`, `moveDatabaseToSection`, `removeSectionFromSpace`, `renameSectionInSpace`, `removeDatabaseFromSpace`, `clearSession`

Дані синхронізуються з `localStorage` для миттєвого відображення при перезавантаженні сторінки. Метод `clearSession` викликається автоматично при збої оновлення токенів (401).

### Структура сторінок (Page Structure)

```
layout.tsx (AppProvider, шрифти)
└── Header (Шапка сторінки)
└── <вміст сторінки>
    ├── / (page.tsx)
    │   ├── [неавторизований] → інтерфейс лендінгу
    │   └── [авторизований]   → Сайдбар + вітальне вікно
    ├── /login
    ├── /register
    └── /database/[id]
└── Footer (Підвал сторінки)
```

### Дерево компонентів сайдбару (Sidebar Component Tree)

```
Sidebar
├── SpaceSwitcher           — вибір та перемикання просторів
├── SidebarActions          — створення секції або бази даних
├── SectionItem[]           — секція сайдбару (колапс, перетягування)
│   └── DatabaseItem[]      — посилання на базу даних (перетягування)
├── UnsectionedDropZone     — зона перетягування для баз поза секціями
└── SidebarDragOverlay      — візуальний ефект при перетягуванні dnd
```

Використовувані хуки:
`useSidebarDnd` — dnd-логіка перетягування на базі `@dnd-kit`
`useSidebarState` — стан відкриття/закриття секцій, активна база даних

### Компоненти перегляду баз даних (Database View)

```
DatabaseHeader              — заголовок, іконка, режими перегляду, дії
DatabaseTable               — записи у вигляді рядків, властивості у вигляді колонок
  ├── PropertyIcon          — іконка для кожного типу PropertyType
  └── CellValue             — рендеринг типізованого значення комірки
RecordModal                 — модальне вікно запису з полями PropertyInput відповідно до типів
```

### Клієнт API (`src/lib/api/`)

- `client.ts` — обгортка `apiFetch`: додає заголовок Bearer, перехоплює помилку 401, оновлює токени
- `space.ts`, `database.ts`, `user.ts`, … — типізовані функції для роботи з відповідними ресурсами

---

## 8. Спільний пакет домену

Пакет `packages/domain/src/` містить усі спільні DTO та сутності (entities). Він компилюється в папку `dist/` за допомогою `tsc`.

| Модуль                  | Ключові експорти                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| auth                    | `LoginUserDto`, `RegisterUserDto`, `VerifyEmailDto`, `AuthResponseDto`                                       |
| user                    | `UserResponseDto`, `UpdateUserDto`                                                                           |
| space                   | `SpaceResponseDto`, `CreateSpaceDto`, `UpdateSpaceDto`, `DEFAULT_SPACE_SETTINGS`                             |
| section                 | `SectionResponseDto`, `CreateSectionDto`, `SectionOperationDto`                                              |
| database                | `DatabaseResponseDto`, `CreateDatabaseDto`, `UpdateDatabaseDto`                                              |
| property                | `PropertyResponseDto`, `CreatePropertyDto`, перерахування `PropertyType`, конфігурації типів                 |
| record                  | `RecordResponseDto`, `CreateRecordDto`, `UpdateRecordDto`                                                    |
| property-value          | `PropertyValueResponseDto`, `CreatePropertyValueDto`                                                         |
| template                | `TemplateResponseDto`, `CreateTemplateDto`, `UpdateTemplateDto`                                              |
| template-property-value | `TemplatePropertyValueResponseDto`, `CreateTemplatePropertyValueDto`, `UpdateTemplatePropertyValueDto`       |
| settings                | `SettingsResponseDto`, `UpdateSettingsDto`                                                                   |
| settings                | `DatabaseSettingsInterface`, `RecordSettingsInterface`, `SectionSettingsInterface`, `SpaceSettingsInterface` |

---

## 9. Ініціалізація та наповнення даними

Після завершення реєстрації користувача сервіс `InitializeUserSpaceUseCase` запускає **4-прохідний алгоритм ініціалізації**:

1. **Створення секцій** — Routine (Рутина), Insight (Аналітика), Settings (Налаштування)
2. **Створення порожніх баз даних** — 9 стандартних баз даних у відповідних секціях
3. **Створення властивостей** — розв'язання символьних зв'язків `RELATION` (наприклад, `{ relatedEntityType: 'accounts' }`)
4. **Створення шаблонів за замовчуванням** — по 2 шаблони на кожну базу (описані в конфігурації `initialization.config.ts`); перший шаблон позначається як `isDefault: true` та автоматично застосовується при створенні нового запису
5. **Наповнення демонстраційними записами** — дані з файлу `initialization.seeds.ts`; зв'язки розв'язуються за назвами записів через інтерфейси `SeedRecord`, `SeedRelation`.

**7 попередньо налаштованих баз даних:**

| База даних           | Секція   | Ключові властивості                                                                                                                         |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Trading Journal      | Routine  | Назва (Name), Дата, Рахунок (relation), Валютна пара (SELECT), Сесія, Напрямок, Результат, Отриманий R-Multiple, Модель входу, Стоп-лосс... |
| Session Routine      | Routine  | Назва, Дата, Рахунок, Пара, Торгова система, Опис, Результат; ФОРМУЛА: Точність опису, Виконання                                            |
| Notes                | Insight  | Назва, Дата, Тип (SELECT: Урок/Правило/Спостереження/Стратегія/Психологія), Тема                                                            |
| Mistakes             | Insight  | Назва, Дата, Тип помилки, Тема, Рівень серйозності                                                                                          |
| Accounts             | Settings | Назва, Дата старту, Тип рахунку, Статус, Стартовий баланс (валюта), Поточний баланс (валюта)                                                |
| Payouts / Operations | Settings | Назва, Дата, Рахунок (relation), Сума операції (валюта)                                                                                     |
| Trading Systems      | Settings | Назва, Дата                                                                                                                                 |

Кожна база даних має обов'язкову первинну текстову властивість `Name`. Властивості типу `SELECT` містять категорії (наприклад, пари валют: EURUSD, GBPUSD...; товари: XAUUSD).

---

## 10. Ключові патерни розробки

### Серверна частина (Backend)

| Патерн                | Реалізація                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use cases             | Складні багатокрокові операції виділені в окремі файли `*.usecase.ts` (наприклад, `DuplicateSpaceUseCase`, `DuplicateDatabaseUseCase`, `InitializeUserSpaceUseCase`)                                       |
| Мапінг виключень      | `GlobalExceptionFilter` перетворює помилки Prisma на відповідні HTTP коди (наприклад, P2002 -> 409 Conflict, P2025 -> 404 Not Found)                                                                       |
| ACID Транзакції       | Використання `prisma.$transaction()` для забезпечення цілісності при багатокрокових записах в БД                                                                                                           |
| Логування             | Кастомний клас `AppLogger`; кожен сервіс ініціює контекст за допомогою `this.logger.setContext(ClassName)`                                                                                                 |
| Керування куками      | Функція `setAccessTokenCookie()` встановлює access-токен у відповідь; `AuthCookiesInterceptor` додатково керує refresh-токеном                                                                             |
| Валідація             | Глобальний пайп `ValidationPipe` (налаштування: whitelist, forbidNonWhitelisted, transform)                                                                                                                |
| Реєстр властивостей   | `PropertyTypeRegistry` + обробники для кожного типу (`PropertyConfigHandler`, `PropertyValueHandler`). Додавання нової властивості автоматично створює null-значення для всіх наявних записів у базі даних |
| JSON-колонки конфігів | Гнучкі налаштування об'єктів збережені в базі даних як `Json?` поля моделей (Space, Database, Property, Record)                                                                                            |

### Клієнтська частина (Frontend)

| Патерн                 | Реалізація                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Оптимістичні оновлення | Стан інтерфейсу оновлюється миттєво до отримання відповіді від сервера; сервер підтверджує зміни у фоновому режимі |
| Drag-and-drop          | Бібліотека `@dnd-kit` для сортування секцій та баз даних у сайдбарі                                                |
| Кешування localStorage | Користувач та простори кешуються локально; кеш очищується при статусі 401                                          |
| Власні хуки            | Хуки `useSidebarDnd`, `useSidebarState`, `useMutation`, `useModal` ізолюють складну логіку від самих компонентів   |
| Абстракція API         | Модулі в папочці `/lib/api/*` приховують деталі виконання fetch-запитів від компонентів                            |

### Монорепозиторій (Monorepo)

| Патерн                   | Реалізація                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Спільні типи             | Скомпільований пакет `@fixspace/domain` забезпечує строгу типізацію між клієнтом та сервером |
| Кешування Turborepo      | Завдання кешуються; компілюються лише ті пакети, в які вносилися зміни                       |
| Аліаси робочих просторів | Використання префікса `workspace:*` для внутрішніх залежностей в файлах `package.json`       |

---

## 11. Змінні оточення

Валідуються при старті сервера за допомогою Zod (`apps/api/src/config/env.validation.ts`). Сервер зупиняє роботу при невалідній конфігурації.

| Змінна                                | Значення за замовчуванням | Опис                                    |
| ------------------------------------- | ------------------------- | --------------------------------------- |
| `NODE_ENV`                            | `development`             | `development` \| `production` \| `test` |
| `PORT`                                | `3000`                    | Порт API сервера                        |
| `DATABASE_URL`                        | —                         | Рядок підключення до PostgreSQL         |
| `DATABASE_POOL_SIZE`                  | `10`                      | Пул з'єднань Prisma                     |
| `JWT_SECRET`                          | —                         | мінімум 32 символи, **обов'язкова**     |
| `JWT_ACCESS_EXPIRATION`               | `15m`                     | Термін дії access-токена                |
| `JWT_REFRESH_SECRET`                  | —                         | мінімум 32 символи, **обов'язкова**     |
| `JWT_REFRESH_EXPIRATION`              | `7d`                      | Термін дії refresh-токена               |
| `VERIFICATION_TOKEN_EXPIRATION_HOURS` | `24`                      | Термін дії токена верифікації email     |
| `COOKIE_DOMAIN`                       | `localhost`               | Домен для запису куки сесії             |
| `SMTP_HOST`                           | —                         | опціонально для надсилання пошти        |
| `SMTP_PORT`                           | `587`                     |                                         |
| `SMTP_USER / SMTP_PASS`               | —                         | опціонально                             |
| `MAIL_FROM`                           | `noreply@fixspace.app`    |                                         |
| `APP_URL`                             | `http://localhost:3001`   | Використовується для посилань у листах  |
| `CORS_ORIGIN`                         | `http://localhost:3001`   | Дозволене джерело запитів CORS          |
| `SPACE_NAME_TEMPLATE`                 | `{{username}}'s Space`    | Назва простору за замовчуванням         |

Скопіюйте файл `apps/api/.env.example` -> `apps/api/.env.development` та вкажіть локальні налаштування.

---

## 12. Команди розробки

```bash
# Запуск інфраструктури
docker-compose up -d                          # PostgreSQL у Docker

# Локальна розробка
turbo dev                                     # Запуск усіх застосунків (API + Web)
turbo dev --filter=@fixspace/api               # Тільки API
pnpm --filter @fixspace/domain dev             # Компіляція пакета domain в режимі watch

# Збірка (Build)
turbo build
pnpm --filter @fixspace/domain build           # Обов'язково перед першим запуском

# Робота з базою даних
turbo db:generate                             # Генерація клієнта Prisma після зміни схеми
turbo db:migrate:dev                          # Створення та застосування міграції розробки
turbo db:push                                 # Швидкий пуш схеми без створення файлу міграції
turbo db:seed                                 # Заповнення бази початковими даними (seeding)
pnpm db:reset                                 # Повне скидання бази (видалення даних, повторна міграція)
pnpm --filter @fixspace/database studio        # Запуск Prisma Studio

# Тестування (Tests)
turbo test                                    # Запуск усіх unit-тестів
turbo test:e2e                                # Запуск усіх e2e-тестів
pnpm --filter @fixspace/api test:watch         # Unit-тести API в режимі watch

# Перевірка та форматування коду
turbo lint
pnpm format                                   # Запуск Prettier (ts, tsx, md)
```

---

## Діаграми

Вихідні файли PlantUML розміщені в папці `docs/diagrams/`. Їх можна відкрити за допомогою будь-якого рендерера PlantUML (розширення для VS Code, онлайн-редактор на plantuml.com або CLI-інструмент `plantuml`).

| Файл                                                                                     | Опис                                                                 |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`System_Context.plantuml`](../diagrams/System_Context.plantuml)                         | C4 System Context — Контекст системи FIX Space та зовнішніх сервісів |
| [`Container.plantuml`](../diagrams/Container.plantuml)                                   | C4 Container — Діаграма контейнерів: Next.js, NestJS, PostgreSQL     |
| [`Component.plantuml`](../diagrams/Component.plantuml)                                   | C4 Component — Діаграма компонентів: NestJS модулі                   |
| [`Deployment.plantuml`](../diagrams/Deployment.plantuml)                                 | C4 Deployment — Схема розгортання: Vercel + Railway                  |
| [`ER_Diagram.plantuml`](../diagrams/ER_Diagram.plantuml)                                 | Діаграма зв'язків сутностей (Entity-Relationship)                    |
| [`Sequence_AuthFlow.plantuml`](../diagrams/Sequence_AuthFlow.plantuml)                   | Діаграма послідовності автентифікації (JWT + Google OAuth)           |
| [`Sequence_FormulaEvaluation.plantuml`](../diagrams/Sequence_FormulaEvaluation.plantuml) | Процес обчислення формул                                             |
| [`Sequence_RecordCreation.plantuml`](../diagrams/Sequence_RecordCreation.plantuml)       | Створення запису із заповненням значень властивостей                 |
