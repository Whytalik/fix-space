# @fixspace/api

NestJS 11 REST API for the FIX Space platform. Provides a modular monolith backend with JWT authentication, rate limiting, i18n validation, and OpenAPI/Swagger documentation.

## Structure

```
apps/api/src/
├── auth/                    # Registration, login, JWT refresh, password reset, email verification
├── user/                    # User profile, avatar, password change, account deletion
├── space/                   # Spaces — top-level workspaces with duplication support
├── database/                # Databases — typed data containers within spaces
├── property/                # Properties — typed columns (TEXT, NUMBER, DATE, SELECT, etc.)
├── property-value/          # Property values — JSON values for record-property pairs
├── record/                  # Records — data rows with search, filter, sort, content
├── template/                # Templates — pre-filled record templates with duplication
├── template-property-value/ # Template property values — defaults for template properties
├── settings/                # Settings — per-category key-value configs (space, database, section, record)
├── health/                  # Health check endpoint
├── jwt/                     # JWT strategy, guards, token service
├── mail/                    # Email service (nodemailer)
├── common/                  # Shared filters, interceptors, logger, middleware
├── config/                  # Environment validation (Zod)
├── i18n/                    # i18n translation files (en, uk)
├── main.ts                  # Bootstrap — Swagger, CORS, validation pipe, global filters
└── app.module.ts            # Root module — Throttler, I18n, all feature modules
```

## Endpoints

### Auth

| Method | Endpoint                | Description                        |
| :----- | :---------------------- | :--------------------------------- |
| POST   | `/auth/register`        | Register a new user                |
| POST   | `/auth/verify`          | Verify email address               |
| POST   | `/auth/login`           | Login (returns JWT access+refresh) |
| POST   | `/auth/refresh`         | Rotate refresh token               |
| POST   | `/auth/logout`          | Revoke refresh token               |
| POST   | `/auth/forgot-password` | Request password reset email       |
| POST   | `/auth/reset-password`  | Reset password with token          |
| POST   | `/auth/dev/verify-user` | Dev-only: verify user manually     |
| POST   | `/auth/dev/reset`       | Dev-only: reset user state         |

### User

| Method | Endpoint             | Description              |
| :----- | :------------------- | :----------------------- |
| GET    | `/users/me`          | Get current user profile |
| PATCH  | `/users/me`          | Update profile           |
| POST   | `/users/me/avatar`   | Upload avatar            |
| DELETE | `/users/me/avatar`   | Remove avatar            |
| PATCH  | `/users/me/password` | Change password          |
| DELETE | `/users/me`          | Delete account           |

### Spaces

| Method | Endpoint                | Description      |
| :----- | :---------------------- | :--------------- |
| POST   | `/spaces`               | Create a space   |
| GET    | `/spaces`               | List user spaces |
| GET    | `/spaces/:id`           | Get space by ID  |
| PATCH  | `/spaces/:id`           | Update space     |
| DELETE | `/spaces/:id`           | Delete space     |
| POST   | `/spaces/:id/duplicate` | Duplicate space  |

### Databases

| Method | Endpoint                     | Description        |
| :----- | :--------------------------- | :----------------- |
| POST   | `/spaces/:spaceId/databases` | Create database    |
| GET    | `/spaces/:spaceId/databases` | List databases     |
| GET    | `/databases/:id`             | Get database by ID |
| PATCH  | `/databases/:id`             | Update database    |
| DELETE | `/databases/:id`             | Delete database    |
| POST   | `/databases/:id/duplicate`   | Duplicate database |

### Properties

| Method | Endpoint                            | Description        |
| :----- | :---------------------------------- | :----------------- |
| POST   | `/databases/:databaseId/properties` | Create property    |
| GET    | `/databases/:databaseId/properties` | List properties    |
| GET    | `/properties/:id`                   | Get property by ID |
| PATCH  | `/properties/:id`                   | Update property    |
| DELETE | `/properties/:id`                   | Delete property    |

### Records

| Method | Endpoint                                | Description                      |
| :----- | :-------------------------------------- | :------------------------------- |
| POST   | `/databases/:databaseId/records`        | Create record                    |
| GET    | `/databases/:databaseId/records`        | List records (filter/sort/group) |
| GET    | `/databases/:databaseId/records/search` | Search records                   |
| GET    | `/records/:id`                          | Get record by ID                 |
| PATCH  | `/records/:id`                          | Update record                    |
| DELETE | `/records/:id`                          | Delete record                    |
| GET    | `/records/:id/content`                  | Get record content               |
| PUT    | `/records/:id/content`                  | Update record content            |

### Templates

| Method | Endpoint                           | Description        |
| :----- | :--------------------------------- | :----------------- |
| POST   | `/databases/:databaseId/templates` | Create template    |
| GET    | `/databases/:databaseId/templates` | List templates     |
| GET    | `/templates/:id`                   | Get template by ID |
| PATCH  | `/templates/:id`                   | Update template    |
| DELETE | `/templates/:id`                   | Delete template    |
| POST   | `/templates/:id/duplicate`         | Duplicate template |

### Settings

| Method | Endpoint             | Description              |
| :----- | :------------------- | :----------------------- |
| GET    | `/settings/space`    | Get space settings       |
| PATCH  | `/settings/space`    | Update space settings    |
| GET    | `/settings/database` | Get database settings    |
| PATCH  | `/settings/database` | Update database settings |
| GET    | `/settings/section`  | Get section settings     |
| PATCH  | `/settings/section`  | Update section settings  |
| GET    | `/settings/record`   | Get record settings      |
| PATCH  | `/settings/record`   | Update record settings   |

### Health

| Method | Endpoint  | Description              |
| :----- | :-------- | :----------------------- |
| GET    | `/health` | Application health check |

## Swagger

OpenAPI/Swagger UI is available at `http://localhost:3000/api/docs` when running in development mode.

## Environment

Copy `.env.example` to `.env.development` and fill in the required variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/FIX Space?schema=public
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=password
MAIL_FROM=noreply@example.com
CORS_ORIGIN=http://localhost:3001
PORT=3000
```

## Commands

```bash
# Development (watch mode)
pnpm --filter @fixspace/api dev

# Build for production
pnpm --filter @fixspace/api build

# Start production build
pnpm --filter @fixspace/api start:prod

# Start with debugger
pnpm --filter @fixspace/api start:debug

# Unit tests
pnpm --filter @fixspace/api test

# Unit tests (watch mode)
pnpm --filter @fixspace/api test:watch

# E2E tests
pnpm --filter @fixspace/api test:e2e

# Lint
pnpm --filter @fixspace/api lint

# Format
pnpm --filter @fixspace/api format
```

## Docker

A `Dockerfile` is provided at the app root for Railway/container deployment. It runs Prisma migrations before starting the NestJS server.

## Dependencies

| Package             | Purpose                             |
| :------------------ | :---------------------------------- |
| `@nestjs/*`         | Framework (common, core, jwt, etc.) |
| `@nestjs/swagger`   | OpenAPI documentation               |
| `@nestjs/throttler` | Rate limiting                       |
| `bcryptjs`          | Password hashing                    |
| `cookie-parser`     | Cookie-based refresh tokens         |
| `nestjs-i18n`       | Internationalized validation        |
| `nodemailer`        | Email delivery                      |
| `passport-jwt`      | JWT authentication strategy         |
| `zod`               | Environment variable validation     |
