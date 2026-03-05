# Nucleus — Architecture Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Data Model](#4-data-model)
5. [API Layer](#5-api-layer)
6. [Authentication Flow](#6-authentication-flow)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Domain Package](#8-domain-package)
9. [Initialization & Seeding](#9-initialization--seeding)
10. [Key Patterns](#10-key-patterns)
11. [Environment Variables](#11-environment-variables)
12. [Dev Commands](#12-dev-commands)

---

## 1. Project Overview

Nucleus is a full-stack monorepo for a **trading workspace platform** — a system tailored to traders. Users get a personal workspace (Space) with pre-seeded sections and databases (trading journal, notes, mistakes, accounts, etc.) on registration.

**Core concept hierarchy:**

```
User → Space → Section → Database → Property / Record → PropertyValue / RecordContent
```

---

## 2. Technology Stack

### Backend (apps/api)

| Concern          | Technology                                                         |
| ---------------- | ------------------------------------------------------------------ |
| Framework        | NestJS 11 (TypeScript)                                             |
| Database ORM     | Prisma 6                                                           |
| Database         | PostgreSQL 16 (Docker)                                             |
| Authentication   | JWT (access + refresh tokens), Passport                            |
| Password hashing | bcryptjs                                                           |
| Email            | Nodemailer                                                         |
| Validation       | class-validator, Zod (env)                                         |
| Rate limiting    | @nestjs/throttler (200 req/min global, 5 req/min on `/auth/login`) |
| Runtime          | Node.js 18+                                                        |

### Frontend (apps/web)

| Concern     | Technology                        |
| ----------- | --------------------------------- |
| Framework   | Next.js 16 (React 19, TypeScript) |
| Build tool  | Turbopack (dev mode)              |
| Styling     | Tailwind CSS 4, PostCSS           |
| Icons       | lucide-react, emoji-mart          |
| Drag & Drop | @dnd-kit (core, sortable)         |
| Runtime     | Node.js 18+                       |

### Tooling

| Concern                | Technology                   |
| ---------------------- | ---------------------------- |
| Package manager        | pnpm 9.15                    |
| Monorepo orchestration | Turborepo 2.8                |
| Code quality           | ESLint, Prettier             |
| Testing                | Jest (unit), Supertest (e2e) |

---

## 3. Monorepo Structure

```
nucleus-project/
├── apps/
│   ├── api/                        # NestJS REST API  — port 3000
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── main.ts
│   │       ├── auth/               # Registration, login, refresh, verify
│   │       ├── space/              # Space CRUD + section operations
│   │       ├── database/           # Database (collection) CRUD
│   │       ├── property/           # Property (column) CRUD
│   │       ├── property-value/     # Cell values
│   │       ├── record/             # Record (row) CRUD
│   │       ├── record-content/     # Rich content per record
│   │       ├── user/               # User profile
│   │       ├── settings/           # Key-value user settings
│   │       ├── jwt/                # JWT strategy, guard
│   │       ├── mail/               # Email service
│   │       ├── common/             # Filters, interceptors, guards, decorators, logger
│   │       └── config/             # Env validation (Zod), initialization config
│   │
│   └── web/                        # Next.js frontend  — port 3001
│       ├── app/                    # Next.js App Router pages
│       │   ├── layout.tsx
│       │   ├── page.tsx            # Home (landing or dashboard)
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   ├── settings/page.tsx
│       │   └── not-found.tsx
│       └── src/
│           ├── components/
│           │   ├── auth/           # Login & register forms
│           │   ├── home/           # Dashboard: sidebar, section/database items, space-switcher
│           │   ├── database/       # Database view: header, table
│           │   ├── layout/         # Header, footer
│           │   └── ui/             # Atoms: form, icons, overlays, primitives, color-picker
│           ├── context/
│           │   └── app-context.tsx # Global state (user, spaces, current space)
│           ├── lib/
│           │   ├── api/            # Typed fetch wrappers (client, user, space, database, …)
│           │   └── cache.ts        # localStorage-based caching
│           └── styles/
│
├── packages/
│   ├── domain/                     # @nucleus/domain — shared DTOs & entities
│   │   ├── src/                    # TypeScript source
│   │   └── dist/                   # Compiled output (imported by API & web)
│   ├── database/                   # @nucleus/database — Prisma schema, client, migrations
│   │   ├── prisma/schema.prisma
│   │   ├── generated/              # Prisma client output
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

### Package consumption rules

- **`@nucleus/domain`** compiles to `dist/` via `tsc`. Must run `pnpm --filter @nucleus/domain build` before first dev session if `dist/` is missing. In dev, run `pnpm --filter @nucleus/domain dev` (`tsc --watch`) to keep it compiled.
- **`@nucleus/ui`** exports TypeScript source directly — listed in `transpilePackages` in `apps/web/next.config.js`. Any new local TS-source package used in web must be added there too.
- `@nucleus/domain` is a `devDependency` in web (types only); the API imports it as a runtime dependency.

---

## 4. Data Model

### Enums

```prisma
enum PropertyType {
  TEXT, NUMBER, DATE, CHECKBOX, SELECT, STATUS, RELATION, FORMULA
}
```

### Models

#### User

| Field        | Type     | Notes              |
| ------------ | -------- | ------------------ |
| id           | uuid     | PK                 |
| email        | String   | unique             |
| username     | String   | unique             |
| passwordHash | String   | bcryptjs hash      |
| icon         | String?  | emoji or URL       |
| isVerified   | Boolean  | email verification |
| createdAt    | DateTime |                    |

Relations: `spaces[]`, `refreshTokens[]`, `verificationTokens[]`, `settings[]`

#### RefreshToken

Stores hashed refresh tokens with expiry. Cascade-deleted with user.

#### EmailVerificationToken

Stores hashed verification tokens with expiry and `usedAt` timestamp.

#### Settings (key-value)

| Field    | Type   | Notes                             |
| -------- | ------ | --------------------------------- |
| id       | uuid   | PK                                |
| userId   | uuid   | FK → User                         |
| key      | String |                                   |
| value    | Json   |                                   |
| category | String | `space`, `database`, `section`, … |

Unique on `(userId, key)`. Cascade-deleted with user.

#### Space

| Field     | Type     | Notes                  |
| --------- | -------- | ---------------------- |
| id        | uuid     | PK                     |
| ownerId   | uuid     | FK → User              |
| name      | String   | unique per owner       |
| icon      | String?  |                        |
| isDefault | Boolean  |                        |
| config    | Json?    | flexible future config |
| createdAt | DateTime |                        |

Relations: `sections[]`, `databases[]`

#### Section

| Field                 | Type     | Notes            |
| --------------------- | -------- | ---------------- |
| id                    | uuid     | PK               |
| spaceId               | uuid     | FK → Space       |
| name                  | String   | unique per space |
| position              | Int      | display order    |
| icon                  | String?  |                  |
| color                 | String?  |                  |
| createdAt / updatedAt | DateTime |                  |

Relations: `databases[]`

#### Database

| Field                 | Type     | Notes                   |
| --------------------- | -------- | ----------------------- |
| id                    | uuid     | PK                      |
| spaceId               | uuid     | FK → Space              |
| sectionId             | uuid?    | FK → Section (nullable) |
| name                  | String   | unique per space        |
| title                 | String?  | display title           |
| icon                  | String?  |                         |
| config                | Json?    |                         |
| createdAt / updatedAt | DateTime |                         |

Relations: `properties[]`, `records[]`

#### Property (column definition)

| Field                 | Type         | Notes                            |
| --------------------- | ------------ | -------------------------------- |
| id                    | uuid         | PK                               |
| databaseId            | uuid         | FK → Database                    |
| name                  | String       |                                  |
| type                  | PropertyType | enum                             |
| position              | Int          | column order                     |
| icon / color          | String?      |                                  |
| isRequired            | Boolean      |                                  |
| isPrimary             | Boolean      | identifies the "name" column     |
| config                | Json?        | type-specific config (see below) |
| createdAt / updatedAt | DateTime     |                                  |

**Type-specific config shapes:**

- **NUMBER**: `{ format: 'float' | 'integer' | 'currency', decimalPlaces, defaultValue }`
- **DATE**: `{ format, includeTime, timeFormat }`
- **SELECT**: `{ categories: [{ name, options: [] }], isMultiSelect }`
- **STATUS**: `{ values: [{ label, color }] }`
- **RELATION**: `{ sourceDatabaseType: string, multiple: bool }`
- **FORMULA**: `{ formula: string, outputType: PropertyType }`

#### Record (row)

| Field                 | Type     | Notes         |
| --------------------- | -------- | ------------- |
| id                    | uuid     | PK            |
| databaseId            | uuid     | FK → Database |
| name                  | String   |               |
| icon                  | String?  |               |
| config                | Json?    |               |
| createdAt / updatedAt | DateTime |               |

Relations: `values[]`, `content` (one-to-one RecordContent)

#### PropertyValue (cell)

| Field      | Type    | Notes                    |
| ---------- | ------- | ------------------------ |
| id         | uuid    | PK                       |
| recordId   | uuid    | FK → Record              |
| propertyId | uuid    | FK → Property            |
| value      | Json?   | typed cell value         |
| computed   | Boolean | true for formula results |

Unique on `(recordId, propertyId)`.

#### RecordContent (rich text)

| Field        | Type     | Notes               |
| ------------ | -------- | ------------------- |
| id           | uuid     | PK                  |
| recordId     | uuid     | unique FK → Record  |
| lastEditedAt | DateTime |                     |
| config       | Json?    | block-based content |

---

## 5. API Layer

All endpoints are JWT-protected unless marked **[public]**. Auth is applied globally via `JwtAuthGuard` as `APP_GUARD`; the `@Public()` decorator opts out.

### Auth — `/auth`

| Method | Path                  | Description                       |
| ------ | --------------------- | --------------------------------- |
| POST   | /auth/register        | Register new user [public]        |
| POST   | /auth/login           | Login (throttled: 5/min) [public] |
| POST   | /auth/verify          | Verify email token [public]       |
| POST   | /auth/refresh         | Refresh access token [public]     |
| POST   | /auth/logout          | Logout, revoke refresh token      |
| POST   | /auth/dev/verify-user | Dev: bypass email verification    |
| POST   | /auth/dev/reset       | Dev: reset test data              |

### User — `/users`

| Method | Path      | Description          |
| ------ | --------- | -------------------- |
| GET    | /users/me | Current user profile |
| PATCH  | /users/me | Update profile       |
| DELETE | /users/me | Delete account       |

### Space — `/spaces`

| Method | Path                  | Description                           |
| ------ | --------------------- | ------------------------------------- |
| POST   | /spaces               | Create space                          |
| GET    | /spaces               | List user's spaces                    |
| GET    | /spaces/:id           | Space details (sections + databases)  |
| PATCH  | /spaces/:id           | Update space / run section operations |
| DELETE | /spaces/:id           | Delete space (not the default)        |
| POST   | /spaces/:id/duplicate | Duplicate space                       |

### Database — `/spaces/:spaceId/databases`

| Method | Path                           | Description     |
| ------ | ------------------------------ | --------------- |
| POST   | /spaces/:spaceId/databases     | Create database |
| GET    | /spaces/:spaceId/databases     | List databases  |
| GET    | /spaces/:spaceId/databases/:id | Get database    |
| PATCH  | /spaces/:spaceId/databases/:id | Update database |
| DELETE | /spaces/:spaceId/databases/:id | Delete database |

### Property — `/databases/:databaseId/properties`

Standard CRUD: POST, GET (list), GET (:id), PATCH (:id), DELETE (:id)

### Record — `/databases/:databaseId/records`

Standard CRUD: POST, GET (list), GET (:id), PATCH (:id), DELETE (:id)

### PropertyValue — `/records/:recordId/values`

Standard CRUD: POST, GET (list), GET (:id), PATCH (:id), DELETE (:id)

### RecordContent — `/records/:recordId/content`

Standard CRUD for rich content blocks.

### Settings — `/settings`

GET and PATCH by key + category.

---

### Standard response shapes

```json
// Success
{ "id": "uuid", "name": "...", ...fields }

// Error
{ "message": "Error text", "statusCode": 400, "timestamp": "..." }
```

| Status | Meaning                     |
| ------ | --------------------------- |
| 201    | Created                     |
| 400    | Validation error            |
| 401    | Invalid / expired token     |
| 403    | Not resource owner          |
| 404    | Not found                   |
| 409    | Duplicate unique constraint |
| 429    | Rate limited                |

---

## 6. Authentication Flow

### Registration

1. `POST /auth/register` with `{ email, username, password }`
2. Password hashed with bcryptjs
3. User created; default Space initialized (see §9)
4. Verification email sent (Nodemailer)
5. Access token returned in body; refresh token set as HTTP-only cookie

### Login

1. `POST /auth/login` with `{ email, password }`
2. Password compared with stored hash
3. New access token (15 min) + refresh token (7 days, hashed in DB) issued
4. Refresh token → HTTP-only cookie `refresh_token`

### Token refresh

1. `apiFetch` intercepts `401` responses
2. Calls `POST /auth/refresh` (sends cookie automatically)
3. API validates token hash in DB, issues new access token
4. Original request retried; on failure → redirect to `/login`

### Guards & decorators

- **`JwtAuthGuard`** — global `APP_GUARD`; all routes protected by default
- **`@Public()`** — opts a route out of JWT requirement
- **`@CurrentUser()`** — extracts `userId` from JWT payload in controller params
- **`ResourceOwnerGuard`** — verifies the requesting user owns the resource
- **`ThrottlerGuard`** — rate limiting (configured per-route or globally)

---

## 7. Frontend Architecture

### Global State — `AppContext`

`AppProvider` (wraps entire app in `layout.tsx`) manages:

- `user` — current authenticated user
- `spaces[]` — user's spaces list
- `space` — currently selected space (with sections & databases)
- `isLoading` — global loading state

Exposed methods: `setSpace`, `addSpace`, `removeSpace`, `updateSpaceInList`, `updateDatabaseInSpace`, `reorderSections`, `reorderDatabasesInSection`, `moveDatabaseToSection`, `removeSectionFromSpace`, `renameSectionInSpace`, `clearSession`

Data is persisted to `localStorage` for instant hydration. `clearSession` is called automatically on 401 if token refresh fails.

### Page Structure

```
layout.tsx (AppProvider, fonts)
└── Header
└── <page content>
    ├── / (page.tsx)
    │   ├── [unauthenticated] → landing view
    │   └── [authenticated]  → Sidebar + DatabaseView
    ├── /login
    ├── /register
    └── /settings
└── Footer
```

### Sidebar Component Tree

```
Sidebar
├── SpaceSwitcher           — switch between spaces
├── SidebarActions          — create space / database
├── SectionItem[]           — collapsible, draggable
│   └── DatabaseItem[]      — draggable database links
├── UnsectionedDropZone     — drop zone for unsectioned databases
└── SidebarDragOverlay      — DnD visual ghost

Hooks:
  useSidebarDnd             — @dnd-kit drag logic
  useSidebarState           — collapsed sections, active database
```

### Database View Components

```
DatabaseHeader              — title, icon, view controls, actions
DatabaseTable               — records as rows, properties as columns
  └── PropertyIcon          — icon per PropertyType
```

### API Client (`src/lib/api/`)

- `client.ts` — `apiFetch` wrapper: attaches Bearer token, intercepts 401, handles token refresh
- `space.ts`, `database.ts`, `user.ts`, … — typed functions per resource

---

## 8. Domain Package

`packages/domain/src/` exports all shared DTOs and entities. Compiled to `dist/` via `tsc`.

| Module         | Key exports                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| auth           | `LoginUserDto`, `RegisterUserDto`, `VerifyEmailDto`, `AuthResponseDto`           |
| user           | `UserResponseDto`, `UpdateUserDto`                                               |
| space          | `SpaceResponseDto`, `CreateSpaceDto`, `UpdateSpaceDto`, `DEFAULT_SPACE_SETTINGS` |
| section        | `SectionResponseDto`, `CreateSectionDto`, `SectionOperationDto`                  |
| database       | `DatabaseResponseDto`, `CreateDatabaseDto`, `UpdateDatabaseDto`                  |
| property       | `PropertyResponseDto`, `CreatePropertyDto`, `PropertyType` enum, type configs    |
| record         | `RecordResponseDto`, `CreateRecordDto`, `UpdateRecordDto`                        |
| property-value | `PropertyValueResponseDto`, `CreatePropertyValueDto`                             |
| record-content | `RecordContentResponseDto`, `CreateRecordContentDto`                             |
| settings       | `SettingsResponseDto`, `UpdateSettingsDto`                                       |

---

## 9. Initialization & Seeding

When a user registers, `InitializeUserSpaceUseCase` runs and creates:

**Default Space** — `"{username}'s Space"`

**3 Sections** (from `initialization.config.ts`):

1. Routine (position 0)
2. Insight (position 1)
3. Settings (position 2)

**7 Pre-seeded Databases:**

| Database        | Section  | Key Properties                                                                                                  |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| Trading Journal | Routine  | Name, Date, Account (relation), Pair (SELECT), Session, Direction, Result, Gained RR, Entry Model, Stop Loss, … |
| Session Routine | Routine  | Name, Date, Account, Pair, Trading System, Narrative, Outcome; FORMULA: Narrative Accurate, Execution           |
| Notes           | Insight  | Name, Date, Type (SELECT: Lesson/Rule/Observation/Strategy/Psychology), Topic                                   |
| Mistakes        | Insight  | Name, Date, Type, Topic, Severity                                                                               |
| Accounts        | Settings | Name, Started, Account Type, Status, Starting Equity (currency), Current Equity (currency)                      |
| Payouts         | Settings | Name, Date, Account (relation), Amount (currency)                                                               |
| Trading Systems | Settings | Name, Date                                                                                                      |

Every database gets a primary `Name` TEXT property. SELECT properties use categorized options (e.g. Forex pairs: EURUSD, GBPUSD, …; Commodities: XAUUSD).

---

## 10. Key Patterns

### Backend

| Pattern             | Implementation                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Use cases           | Complex multi-step operations extracted to `*.usecase.ts` files (e.g. `DuplicateSpaceUseCase`, `InitializeUserSpaceUseCase`) |
| Exception mapping   | `GlobalExceptionFilter` maps Prisma errors → HTTP codes (P2002→409, P2025→404)                                               |
| ACID transactions   | `prisma.$transaction()` for multi-step writes                                                                                |
| Logging             | Custom `AppLogger`; every service calls `this.logger.setContext(ClassName)`                                                  |
| Cookie management   | `AuthCookiesInterceptor` sets/clears `refresh_token` cookie on auth responses                                                |
| Validation          | Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform)                                                         |
| JSON config columns | Flexible per-model config stored as `Json?` field (Space, Database, Property, Record)                                        |

### Frontend

| Pattern            | Implementation                                                 |
| ------------------ | -------------------------------------------------------------- |
| Optimistic updates | UI state updated immediately; server confirms in background    |
| Drag-and-drop      | `@dnd-kit` for section/database reordering in sidebar          |
| localStorage cache | User + spaces cached; invalidated on 401                       |
| Custom hooks       | `useSidebarDnd`, `useSidebarState` isolate complex logic       |
| API abstraction    | `/lib/api/*` typed wrappers hide fetch details from components |

### Monorepo

| Pattern            | Implementation                                                     |
| ------------------ | ------------------------------------------------------------------ |
| Shared types       | `@nucleus/domain` compiled package ensures type safety across apps |
| Turborepo caching  | Task outputs cached; only changed packages rebuild                 |
| Workspace aliasing | `workspace:*` for internal deps in `package.json`                  |

---

## 11. Environment Variables

Validated at startup with Zod (`apps/api/src/config/env.validation.ts`). App exits on invalid config.

| Variable                              | Default                 | Notes                                   |
| ------------------------------------- | ----------------------- | --------------------------------------- |
| `NODE_ENV`                            | `development`           | `development` \| `production` \| `test` |
| `PORT`                                | `3000`                  | API port                                |
| `DATABASE_URL`                        | —                       | PostgreSQL connection string            |
| `DATABASE_POOL_SIZE`                  | `10`                    | Prisma connection pool                  |
| `JWT_SECRET`                          | —                       | min 32 chars, **required**              |
| `JWT_ACCESS_EXPIRATION`               | `15m`                   | Access token lifetime                   |
| `JWT_REFRESH_SECRET`                  | —                       | min 32 chars, **required**              |
| `JWT_REFRESH_EXPIRATION`              | `7d`                    | Refresh token lifetime                  |
| `VERIFICATION_TOKEN_EXPIRATION_HOURS` | `24`                    | Email token expiry                      |
| `COOKIE_DOMAIN`                       | `localhost`             | Domain for refresh cookie               |
| `SMTP_HOST`                           | —                       | optional                                |
| `SMTP_PORT`                           | `587`                   |                                         |
| `SMTP_USER / SMTP_PASS`               | —                       | optional                                |
| `MAIL_FROM`                           | `noreply@nucleus.app`   |                                         |
| `APP_URL`                             | `http://localhost:3001` | Used in email links                     |
| `CORS_ORIGIN`                         | `http://localhost:3001` |                                         |
| `SPACE_NAME_TEMPLATE`                 | `{{username}}'s Space`  | Default space name                      |

Copy `apps/api/.env.example` → `apps/api/.env.development` to set up locally.

---

## 12. Dev Commands

```bash
# Start infrastructure
docker-compose up -d                          # PostgreSQL

# Development
turbo dev                                     # All apps (API + Web)
turbo dev --filter=@nucleus/api               # API only
pnpm --filter @nucleus/domain dev             # Watch-compile domain package

# Build
turbo build
pnpm --filter @nucleus/domain build           # Required before first dev run

# Database
turbo db:generate                             # Regenerate Prisma client after schema changes
turbo db:migrate:dev                          # Create and apply dev migration
turbo db:push                                 # Push schema without migration file (dev only)
turbo db:seed                                 # Seed with initial data
pnpm db:reset                                 # Full reset (destroys all data, re-migrates)
pnpm --filter @nucleus/database studio        # Open Prisma Studio

# Tests
turbo test                                    # All unit tests
turbo test:e2e                                # All e2e tests
pnpm --filter @nucleus/api test:watch         # API unit tests in watch mode

# Code quality
turbo lint
pnpm format                                   # Prettier (ts, tsx, md)
```
