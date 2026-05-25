# `@nucleus/database`

Prisma ORM configuration and client for the Nucleus monorepo. Provides a singleton `PrismaClient` instance with driver adapter support.

## Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Database schema (models, enums, relations)
│   └── migrations/            # Generated migration files
├── generated/
│   └── client/                # Auto-generated Prisma Client (git-ignored)
├── src/
│   └── client.ts              # PrismaClient singleton with connection pool
├── prisma.config.ts           # Prisma CLI config (datasource, schema path)
├── tsconfig.json              # TypeScript config for development
└── tsconfig.build.json        # TypeScript config for production build
```

## Prisma schema

### Generator

Uses the new Prisma 7 `prisma-client` provider (Rust-free, faster queries, smaller bundle):

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/client"
}
```

### Models

| Model                    | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `User`                   | User accounts with email/username auth                |
| `RefreshToken`           | JWT refresh tokens with bcrypt hashing                |
| `EmailVerificationToken` | Email verification flow tokens                        |
| `PasswordResetToken`     | Password reset flow tokens                            |
| `GoogleAccount`          | Linked Google OAuth account                           |
| `Settings`               | User-level key-value settings (JSON)                  |
| `Notification`           | In-app notifications (SYSTEM, ALERT, INTEGRATION)     |
| `IntegrationConnection`  | External broker/exchange API connections              |
| `Space`                  | Top-level workspace (owned by user)                   |
| `Section`                | Organizational sections within a space                |
| `Database`               | Data containers within a space/section                |
| `PropertyGroup`          | Named property groups with conditional visibility     |
| `Property`               | Typed columns (TEXT, NUMBER, DATE, etc.)              |
| `Record`                 | Data rows within a database                           |
| `PropertyValue`          | JSON values for record-property pairs                 |
| `RecordContent`          | Rich text content (Editor.js JSON) per record         |
| `RecordContentSnapshot`  | Versioned snapshots of record content                 |
| `ButtonExecution`        | Tracks last successful button execution per record    |
| `Template`               | Pre-filled record templates                           |
| `TemplatePropertyValue`  | Default values for template properties                |
| `View`                   | Saved view configurations (filters, sort, grouping)   |
| `Automation`             | Server-side automation rules per database             |
| `AutomationLog`          | Execution history for automations                     |
| `ImportMapping`          | Saved CSV field-mapping presets                       |
| `ImportHistory`          | CSV import job history                                |
| `ContentBlockLibrary`    | Reusable content blocks (system presets + user saved) |
| `OnboardingProgress`     | Per-user tour state, checklist, contextual tips       |

### Property types

The `PropertyType` enum defines available column types:

`TEXT`, `NUMBER`, `DATE`, `CHECKBOX`, `SELECT`, `STATUS`, `RELATION`, `FORMULA`, `RATING`, `PROGRESS`, `DURATION`, `BUTTON`

## Client usage

### Singleton pattern

The client uses a global singleton to prevent multiple connection pools in development (hot reload):

```ts
import { prisma } from "@nucleus/database";

const users = await prisma.user.findMany();
```

### Driver adapter

Uses `@prisma/adapter-pg` with `pg` connection pool for PostgreSQL:

```ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

## Commands

All commands load environment variables from `.env.development` and `.env` (fallback):

```bash
# Generate Prisma Client (run after schema changes)
pnpm --filter @nucleus/database db:generate

# Create and apply a migration (development)
pnpm --filter @nucleus/database db:migrate:dev

# Apply pending migrations (production)
pnpm --filter @nucleus/database db:migrate:deploy

# Push schema changes without migration file
pnpm --filter @nucleus/database db:push

# Open Prisma Studio (GUI)
pnpm --filter @nucleus/database studio

# Format schema file
pnpm --filter @nucleus/database format

# Lint package
pnpm --filter @nucleus/database lint
```

## Environment

Required in `.env.development` or `.env`:

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `DATABASE_URL` | PostgreSQL connection string |

## Prisma 7 notes

- **ESM only** — `package.json` has `"type": "module"`
- **Driver adapter required** — `PrismaClient` must receive an `adapter` option
- **`prisma generate` is explicit** — no longer runs automatically after `migrate dev`
- **No auto-seeding** — `prisma db seed` must be run explicitly
