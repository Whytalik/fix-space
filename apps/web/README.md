# @fixspace/web

Next.js 16 frontend for the FIX Space platform. Built with React 19, App Router, Turbopack, and Tailwind CSS 4. Features i18n (uk/en), drag-and-drop interfaces, rich content editing, and a _Void Terminal_ design aesthetic.

## Structure

```
apps/web/src/
├── app/
│   └── [locale]/
│       ├── (auth)/                # Auth pages (login, register, reset)
│       ├── (dashboard)/           # Main application shell
│       │   ├── database/          # Database views — table, grid
│       │   ├── record/            # Record detail view
│       │   └── statistics/        # Analytics and charts
│       ├── (editor)/              # Full-screen content & database editors
│       ├── privacy/               # Privacy policy
│       ├── terms/                 # Terms of service
│       ├── layout.tsx             # Root layout with providers
│       └── page.tsx               # Landing page
├── components/
│   ├── auth/                      # Login/register forms, OAuth buttons
│   ├── automation/                # Automation rule builders
│   ├── database/                  # Data tables, filters, import/export
│   ├── layout/                    # Sidebar, header, navigation
│   ├── ui/                        # Atomic design system (primitives, icons)
│   └── providers/                 # Query, Theme, UI, I18n providers
├── hooks/                         # Custom React hooks
├── i18n/                          # Translations and routing
├── lib/                           # API client and server utilities
├── context/                       # Shared React contexts
└── styles/                        # Tailwind 4 configuration and global CSS
```

## Stack

| Layer       | Technology                         |
| :---------- | :--------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19 |
| Styling     | Tailwind CSS 4 + Framer Motion     |
| Icons       | Lucide React                       |
| State       | TanStack Query v5                  |
| i18n        | next-intl (uk/en)                  |
| Charts      | Recharts                           |
| Editor      | Tiptap (Headless Rich Text)        |
| Drag & Drop | @dnd-kit                           |
| Fonts       | Geist (Sans & Mono)                |

## Design System

The UI follows the _Void Terminal_ aesthetic: dark backgrounds, high-contrast typography, and monospace accents. Design tokens are integrated into Tailwind 4 variables for consistent spacing and color application.

### UI Primitives

Located in `components/ui/`:

- `primitives/inputs` — Custom inputs, selects, and checkboxes.
- `primitives/display` — Badges, cards, and status indicators.
- `primitives/feedback` — Toasts, modals, and loading skeletons.
- `overlays` — Dialogs, context menus, and tooltips.

## i18n

Supported locales: `uk` (default), `en`. Translations are managed in `i18n/messages/` and resolved via URL prefix.

## Commands

```bash
# Development (Turbopack, port 3001)
pnpm --filter @fixspace/web dev

# Production build
pnpm --filter @fixspace/web build

# Start production server
pnpm --filter @fixspace/web start

# Testing
pnpm --filter @fixspace/web test          # Unit tests (Jest)
pnpm --filter @fixspace/web test:e2e      # E2E tests (Playwright)

# Quality
pnpm --filter @fixspace/web check-types   # TypeScript check
pnpm --filter @fixspace/web lint          # Linting
pnpm --filter @fixspace/web format        # Prettier
```

## Environment

Set in `.env.local` or `.env.development`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```
