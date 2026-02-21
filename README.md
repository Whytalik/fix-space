# 🔬 Nucleus

> A specialized operational system designed for **CFD traders** 📈

Nucleus is a comprehensive platform that helps traders of all levels structure their knowledge, manage statistics, and organize their daily trading activities.

This project was developed as a diploma thesis, and this repository contains the full source code for the platform. ✨

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

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/get-started) (for running a local PostgreSQL database)

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

3. **Set up environment variables:**
   Create a `.env` file in the root of the `apps/api` and `apps/web` directories. You can use the provided `.env.example` files as a template.

4. **Start the database:**

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations:**

   ```bash
   pnpm db:push
   ```

6. **Run the development servers:**
   ```bash
   pnpm dev
   ```

## 📜 Available Commands

This monorepo is configured with the following commands:

- `pnpm build` - 🔨 Build all apps and packages.
- `pnpm dev` - 🏃 Run all apps in development mode.
- `pnpm test` - 🧪 Run tests for all apps and packages.
- `pnpm lint` - ✅ Lint all apps and packages.
- `pnpm format` - 💅 Format all supported files.
