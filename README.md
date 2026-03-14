# 🔬 Nucleus

> A specialized operational system designed for **CFD traders** 📈

Nucleus is a comprehensive platform that helps traders of all levels structure their knowledge, manage statistics, and organize their daily trading activities.

## 🎯 The Problem

Traders often struggle with fragmented data and a lack of centralized, specialized tools. Existing solutions like Notion require extensive manual setup, and trading journals often focus solely on trade logging, neglecting detailed statistics, knowledge management, and process analysis.

**Nucleus aims to solve this** by providing an integrated, out-of-the-box solution that combines knowledge management, trade journaling, and powerful analytics with AI-driven insights. 🚀

## ⚡ Core Features

- **📊 Structured Environment:** Instead of a blank canvas, Nucleus provides a ready-made workspace optimized for trading scenarios, including a Trading Journal, Daily Routine, Notes, and Mistake tracking.
- **🎨 Specialized UX:** The user interface is designed specifically for traders, minimizing setup time and guiding the user directly to analytics.
- **💰 Financial Interpretations:** Built-in understanding of trading concepts like P/L, Risk/Reward, session efficiency, etc.
- **🔧 No-Code Customization:** Users can extend their workspaces, add new databases, and adapt the structure to their own trading style without writing any code.
- **🤖 AI-Powered Insights:** An integrated AI module helps identify patterns, explain strategy mistakes, and generate recommendations for risk management and performance improvement.

## 👥 Target Audience

1. **👶 Beginner CFD Traders:** Who want to structure their trading journal without complex setups.
2. **📈 Traders with 1-3 years of experience:** Who need advanced analytics, automation, and AI assistance to improve stability and risk management.
3. **🏆 Experienced Traders & Mentors:** Who manage multiple strategies or teach others and need a unified platform to review results, patterns, and mistakes.

## 🛠️ Tech Stack

| Category       | Technology                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| **Frontend**   | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) (Turbopack)                        |
| **Backend**    | [NestJS 11](https://nestjs.com/)                                                                      |
| **Database**   | [PostgreSQL 16](https://www.postgresql.org/)                                                          |
| **ORM**        | [Prisma 7](https://www.prisma.io/)                                                                    |
| **Auth**       | JWT (access + refresh tokens) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)                      |
| **Email**      | [Nodemailer](https://nodemailer.com/) (Ethereal in dev)                                               |
| **Language**   | [TypeScript](https://www.typescriptlang.org/)                                                         |
| **Monorepo**   | [Turborepo 2.8](https://turbo.build/) + [pnpm 9.15](https://pnpm.io/)                                 |
| **Deployment** | [Vercel](https://vercel.com/) (Frontend) · [Google Cloud Run](https://cloud.google.com/run) (Backend) |

## 📂 Monorepo Structure

```shell
.
├── apps/
│   ├── api/                      # 🔌 NestJS REST API (port 3000)
│   └── web/                      # 🌐 Next.js frontend (port 3001)
└── packages/
    ├── database/                 # 🗄️ @nucleus/database — Prisma schema, client, migrations
    ├── domain/                   # 📦 @nucleus/domain — Shared DTOs & entities (class-validator)
    ├── eslint-config/            # ✅ @nucleus/eslint-config — ESLint configurations
    ├── jest-config/              # 🧪 @nucleus/jest-config — Shared Jest setup
    └── typescript-config/        # 📘 @nucleus/typescript-config — Shared tsconfig files
```

## 🚀 Getting Started

### 📋 Prerequisites

- [Node.js](https://nodejs.org/en/) v18 or later
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/get-started) (for local PostgreSQL)

### 🔧 Installation and Development

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd nucleus-project
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure git hooks:**

   ```bash
   pnpm setup:hooks
   ```

4. **Set up environment variables:**

   Copy `.env.example` to `.env.development` in `apps/api/` and fill in the required values (see [Environment Variables](#environment-variables) below).

   ```bash
   cp apps/api/.env.example apps/api/.env.development
   ```

5. **Start the database:**

   ```bash
   docker-compose up -d
   ```

6. **Generate Prisma client and apply migrations:**

   ```bash
   turbo db:generate
   turbo db:migrate:dev
   ```

7. **Run the development servers:**

   ```bash
   turbo dev
   ```

## 📜 Available Commands

### Development

```bash
turbo dev                                     # Run all apps (API + Web)
turbo dev --filter=@nucleus/api               # Run only the API
pnpm --filter @nucleus/api start:debug        # API in debug/watch mode
```

### Build & Production

```bash
turbo build                                   # Build all apps and packages
pnpm start:prod                               # Start API in production mode (after build)
pnpm --filter @nucleus/web check-types        # TypeScript type check for Web
```

### Testing

```bash
turbo test                                    # Run all unit tests
turbo test:e2e                                # Run all e2e tests
pnpm --filter @nucleus/api test:watch         # API unit tests in watch mode
pnpm --filter @nucleus/api test:e2e           # API e2e tests
```

### Database

```bash
docker-compose up -d                          # Start PostgreSQL container
turbo db:generate                             # Generate Prisma client
turbo db:migrate:dev                          # Create and apply dev migrations
turbo db:migrate:deploy                       # Apply migrations (production)
turbo db:push                                 # Push schema without migrations (dev only)
turbo db:seed                                 # Seed database with initial data
pnpm db:reset                                 # Full reset — destroys all data!
pnpm --filter @nucleus/database studio        # Open Prisma Studio
```

### Code Quality

```bash
turbo lint                                    # Lint all apps and packages
pnpm format                                   # Format with Prettier (ts, tsx, md)
```

## 🔐 Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env.development` and configure the following:

### Required

| Variable             | Description                                       |
| -------------------- | ------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                      |
| `JWT_SECRET`         | JWT signing secret (min. 32 characters)           |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (min. 32 characters) |

### Optional (with defaults)

| Variable                              | Default                 | Description                                           |
| ------------------------------------- | ----------------------- | ----------------------------------------------------- |
| `PORT`                                | `3000`                  | API server port                                       |
| `NODE_ENV`                            | `development`           | Environment (`development` \| `production` \| `test`) |
| `CORS_ORIGIN`                         | `http://localhost:3001` | Allowed CORS origin                                   |
| `JWT_ACCESS_EXPIRATION`               | `15m`                   | Access token lifetime                                 |
| `JWT_REFRESH_EXPIRATION`              | `7d`                    | Refresh token lifetime                                |
| `VERIFICATION_TOKEN_EXPIRATION_HOURS` | `24`                    | Email verification token TTL (hours)                  |
| `COOKIE_DOMAIN`                       | `localhost`             | Cookie domain                                         |
| `APP_URL`                             | `http://localhost:3001` | Frontend URL (used in emails)                         |
| `SPACE_NAME_TEMPLATE`                 | `{{username}}'s Space`  | Default space name on registration                    |

### SMTP (optional — uses Ethereal in dev if not set)

| Variable    | Description                                     |
| ----------- | ----------------------------------------------- |
| `SMTP_HOST` | SMTP server host                                |
| `SMTP_PORT` | SMTP server port (default: `587`)               |
| `SMTP_USER` | SMTP username                                   |
| `SMTP_PASS` | SMTP password                                   |
| `MAIL_FROM` | Sender address (default: `noreply@nucleus.app`) |

### Docker PostgreSQL

| Variable            | Description              |
| ------------------- | ------------------------ |
| `POSTGRES_USER`     | PostgreSQL user          |
| `POSTGRES_PASSWORD` | PostgreSQL password      |
| `POSTGRES_DB`       | PostgreSQL database name |

## 🔌 API Overview

All endpoints require JWT authentication unless marked as public.

| Module             | Base Path                           | Endpoints                                | Notes                                      |
| ------------------ | ----------------------------------- | ---------------------------------------- | ------------------------------------------ |
| **Auth**           | `/auth`                             | register, verify, login, refresh, logout | register/verify/login/refresh are public   |
| **User**           | `/users`                            | `GET/PATCH/DELETE /users/me`             | —                                          |
| **Space**          | `/spaces`                           | Full CRUD + duplicate                    | Ownership guard                            |
| **Database**       | `/databases`                        | Full CRUD + duplicate                    | `spaceId` in body (POST) or query (GET)    |
| **Property**       | `/properties`                       | Full CRUD                                | `databaseId` in body (POST) or query (GET) |
| **Record**         | `/records`                          | Full CRUD                                | `databaseId` in body (POST) or query (GET); optional `page`/`limit` pagination on GET |
| **Property Value** | `/values`                           | Full CRUD                                | `recordId` in body (POST) or query (GET)   |
| **Record Content** | `/records/:recordId/content`        | `GET`, `PUT`, `DELETE`                   | Rich content per record                    |
| **Template** | `/templates`                              | Full CRUD                                | `databaseId` in body (POST) or query (GET) |
| **Template Property Value** | `/template-property-values` | Full CRUD                           | `templateId` in body (POST) or query (GET) |
| **Settings**       | `/settings`                         | `GET/PATCH` per category                 | Categories: `space`, `database`, `section`, `record` |

### Auth Notes

- Access tokens expire in `15m`, refresh tokens in `7d`
- Refresh tokens are stored in HTTP-only cookies (`refresh_token`)
- Login is rate-limited: **5 requests per 60 seconds**
- Use `@Public()` decorator on endpoints to bypass JWT guard
- `ResourceOwnerGuard` validates that the requesting user owns the resource
- Access token is also set as an HTTP-only cookie (`access_token`) for cookie-first JWT extraction


