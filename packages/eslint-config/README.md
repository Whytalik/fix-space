# `@nucleus/eslint-config`

Shared ESLint configurations for the Nucleus monorepo. All configs use the ESLint flat config format.

## Available configs

### `base` — Base shared rules

Foundation config that all others extend from. Provides:

- TypeScript recommended rules via `typescript-eslint`
- ESLint recommended rules
- Prettier compatibility (disables conflicting rules)
- Turbo plugin (`turbo/no-undeclared-env-vars` — warns on missing env vars)
- `only-warn` plugin (downgrades all errors to warnings in CI)
- Ignores `dist/` and `node_modules/`

Not meant to be used directly — always extended by a more specific config.

### `nest-js` — NestJS backend

For Node.js backend services built with NestJS. Extends `base` with:

- Node.js + Jest globals
- `@typescript-eslint/no-explicit-any` — **off** (pragmatic for DTOs/mappers)
- `@typescript-eslint/no-floating-promises` — warn
- `@typescript-eslint/no-misused-promises` — warn (skips attribute check)
- `@typescript-eslint/require-await` — warn
- `@typescript-eslint/prefer-nullish-coalescing` — warn
- `@typescript-eslint/prefer-optional-chain` — warn
- `eqeqeq` — error
- `no-console` — warn
- `prefer-const` — error
- `@typescript-eslint/consistent-type-imports` — warn

Used by: `apps/api`, `packages/domain`

### `next-js` — Next.js frontend

For Next.js React applications. Extends `base` with:

- React recommended rules via `eslint-plugin-react`
- React Hooks rules via `eslint-plugin-react-hooks`
- Next.js recommended + Core Web Vitals rules via `@next/eslint-plugin-next`
- Browser globals
- `react/prop-types` — off (we use TypeScript)
- `react/react-in-jsx-scope` — off (Next.js 13+ has automatic JSX runtime)
- `react/self-closing-comp` — warn
- `@typescript-eslint/consistent-type-imports` — warn

Used by: `apps/web`

### `database` — Database package

For the `@nucleus/database` package with Prisma. Extends `base` with:

- Node.js globals
- TypeScript parser with `projectService` for type-aware linting
- `turbo/no-undeclared-env-vars` — allows `NODE_ENV`
- Special rules for `generated/**/*.d.ts` (Prisma client):
  - `@typescript-eslint/no-unused-vars` — off
  - `@typescript-eslint/no-explicit-any` — off
  - `@typescript-eslint/no-empty-object-type` — off
  - `@typescript-eslint/no-unsafe-function-type` — off
- Ignores `.turbo/`, `node_modules/`, `dist/`, `generated/`

Used by: `packages/database`

### `library` — Generic Node.js library

For standalone Node.js packages without framework-specific rules. Extends `base` with:

- Node.js globals
- TypeScript parser settings with `import/resolver` for type-aware linting
- Ignores `.*.js`, `node_modules/`, `dist/`

Used by: root `.eslintrc.mjs` (for repo-level files)

### `prettier-base` — Shared Prettier options

Not an ESLint config — a shared Prettier configuration object. Settings:

| Option           | Value        |
| ---------------- | ------------ |
| `singleQuote`    | `false`      |
| `semi`           | `true`       |
| `trailingComma`  | `"all"`      |
| `printWidth`     | `120`        |
| `tabWidth`       | `2`          |
| `useTabs`        | `false`      |
| `bracketSpacing` | `true`       |
| `arrowParens`    | `"always"`   |
| `endOfLine`      | `"lf"`       |
| `proseWrap`      | `"preserve"` |

Overrides: `*.md` and `*.json` get `printWidth: 80`.

Used by: all `.prettierrc.mjs` files (root, api, web, domain)
