# @nucleus/eslint-config

Shared ESLint configurations for the Nucleus monorepo. All configs use the
**ESLint flat config format** (ESLint 9+) and are plain `.js` files that export
arrays of config objects.

## Available configs

### `base` — Foundation

All other configs extend from this. It provides a minimal, framework-agnostic
layer that every package in the monorepo shares.

Includes:

- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules
- `eslint-config-prettier` — disables formatting rules that conflict with Prettier
- `eslint-plugin-turbo` — warns on `turbo/no-undeclared-env-vars`
- `eslint-plugin-only-warn` — downgrades all ESLint errors to warnings

The `only-warn` plugin means ESLint never fails the process by itself. CI failure
is handled by explicitly passing `--max-warnings 0` where zero-warning policy matters.

Not meant to be used directly — always extend a more specific config.

---

### `nest` → `nestJsConfig`

For NestJS backend services. Extends `base` with Node.js and Jest globals, and
adds type-aware TypeScript rules via `parserOptions.projectService`.

| Rule                                           | Level | Note                                                 |
| ---------------------------------------------- | ----- | ---------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`           | off   | Pragmatic for DTOs and service mappers               |
| `@typescript-eslint/no-floating-promises`      | warn  | Catches unawaited async calls                        |
| `@typescript-eslint/no-unsafe-argument`        | warn  | Type safety at call sites                            |
| `@typescript-eslint/no-misused-promises`       | warn  | Skips `checksVoidReturn.attributes` (event handlers) |
| `@typescript-eslint/require-await`             | warn  | Flags async functions with no await                  |
| `@typescript-eslint/prefer-nullish-coalescing` | warn  | Prefer `??` over `\|\|` for null checks              |
| `@typescript-eslint/prefer-optional-chain`     | warn  | Prefer `?.` over chained `&&` checks                 |
| `@typescript-eslint/consistent-type-imports`   | warn  | Enforces `import type` for type-only imports         |
| `eqeqeq`                                       | error | Strict equality everywhere                           |
| `no-console`                                   | warn  | Console calls should not reach production            |
| `prefer-const`                                 | error | Immutable bindings where possible                    |

Used by: `apps/api`, `packages/domain`

---

### `next` → `nextJsConfig`

For Next.js React applications. Extends `base` with browser globals and React/Next.js
specific rule sets.

Plugins included:

- `eslint-plugin-react` (flat recommended config)
- `eslint-plugin-react-hooks` (recommended rules)
- `@next/eslint-plugin-next` (recommended + Core Web Vitals rules)

Additional rules:

| Rule                                         | Level | Note                                           |
| -------------------------------------------- | ----- | ---------------------------------------------- |
| `react/prop-types`                           | off   | TypeScript handles prop validation             |
| `react/react-in-jsx-scope`                   | off   | Not needed in Next.js 13+ (automatic JSX)      |
| `react/self-closing-comp`                    | warn  | `<Component />` over `<Component></Component>` |
| `@typescript-eslint/consistent-type-imports` | warn  | Enforces `import type` for type-only imports   |

Used by: `apps/web`

---

### `database` → `databaseConfig`

For the `@nucleus/database` package. Extends `base` with special handling for
Prisma-generated files, which contain patterns that would normally trigger
type-safety warnings.

Overrides for `generated/**/*.d.ts`:

| Rule                                         | Level | Why                                        |
| -------------------------------------------- | ----- | ------------------------------------------ |
| `@typescript-eslint/no-unused-vars`          | off   | Generated type aliases aren't always used  |
| `@typescript-eslint/no-explicit-any`         | off   | Prisma uses `any` in internal type helpers |
| `@typescript-eslint/no-empty-object-type`    | off   | Prisma generates empty interface stubs     |
| `@typescript-eslint/no-unsafe-function-type` | off   | Prisma uses `Function` type internally     |

Also ignores: `.turbo/`, `node_modules/`, `dist/`, `generated/`, `prisma.config.ts`

Used by: `packages/database`

---

### `library` → `libraryConfig`

For standalone Node.js packages without framework-specific needs. Extends `base`
with Node.js globals and TypeScript-aware import resolution.

Used by: root-level `eslint.config.mjs` (for monorepo tooling files)

---

### `prettier-base` — Shared Prettier options

Not an ESLint config — a shared Prettier configuration object exported as the
default export of `prettier-base.js`.

| Option                       | Value        |
| ---------------------------- | ------------ |
| `singleQuote`                | `false`      |
| `semi`                       | `true`       |
| `trailingComma`              | `"all"`      |
| `printWidth`                 | `120`        |
| `tabWidth`                   | `2`          |
| `useTabs`                    | `false`      |
| `bracketSpacing`             | `true`       |
| `bracketSameLine`            | `false`      |
| `arrowParens`                | `"always"`   |
| `endOfLine`                  | `"lf"`       |
| `proseWrap`                  | `"preserve"` |
| `embeddedLanguageFormatting` | `"auto"`     |
| `singleAttributePerLine`     | `false`      |

Overrides: `*.md` and `*.json` get `printWidth: 80`.

Used by: all `.prettierrc.mjs` files across the monorepo (root, api, web, domain).

---

## Usage

```js
// apps/api/eslint.config.mjs
import { nestJsConfig } from "@nucleus/eslint-config/nest";

export default [
  ...nestJsConfig,
  // project-specific overrides
];
```

```js
// apps/web/eslint.config.mjs
import { nextJsConfig } from "@nucleus/eslint-config/next";

export default [
  ...nextJsConfig,
  // project-specific overrides
];
```

```js
// .prettierrc.mjs (root or any app)
import prettierBase from "@nucleus/eslint-config/prettier-base";

export default prettierBase;
```
