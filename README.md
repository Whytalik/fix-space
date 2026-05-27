# FIX Space

[![CI](https://github.com/Whytalik/fix-space/actions/workflows/ci.yml/badge.svg)](https://github.com/Whytalik/fix-space/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-blue?logo=vercel&logoColor=white)](https://fix-space-web.vercel.app/uk)
[![Railway Deployment](https://img.shields.io/badge/Deploy-Railway-darkviolet?logo=railway&logoColor=white)](https://fix-space-production.up.railway.app/)
[![codecov](https://codecov.io/gh/Whytalik/fix-space/graph/badge.svg)](https://codecov.io/gh/Whytalik/fix-space)
[![Uptime Status](https://img.shields.io/badge/Uptime-Monitor-brightgreen?logo=uptimerobot&logoColor=white)](https://stats.uptimerobot.com/hD2QZnY8tn)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Whytalik_fix-space&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Whytalik_fix-space)

- **🚀 Live Web App:** [https://fix-space-web.vercel.app/uk](https://fix-space-web.vercel.app/uk)
- **⚡ Live REST API:** [https://fix-space-production.up.railway.app/](https://fix-space-production.up.railway.app/)
- **📖 API Documentation (Swagger):** [https://fix-space-production.up.railway.app/api/docs](https://fix-space-production.up.railway.app/api/docs)
- **📊 Service Status Page (Uptime):** [https://stats.uptimerobot.com/hD2QZnY8tn](https://stats.uptimerobot.com/hD2QZnY8tn)

> A personalized web platform for professional organization of CFD trader activity.

Private traders distribute information across 4–7 independent services — Excel, Notion, TradingView, broker statements, paper notes. This leads to information fragmentation: up to 40% productivity loss from context switching, inability to perform retrospective analysis, hidden behavioral patterns.

FIX Space solves this — a single centralized environment where every aspect of a trader's activity is connected into a unified data model.

---

## Features

- **Trade journal** — full parameter logging (PnL, RR, MAE/MFE, commissions) with automatic Net PnL calculation and plan deviation tracking
- **Routine analysis** — `Daily Routine` and `Routine Library` databases for pre-session preparation and post-session review
- **Mistake tracker** — `Mistakes` database with an algorithm for automatic Severity determination based on frequency and financial impact
- **Dynamic structure** — custom property types, formulas, and automations without writing code
- **Content area** — editor for trade breakdowns with embedded charts, screenshots, and risk calculators

---

## Stack

| Layer      | Technology                                                                                  |
| :--------- | :------------------------------------------------------------------------------------------ |
| Frontend   | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) · App Router · Turbopack |
| Backend    | [NestJS 11](https://nestjs.com/) · Modular Monolith                                         |
| Database   | [PostgreSQL 16](https://www.postgresql.org/) + [Prisma 7](https://www.prisma.io/)           |
| Auth       | JWT Access/Refresh rotation + bcryptjs                                                      |
| UI         | Tailwind CSS 4 + Lucide Icons · Aesthetic: _Void Terminal_                                  |
| Monorepo   | [Turborepo 2.8](https://turbo.build/) + [pnpm 9.15](https://pnpm.io/)                       |
| Deployment | [Vercel](https://vercel.com/) (Web) · [Railway](https://railway.app/) (API · Docker)        |

---

## Structure

```
.
├── apps/
│   ├── api/          NestJS REST API (port 3000, OpenAPI/Swagger)
│   └── web/          Next.js Frontend (port 3001)
├── packages/
│   ├── domain/       @fixspace/domain — shared DTOs & entities
│   ├── database/     @fixspace/database — Prisma schema & migrations
│   ├── eslint-config/
│   ├── jest-config/
│   └── typescript-config/
└── docs/             architecture, testing, deployment
```

---

## Quick Start

> [!WARNING]
> Docker Desktop is required for local development — it runs the PostgreSQL container.

```bash
# 1. Install
git clone <repository-url>
pnpm install

# 2. Environment
cp .env.example .env.development
# fill in variables in .env.development

# 3. Database
docker-compose up -d
turbo db:generate
turbo db:migrate:dev

# 4. Development
turbo dev
```

---

## CI/CD Pipeline

Runs automatically on every PR and push to `develop`.

| Step | Job        | Description                                |
| :--: | :--------- | :----------------------------------------- |
|  1   | `lint`     | ESLint across all monorepo packages        |
|  2   | `test`     | Unit tests · 682 cases · coverage saved    |
|  2   | `security` | `pnpm audit` — dependency vulnerabilities  |
|  3   | `build`    | Build API `dist/` and Web `.next/`         |
|  4   | `docker`   | Build API Docker image                     |
|  5   | `deploy`   | Deploy to staging (push to `develop` only) |

Full description: [`docs/08-deployment/ci-cd.md`](docs/08-deployment/ci-cd.md)

---

## Documentation

| Document                                                          | Description                    |
| :---------------------------------------------------------------- | :----------------------------- |
| [Algorithms & Business Logic](docs/03-architecture/algorithms.md) | Core system algorithms         |
| [Database Design](docs/03-architecture/database.md)               | Schema and data model          |
| [Security Model](docs/03-architecture/security.md)                | Auth, JWT, resource protection |
| [Frontend Architecture](docs/03-architecture/frontend-state.md)   | State management, components   |
| [Test Plan](docs/06-testing/strategy.md)                          | Strategy, types, coverage      |
| [User Guide](docs/07-user-guide/index.md)                         | End-user instructions          |

---

> [!NOTE]
> Project is successfully deployed! Live Web App is hosted on [Vercel](https://fix-space-web.vercel.app/uk) and REST API is hosted on [Railway](https://fix-space-production.up.railway.app/).

_Thesis project · Specialty 121 · Zhytomyr Polytechnic · 2026_
