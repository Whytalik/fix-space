# @fixspace/web

Next.js 16 frontend for the FIX Space platform. Built with React 19, App Router, Turbopack, and Tailwind CSS 4. Features i18n (uk/en), drag-and-drop interfaces, rich content editing, and a _Void Terminal_ design aesthetic.

## Structure

```
apps/web/src/
├── app/
│   └── [locale]/
│       ├── (dashboard)/
│       │   ├── database/          # Database views — table, grid, content editor
│       │   ├── profile/           # User profile page
│       │   ├── statistics/        # Analytics and charts
│       │   └── layout.tsx         # Dashboard shell (sidebar, header)
│       ├── auth/                  # Auth-related pages
│       ├── login/                 # Login page
│       ├── register/              # Registration page
│       ├── reset-password/        # Password reset flow
│       ├── record/                # Record detail view
│       ├── page.tsx               # Landing / home page
│       ├── layout.tsx             # Root layout with providers
│       └── not-found.tsx          # 404 page
├── components/
│   ├── auth/                      # Login form, register form, OAuth buttons
│   ├── charts/                    # Recharts-based analytics visualizations
│   ├── database/                  # Database table, grid, column headers, filters
│   ├── layout/                    # Sidebar, header, breadcrumbs, shell
│   ├── navigation/                # Space switcher, section nav, route links
│   ├── property/                  # Property editors, type-specific renderers
│   ├── providers/                 # Query client, theme, session, locale providers
│   ├── record/                    # Record card, content editor, cell renderers
│   ├── settings/                  # Settings panels per category
│   └── ui/                        # Primitives — button, input, modal, dropdown, etc.
├── context/                       # React contexts (session, space, UI state)
├── hooks/                         # Custom hooks (useApi, useDebounce, etc.)
├── i18n/                          # next-intl configuration and messages
├── lib/                           # API client, formatters, validators
├── styles/                        # Global CSS, design tokens
└── types/                         # Shared TypeScript type definitions
```

## Pages & Routes

| Route                     | Description                        |
| :------------------------ | :--------------------------------- |
| `/`                       | Landing page                       |
| `/login`                  | User login                         |
| `/register`               | User registration                  |
| `/reset-password`         | Password reset flow                |
| `/[locale]/database/[id]` | Database view (table/grid/content) |
| `/[locale]/statistics`    | Analytics dashboard                |
| `/[locale]/profile`       | User profile management            |
| `/[locale]/record/[id]`   | Record detail with content editor  |

All routes are prefixed with a locale (`uk` or `en`) via `next-intl`.

## Stack

| Layer        | Technology                           |
| :----------- | :----------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19   |
| Styling      | Tailwind CSS 4 + Framer Motion       |
| Icons        | Lucide React                         |
| State        | TanStack Query (React Query) v5      |
| i18n         | next-intl (uk/en)                    |
| Charts       | Recharts                             |
| Drag & Drop  | @dnd-kit (core, sortable, utilities) |
| Emoji Picker | emoji-mart                           |
| Fonts        | Geist (sans-serif)                   |
| Dev          | Turbopack (fast HMR in dev)          |

## API Integration

The frontend communicates with `@fixspace/api` via a typed API client in `lib/`. All data fetching uses TanStack Query for caching, background refetch, and optimistic updates. DTOs from `@fixspace/domain` are imported as `type` — zero runtime bundle cost.

```ts
// Type-only import — no validators shipped to the browser
import type { RecordResponseDto, ViewResponseDto } from "@fixspace/domain";

// Runtime enums/constants — small bundle footprint
import { PropertyType, FilterLogic } from "@fixspace/domain/enums";
```

## Design System

The UI follows the _Void Terminal_ aesthetic: dark backgrounds, subtle borders, monospace accents. Design tokens are defined in `styles/tokens.css` and consumed via Tailwind utility classes.

### UI Primitives

Located in `components/ui/`:

- `button` — variants: default, destructive, outline, ghost, link
- `input` / `textarea` — form inputs with validation states
- `modal` / `dialog` — accessible overlay dialogs
- `dropdown` — context menus and select dropdowns
- `badge` / `tag` — status indicators
- `tooltip` — hover tooltips

## i18n

Supported locales: `uk` (default), `en`. Locale is resolved from the URL path (`/[locale]/...`) with fallback to `uk`. Messages live in `i18n/messages/{locale}.json`.

## Commands

```bash
# Development (Turbopack, port 3001)
pnpm --filter @fixspace/web dev

# Production build
pnpm --filter @fixspace/web build

# Start production server
pnpm --filter @fixspace/web start

# TypeScript type-check (no emit)
pnpm --filter @fixspace/web check-types

# Lint
pnpm --filter @fixspace/web lint

# Format
pnpm --filter @fixspace/web format

# Component tests
pnpm --filter @fixspace/web test

# Component tests (watch mode)
pnpm --filter @fixspace/web test:watch
```

## Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Set via `.env.local` or `.env.development` in the app directory.

## Dependencies

| Package                 | Purpose                      |
| :---------------------- | :--------------------------- |
| `next`                  | React framework (App Router) |
| `react` / `react-dom`   | UI library (v19)             |
| `@tanstack/react-query` | Server state management      |
| `tailwindcss`           | Utility-first CSS            |
| `framer-motion`         | Animations and transitions   |
| `lucide-react`          | Icon library                 |
| `next-intl`             | Internationalization         |
| `recharts`              | Charting library             |
| `@dnd-kit/*`            | Drag-and-drop system         |
| `@emoji-mart/react`     | Emoji picker                 |
| `geist`                 | Font family                  |
