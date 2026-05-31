# Обґрунтування вибору технологій (FIX Space)

Цей документ пояснює **чому** обрано кожну технологію, а не **як** вона використовується. Детальна архітектура — у [`overview.md`](./overview.md), алгоритми — у [`algorithms.md`](./algorithms.md), безпека — у [`security.md`](./security.md), фронтенд-стейт — у [`frontend-state.md`](./frontend-state.md).

---

## 1. Загальна концепція стеку

FIX Space — це **персональний SaaS для одного користувача** (single-tenant per account). Основні вимоги до стеку:

- **TypeScript наскрізь** — від схеми БД до React-компонентів, без розриву типів між шарами
- **Швидка ітерація** — solo-розробник без CI-команди, тому DX важливіший за горизонтальне масштабування
- **Реляційна JSONB-модель** — гнучка схема `PropertyValue.value: Json` вимагає СУБД із нативною підтримкою JSON і транзакцій
- **Монорепо** — фронтенд, бекенд і спільний domain-пакет в одному репозиторії

Фінальний стек:

| Шар          | Технологія                           | Версія     |
| ------------ | ------------------------------------ | ---------- |
| Frontend     | Next.js + React                      | 16 / 19    |
| Backend      | NestJS                               | 11         |
| ORM          | Prisma                               | 7          |
| Database     | PostgreSQL                           | 16         |
| Монорепо     | Turborepo + pnpm                     | 2.8 / 9.15 |
| Shared types | @fixspace/domain (TypeScript)        | —          |
| Server state | TanStack Query                       | 5          |
| Email        | Resend SDK (Prod) / Nodemailer (Dev) | —          |
| Auth         | JWT + bcryptjs                       | —          |
| Деплой       | Vercel + Railway                     | —          |

---

## 2. Frontend — Next.js 16 + React 19

### Чому Next.js, а не Vite / Create React App

**App Router + Server Components** — центральна причина вибору. Server Components рендеряться на сервері: JavaScript компонента не потрапляє до браузера, що дає:

- Менший bundle size — критично для комплексних сторінок із великою кількістю властивостей і записів
- Пряме звернення до даних у Server Component без додаткового API-endpoint для SSR
- SEO та початкове завантаження без клієнтського JS

**Turbopack** (стабільний з v15, використовується в dev-режимі) — заміна Webpack із значно швидшим HMR. Для монорепо з кількома пакетами це відчутно прискорює ітерацію.

**Streaming з Suspense** — повільні запити не блокують весь рендер сторінки. `<Suspense fallback={<Skeleton />}>` дозволяє відображати готові частини одразу.

**File-system routing** — структура `app/` директорій безпосередньо визначає маршрути. Для solo-розробника це усуває необхідність у окремому router-конфігу.

**Автоматичне code splitting** — кожна сторінка отримує тільки потрібний JS, без ручного налаштування.

### Чому React 19

`use()` хук для стримінгу Promise з Server Component до Client Component — це нова можливість React 19, яку App Router використовує для передачі даних між шарами без prop drilling.

### Альтернативи що розглядались

| Альтернатива     | Причина відхилення                                                             |
| ---------------- | ------------------------------------------------------------------------------ |
| Vite + React     | Немає SSR/Server Components з коробки; потребує окремого backend для SSR       |
| Create React App | Застарілий, не підтримується; немає SSR                                        |
| Remix            | Менша екосистема, менш зрілий App Router-аналог; менше матеріалів              |
| SvelteKit        | Менша екосистема TypeScript-бібліотек; складніша інтеграція з @fixspace/domain |

---

## 3. Backend — NestJS 11

### Чому NestJS, а не Express

NestJS — **прогресивний Node.js фреймворк** (під капотом — Express), що додає структуру через декоратори та DI-контейнер.

**Dependency Injection (IoC container)** — `@Injectable()` декоратор дозволяє NestJS автоматично створювати та управляти залежностями. Для FIX Space це означає:

- Сервіси, репозиторії та use-cases ін'єктуються автоматично — без ручного `new Service(new Dep())`
- Тести: залежності замінюються mock-об'єктами без зміни коду (`TestingModule`)

**Модульна архітектура** — кожна фіча (Auth, Space, Record, Property тощо) є окремим NestJS-модулем із чіткими межами. Це безпосередньо відображається у структурі `apps/api/src/` (детально в [`overview.md §3`](./overview.md)).

**Guards, Pipes, Interceptors, Filters** — крос-cutting concerns винесені з бізнес-логіки:

- `JwtAuthGuard` (глобальний APP_GUARD) — весь захист в одному місці
- `ValidationPipe` (глобальний) — DTO валідація без дублювання коду
- `GlobalExceptionFilter` — маппінг Prisma помилок на HTTP коди (P2002→409, P2025→404)
- `ThrottlerGuard` — rate limiting без логіки в контролері

Детально про security-шари — у [`security.md §3`](./security.md).

**TypeScript first** — NestJS розроблявся виключно для TypeScript. Декоратори (`@Controller`, `@Get`, `@Body`) дають типізовані metadata без додаткових конфігів.

**Тестуємість з коробки** — `@nestjs/testing` надає `TestingModule` для ізольованого тестування кожного модуля. 53 spec-файли в проекті використовують саме цей підхід.

### Альтернативи що розглядались

| Альтернатива  | Причина відхилення                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Express (raw) | Немає DI, guards, pipes; потребує вручну організовувати структуру; швидко стає spaghetti                                        |
| Fastify       | Менша екосистема готових модулів; менше матеріалів для TypeScript                                                               |
| Hono          | Молодий, мало документації; немає DI і модульності                                                                              |
| tRPC          | Гарний для full-stack TypeScript, але прив'язує фронтенд безпосередньо до бекенду; ускладнює Postman-тестування і REST-контракт |

---

## 4. ORM — Prisma 7

### Чому Prisma, а не TypeORM або raw SQL

**Єдина декларативна схема** (`schema.prisma`) — джерело правди для:

- Структури БД (таблиці, поля, зв'язки, індекси)
- Auto-generated TypeScript типів (`PrismaClient`)
- SQL міграцій (`prisma migrate dev`)

Зміна схеми → `turbo db:migrate:dev` → нова міграція + оновлений клієнт. Ніякої ручної синхронізації між моделлю і БД.

**Типобезпека автоматично** — `prisma.record.findMany({ where: { name: input } })` повертає `Record[]` з повними типами. IDE підказує всі поля. Тип `Record` автоматично оновлюється при зміні схеми.

```typescript
// Компілятор перевіряє що 'naem' - помилка:
await prisma.record.findMany({ where: { naem: "test" } }); // ❌ TypeScript error
await prisma.record.findMany({ where: { name: "test" } }); // ✅
```

**Параметризовані запити** — Prisma використовує prepared statements для всіх операцій. SQL injection неможлива на рівні бібліотеки. Детальніше — у [`security.md §8`](./security.md).

**Prisma Studio** — GUI для перегляду і редагування даних у розробці (`pnpm --filter @fixspace/database studio`). Незамінний при роботі зі складною ієрархічною структурою `User → Space → Database → Record`.

**vs TypeORM:** TypeORM використовує model-classes з декораторами — модель і схема в одному файлі, але синхронізація між ними ненадійна. Prisma розділяє schema (`schema.prisma`) і query client — чистіша архітектура. Детальне порівняння: `Prisma vs TypeORM` у офіційній документації.

**vs raw SQL:** для проекту з 22 моделями і складними зв'язками (Data Dictionary у [`database.md §6`](./database.md)) raw SQL створив би величезний maintenance overhead. JSONB-поля (`PropertyValue.value`, `Property.config`) обробляються безпечно через Prisma API.

### Альтернативи що розглядались

| Альтернатива | Причина відхилення                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------- |
| TypeORM      | Декоратори на класах плутають модель і схему; менш надійні міграції; слабша типізація результатів |
| Drizzle      | Хороший варіант, але менш зрілий; менше документації; відсутній Studio                            |
| Raw SQL / pg | Потребує вручну писати і підтримувати 22 моделі; відсутність типів з коробки                      |
| Sequelize    | JavaScript-first, TypeScript підтримка вторинна; застаріла архітектура                            |

### Singleton-клієнт замість PrismaService

У більшості NestJS-туторіалів Prisma підключається через `PrismaService` — injectable клас, що розширює `PrismaClient` і інжектується через DI:

```typescript
// Популярний, але не підходить для монорепо
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

У FIX Space обрано **singleton-патерн** у спільному пакеті `@fixspace/database`:

```typescript
// packages/database/src/client.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Причини:**

1. **Монорепо-архітектура** — `@fixspace/database` є спільним пакетом між застосунками. Singleton у shared пакеті — рекомендований підхід Prisma для turborepo. `PrismaService` прив'язаний до одного NestJS-модуля і не може бути shared.

2. **Запобігання множинним підключенням** — `PrismaClient` відкриває пул з'єднань до БД. Кожен новий інстанс — новий пул. У dev-режимі (hot reload) Node.js перезавантажує модулі при кожній зміні коду, але **не** глобальний об'єкт `global`. Зберігання інстансу в `global` гарантує один клієнт протягом усіх hot reload циклів.

3. **Простота** — репозиторії імпортують клієнт напряму: `import { prisma } from "@fixspace/database"`. Немає потреби передавати `PrismaService` через весь ланцюг DI кожного модуля.

**Driver adapter `@prisma/adapter-pg`** — сучасний підхід Prisma 5+. Замість вбудованого рушія використовується нативний `pg.Pool`, що дає контроль над параметрами пулу підключень і сумісність з edge-середовищами.

---

## 5. Database — PostgreSQL 16

### Чому PostgreSQL

**JSONB з індексуванням** — `PropertyValue.value` і `Property.config` зберігаються як `Json` (JSONB у PostgreSQL). JSONB дозволяє фільтрувати по вкладених полях і будувати GIN-індекси на JSON-документах. Для гнучкої моделі властивостей FIX Space це критично.

**ACID-транзакції** — 4-pass ініціалізація простору (створення секцій → баз даних → властивостей → templates) виконується в одній транзакції (`prisma.$transaction()`). При помилці на будь-якому кроці — повний rollback. Детально в [`algorithms.md §5`](./algorithms.md).

**Зрілість і надійність** — PostgreSQL 16 підтримується хмарними платформами (Railway, Supabase, Google Cloud SQL). Деплой описаний у [`deployment.md`](../08-deployment/deployment.md).

**Розширений SQL** — оконні функції, CTE, `LATERAL JOIN` — для майбутньої аналітики по торгових метриках (Win Rate, Profit Factor, Expectancy).

**Docker-образ** — `postgres:16` з docker-compose забезпечує ідентичне середовище в dev та CI. Два контейнери: `db` (порт 5432, `FIX Space_dev`) і `db-test` (порт 5433, `FIX Space_test`).

### Альтернативи що розглядались

| Альтернатива    | Причина відхилення                                                                 |
| --------------- | ---------------------------------------------------------------------------------- |
| MySQL / MariaDB | Слабша підтримка JSONB; менший SQL-стандарт                                        |
| SQLite          | Немає паралельних запитів; не підходить для production                             |
| MongoDB         | Відсутні ACID-транзакції для складних операцій; не підтримується Prisma рівноцінно |
| Supabase        | Додає abstraction-шар і vendor lock-in; raw PostgreSQL гнучкіший                   |

---

## 6. Монорепо — Turborepo + pnpm

### Чому монорепо

FIX Space складається з трьох відокремлених частин:

- `apps/api` — NestJS бекенд
- `apps/web` — Next.js фронтенд
- `packages/domain` — спільні TypeScript DTOs та entities
- `packages/database` — Prisma схема і клієнт

Без монорепо: `@fixspace/domain` треба публікувати в npm або symlink вручну при кожній зміні. З монорепо: `workspace:*` — залежність встановлюється автоматично.

### Чому Turborepo

**Task caching** — Turborepo кешує результати задач. `turbo build` виконується тільки для пакетів з реальними змінами — незмінені пакети відновлюються з кешу. Для `packages/domain` (компілюється в `dist/`) це означає що після `pnpm build` без змін у domain — rebuild не потрібен.

**Task orchestration** — `turbo.json` визначає залежності між задачами:

```
build: [^build]        → спочатку build всіх залежностей
test: [build]          → test тільки після build
db:migrate: [generate] → генерація клієнта перед міграцією
```

Без Turborepo порядок виконання треба задавати вручну через shell-скрипти.

**Паралелізація** — незалежні задачі виконуються паралельно на всіх доступних CPU. `turbo test` запускає unit-тести `api` і `web` одночасно.

**Remote caching** (опціонально) — кеш задач можна шарити між машинами та CI через Vercel Remote Cache.

### Чому pnpm

**Ефективне використання диску** — pnpm використовує symlinks до глобального store замість копіювання `node_modules`. При 3+ пакетах у монорепо це економить сотні MB.

**Workspace protocol** — `workspace:*` і `workspace:^` — нативна підтримка internal залежностей без npm publish.

**Швидша інсталяція** — deduplicated store + content-addressable storage.

---

## 7. Наскрізний TypeScript — @fixspace/domain

### Навіщо окремий domain-пакет

`packages/domain` (`@fixspace/domain`) — спільні DTOs, entities та enum'и що використовуються і в API, і у Web.

**Проблема без shared package:** `CreateRecordDto` визначається двічі — в API і у fetch-функціях фронтенду. При зміні поля — потрібно оновлювати в двох місцях, і компілятор не попередить про розбіжність.

**З @fixspace/domain:** API приймає `CreateRecordDto`, фронтенд відправляє `CreateRecordDto` — той самий тип. TypeScript перевіряє відповідність при компіляції. Помилка в DTO → compile error в обох apps одночасно.

`@fixspace/domain` компілюється в `dist/` через `tsc`. Перед першою dev-сесією: `pnpm --filter @fixspace/domain build`. В dev: `pnpm --filter @fixspace/domain dev` (watch mode).

---

## 8. Auth — JWT + bcryptjs

### Чому JWT, а не Sessions

JWT дозволяє **stateless верифікацію** на рівні API: сервер перевіряє підпис токена без звернення до БД на кожен запит. Тільки refresh-токен перевіряється через БД (tokenHash) — для ротації та відкликання.

Access token (15 хв) в HTTP-only cookie — захист від XSS. Refresh token (30 днів) теж в HTTP-only cookie + hashed в БД — захист від крадіжки. Детальний flow — у [`algorithms.md §7`](./algorithms.md), security-модель — у [`security.md §2`](./security.md).

### Чому bcryptjs, а не argon2

bcryptjs — чистий JavaScript, без нативних C-бінарників. argon2 теоретично кращий, але потребує компіляції нативних модулів. Для Docker-контейнерів на різних архітектурах (amd64, arm64) bcryptjs — простіша збірка без cross-compilation проблем.

---

## 9. Деплой — Vercel + Railway

### Vercel (Frontend)

Next.js розроблений Vercel — натуральне середовище для App Router. Edge Network для статичних assets, автоматичний preview для PR, zero-config деплой з GitHub.

### Railway (Backend + PostgreSQL)

Railway підтримує Docker-деплой з `docker-compose`-синтаксисом. API упаковується в Docker-образ (`apps/api/Dockerfile`), PostgreSQL — як окремий Railway-сервіс. Автоматичне SSL, environment variables через UI.

Детальна конфігурація деплою — у [`deployment.md`](../08-deployment/deployment.md).

---

## 10. Зв'язок документів

| Документ                                                           | Що покриває                                                      |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`overview.md`](./overview.md)                                     | Загальна архітектура: модульна структура, API endpoints, патерни |
| [`database.md`](./database.md)                                     | 22 Prisma-моделі, Data Dictionary, ER-зв'язки                    |
| [`algorithms.md`](./algorithms.md)                                 | Formula engine, Space initialization, JWT flow, Record filtering |
| [`security.md`](./security.md)                                     | Модель загроз, guards, bcrypt, CORS, rate limiting               |
| [`frontend-state.md`](./frontend-state.md)                         | TanStack Query, Server vs Client Components, caching             |
| [`../08-deployment/deployment.md`](../08-deployment/deployment.md) | Vercel + Railway, env vars, CORS, міграції                       |
| [`../06-testing/strategy.md`](../06-testing/strategy.md)           | Jest unit, e2e (SuperTest + FIX Space_test DB), Postman          |
