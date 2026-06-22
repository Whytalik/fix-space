# @fixspace/api

NestJS 11 REST API for the FIX Space platform. Provides a modular monolith backend with JWT authentication, rate limiting, i18n validation, and OpenAPI/Swagger documentation.

## Structure

```
apps/api/src/
├── core/                    # Core infrastructure
│   ├── auth/                # Registration, login, Google OAuth, JWT strategy
│   ├── cache/               # Redis cache integration
│   ├── config/              # Environment validation (Zod)
│   ├── health/              # Health check endpoint
│   ├── i18n/                # i18n configuration and translations
│   ├── jwt/                 # Token service
│   ├── mail/                # Email service (Nodemailer / Resend)
│   └── storage/             # File storage (Cloudinary)
├── modules/                 # Domain-specific feature modules
│   ├── automation/          # Database automation rules and scheduler
│   ├── database/            # Typed data containers within spaces
│   ├── import-export/       # CSV import/export with mapping
│   ├── integration-connection/# External API connections (Binance, MT5)
│   ├── notification/        # In-app notifications
│   ├── property/            # Typed columns (TEXT, NUMBER, DATE, etc.)
│   ├── property-group/      # Logical grouping of properties
│   ├── property-value/      # JSON values for record-property pairs
│   ├── record/              # Data rows with search, filter, sort
│   ├── record-content/      # Rich-text content for records (Tiptap JSON)
│   ├── settings/            # Per-category key-value configs
│   ├── space/               # Top-level workspaces
│   ├── statistics/          # Trading and custom reports
│   ├── template/            # Pre-filled record templates
│   ├── user/                # User profile and management
│   └── view/                # Database views (Table, Grid, etc.)
├── common/                  # Shared filters, interceptors, logger
├── main.ts                  # Bootstrap — Swagger, CORS, pipes
└── app.module.ts            # Root module
```

## Endpoints

### Auth

| Method | Endpoint                    | Description                        |
| :----- | :-------------------------- | :--------------------------------- |
| POST   | `/auth/register`            | Register a new user                |
| POST   | `/auth/verify`              | Verify email address               |
| POST   | `/auth/resend-verification` | Resend verification email          |
| POST   | `/auth/login`               | Login (returns JWT access+refresh) |
| POST   | `/auth/refresh`             | Rotate refresh token               |
| POST   | `/auth/logout`              | Revoke refresh token               |
| POST   | `/auth/logout-all`          | Revoke all refresh tokens          |
| GET    | `/auth/sessions`            | List active sessions               |
| DELETE | `/auth/sessions/:id`        | Revoke specific session            |
| POST   | `/auth/forgot-password`     | Request password reset email       |
| POST   | `/auth/reset-password`      | Reset password with token          |
| GET    | `/auth/google`              | Initiate Google OAuth              |
| GET    | `/auth/google/callback`     | Handle Google OAuth callback       |

### User

| Method | Endpoint             | Description              |
| :----- | :------------------- | :----------------------- |
| GET    | `/users/me`          | Get current user profile |
| PATCH  | `/users/me`          | Update profile           |
| POST   | `/users/me/avatar`   | Upload avatar            |
| DELETE | `/users/me/avatar`   | Remove avatar            |
| PATCH  | `/users/me/password` | Change password          |
| DELETE | `/users/me`          | Delete account           |

### Spaces & Databases

| Method | Endpoint                     | Description      |
| :----- | :--------------------------- | :--------------- |
| GET    | `/spaces`                    | List user spaces |
| POST   | `/spaces`                    | Create a space   |
| PATCH  | `/spaces/:id`                | Update space     |
| DELETE | `/spaces/:id`                | Delete space     |
| GET    | `/spaces/:spaceId/databases` | List databases   |
| POST   | `/spaces/:spaceId/databases` | Create database  |

### Records & Content

| Method | Endpoint                         | Description                |
| :----- | :------------------------------- | :------------------------- |
| GET    | `/databases/:databaseId/records` | List records (filter/sort) |
| POST   | `/databases/:databaseId/records` | Create record              |
| PATCH  | `/records/:id`                   | Update record properties   |
| DELETE | `/records/:id`                   | Delete record              |
| GET    | `/records/:id/content`           | Get rich-text content      |
| PATCH  | `/records/:id/content`           | Update rich-text content   |

### Automations & Integrations

| Method | Endpoint                   | Description                       |
| :----- | :------------------------- | :-------------------------------- |
| GET    | `/automations`             | List database automations         |
| POST   | `/automations`             | Create automation rule            |
| GET    | `/integration-connections` | List API connections              |
| POST   | `/integration-connections` | Connect Binance/MT5               |
| GET    | `/statistics/trading`      | Get trading performance analytics |

## Swagger

OpenAPI/Swagger UI is available at `http://localhost:3000/api/docs` in development mode.

## Environment

| Variable             | Description                         |
| :------------------- | :---------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string        |
| `JWT_SECRET`         | Secret for signing access tokens    |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens   |
| `SMTP_HOST`          | SMTP server for emails              |
| `CLOUDINARY_URL`     | Storage for avatars and attachments |
| `GOOGLE_CLIENT_ID`   | Google OAuth credentials            |

## Commands

```bash
# Development (watch mode)
pnpm --filter @fixspace/api dev

# Build for production
pnpm --filter @fixspace/api build

# Start production build
pnpm --filter @fixspace/api start:prod

# Unit & Integration tests
pnpm --filter @fixspace/api test
pnpm --filter @fixspace/api test:integration

# Lint & Format
pnpm --filter @fixspace/api lint
pnpm --filter @fixspace/api format
```

## Tech Stack

- **Framework:** NestJS 11 (Express)
- **Database:** PostgreSQL + Prisma
- **Auth:** Passport.js (JWT, Google OAuth 2.0)
- **Validation:** Class-validator + I18n
- **Storage:** Cloudinary
- **Mail:** Nodemailer / Resend
- **Docs:** Swagger/OpenAPI 3.0
